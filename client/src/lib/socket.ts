// ──────────────────────────────────────────────
// XOChat — Socket.IO Client
// ──────────────────────────────────────────────
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket: Socket | null = null;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const storageToken = sessionStorage.getItem('xo_session_token');
  if (storageToken) return storageToken;
  return getCookie('xo_session_client') || getCookie('xo_session');
}

export function getSocket(): Socket {
  if (!socket) {
    const token = getToken();
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token: token || undefined,
      },
    });
  }
  return socket;
}

export function connectSocket(overrideToken?: string): void {
  const token = overrideToken || getToken();
  const s = getSocket();
  const currentToken = (s.auth as any)?.token;

  if (token && currentToken !== token) {
    s.auth = { token };
    if (s.connected) {
      s.disconnect();
    }
  }

  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
