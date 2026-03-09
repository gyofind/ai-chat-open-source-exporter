# AI Chat Exporter: Coding Rules & Architecture

This document serves as the single source of truth for all architectural decisions, coding standards, and best practices within the AI Chat Exporter project. Adhering to these guidelines ensures maintainability, extensibility, and robustness of the extension across different AI platforms.

> [!NOTE]
> This document is public to assist both human contributors and AI coding assistants 
> in maintaining the architectural integrity of this GPL-licensed project.

## 🏗 Core Architecture

* **Orchestration**: `src/content/content.js` manages the high-level flow. It detects the active AI platform and then calls static methods on the respective Platform classes to extract messages.
* **Platform Classes**: Each AI platform (e.g., Mistral, Claude, Gemini) must have its own class (e.g., `src/lib/platforms/mistral.js`) which *must* extend the `AIPlatform` base class.
* **Static Methods**: Key interaction methods like `detect()` and `extractMessages()` **MUST remain static**. The orchestrator calls these directly on the Class constructor.

## 🎨 Assets & Branding

* **Source Files**: Original vector designs (`.svg`) are stored in `assets/icons/`.
    * `logo-ADLaM-light-theme.svg`: Optimized for light toolbars/backgrounds.
    * `logo-ADLaM-dark-theme.svg`: Optimized for dark toolbars/backgrounds.
* **Production Icons**: Exported `.png` files are stored in `public/icons/`.
* **Automated Generation**: A standalone utility `scripts/generate-icons.js` uses the `sharp` library to convert SVGs into the required PNG sizes (16, 32, 48, 96).
    * **Workflow**: Run `node scripts/generate-icons.js` manually only when the source SVGs are modified.
* **Responsive Theming**: The `manifest.json` uses the `theme_icons` property to automatically toggle between light and dark icons based on the browser's UI theme.

## 🔍 Extraction Logic (Scrapers)

*   **DOM Independence**: When manipulating or cleaning content that might cause UI reflows or flickering, consider using `cloneNode(true)` on the relevant DOM elements before performing extensive modifications, or working on detached DOM nodes.
*   **Selector Specificity**: Always prioritize highly specific selectors, especially `data-testid` attributes where available, over generic or obfuscated CSS classes. This reduces breakage due to minor UI changes on the target platforms. When `data-testid` is not present, use a combination of stable class names and attribute selectors.
*   **De-duplication**: Scrapers (`extractMessages` methods) must carefully design their `querySelectorAll` logic and subsequent processing to filter nodes. The goal is to ensure that parent containers are not inadvertently selected alongside their children if both represent parts of a single logical message. Techniques like using `.closest()` for ascending searches or `.filter()` on node lists are essential to prevent duplicate message entries.
*   **Timestamp Extraction**: Timestamps (e.g., "Feb 8, 9:48pm") must be extracted as separate metadata and **NOT** be included as part of the message's main content (`content` field). They should be stored in a dedicated `timestamp` property within the message object.

## 🛠 Formatting Standards

*   **Markdown Conversion**: The `TurndownService` library (`turndown`) in `src/lib/utils/helpers.js` is the standard for converting HTML content into Markdown. Configure it for consistent output (e.g., `headingStyle: 'atx'`, `codeBlockStyle: 'fenced'`).
*   **Fenced Divs**: All extracted chat messages, once converted to Markdown, **MUST** be wrapped using the `wrapInFencedDiv` helper function (`src/lib/utils/helpers.js`). This adheres to the Pandoc-style fenced div standard, ensuring machine-readability and proper rendering.
    *   Fenced divs require a blank line immediately after the opening `:::` marker and immediately before the closing `:::` marker for correct parsing by most Markdown renderers. The `wrapInFencedDiv` helper must enforce this.
*   **ID Generation**: Each fenced div (representing a message) **MUST** have a unique ID. The `wrapInFencedDiv` helper generates this ID using a combination of `msg-${role}-${Date.now()}-${Math.random()}` to ensure uniqueness across sessions and messages.
*   **Triple Colon Escaping**: Any occurrences of `:::` within the actual message content must be escaped (e.g., to `\:::`) to prevent them from being misinterpreted as additional fenced div delimiters. The `escapeTripleColons` helper in `src/lib/utils/helpers.js` handles this.
*   **Message Separator**: A consistent separator (`\n\n---\n\n`) should be used between individual messages in the final Markdown output for better readability.

