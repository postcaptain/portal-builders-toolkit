# Portal Builders Toolkit

The purpose of this repo is to supply the **Portal Builders Toolkit user dashboard** with standardized and centralized access to common portal building tools (like tabs, popups, and looping tables).

This allows Slate users to:
- quickly copy reusable HTML / Liquid snippets
- stay consistent across portals
- benefit from centralized updates without rewriting code

---

## 🚀 How it works

This toolkit renders a set of buttons inside Slate. Each button copies a predefined snippet to the clipboard.

Snippets can come from:
- inline text (stored in JSON)
- external files (stored here in `/snippets` and fetched dynamically)

---

## 📦 Installation (Slate)

This toolkit is distributed via a **Slate Suitcase ID**.

> 📌 Add the provided Suitcase ID to your Slate instance (this will be shared separately).

Once installed, the toolkit will render automatically in the configured dashboard location.

---

## 🎨 Styling (End User)

All styling is controlled via CSS variables.

You can override these in your Slate theme or page-level CSS:

```css
:root {
  --copy-btn-bg: #004d80;
  --copy-btn-bg-hover: #A5c3e6;
  --copy-btn-text: #ffffff;
  --copy-btn-text-hover: #004d80;
  --copy-btn-border: #004d80;
  --copy-btn-radius: 12px;
  --copy-btn-padding-y: 0.85rem;
  --copy-btn-padding-x: 1rem;
}
```

Example alternative style:

```css
:root {
  --copy-btn-bg: #ffffff;
  --copy-btn-text: #111827;
  --copy-btn-border: #d1d5db;
  --copy-btn-bg-hover: #f3f4f6;
  --copy-btn-text-hover: #111827;
  --copy-btn-radius: 999px;
}
```

---

## ➕ Adding Custom Buttons (End User)

You can extend the toolkit without modifying the repo.

Add this to your page:

```html
<script>
  window.SlateCopyButtonsExtra = [
    {
      key: "custom-1",
      label: "Copy custom text",
      width: "full",
      text: "This came from the page."
    }
  ];
</script>
```

### Layout options

Instead of complex grid coordinates, use:

- `"width": "auto"` → default (1 column)
- `"width": "half"` → half width
- `"width": "full"` → full width

### Advanced layout (optional)

```js
{
  key: "custom-advanced",
  label: "Custom Grid",
  grid: { row: 3, col: 1, colSpan: 2 },
  text: "Advanced placement"
}
```

---

## 🧩 JSON Configuration

The main configuration lives in:

```
copy-buttons.json
```

Example:

```json
[
  {
    "key": "liquid-table",
    "label": "Liquid Looping Table",
    "width": "full",
    "source": "https://raw.githubusercontent.com/postcaptain/portal-builders-toolkit/main/snippets/liquid-table.html"
  }
]
```

---

## ✏️ Text vs Source

### Use `text` for small snippets

```json
{
  "key": "welcome-template",
  "label": "Copy welcome",
  "width": "full",
  "text": "Hi there,\n\nThanks for reaching out."
}
```

---

### Use `source` for larger snippets

```json
{
  "key": "tabs",
  "label": "Portal Tabs",
  "width": "full",
  "source": "https://raw.githubusercontent.com/postcaptain/portal-builders-toolkit/main/snippets/tabs.html"
}
```

---

## ⚠️ JSON Formatting Rules

JSON is strict. Most errors come from formatting issues.

### 1. No comments allowed

❌ Invalid:

```json
// this will break
```

---

### 2. Escape double quotes

```json
"text": "She said, \"Hello\""
```

---

### 3. Use `\n` for line breaks

```json
"text": "Line one\nLine two"
```

---

### 4. No raw line breaks inside strings

❌ Invalid:

```json
"text": "Hello
world"
```

---

### 5. Single quotes are safe

```json
"text": "I won't break"
```

---

## 📁 Snippet Files

Large snippets should live in:

```
/snippets/
```

Example structure:

```
snippets/
  liquid-table.html
  tabs.html
  popup.html
```

These files are fetched dynamically and copied to the clipboard.

---

## ⚙️ Technical Notes

- Uses modern JavaScript (ES modules)
- Requires a modern browser
- Clipboard API requires **HTTPS**
- Uses `fetch()` to load config and snippets
- Snippets are cached in memory per page load

---

## 🔁 Updating the Toolkit

If updates don’t appear:

1. Confirm changes exist in GitHub
2. Purge jsDelivr cache: https://www.jsdelivr.com/tools/purge
3. Hard refresh your browser

---

## 🧠 System Overview

| Layer | Responsibility |
|------|--------|
| JSON | Defines available buttons |
| `/snippets` | Stores large reusable code |
| JS | Renders UI + handles copy |
| CSS variables | Controls appearance |

---

## 📌 Summary

- Use **JSON** to define buttons  
- Use **`text`** for small snippets  
- Use **`source`** for large snippets  
- Use **CSS variables** to style  
- Use **extraItems** to extend locally  
