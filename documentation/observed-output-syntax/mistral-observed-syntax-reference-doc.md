# Mistral WebUI Output Format Reference Documentation

This document provides a technical breakdown of the HTML structures and data attributes used by the Mistral WebUI (as of early 2026). This reference is intended to serve as a baseline for developing robust export logic and DOM scraping tools.

---

## 1. Message Containers

The high-level structure distinguishes between the user and the assistant using `data-message-author-role`.

### User Message

* **Selector**: `div[data-message-author-role="user"]`
* **Key Attributes**:
* `data-message-id`: Unique UUID for the message turn.
* `class`: Contains `group/message`.


* **Content Wrapper**: The text is typically nested within a series of `div` tags, eventually reaching a `span` with `whitespace-pre-wrap`.

### Assistant Message

* **Selector**: `div[data-message-author-role="assistant"]`
* **Avatar**: Represented by a `span[data-slot="avatar"]` containing an SVG logo.
* **Content Wrapper**: `div[data-testid="text-message-part"]` inside a `markdown-container-style`.

---

## 2. Rich Text & Media Formats

### Tables (Rich Data Tables)

Mistral employs a sophisticated "Rich Table" structure that is distinct from standard HTML `<table>` tags to allow for interactive sorting and UI buttons.

* **Wrapper**: `div[data-rich-table-inner-html]`
* *Note*: This attribute often contains the raw HTML version of the table as a string, which is highly useful for exporters.


* **Visual Structure**:
* **Title Bar**: `div.rich-table-title-bar` containing the table name and Action Buttons (Copy/Download).
* **Grid**: `div.rich-table` with `role="table"`.
* **Headers**: `div[role="columnheader"]` containing a `button`.
* **Cells**: `div[role="cell"]`.



### Code Blocks

Mistral uses a custom container for code blocks to support syntax highlighting and "Copy" functionality.

* **Container**: `div[data-testid="code-block"]`
* **Header**: `div[data-exclude-copy="true"]` contains the language label (e.g., "python", "html") and the "Copy" button.
* **Syntax Highlighting**: Uses inline styles or specific classes (e.g., `color:#397300` for Python keywords).
* **Inline Code**: Represented by `<code data-testid="code-block">` within standard paragraph tags.

### Mathematical Formulas (LaTeX)

Math is rendered using the KaTeX library.

* **Inline/Display Math**: Wrapped in `span.katex`.
* **Structure**:
* `span.katex-mathml`: Contains the accessible MathML markup.
* `span.katex-html`: Contains the visually rendered elements (usually hidden from simple text scrapers).
* **Raw Source**: Often found inside an `<annotation encoding="application/x-tex">` tag within the MathML.



---

## 3. Standard Markdown Elements

The WebUI renders standard Markdown into the following HTML equivalents:

| Element | HTML Tag / Logic |
| --- | --- |
| **Headers** | `h1`, `h2`, `h3` tags. |
| **Bold** | `strong` tags. |
| **Italics** | `em` tags. |
| **Blockquotes** | `blockquote` tags. |
| **Horizontal Rules** | `hr` tags. |
| **Ordered Lists** | `ol` > `li`. |
| **Unordered Lists** | `ul` > `li`. |
| **Links** | `a` with `rel="nofollow noopener noreferrer external"`. |

---

## 4. Metadata & UI Elements

When scraping, these elements are typically excluded to ensure a clean text export.

* **Timestamps**: `div.text-hint` (e.g., "1:34am").
* **Action Buttons**:
* `button[aria-label="Like"]`
* `button[aria-label="Dislike"]`
* `button[aria-label="Copy to clipboard"]`
* `button[aria-label="Edit question"]`


* **Status Icons**: SVGs such as the "Sparkle" icon next to the timestamp.

---

## 5. Multi-Language Handling

* **RTL Support**: For languages like Arabic, the UI utilizes the `dir="auto"` attribute on message containers to ensure correct text alignment.
* **Standard Scripts**: Japanese and Greek are rendered within standard `p` tags using UTF-8 encoding.

---

## 6. Logic for Export Fine-Tuning

> [!TIP]
> **Recommended Extraction Strategy:**
> 1. Target `div[data-testid="text-message-part"]` for the primary content.
> 2. For **Tables**, prioritize extracting the value from the `data-rich-table-inner-html` attribute rather than scraping the `role="grid"` divs.
> 3. For **Code**, extract the text from the `<code>` tag and the language from the sibling `div` header.
> 4. For **Math**, extract the content of the `annotation[encoding="application/x-tex"]` tag to preserve the original LaTeX formula.
> 
>