# AI Chat Open Source Exporter

A privacy-focused, open-source browser extension to export AI chat conversations locally as JSON, Markdown, or PDF.

## Features
- Export conversations from Mistral, soon Anthropic's Claude and Google's Gemini WebUIs.
- Privacy-focused: all processing happens locally in your browser and no data leaves your machine.
- Open-source (GPL 3.0).
- Enhanced message extraction and formatting.
- Support for nested Markdown structures.

## Installation
1. Clone this repo.
2. Load the extension in Firefox/Chrome/Safari.

## Usage
1. Open an AI chat.
2. Click the extension icon.
3. Choose your export format.

## Contributing
Pull requests welcome!

## License
GPL 3.0

## Markdown Handling

When exporting to Markdown, the extension uses Pandoc fenced divs to wrap messages. Each message is wrapped in a div with the following attributes:

- `ai-chat-message`: Class for styling and identification
- Unique ID: Generated using the message role and timestamp
- `data-role`: Specifies the role of the message (user or assistant)