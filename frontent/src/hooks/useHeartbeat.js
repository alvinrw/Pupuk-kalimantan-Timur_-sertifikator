import { useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function useHeartbeat(intervalMs = 60000) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // Hanya jalankan jika user sedang login

    const sendHeartbeat = async () => {
      try {
        await api.post('/auth/heartbeat');
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    // Kirim segera saat komponen mount
    sendHeartbeat();

    // Set interval untuk mengirim heartbeat secara berkala
    const intervalId = setInterval(sendHeartbeat, intervalMs);

    return () => clearInterval(intervalId);
  }, [user, intervalMs]);
}
