// Real-Time WebSocket + BroadcastChannel Multi-Transport Synchronization Engine

export type BroadcastMessageType = 
  | 'STATE_SYNC'
  | 'TRIGGER_OVERLAY'
  | 'HIDE_OVERLAY'
  | 'TRIGGER_TRANSITION'
  | 'UPDATE_SCORE'
  | 'UPDATE_TIME'
  | 'BLACKOUT_TOGGLE'
  | 'REQUEST_CURRENT_STATE'
  | 'CLIENT_COUNT_UPDATE';

export interface BroadcastMessage {
  type: BroadcastMessageType;
  payload: any;
  timestamp: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

const CHANNEL_NAME = 'astrotv_broadcast_bus';

class BroadcastSyncBus {
  private channel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private listeners: Array<(msg: BroadcastMessage) => void> = [];
  private statusListeners: Array<(status: ConnectionStatus, clientCount: number) => void> = [];
  
  public connectionStatus: ConnectionStatus = 'disconnected';
  public clientCount: number = 1;
  private reconnectTimer: any = null;
  private pingInterval: any = null;

  constructor() {
    // 1. Initialize BroadcastChannel for local tab fallback
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const msg = event.data as BroadcastMessage;
        this.notifyListeners(msg);
      };
    }

    // 2. Initialize WebSocket for OBS Studio CEF & Remote Networks
    if (typeof window !== 'undefined') {
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname || 'localhost';
    const port = window.location.port || '5173';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Primary: ws://localhost:5173/ws | Fallback: ws://localhost:8080
    const primaryWsUrl = `${protocol}//${window.location.host}/ws`;
    const fallbackWsUrl = `${protocol}//${hostname}:8080`;

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(primaryWsUrl);

      this.ws.onopen = () => {
        console.log('[AstroTv Sync] WebSocket connected to', primaryWsUrl);
        this.setStatus('connected');
        
        // Handshake: Request current state from other clients/server
        this.send('REQUEST_CURRENT_STATE', {});

        // Keep-alive ping every 15s
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as BroadcastMessage;
          if (msg.type === 'CLIENT_COUNT_UPDATE') {
            this.clientCount = msg.payload.count || 1;
            this.notifyStatusListeners();
          } else if (msg.type) {
            this.notifyListeners(msg);
          }
        } catch (e) {
          // Ignore non-json
        }
      };

      this.ws.onerror = () => {
        // Try fallback port 8080 if primary fails
        if (this.ws && this.ws.url === primaryWsUrl) {
          try {
            const fbWs = new WebSocket(fallbackWsUrl);
            fbWs.onopen = () => {
              this.ws = fbWs;
              this.setStatus('connected');
              this.send('REQUEST_CURRENT_STATE', {});
            };
          } catch (e) {}
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        if (this.pingInterval) clearInterval(this.pingInterval);
        
        // Auto-reconnect every 2.5 seconds
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectWebSocket();
          }, 2500);
        }
      };
    } catch (err) {
      console.warn('[AstroTv Sync] WS connection attempt failed, will retry...', err);
      this.setStatus('disconnected');
      if (!this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.connectWebSocket();
        }, 3000);
      }
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.notifyStatusListeners();
  }

  private notifyStatusListeners() {
    this.statusListeners.forEach((fn) => fn(this.connectionStatus, this.clientCount));
  }

  private notifyListeners(msg: BroadcastMessage) {
    this.listeners.forEach((listener) => listener(msg));
  }

  // Send message across all available transports (WebSocket + BroadcastChannel + LocalStorage)
  send(type: BroadcastMessageType, payload: any = {}) {
    const msg: BroadcastMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // 1. Send via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (e) {
        console.warn('WS send error:', e);
      }
    }

    // 2. Send via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {}
    }

    // 3. Fallback via LocalStorage storage events
    try {
      localStorage.setItem('astrotv_bus_event', JSON.stringify(msg));
    } catch (e) {}
  }

  subscribe(callback: (msg: BroadcastMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  subscribeStatus(callback: (status: ConnectionStatus, clientCount: number) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.connectionStatus, this.clientCount);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== callback);
    };
  }
}

export const broadcastBus = new BroadcastSyncBus();
