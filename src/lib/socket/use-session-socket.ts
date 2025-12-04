import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from './socket-context';

/**
 * Hook to connect to a session room and listen for real-time updates
 */
export const useSessionSocket = (sessionId: string | undefined) => {
  const { sessionsSocket, isConnected } = useSocketContext();
  const queryClient = useQueryClient();
  const hasJoinedRef = useRef(false);

  // Join session room
  useEffect(() => {
    if (!sessionsSocket || !sessionId || !isConnected || hasJoinedRef.current) {
      return;
    }

    console.log(`Joining session room: ${sessionId}`);
    sessionsSocket.emit('join-session', sessionId);
    hasJoinedRef.current = true;

    return () => {
      if (sessionsSocket && sessionId) {
        console.log(`Leaving session room: ${sessionId}`);
        sessionsSocket.emit('leave-session', sessionId);
        hasJoinedRef.current = false;
      }
    };
  }, [sessionsSocket, sessionId, isConnected]);

  // Listen for player joined
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handlePlayerJoined = (data: any) => {
      console.log('Player joined:', data);
      // Invalidate players query to refetch
      queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-readiness', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    };

    sessionsSocket.on('session:player-joined', handlePlayerJoined);

    return () => {
      sessionsSocket.off('session:player-joined', handlePlayerJoined);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for player left
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handlePlayerLeft = (data: any) => {
      console.log('Player left:', data);
      queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-readiness', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    };

    sessionsSocket.on('session:player-left', handlePlayerLeft);

    return () => {
      sessionsSocket.off('session:player-left', handlePlayerLeft);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for player readiness changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handlePlayerReadyChanged = (data: any) => {
      console.log('Player readiness changed:', data);
      queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-readiness', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-can-start', sessionId] });
    };

    sessionsSocket.on('session:player-ready-changed', handlePlayerReadyChanged);

    return () => {
      sessionsSocket.off('session:player-ready-changed', handlePlayerReadyChanged);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for session readiness changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handleReadinessChanged = (data: any) => {
      console.log('Session readiness changed:', data);
      queryClient.setQueryData(['session-readiness', sessionId], data.readiness);
    };

    sessionsSocket.on('session:readiness-changed', handleReadinessChanged);

    return () => {
      sessionsSocket.off('session:readiness-changed', handleReadinessChanged);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for session status changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handleStatusChanged = (data: any) => {
      console.log('Session status changed:', data);
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    };

    sessionsSocket.on('session:status-changed', handleStatusChanged);

    return () => {
      sessionsSocket.off('session:status-changed', handleStatusChanged);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for team events
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handleTeamCreated = (data: any) => {
      console.log('Team created:', data);
      queryClient.invalidateQueries({ queryKey: ['teams', 'session', sessionId] });
    };

    const handleTeamUpdated = (data: any) => {
      console.log('Team updated:', data);
      queryClient.invalidateQueries({ queryKey: ['teams', 'session', sessionId] });
    };

    const handleTeamDeleted = (data: any) => {
      console.log('Team deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['teams', 'session', sessionId] });
    };

    const handlePlayerAssigned = (data: any) => {
      console.log('Player assigned to team:', data);
      queryClient.invalidateQueries({ queryKey: ['teams', 'session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] });
    };

    sessionsSocket.on('session:team-created', handleTeamCreated);
    sessionsSocket.on('session:team-updated', handleTeamUpdated);
    sessionsSocket.on('session:team-deleted', handleTeamDeleted);
    sessionsSocket.on('session:player-assigned-to-team', handlePlayerAssigned);

    return () => {
      sessionsSocket.off('session:team-created', handleTeamCreated);
      sessionsSocket.off('session:team-updated', handleTeamUpdated);
      sessionsSocket.off('session:team-deleted', handleTeamDeleted);
      sessionsSocket.off('session:player-assigned-to-team', handlePlayerAssigned);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for can-start changes
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handleCanStartChanged = (data: any) => {
      console.log('Can start changed:', data);
      queryClient.invalidateQueries({ queryKey: ['session-can-start', sessionId] });
    };

    sessionsSocket.on('session:can-start-changed', handleCanStartChanged);

    return () => {
      sessionsSocket.off('session:can-start-changed', handleCanStartChanged);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for player online events
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handlePlayerOnline = (data: any) => {
      console.log('Player online:', data);
      // Invalidate queries to update player online status
      queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] });
    };

    sessionsSocket.on('session:player-online', handlePlayerOnline);

    return () => {
      sessionsSocket.off('session:player-online', handlePlayerOnline);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  // Listen for player offline events
  useEffect(() => {
    if (!sessionsSocket || !sessionId) return;

    const handlePlayerOffline = (data: any) => {
      console.log('Player offline:', data);
      // Invalidate queries to update player online status
      queryClient.invalidateQueries({ queryKey: ['players', 'session', sessionId] });
    };

    sessionsSocket.on('session:player-offline', handlePlayerOffline);

    return () => {
      sessionsSocket.off('session:player-offline', handlePlayerOffline);
    };
  }, [sessionsSocket, sessionId, queryClient]);

  return {
    isConnected,
    socket: sessionsSocket,
  };
};
