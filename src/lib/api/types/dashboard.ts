export type UUID = string;

/**
 * GM Dashboard main interface
 */
export interface GMDashboard {
  gamesMasterId: UUID;
  gamesMasterName: string;
  stats: DashboardStats;
  sessions: DashboardSession[];
  lastUpdated: Date | string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalPlayers: number;
  onlinePlayers: number;
  totalGames: number;
  gamesInProgress: number;
  gamesCompleted: number;
}

/**
 * Session info for dashboard
 */
export interface DashboardSession {
  id: UUID;
  name: string;
  status: string;
  location: string;
  scheduledFor: Date | string;
  playersCount: number;
  players: DashboardPlayer[];
  games: DashboardGame[];
  gamesInProgress: number;
  gamesCompleted: number;
}

/**
 * Player info for dashboard
 */
export interface DashboardPlayer {
  id: UUID;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  teamId?: UUID;
  teamName?: string;
}

/**
 * Game info for dashboard
 */
export interface DashboardGame {
  id: UUID;
  name: string;
  status: string;
  currentRound: number;
  maxRounds: number;
  teamsCount: number;
  currentTurnTeamId?: UUID;
  currentTurnTeamName?: string;
  turnStartedAt?: Date | string;
  turnTimeLimit?: number;
  winnerId?: UUID;
  createdAt: Date | string;
}
