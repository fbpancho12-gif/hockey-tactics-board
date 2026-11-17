// Builds index.html (the installable, offline board) from src/board.html.
// Run: node build.mjs
//
// src/board.html is the same page as the online Claude artifact. That page keeps saved
// plays in the artifact's database; here a small stand-in keeps them on the device instead.
import { readFileSync, writeFileSync } from 'node:fs';

const board = readFileSync(new URL('./src/board.html', import.meta.url), 'utf8')
  .replace('<h2>Saved plays</h2>', '<h2>Saved plays on this device</h2>');

const example = {
  name: 'Example: PC drag flick', example: true, view: 'half', updatedAt: Date.UTC(2026, 10, 16),
  board: {
    teams: { a: '#FFC21A', b: '#E0245E', ga: '#2DC653', gb: '#7B2CBF' },
    items: [
      { kind: 'arrow', style: 'pass', x1: 91.1, y1: 15.9, x2: 76.4, y2: 27.2 },
      { kind: 'arrow', style: 'pass', x1: 75.8, y1: 27.5, x2: 90.8, y2: 26.3 },
      { kind: 'arrow', style: 'run', x1: 92.6, y1: 21.5, x2: 81.5, y2: 25.5 },
      { kind: 'arrow', style: 'run', x1: 92.4, y1: 30.5, x2: 84, y2: 30.5 },
      { kind: 'player', team: 'a', num: 11, x: 92.4, y: 15.67 },
      { kind: 'player', team: 'a', num: 8, x: 75.8, y: 27.5 },
      { kind: 'player', team: 'a', num: 5, x: 74.2, y: 30.2 },
      { kind: 'player', team: 'a', num: 9, x: 76.6, y: 19.3 },
      { kind: 'player', team: 'a', num: 10, x: 77, y: 36.2 },
      { kind: 'player', team: 'b', num: 1, gk: true, x: 90.6, y: 27.5 },
      { kind: 'player', team: 'b', num: 6, x: 92.6, y: 21.5 },
      { kind: 'player', team: 'b', num: 2, x: 92.4, y: 30.5 },
      { kind: 'player', team: 'b', num: 4, x: 92.6, y: 34 },
      { kind: 'player', team: 'b', num: 13, x: 44, y: 20 },
      { kind: 'player', team: 'b', num: 14, x: 44, y: 35 },
      { kind: 'ball', x: 91, y: 16.4 },
    ],
  },
};

// Same calls the board makes on the artifact database, answered from localStorage.
const localPlays = `<script>
(() => {
  if (window.claude) return;
  const KEY = 'fh-plays-v1';
  const subs = [];
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const write = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } };
  let docs = read();
  if (!docs || typeof docs !== 'object') { docs = { 'example-pc-drag-flick': ${JSON.stringify(example)} }; write(docs); }
  const meta = { fromCache: false, hasPendingWrites: false };
  const snapshot = () => ({ docs: Object.keys(docs).map((id) => ({ id, exists: true, data: () => docs[id], metadata: meta })), metadata: meta });
  const emit = () => setTimeout(() => subs.forEach((f) => f(snapshot())), 0);
  const fail = (code) => Object.assign(new Error(code), { code });
  const ref = (id) => ({
    id, path: 'plays/' + id,
    set: async (d) => { const next = { ...docs, [id]: JSON.parse(JSON.stringify(d)) }; if (!write(next)) throw fail('quota_exceeded'); docs = next; emit(); },
    delete: async () => { const next = { ...docs }; delete next[id]; if (!write(next)) throw fail('unavailable'); docs = next; emit(); },
  });
  const db = {
    collection: () => ({
      add: async (d) => { const r = ref('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)); await r.set(d); return r; },
      onSnapshot: (f) => { subs.push(f); emit(); return () => {}; },
    }),
    doc: (p) => ref(String(p).split('/')[1]),
  };
  // Another open copy of the board changed the plays: show the new list.
  addEventListener('storage', (e) => { if (e.key === KEY) { docs = read() || {}; emit(); } });
  window.claude = { use: async (name) => (name === 'db' ? db : null) };
})();
</script>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#17457d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Hockey Board">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<style>
:root { color-scheme: light; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
body { margin: 0; font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; }
img { max-width: 100%; }
[hidden] { display: none !important; }
</style>
</head>
<body>
${localPlays}
${board}
<script>
if ('serviceWorker' in navigator) {
  addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
</script>
</body>
</html>
`;

writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html written (' + Math.round(html.length / 1024) + ' KB)');
