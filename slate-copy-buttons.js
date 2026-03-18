const defaultGridConfig = {
  columns: 4,
  gap: "12px"
};

function applyGridConfig(container, config) {
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${config.columns}, minmax(0, 1fr))`;
  container.style.gap = config.gap;
}

function ensureBaseStyles() {
  if (document.getElementById("slate-copy-buttons-styles")) return;

  const style = document.createElement("style");
  style.id = "slate-copy-buttons-styles";
  style.textContent = `
    #copy-buttons {
      gap: var(--copy-buttons-gap, 12px);
    }

    .copy-btn {
      appearance: none;
      border: 1px solid var(--copy-btn-border, #004d80);
      border-radius: var(--copy-btn-radius, 12px);
      background: var(--copy-btn-bg, #004d80);
      color: var(--copy-btn-text, #ffffff);
      padding: var(--copy-btn-padding-y, 0.85rem) var(--copy-btn-padding-x, 1rem);
      cursor: pointer;
      margin: 0;
      transition: background 160ms ease, opacity 160ms ease;
    }

    .copy-btn:hover:not(:disabled) {
      background: var(--copy-btn-bg-hover, #A5c3e6);
      color: var(--copy-btn-text-hover, #004d80);
    }

    .copy-btn:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}

function getColumnSpan(config, totalColumns) {
  if (config.grid?.colSpan) return config.grid.colSpan;

  switch (config.width) {
    case "full":
      return totalColumns;
    case "half":
      return Math.max(1, Math.floor(totalColumns / 2));
    case "auto":
    default:
      return 1;
  }
}

function createCopyButton(key, config, totalColumns) {
  const button = document.createElement("button");
  const { row, col, rowSpan = 1 } = config.grid ?? {};
  const colSpan = getColumnSpan(config, totalColumns);

  button.type = "button";
  button.dataset.copyKey = key;
  button.textContent = config.label;
  button.className = "copy-btn";

  if (row != null) button.style.gridRow = `${row} / span ${rowSpan}`;
  if (col != null) {
    button.style.gridColumn = `${col} / span ${colSpan}`;
  } else {
    button.style.gridColumn = `span ${colSpan}`;
  }

  return button;
}

function renderCopyButtons(container, registry, totalColumns) {
  const buttons = [...registry.entries()]
    .filter(([, config]) => config.visible !== false)
    .map(([key, config]) => createCopyButton(key, config, totalColumns));

  container.replaceChildren(...buttons);
}

function buildRegistry(items) {
  return new Map(
    items.map((item) => [
      item.key,
      {
        label: item.label,
        grid: item.grid,
        visible: item.visible,
        resolve: async () => item.text
      }
    ])
  );
}

function mergeItems(baseItems, extraItems) {
  const merged = new Map(baseItems.map((item) => [item.key, item]));
  for (const item of extraItems) merged.set(item.key, item);
  return [...merged.values()];
}

async function loadItems(configUrl) {
  const response = await fetch(configUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.status}`);
  }
  return await response.json();
}

async function copyByKey(registry, key) {
  const entry = registry.get(key);
  if (!entry) throw new Error(`Unknown copy key: ${key}`);

  const text = await entry.resolve();
  await navigator.clipboard.writeText(text);
}

export async function initCopyButtons({
  containerId = "copy-buttons",
  configUrl,
  gridConfig = defaultGridConfig,
  extraItems = []
} = {}) {
  ensureBaseStyles();

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container not found: ${containerId}`);

  applyGridConfig(container, gridConfig);

  const baseItems = configUrl ? await loadItems(configUrl) : [];
  const mergedItems = mergeItems(baseItems, extraItems);
  const registry = buildRegistry(mergedItems);

  renderCopyButtons(container, registry, gridConfig.columns);

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-key]");
    if (!button) return;

    const originalLabel = button.textContent;

    try {
      button.disabled = true;
      await copyByKey(registry, button.dataset.copyKey);
      button.textContent = "Copied!";
    } catch (error) {
      console.error(error);
      button.textContent = "Copy failed";
    } finally {
      setTimeout(() => {
        button.textContent = originalLabel;
        button.disabled = false;
      }, 1200);
    }
  });
}
