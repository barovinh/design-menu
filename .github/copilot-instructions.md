Menu Studio workspace instructions.

Project context:
- Vite + React + TypeScript app for designing Vietnamese food menus.
- Core features: drag and drop elements on a canvas, upload images, add stickers/text, and reorder layers.
- The starter data should reflect the menu categories and items provided by the user.

Implementation guidance:
- Prefer small, focused changes that preserve the editor workflow.
- Keep the canvas interactive and responsive on desktop layouts.
- Use local state and localStorage unless persistence is explicitly requested.
- When editing the menu designer, keep layer ordering, selection, and property controls consistent.

Quality checks:
- Run `npm run build` after changes that affect the app.
- Update the README if the run or build flow changes.