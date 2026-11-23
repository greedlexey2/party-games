const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => (n ?? 0).toLocaleString('ru-RU');
const L = 'ABCD';

function connect(h) {
  let ws, retry = null;
  const api = { send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } };
  function open() {
    clearTimeout(retry); retry = null;
    // On GitHub Pages config.js sets window.GAME_SERVER = 'wss://…'; locally — same host.
    ws = new WebSocket(window.GAME_SERVER || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host));
    ws.onopen = () => h.open && h.open();
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch { return; } try { h[m.t] && h[m.t](m); } catch (err) { console.error(err); } };
    ws.onclose = () => { h.close && h.close(); if (!retry) retry = setTimeout(open, 1200); };
  }
  // Back from another app / screen lock: reconnect at once instead of waiting.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ws && ws.readyState > 1) { ws.onclose = null; open(); }
  });
  open();
  return api;
}

function leaderboard(players, meId) {
  if (!players.length) return '<p class="mute center">Пока никого нет</p>';
  return '<div class="lb">' + players.map((p, i) =>
    `<div class="it ${p.online === false ? 'off' : ''}" ${p.me || (meId && p.id === meId) ? 'style="border-color:var(--sel)"' : ''}>
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

// Host hint + phone-a-friend countdown, shown on every screen during a Millionaire question.
function lifelinesHtml(m, at) {
  let h = '';
  if (m.hint) h += `<div class="lifeline pop"><div class="k">Подсказка ведущего</div><div style="font-weight:700;margin-top:4px">${esc(m.hint)}</div></div>`;
  if (m.callLeft > 0) h += `<div class="lifeline pop"><div class="k">Звонок другу${m.callWho ? ' · ' + esc(m.callWho) : ''}</div>
    <div class="num" style="font-size:32px;margin-top:4px" data-until="${at + m.callLeft}">${Math.ceil(m.callLeft / 1000)}</div></div>`;
  return h;
}
setInterval(() => document.querySelectorAll('[data-until]').forEach(el => {
  const s = Math.max(0, Math.ceil((+el.dataset.until - Date.now()) / 1000));
  el.textContent = s ? s : 'Время!';
}), 250);

function toast(t) {
  const d = document.createElement('div'); d.className = 'toast pop'; d.textContent = t;
  document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
}
