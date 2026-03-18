const defaultGridConfig = {
  columns: 4,
  gap: "12px"
};

const snippetCache = new Map();

function ensureBaseStyles() {
  if (document.getElementById("slate-copy-buttons-styles")) return;

  const style = document.createElement("style");
  style.id = "slate-copy-buttons-styles";
  style.textContent = `
    .copy-btn {
      appearance: none;
      border: 1px solid var(--copy-btn-border, #004d80);
      border-radius: var(--copy-btn-radius, 12px);
      background: var(--copy-btn-bg, #004d80);
      color: var(--copy-btn-text, #ffffff);
      padding: var(--copy-btn-padding-y, 0.85rem) var(--copy-btn-padding-x, 1rem);
      cursor: pointer;
      margin: 0;
      transition: background 160ms ease, color 160ms ease, opacity 160ms ease;
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

function applyGridConfig(container, config) {
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${config.columns}, minmax(0, 1fr))`;
  container.style.gap = config.gap;
}

function getColumnSpan(item, totalColumns) {
  if (item.grid?.colSpan != null) return item.grid.colSpan;

  switch (item.width) {
    case "full":
      return totalColumns;
    case "half":
      return Math.max(1, Math.floor(totalColumns / 2));
    case "auto":
    default:
      return 1;
  }
}

function createCopyButton(item, totalColumns) {
  const button = document.createElement("button");
  const { row, col, rowSpan = 1 } = item.grid ?? {};
  const colSpan = getColumnSpan(item, totalColumns);

  button.type = "button";
  button.dataset.copyKey = item.key;
  button.textContent = item.label;
  button.className = "copy-btn";

  if (row != null) {
    button.style.gridRow = `${row} / span ${rowSpan}`;
  }

  if (col != null) {
    button.style.gridColumn = `${col} / span ${colSpan}`;
  } else {
    button.style.gridColumn = `span ${colSpan}`;
  }

  return button;
}

function renderCopyButtons(container, items, totalColumns) {
  const buttons = items
    .filter((item) => item.visible !== false)
    .map((item) => createCopyButton(item, totalColumns));

  container.replaceChildren(...buttons);
}

function normalizeItems(items) {
  return items.map((item) => ({
    key: item.key,
    label: item.label,
    text: item.text ?? null,
    source: item.source ?? null,
    width: item.width ?? "auto",
    grid: item.grid,
    visible: item.visible
  }));
}

function mergeItems(baseItems, extraItems) {
  const merged = new Map();

  for (const item of normalizeItems(baseItems)) {
    merged.set(item.key, item);
  }

  for (const item of normalizeItems(extraItems)) {
    merged.set(item.key, item);
  }

  return [...merged.values()];
}

async function loadItems(configUrl) {
  const response = await fetch(configUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.status}`);
  }

  return await response.json();
}

function buildRegistry(items) {
  return new Map(
    items.map((item) => [
      item.key,
      {
        text: item.text,
        source: item.source
      }
    ])
  );
}

async function fetchSourceText(sourceUrl) {
  if (snippetCache.has(sourceUrl)) {
    return snippetCache.get(sourceUrl);
  }

  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load source: ${response.status}`);
  }

  const text = await response.text();
  snippetCache.set(sourceUrl, text);
  return text;
}

async function resolveCopyText(entry) {
  if (entry.text != null) {
    return entry.text;
  }

  if (entry.source) {
    return await fetchSourceText(entry.source);
  }

  throw new Error("No text or source defined for copy item.");
}

async function copyByKey(registry, key) {
  const entry = registry.get(key);
  if (!entry) {
    throw new Error(`Unknown copy key: ${key}`);
  }

  const text = await resolveCopyText(entry);
  await navigator.clipboard.writeText(text);
}

function bindCopyHandler(container, registry) {
  if (container.dataset.copyButtonsBound === "true") return;

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-key]");
    if (!button || !container.contains(button)) return;

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

  container.dataset.copyButtonsBound = "true";
}

export async function initCopyButtons({
  containerId = "copy-buttons",
  configUrl,
  gridConfig = defaultGridConfig,
  extraItems = []
} = {}) {
  ensureBaseStyles();

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container not found: ${containerId}`);
  }

  applyGridConfig(container, gridConfig);

  const baseItems = configUrl ? await loadItems(configUrl) : [];
  const mergedItems = mergeItems(baseItems, extraItems);
  const registry = buildRegistry(mergedItems);

  renderCopyButtons(container, mergedItems, gridConfig.columns);
  bindCopyHandler(container, registry);
}