## 🧪 Snapshot Testing Suite
- **Location**: `tests/snapshots/`
- **Active Source**: `mistral-page-source.html` (Target for copy-pasting new chat HTML).
- **Execution**: Run `node tests/snapshots/test-mistral-to-md.js`.
- **Versioning**: Every run generates a unique timestamped pair in `history/`:
  - `<ID>-source.html`: The raw input used for the test.
  - `<ID>-output.md`: The resulting markdown extraction.
- **Strict Rule**: Scraper logic must be verified against these snapshots to ensure complex structures (tables, code blocks) and de-duplication are handled correctly before deploying to the browser.

## 🚀 Development & Environment

* **Persistent Firefox Profile**: To avoid repetitive "Welcome" modals and maintain login sessions, use the local `.firefox-dev-profile`.
* **Startup Logic**: Execution is handled by `scripts/start-firefox.sh`. 
    * It utilizes `--firefox-profile=./.firefox-dev-profile` and `--keep-profile-changes`.
    * Configuration is hardened via a `user.js` file within the profile folder to silence telemetry and onboarding.
* **Git Hygiene**: 
    * **Ignore**: `.DS_Store`, `node_modules`, `dist/`, and `.firefox-dev-profile/`.
    * **Track**: SVG source files and the generation scripts.


---

## 📄 File Descriptions

### `package.json`
* **Relative Path**: `package.json`
* **Function**: Defines the project's metadata, dependencies, and scripts. It specifies `type: "module"` for ESM, lists development dependencies (Webpack, Babel, ESLint, `jsdom`), and runtime dependencies (`jspdf`, `turndown`).
* **Key Information**:
    *   `"type": "module"`: Enables ES Module syntax.
    *   `scripts`: Contains commands for building (`webpack`), watching for changes (`webpack --watch`), running the extension in Firefox Developer Edition (`web-ext run`), linting, and running specific tests (`test:markdown`).
    *   `devDependencies`: Includes tools for bundling and testing.
    *   `dependencies`: Lists libraries used by the extension at runtime.
* **Key Scripts**:
    * `build`: Runs `webpack`.
    * `start`: Executes `bash scripts/start-firefox.sh`.
    * `icons`: (Manual) `node scripts/generate-icons.js`.
* **Dependencies**: Includes `sharp` (image processing), `turndown` (MD), and `jspdf` (PDF).

### `webpack.config.js`
* **Relative Path**: `webpack.config.js`
* **Function**: Bundles JS entry points and uses `CopyPlugin` to move `manifest.json`, `popup.html`, and the `public/icons` folder (renamed to `icons` in `dist`) into the build directory.
* **Key Information**:
    *   `mode`: Set to "development" for development builds, should be "production" for releases.
    *   `entry`: Defines the entry points for `background.js`, `content.js`, and `popup.js`.
    *   `output`: Specifies the output filename (`[name].js`) and directory (`dist`). `clean: true` ensures a fresh build.
    *   `plugins`: Uses `CopyPlugin` to copy `manifest.json`, `popup.html`, `popup.css` (if uncommented), and `icons` to the `dist` folder.
    *   `module.rules`: Configures `babel-loader` for transpiling JavaScript using `@babel/preset-env`.

### `src/content/content.js`
* **Relative Path**: `src/content/content.js`
* **Function**: This script runs in the context of web pages defined in `manifest.json`. It detects the AI chat platform, extracts messages using the platform-specific static methods, and handles communication with the background script for exporting chat conversations in various formats.
* **Key Information**:
    *   `detectPlatform()`: Identifies the current AI chat platform (e.g., "mistral") based on the `window.location.hostname`.
    *   `exportChat(format)`: The main function triggered by the popup. It calls `Mistral.extractMessages()` (or similar static methods for other platforms) to get chat data, then uses `generateJSON`, `generateMarkdown`, or `generatePDF` from `src/lib/utils/helpers.js` to format the data, and finally sends it to `src/background/background.js` for download.
    *   `chrome.runtime.onMessage.addListener`: Listens for messages from the popup script (`src/popup/popup.js`) to initiate the `exportChat` process.

