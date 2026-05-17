import { WebSocketServer } from 'ws';

const clients = new Map(); // ws -> { userId }
const presence = new Map(); // userId -> Set<ws>

export function presenceList() {
  return Array.from(presence.keys());
}

export function broadcast(payload, exclude = null) {
  const data = JSON.stringify(payload);
  for (const [ws] of clients) {
    if (ws === exclude) continue;
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

export function sendToUser(userId, payload) {
  const set = presence.get(userId);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const ws of set) if (ws.readyState === ws.OPEN) ws.send(data);
}

function addPresence(userId, ws) {
  let set = presence.get(userId);
  if (!set) { set = new Set(); presence.set(userId, set); }
  const wasEmpty = set.size === 0;
  set.add(ws);
  if (wasEmpty) broadcast({ type: 'presence', userId, online: true });
}

function removePresence(userId, ws) {
  const set = presence.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) {
    presence.delete(userId);
    broadcast({ type: 'presence', userId, online: false });
  }
}

export function attachWs(server, sessionMiddleware) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url.startsWith('/ws')) return;
    sessionMiddleware(req, {}, () => {
      const userId = req.session?.userId;
      if (!userId) { socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); socket.destroy(); return; }
      wss.handleUpgrade(req, socket, head, (ws) => {
        clients.set(ws, { userId });
        addPresence(userId, ws);
        ws.send(JSON.stringify({ type: 'hello', userId, online: presenceList() }));
        wss.emit('connection', ws, req);
      });
    });
  });

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      const meta = clients.get(ws);
      if (!meta) return;
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (msg.type === 'typing' && msg.threadId) {
        broadcast({ type: 'typing', threadId: msg.threadId, userId: meta.userId }, ws);
      }
    });
    ws.on('close', () => {
      const meta = clients.get(ws);
      if (!meta) return;
      clients.delete(ws);
      removePresence(meta.userId, ws);
    });
  });

  return wss;
}
