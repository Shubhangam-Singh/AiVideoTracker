// Singleton WebSocket client with auto-reconnect + subscriber registry.

const listeners = new Set();
let ws = null;
let reconnectTimer = null;
let lastConnectAt = 0;
let isAlive = false;

function url() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

function notify(event) {
  for (const fn of listeners) {
    try { fn(event); } catch (err) { console.error('[ws listener error]', err); }
  }
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  lastConnectAt = Date.now();
  try { ws = new WebSocket(url()); } catch (e) { scheduleReconnect(); return; }
  ws.onopen = () => { isAlive = true; notify({ type: 'open' }); };
  ws.onmessage = (e) => {
    try { notify(JSON.parse(e.data)); } catch {}
  };
  ws.onclose = () => { isAlive = false; notify({ type: 'close' }); scheduleReconnect(); };
  ws.onerror = () => { /* close will follow */ };
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const since = Date.now() - lastConnectAt;
  const delay = since < 2000 ? 2000 : 500;
  reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, delay);
}

export const socket = {
  start() { connect(); },
  stop() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (ws) { try { ws.close(); } catch {} ws = null; }
    isAlive = false;
  },
  send(payload) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  isOpen: () => isAlive,
};

export default socket;
