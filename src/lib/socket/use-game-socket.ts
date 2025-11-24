import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from './socket-context';

/**
 * Hook to connect to a game room and listen for real-time updates
 */
export const useGameSocket = (gameId: string | undefined) => {
  const { gamesSocket, isConnected } = useSocketContext();
  const queryClient = useQueryClient();
  const hasJoinedRef = useRef(false);

  // Join game room
  useEffect(() => {
    if (!gamesSocket || !gameId || !isConnected || hasJoinedRef.current) {
      return;
    }

    console.log(`Joining game room: ${gameId}`);
    gamesSocket.emit('join-game', gameId);
    hasJoinedRef.current = true;

    return () => {
      if (gamesSocket && gameId) {
        console.log(`Leaving game room: ${gameId}`);
        gamesSocket.emit('leave-game', gameId);
        hasJoinedRef.current = false;
      }
    };
  }, [gamesSocket, gameId, isConnected]);

  // Listen for score submitted
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleScoreSubmitted = (data: any) => {
      console.log('Score submitted:', data);
      queryClient.invalidateQueries({ queryKey: ['scores', 'game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', gameId] });
    };

    gamesSocket.on('game:score-submitted', handleScoreSubmitted);

    return () => {
      gamesSocket.off('game:score-submitted', handleScoreSubmitted);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for score updated
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleScoreUpdated = (data: any) => {
      console.log('Score updated:', data);
      queryClient.invalidateQueries({ queryKey: ['scores', 'game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', gameId] });
    };

    gamesSocket.on('game:score-updated', handleScoreUpdated);

    return () => {
      gamesSocket.off('game:score-updated', handleScoreUpdated);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for game started
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleGameStarted = (data: any) => {
      console.log('Game started:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:started', handleGameStarted);

    return () => {
      gamesSocket.off('game:started', handleGameStarted);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for game paused
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleGamePaused = (data: any) => {
      console.log('Game paused:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:paused', handleGamePaused);

    return () => {
      gamesSocket.off('game:paused', handleGamePaused);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for game resumed
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleGameResumed = (data: any) => {
      console.log('Game resumed:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:resumed', handleGameResumed);

    return () => {
      gamesSocket.off('game:resumed', handleGameResumed);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for game completed
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleGameCompleted = (data: any) => {
      console.log('Game completed:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:completed', handleGameCompleted);

    return () => {
      gamesSocket.off('game:completed', handleGameCompleted);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for round started
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleRoundStarted = (data: any) => {
      console.log('Round started:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:round-started', handleRoundStarted);

    return () => {
      gamesSocket.off('game:round-started', handleRoundStarted);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for round ended
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleRoundEnded = (data: any) => {
      console.log('Round ended:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:round-ended', handleRoundEnded);

    return () => {
      gamesSocket.off('game:round-ended', handleRoundEnded);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for game state changed
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleStateChanged = (data: any) => {
      console.log('Game state changed:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:state-changed', handleStateChanged);

    return () => {
      gamesSocket.off('game:state-changed', handleStateChanged);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for leaderboard updates
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleLeaderboardUpdate = (data: any) => {
      console.log('Leaderboard updated:', data);
      queryClient.setQueryData(['leaderboard', gameId], data.leaderboard);
    };

    gamesSocket.on('game:leaderboard-updated', handleLeaderboardUpdate);

    return () => {
      gamesSocket.off('game:leaderboard-updated', handleLeaderboardUpdate);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for turn started events (timer)
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleTurnStarted = (data: any) => {
      console.log('Turn started:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:turn-started', handleTurnStarted);

    return () => {
      gamesSocket.off('game:turn-started', handleTurnStarted);
    };
  }, [gamesSocket, gameId, queryClient]);

  // Listen for turn advanced events (timer)
  useEffect(() => {
    if (!gamesSocket || !gameId) return;

    const handleTurnAdvanced = (data: any) => {
      console.log('Turn advanced:', data);
      queryClient.invalidateQueries({ queryKey: ['games', gameId] });
    };

    gamesSocket.on('game:turn-advanced', handleTurnAdvanced);

    return () => {
      gamesSocket.off('game:turn-advanced', handleTurnAdvanced);
    };
  }, [gamesSocket, gameId, queryClient]);

  return {
    isConnected,
    socket: gamesSocket,
  };
};
