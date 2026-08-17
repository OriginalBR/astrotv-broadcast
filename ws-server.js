// Dedicated Standalone WebSocket Server for AstroTv Broadcast Suite
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
let cachedState = null;

console.log(`\x1b[32m[AstroTv WebSocket Server]\x1b[0m Running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('\x1b[36m[AstroTv WS]\x1b[0m Client connected (OBS Studio / Operator Dashboard)');

  // Send cached state immediately on connect
  if (cachedState) {
    ws.send(JSON.stringify({
      type: 'STATE_SYNC',
      payload: cachedState,
      timestamp: Date.now(),
    }));
  }

  // Broadcast updated client count
  broadcastAll(JSON.stringify({
    type: 'CLIENT_COUNT_UPDATE',
    payload: { count: wss.clients.size },
    timestamp: Date.now(),
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'STATE_SYNC' && msg.payload) {
        cachedState = { ...(cachedState || {}), ...msg.payload };
      }

      if (msg.type === 'REQUEST_CURRENT_STATE' && cachedState) {
        ws.send(JSON.stringify({
          type: 'STATE_SYNC',
          payload: cachedState,
          timestamp: Date.now(),
        }));
      }

      // Broadcast to all other clients
      broadcastAll(data.toString(), ws);
    } catch (e) {}
  });

  ws.on('close', () => {
    console.log('\x1b[33m[AstroTv WS]\x1b[0m Client disconnected');
    broadcastAll(JSON.stringify({
      type: 'CLIENT_COUNT_UPDATE',
      payload: { count: wss.clients.size },
      timestamp: Date.now(),
    }));
  });
});

function broadcastAll(message, sender) {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
