import { vi } from 'vitest';
import type { Socket } from 'socket.io-client';

export type MockSocket = {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  connected: boolean;
  id: string;
};

/**
 * Creates a mock Socket.IO client for testing
 */
export function createMockSocket(overrides?: Partial<MockSocket>): Socket {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: `mock-socket-${Math.random().toString(36).substring(7)}`,
    ...overrides,
  };

  return mockSocket as unknown as Socket;
}

/**
 * Simulates a socket event emission
 */
export function emitSocketEvent(
  socket: MockSocket,
  eventName: string,
  data: any
) {
  const listeners = socket.on.mock.calls
    .filter(([event]) => event === eventName)
    .map(([, callback]) => callback);

  listeners.forEach((listener) => listener(data));
}

/**
 * Gets all event listeners registered for a specific event
 */
export function getSocketListeners(socket: MockSocket, eventName: string) {
  return socket.on.mock.calls
    .filter(([event]) => event === eventName)
    .map(([, callback]) => callback);
}

/**
 * Verifies that a socket event listener was registered
 */
export function expectSocketListenerRegistered(
  socket: MockSocket,
  eventName: string
) {
  const listeners = getSocketListeners(socket, eventName);
  if (listeners.length === 0) {
    throw new Error(`No listeners registered for event: ${eventName}`);
  }
  return listeners;
}

/**
 * Creates a mock socket context with all three sockets
 */
export function createMockSocketContext() {
  return {
    sessionsSocket: createMockSocket(),
    gamesSocket: createMockSocket(),
    chatSocket: createMockSocket(),
    isConnected: true,
  };
}

/**
 * Simulates socket connection
 */
export function simulateSocketConnect(socket: MockSocket) {
  socket.connected = true;
  emitSocketEvent(socket, 'connect', {});
}

/**
 * Simulates socket disconnection
 */
export function simulateSocketDisconnect(socket: MockSocket) {
  socket.connected = false;
  emitSocketEvent(socket, 'disconnect', {});
}

/**
 * Creates a spy on socket event emissions
 */
export function spyOnSocketEmit(socket: MockSocket) {
  return socket.emit;
}
