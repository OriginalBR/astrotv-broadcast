import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { WebSocketServer, WebSocket } from 'ws';

function astroTvWebSocketPlugin(): Plugin {
  let wss: WebSocketServer | null = null;
  let cachedBroadcastState: any = null;

  return {
    name: 'astrotv-websocket-server',
    configureServer(server) {
      if (!server.httpServer) return;

      // Start WebSocket server on Vite's HTTP server
      wss = new WebSocketServer({ 
        noServer: true,
      });

      // Handle WebSocket upgrade requests on /ws and root
      server.httpServer.on('upgrade', (request, socket, head) => {
        const url = request.url || '';
        // Accept websocket upgrade on /ws or /astrotv-ws
        if (url.startsWith('/ws') || url.startsWith('/astrotv-ws') || url === '/') {
          wss?.handleUpgrade(request, socket, head, (ws) => {
            wss?.emit('connection', ws, request);
          });
        }
      });

      // Also create dedicated WebSocket port 8080 as backup
      try {
        const dedicatedWss = new WebSocketServer({ port: 8080 });
        dedicatedWss.on('connection', (ws) => {
          handleClientConnection(ws, dedicatedWss);
        });
        console.log('\x1b[32m[AstroTv WebSocket]\x1b[0m Dedicated server running on ws://localhost:8080');
      } catch (e) {
        console.log('[AstroTv WebSocket] Port 8080 in use or fallback to Vite HTTP server');
      }

      function broadcastToAll(data: string, senderWs?: WebSocket, targetWss?: WebSocketServer) {
        const serverToUse = targetWss || wss;
        serverToUse?.clients.forEach((client) => {
          if (client !== senderWs && client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      }

      function handleClientConnection(ws: WebSocket, serverInstance?: WebSocketServer) {
        console.log('\x1b[36m[AstroTv WebSocket]\x1b[0m Client connected (OBS / Dashboard)');

        // Send latest cached state immediately upon connection
        if (cachedBroadcastState) {
          ws.send(JSON.stringify({
            type: 'STATE_SYNC',
            payload: cachedBroadcastState,
            timestamp: Date.now(),
          }));
        }

        // Notify client count
        const clientCount = (serverInstance || wss)?.clients.size || 1;
        broadcastToAll(JSON.stringify({
          type: 'CLIENT_COUNT_UPDATE',
          payload: { count: clientCount },
          timestamp: Date.now(),
        }));

        ws.on('message', (messageData) => {
          try {
            const parsed = JSON.parse(messageData.toString());

            // Cache broadcast state
            if (parsed.type === 'STATE_SYNC' && parsed.payload) {
              cachedBroadcastState = {
                ...(cachedBroadcastState || {}),
                ...parsed.payload,
              };
            }

            // If a client requests current state and server has it cached, send it back directly
            if (parsed.type === 'REQUEST_CURRENT_STATE') {
              if (cachedBroadcastState) {
                ws.send(JSON.stringify({
                  type: 'STATE_SYNC',
                  payload: cachedBroadcastState,
                  timestamp: Date.now(),
                }));
              }
            }

            // Broadcast to all other connected clients
            broadcastToAll(messageData.toString(), ws, serverInstance);
          } catch (err) {
            console.error('[AstroTv WebSocket] Message parse error:', err);
          }
        });

        ws.on('close', () => {
          console.log('\x1b[33m[AstroTv WebSocket]\x1b[0m Client disconnected');
          const remaining = (serverInstance || wss)?.clients.size || 0;
          broadcastToAll(JSON.stringify({
            type: 'CLIENT_COUNT_UPDATE',
            payload: { count: remaining },
            timestamp: Date.now(),
          }));
        });
      }

      wss.on('connection', (ws) => {
        handleClientConnection(ws, wss!);
      });

      console.log('\x1b[32m[AstroTv WebSocket]\x1b[0m Integrated WebSocket active on Vite server (/ws)');
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    astroTvWebSocketPlugin(),
  ],
  server: {
    host: true, // Exposes on local network for remote devices/OBS on other machines
    port: 5173,
  },
});
