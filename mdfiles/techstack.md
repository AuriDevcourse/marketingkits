## Goal
Create a tool that works locally and can be embedded in a WordPress website.

## Recommended Tech Stack

### Frontend
- **HTML** – structure of the page
- **CSS** – layout, fonts, positioning (Archivo Expanded font can be loaded via `@font-face` or hosted locally)
- **JavaScript** – to handle:
  - Image upload
  - Background switching
  - Live preview
  - Canvas rendering
  - JPG export (using libraries like `html2canvas`)

### Optional Libraries
- **html2canvas** – for rendering the final layout into a downloadable JPG
- **Vanilla JS** is enough – no frameworks are required

### Embedding in WordPress
- Build and test the tool as a standalone HTML page
- Upload it to GitHub Pages or your web server
- Use WordPress's **HTML widget** (via Elementor Pro or native block editor)
- Embed the tool using an `<iframe>` that links to your hosted tool

This approach keeps your tool editable, portable, and fully styled with your assets.