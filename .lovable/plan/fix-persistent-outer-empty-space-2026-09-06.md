# Fix persistent outer empty space

## What will change
- Remove the full-viewport height constraints from the main app wrapper so its height follows the current page content.
- Remove the global forced `height: 100%` chain from the document root where it keeps the outer canvas taller than short pages.
- Keep the app visually connected to its surrounding paper background by reducing the outer gutter, especially on small screens.

## Verification
- Check a short note and a longer page at desktop and mobile widths.
- Confirm there is no large dead area below the app, no clipped content, and scrolling still works naturally.
- Confirm the current build has no new errors.

## Technical details
- Update only the shared shell and global layout styles; individual page content heights stay unchanged unless testing proves they are part of the root cause.
- Replace desktop `h-dvh` / `min-h-dvh` behavior with content-driven sizing and use small responsive outer padding.