### `src/lib/platforms/mistral.js`
* **Relative Path**: `src/lib/platforms/mistral.js`
* **Function**: This class extends `AIPlatform` and provides specific logic for interacting with the Mistral AI chat interface. It defines robust selectors for extracting chat messages, user/assistant roles, content, and timestamps from the DOM.
* **Key Information**:
    *   `constructor()`: Initializes `this.selectors` with highly specific CSS selectors tailored to the Mistral AI chat's HTML structure. These selectors target the unique message containers, content areas, and timestamp elements.
    *   `static detect()`: Checks `window.location.hostname` to confirm if the current page is a Mistral AI chat.
    *   `static extractMessages()`: This is the core scraping method. It queries the DOM (specifically within the `conversation-layout`) for message nodes. It then iterates through these nodes, determines the `role` (user/assistant), extracts the `content` (as innerHTML to preserve rich formatting), and separately extracts the `timestamp`. It avoids including timestamps in the content and prevents message duplication by using precise selectors.
    *   The `static generateMarkdown(messages)` method has been removed from this class, as `generateMarkdown` is a utility function handled by `src/lib/utils/helpers.js`.

### `src/lib/utils/helpers.js`
* **Relative Path**: `src/lib/utils/helpers.js`
* **Function**: Contains utility functions for generating different export formats (JSON, Markdown, PDF) from extracted chat messages. It also includes helper functions for Markdown-specific formatting, such as wrapping content in fenced divs and escaping special characters.
* **Key Information**:
    *   `generateJSON(messages)`: Converts a messages array into a pretty-printed JSON string.
    *   `generatePDF(messages)`: Uses `jspdf` to create a basic PDF document from the messages.
    *   `generateMarkdown(messages)`:
        *   Initializes `TurndownService` with specific options for consistent Markdown output (e.g., `headingStyle: 'atx'`, `codeBlockStyle: 'fenced'`).
        *   Maps over each message, prepending the `timestamp` as metadata (if available) and converting the message's HTML `content` to Markdown using `turndownService.turndown()`.
        *   Wraps the resulting Markdown content (and timestamp metadata) in a fenced div using `wrapInFencedDiv()`.
        *   Joins all formatted messages with a `\n\n---\n\n` separator.
    *   `wrapInFencedDiv(role, content)`: Constructs a Pandoc-style fenced div around the provided content. It generates a unique ID using `Date.now()` and `Math.random()` and includes `data-role` attributes. Crucially, it adds blank lines around the content for proper Markdown rendering.
    *   `escapeTripleColons(content)`: Replaces `:::` occurrences in the message content with `\:::` to prevent them from being misinterpreted as fenced div delimiters.

---

## 🆕 Adding a New Platform (e.g., Claude, ChatGPT)

When extending the project to a new AI platform, follow these steps in order:

1.  **Create Platform Class**: Create `src/lib/platforms/[platform].js` extending `AIPlatform`.
2.  **Define Static Selectors**: Identify and document the unique DOM structure:
    * `container`: The main chat scroll area.
    * `message`: Individual message bubbles.
    * `role`: The attribute or class defining User vs. Assistant.
    * `content`: The div containing the actual text/HTML.
    * `timestamp`: The specific element holding the time metadata.
3.  **Implement Static Methods**:
    * `static detect()`: Logic to return `true` based on `window.location.hostname`.
    * `static extractMessages()`: Implementation of the scraping loop with `.filter()` for de-duplication.
4.  **Register in Orchestrator**: Update `src/content/content.js` to include the new class in the detection and extraction logic.
5.  **Update Manifest**: Add the new domain to the `content_scripts.matches` array in `manifest.json`.
6.  **Create Snapshot Test**: 
    * Save a raw HTML sample of a chat to `tests/snapshots/`.
    * Create a test script `tests/snapshots/test-[platform]-to-md.js`.
    * Verify that tables, code blocks, and math formulas are preserved in the output.