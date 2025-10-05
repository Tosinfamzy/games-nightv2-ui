import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SocketContextValue {
  sessionsSocket: Socket | null;
  gamesSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  sessionsSocket: null,
  gamesSocket: null,
  isConnected: false,
});

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [sessionsSocket, setSessionsSocket] = useState<Socket | null>(null);
  const [gamesSocket, setGamesSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create sessions namespace socket
    const sessionSocket = io(`${API_URL}/sessions`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Create games namespace socket
    const gameSocket = io(`${API_URL}/games`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection handlers for sessions socket
    sessionSocket.on('connect', () => {
      console.log('Sessions socket connected:', sessionSocket.id);
      setIsConnected(true);
    });

    sessionSocket.on('disconnect', () => {
      console.log('Sessions socket disconnected');
      setIsConnected(false);
    });

    sessionSocket.on('connect_error', (error) => {
      console.error('Sessions socket connection error:', error);
    });

    // Connection handlers for games socket
    gameSocket.on('connect', () => {
      console.log('Games socket connected:', gameSocket.id);
    });

    gameSocket.on('disconnect', () => {
      console.log('Games socket disconnected');
    });

    gameSocket.on('connect_error', (error) => {
      console.error('Games socket connection error:', error);
    });

    setSessionsSocket(sessionSocket);
    setGamesSocket(gameSocket);

    // Cleanup on unmount
    return () => {
      sessionSocket.disconnect();
      gameSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sessionsSocket, gamesSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
