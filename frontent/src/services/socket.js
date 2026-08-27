import { io } from 'socket.io-client';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
// Parse origin from baseUrl (e.g., http://localhost:3005)
const socketUrl = baseUrl.split('/api')[0];

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
});
