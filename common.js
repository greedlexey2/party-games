const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => (n ?? 0).toLocaleString('ru-RU');
const L = 'ABCD';

function connect(h) {
  let ws;
  const api = { send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } };
  (function open() {
    // On GitHub Pages config.js sets window.GAME_SERVER = 'wss://…'; locally — same host.
    ws = new WebSocket(window.GAME_SERVER || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host));
    ws.onopen = () => h.open && h.open();
    ws.onmessage = e => { const m = JSON.parse(e.data); h[m.t] && h[m.t](m); };
    ws.onclose = () => { h.close && h.close(); setTimeout(open, 1200); };
  })();
  return api;
}

function leaderboard(players, meId) {
  if (!players.length) return '<p class="mute center">Пока никого нет</p>';
  return '<div class="lb">' + players.map((p, i) =>
    `<div class="it ${p.online === false ? 'off' : ''}" ${p.id === meId ? 'style="border-color:var(--sel)"' : ''}>
      <span class="pos">${i + 1}</span><span class="grow">${esc(p.name)}</span><span class="sc">${fmt(p.score)}</span></div>`).join('') + '</div>';
}

function boardHtml(mel, clickable) {
  const n = Math.max(...mel.categories.map(c => c.cells.length), 1);
  return `<div class="board">` + mel.categories.map((c, ci) =>
    `<div class="cat" style="--n:${n}"><div class="cname">${esc(c.name)}</div>` +
    c.cells.map((x, ri) => {
      const cur = mel.cur && mel.cur.c === ci && mel.cur.r === ri;
      const can = clickable && !x.used && mel.phase === 'board';
      return `<button class="cell ${x.used ? 'used' : ''} ${cur ? 'cur' : ''}" ${can ? `data-pick="${ci},${ri}"` : 'disabled'}>${x.points}</button>`;
    }).join('') + `</div>`).join('') + `</div>`;
}

function toast(t) {
  const d = document.createElement('div'); d.className = 'toast pop'; d.textContent = t;
  document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
}
