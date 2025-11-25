import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from '../lib/socket/socket-context';
import { gamesMasterService } from '../lib/api/services/games-master.service';

/**
 * Hook to fetch and manage GM Dashboard data with real-time WebSocket updates
 *
 * @param gamesMasterId - The Games Master ID to fetch dashboard for
 * @returns Dashboard data, loading state, error state, and refetch function
 */
export const useGMDashboard = (gamesMasterId: string | undefined) => {
  const queryClient = useQueryClient();
  const { sessionsSocket, gamesSocket, isConnected } = useSocketContext();

  // Fetch dashboard data from backend
  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gm-dashboard', gamesMasterId],
    queryFn: () => {
      if (!gamesMasterId) {
        throw new Error('Games Master ID is required');
      }
      return gamesMasterService.getDashboard(gamesMasterId);
    },
    enabled: !!gamesMasterId,
    refetchInterval: 30000, // Fallback: refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Listen to session events for real-time dashboard updates
  useEffect(() => {
    if (!sessionsSocket || !gamesMasterId) return;

    const handleSessionEvent = (data: any) => {
      console.log('GM Dashboard: Session event received', data);
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ['gm-dashboard', gamesMasterId] });
    };

    // Subscribe to all relevant session events
    sessionsSocket.on('session:player-online', handleSessionEvent);
    sessionsSocket.on('session:player-offline', handleSessionEvent);
    sessionsSocket.on('session:player-joined', handleSessionEvent);
    sessionsSocket.on('session:player-left', handleSessionEvent);
    sessionsSocket.on('session:status-changed', handleSessionEvent);
    sessionsSocket.on('session:team-created', handleSessionEvent);
    sessionsSocket.on('session:team-deleted', handleSessionEvent);

    return () => {
      sessionsSocket.off('session:player-online', handleSessionEvent);
      sessionsSocket.off('session:player-offline', handleSessionEvent);
      sessionsSocket.off('session:player-joined', handleSessionEvent);
      sessionsSocket.off('session:player-left', handleSessionEvent);
      sessionsSocket.off('session:status-changed', handleSessionEvent);
      sessionsSocket.off('session:team-created', handleSessionEvent);
      sessionsSocket.off('session:team-deleted', handleSessionEvent);
    };
  }, [sessionsSocket, gamesMasterId, queryClient]);

  // Listen to game events for real-time dashboard updates
  useEffect(() => {
    if (!gamesSocket || !gamesMasterId) return;

    const handleGameEvent = (data: any) => {
      console.log('GM Dashboard: Game event received', data);
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ['gm-dashboard', gamesMasterId] });
    };

    // Subscribe to relevant game events
    gamesSocket.on('game:started', handleGameEvent);
    gamesSocket.on('game:completed', handleGameEvent);
    gamesSocket.on('game:paused', handleGameEvent);
    gamesSocket.on('game:resumed', handleGameEvent);
    gamesSocket.on('game:round-started', handleGameEvent);
    gamesSocket.on('game:round-ended', handleGameEvent);

    return () => {
      gamesSocket.off('game:started', handleGameEvent);
      gamesSocket.off('game:completed', handleGameEvent);
      gamesSocket.off('game:paused', handleGameEvent);
      gamesSocket.off('game:resumed', handleGameEvent);
      gamesSocket.off('game:round-started', handleGameEvent);
      gamesSocket.off('game:round-ended', handleGameEvent);
    };
  }, [gamesSocket, gamesMasterId, queryClient]);

  return {
    dashboard,
    isLoading,
    error,
    refetch,
    isConnected,
  };
};
