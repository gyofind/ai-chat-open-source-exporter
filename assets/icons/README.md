# 🎨 Extension Icons & Branding

This directory contains the original vector source files for the extension's branding. To maintain cross-platform compatibility and high-density display support, these vectors are exported to raster PNGs for production.

## 📂 File Map

| File | Purpose | Theme |
| --- | --- | --- |
| `logo-ADLaM-dark-theme.svg` | Source for Dark Mode UI | Used when the browser/OS is in Dark Mode |
| `logo-ADLaM-light-theme.svg` | Source for Light Mode UI | Used for standard high-contrast visibility |

## ⚙️ Export Specifications (from Inkscape)

When exporting from Inkscape to `public/icons/`, use the following settings to ensure the icons are crisp:

* **Export Area**: Select the **Page** or the specific **Selection** (ensure it's a perfect square).
* **Format**: PNG (`.png`)
* **Color Space**: sRGB
* **Required Sizes**:
* **16x16 px**: Used for tab favicons and small UI elements.
* **32x32 px**: Used for the Firefox toolbar.
* **48x48 px**: The primary extension icon.
* **96x96 px**: For High-DPI / Retina displays.



> [!IMPORTANT]
> Always ensure "Hide all except selected" is unchecked if you have background layers, or checked if you are exporting transparent backgrounds.