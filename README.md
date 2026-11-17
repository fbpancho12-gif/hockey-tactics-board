# Hockey Tactics Board

A field hockey tactics board for iPad that works without internet once it is installed.

**Open it:** https://fbpancho12-gif.github.io/hockey-tactics-board/

## Install on iPad

1. Open the address above in **Safari** while online.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Open it once from the new Home Screen icon while still online, so it saves itself for offline use.

After that, the Home Screen icon works in airplane mode.

## What it does

- Players and opponents with jersey numbers, goalkeepers and team colors
- Ball, pass / run / dribble arrows, and freehand drawing (finger or Apple Pencil)
- Full, vertical and half-pitch views
- Saved plays, kept on the device
- Steps with animated playback

## Where saved plays live

Saved plays are stored on the device that saved them, inside the Home Screen app.
They are not uploaded anywhere. Deleting the Home Screen app also deletes its saved plays.

## Files

| File | What it is |
| --- | --- |
| `src/board.html` | The board itself (same page as the online Claude artifact) |
| `build.mjs` | Builds `index.html` from `src/board.html`: `node build.mjs` |
| `index.html` | The installable page (generated, do not edit by hand) |
| `sw.js` | Service worker that keeps the board working offline |
| `manifest.webmanifest`, `icons/` | Home Screen name and icon |

To ship a change: edit `src/board.html`, run `node build.mjs`, commit and push. Installed iPads pick up
the new version the second time the board is opened while online.
