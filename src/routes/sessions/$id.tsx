import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  playerService,
  sessionManagementService,
  sessionService,
} from '../../lib/api/services'
import { useSessionFull } from '../../lib/api/hooks/use-session'
import { useSessionSocket } from '../../lib/socket'
import { usePlayer } from '../../contexts/PlayerContext'
import { useCurrentGm } from '../../lib/api/hooks/use-current-gm'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { TeamFormationInterface } from '../../components/TeamFormationInterface'
import { TeamDisplay } from '../../components/TeamDisplay'
import { EnhancedTeamManagement } from '../../components/EnhancedTeamManagement'
import { SessionReadinessDashboard } from '../../components/SessionReadinessDashboard'
import { EnhancedGamesTab } from '../../components/EnhancedGamesTab'
import { ManualTeamCreator } from '../../components/ManualTeamCreator'
import SessionChat from '../../components/SessionChat'
import { GuestList } from '../../components/GuestList'
import GameHistoryList from '../../components/GameHistoryList'
import PlayerStatusBadge from '../../components/PlayerStatusBadge'
import OnlinePlayerCount from '../../components/OnlinePlayerCount'
import JoinCodeQR from '../../components/JoinCodeQR'
import ShareSessionModal from '../../components/ShareSessionModal'
import { SessionDetailSkeleton } from '../../components/LoadingSkeleton'
import { QueryErrorDisplay } from '../../components/QueryErrorDisplay'
import { SessionStatusBadge } from '../../components/SessionStatusBadge'
import { StartSessionButton } from '../../components/StartSessionButton'
import { ReadyCelebration } from '../../components/ReadyCelebration'
import {
  enrichTeamsWithPlayers,
  transformGames,
  transformPlayers,
} from '../../lib/utils/data-transforms'
import { showToast, toastHelpers } from '../../lib/toast'

export const Route = createFileRoute('/sessions/$id')({
  component: SessionDetailsPage,
})

function SessionDetailsPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'players' | 'guests' | 'games' | 'teams' | 'chat' | 'history'
  >('overview')
  const [showManualTeamCreator, setShowManualTeamCreator] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showReadyCelebration, setShowReadyCelebration] = useState(false)
  const [previousReadyState, setPreviousReadyState] = useState(false)

  // Connect to session WebSocket for real-time updates
  useSessionSocket(id)

  // Fetch session with all nested resources (games, teams, players) in parallel
  const { session, games, teams, players, isLoading, isError, error } =
    useSessionFull(id)

  // Get current player from context
  const { player } = usePlayer()
  const currentPlayerId = player?.id

  // Check if current user is the Games Master/host (the signed-in Clerk GM
  // whose id matches this session's host).
  const { data: currentGm } = useCurrentGm()
  const isHost = Boolean(currentGm?.id && currentGm.id === session?.host.id)

  // The game the team-management panel should target: the live one if any,
  // else the most recent (was hardcoded to games[0]).
  const activeGame =
    games.find((g) =>
      ['in_progress', 'round_in_progress', 'paused'].includes(
        String(g.status).toLowerCase(),
      ),
    ) ?? games[games.length - 1]

  // Transform API data to UI-friendly format for components
  const uiPlayers = transformPlayers(players)
  const uiGames = transformGames(games)
  const uiGamesWithTeamSize = transformGames(games, true) // Include recommended team size
  const uiTeams = enrichTeamsWithPlayers(teams, players)

  // Fetch session readiness for celebration trigger
  const { data: readiness } = useQuery({
    queryKey: ['session-readiness', id],
    queryFn: () => sessionManagementService.getSessionReadiness(id),
    staleTime: Infinity,
    refetchOnMount: true,
    enabled: !!session,
  })

  // Trigger celebration when all players become ready
  useEffect(() => {
    if (readiness?.allReady && !previousReadyState) {
      setShowReadyCelebration(true)
      setPreviousReadyState(true)
    } else if (!readiness?.allReady) {
      setPreviousReadyState(false)
    }
  }, [readiness?.allReady, previousReadyState])

  // Session mutations
  const startSessionMutation = useMutation({
    mutationFn: sessionService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
    onError: (error) => {
      toastHelpers.operationError('start session', error)
    },
  })

  const completeSessionMutation = useMutation({
    mutationFn: sessionService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
    onError: (error) => {
      toastHelpers.operationError('complete session', error)
    },
  })

  const cancelSessionMutation = useMutation({
    mutationFn: sessionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
    onError: (error) => {
      toastHelpers.operationError('cancel session', error)
    },
  })

  // Player ready mutation (shared between Overview and Players tabs)
  const setPlayerReadyMutation = useMutation({
    mutationFn: ({ playerId, ready }: { playerId: string; ready: boolean }) =>
      sessionManagementService.setPlayerReady(id, playerId, ready),

    // Optimistic update for instant UI feedback
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['sessions', 'detail', id, 'players'],
      })

      // Snapshot previous value
      const previousPlayers = queryClient.getQueryData([
        'sessions',
        'detail',
        id,
        'players',
      ])

      // Optimistically update player status
      queryClient.setQueryData(
        ['sessions', 'detail', id, 'players'],
        (old: any) => {
          if (!old) return old
          return old.map((p: any) =>
            p.id === variables.playerId
              ? { ...p, status: variables.ready ? 'ready' : 'not_ready' }
              : p,
          )
        },
      )

      // Return context with snapshot for rollback
      return { previousPlayers }
    },

    onSuccess: (_, variables) => {
      // Invalidate to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', id],
      })
      const status = variables.ready ? 'ready' : 'not ready'
      showToast.success(`✓ You are marked as ${status}!`)
    },

    onError: (error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousPlayers) {
        queryClient.setQueryData(
          ['sessions', 'detail', id, 'players'],
          context.previousPlayers,
        )
      }
      toastHelpers.operationError('update player ready status', error)
    },

    // Always refetch after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', 'detail', id, 'players'],
      })
    },
  })

  // Handler for toggling current player's ready status
  const handleToggleMyReady = () => {
    if (!currentPlayerId) {
      showToast.error('Please join the session first')
      return
    }
    const currentPlayer = players.find((p) => p.id === currentPlayerId)
    if (!currentPlayer) return

    const isReady = currentPlayer.status === 'ready'
    setPlayerReadyMutation.mutate({
      playerId: currentPlayerId,
      ready: !isReady,
    })
  }

  // Check if user just joined (for demo purposes)
  const justJoined =
    new URLSearchParams(window.location.search).get('joined') === 'true'

  if (isLoading) {
    return <SessionDetailSkeleton />
  }

  if (isError || !session) {
    return (
      <QueryErrorDisplay
        error={
          error instanceof Error ? error : new Error('Failed to load session')
        }
        onRetry={() => window.location.reload()}
        backTo="/sessions"
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 sm:mb-6">
          <Link
            to="/sessions"
            className="hover:text-gray-700 min-h-[44px] flex items-center"
          >
            Sessions
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium truncate">
            {session.name}
          </span>
        </nav>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                {session.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>
                  <strong>Host:</strong> {session.host.name}
                  {isHost && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded border border-purple-300">
                      YOU
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">
                  <strong>Date:</strong>{' '}
                  {new Date(session.date).toLocaleString()}
                </span>
                {session.location && (
                  <span className="hidden sm:inline">
                    <strong>Location:</strong> {session.location}
                  </span>
                )}
              </div>
              {/* Mobile-only date and location */}
              <div className="sm:hidden mt-2 text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Date:</strong>{' '}
                  {new Date(session.date).toLocaleDateString()}
                </div>
                {session.location && (
                  <div>
                    <strong>Location:</strong> {session.location}
                  </div>
                )}
              </div>
              {isHost && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded">
                  <svg
                    className="w-5 h-5 text-purple-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-purple-900">
                    🎮{' '}
                    <span className="hidden sm:inline">
                      You are the Games Master - You have full control over this
                      session
                    </span>
                    <span className="sm:hidden">Games Master</span>
                  </span>
                </div>
              )}
            </div>
            <div className="lg:text-right">
              <div className="flex items-center gap-2 lg:justify-end mb-2">
                <SessionStatusBadge
                  status={session.status}
                  size="md"
                  showDescription={false}
                />
              </div>
              {/* Join Code Section - Mobile optimized */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg lg:bg-transparent lg:p-0">
                <span className="text-sm text-gray-600">Join Code:</span>
                <span className="font-mono bg-gray-100 lg:bg-gray-100 px-3 py-1.5 rounded text-lg font-bold tracking-wider">
                  {session.joinCode}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(session.joinCode)
                      toastHelpers.copied('join code to clipboard')
                    }}
                    className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Copy join code"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={showQRCode ? 'Hide QR code' : 'Show QR code'}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-4 py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5 min-h-[44px]"
                    title="Share session"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
              {showQRCode && (
                <div className="mt-4">
                  <JoinCodeQR
                    joinCode={session.joinCode}
                    sessionName={session.name}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Session Actions — host only (lifecycle control + back to owner list) */}
          {isHost && (
            <div className="flex flex-wrap gap-2">
              {session.status === 'SCHEDULED' && (
                <>
                  <StartSessionButton
                    onStart={() => startSessionMutation.mutate(id)}
                    isLoading={startSessionMutation.isPending}
                    isReady={
                      (readiness?.allReady || false) &&
                      teams.length > 0 &&
                      games.length > 0
                    }
                    readyToStart={{
                      playersReady: readiness?.allReady || false,
                      teamsFormed: teams.length > 0,
                      gamesAvailable: games.length > 0,
                    }}
                  />
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelSessionMutation.isPending}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
                  >
                    Cancel Session
                  </button>
                </>
              )}

              {session.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => completeSessionMutation.mutate(id)}
                  disabled={completeSessionMutation.isPending}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
                >
                  {completeSessionMutation.isPending
                    ? 'Completing...'
                    : 'Complete Session'}
                </button>
              )}

              <Link
                to="/sessions"
                className="px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 min-h-[44px] flex items-center text-sm sm:text-base"
              >
                <span className="hidden sm:inline">←</span> Back
                <span className="hidden sm:inline"> to Sessions</span>
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-1 sm:space-x-4 overflow-x-auto pb-px scrollbar-hide">
              {[
                {
                  id: 'overview',
                  label: 'Overview',
                  shortLabel: 'Home',
                  icon: '📋',
                },
                {
                  id: 'players',
                  label: 'Players',
                  shortLabel: 'Players',
                  icon: '👥',
                  count: players.length,
                  hostOnly: true,
                },
                {
                  id: 'guests',
                  label: 'Guests',
                  shortLabel: 'Guests',
                  icon: '✉️',
                  hostOnly: true,
                },
                {
                  id: 'games',
                  label: 'Games',
                  shortLabel: 'Games',
                  icon: '🎮',
                  hostOnly: true,
                },
                {
                  id: 'teams',
                  label: 'Teams',
                  shortLabel: 'Teams',
                  icon: '🏆',
                },
                { id: 'chat', label: 'Chat', shortLabel: 'Chat', icon: '💬' },
                {
                  id: 'history',
                  label: 'History',
                  shortLabel: 'Hist.',
                  icon: '📊',
                  hostOnly: true,
                },
              ]
                // Minimal player view: players see only overview, teams, chat.
                .filter((tab) => isHost || !tab.hostOnly)
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap min-h-[44px] ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="sm:hidden">{tab.icon}</span>
                    <span className="hidden sm:inline">
                      {tab.icon} {tab.label}
                    </span>
                    {tab.count !== undefined && (
                      <span className="ml-1 sm:ml-2 bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              session={session}
              players={players}
              justJoined={justJoined}
              currentPlayer={players.find((p) => p.id === currentPlayerId)}
              onToggleReady={handleToggleMyReady}
              isTogglingReady={setPlayerReadyMutation.isPending}
              isHost={isHost}
              onShare={() => setShowShareModal(true)}
              onManageGames={() => setActiveTab('games')}
              onCreateTeams={() => setActiveTab('teams')}
            />
          )}

          {activeTab === 'players' && (
            <PlayersTab
              session={session}
              players={uiPlayers}
              setPlayerReadyMutation={setPlayerReadyMutation}
              isHost={isHost}
            />
          )}

          {activeTab === 'guests' && (
            <GuestList
              sessionId={id}
              publicRsvpToken={session.publicRsvpToken}
            />
          )}

          {activeTab === 'games' && (
            <EnhancedGamesTab
              sessionId={id}
              sessionGames={uiGames}
              players={uiPlayers}
              teams={uiTeams}
              sessionStatus={session.status}
            />
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              {/* Host-only: readiness admin, manual creation, auto formation. */}
              {isHost && (
                <>
                  {/* Session Readiness Dashboard */}
                  <SessionReadinessDashboard
                    sessionId={id}
                    players={uiPlayers}
                    teams={uiTeams}
                    games={uiGames}
                    sessionStatus={session.status}
                  />

                  {/* Manual Team Creation Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Manual Team Creation
                        </h3>
                        <p className="text-sm text-gray-600">
                          Create teams manually and assign players
                        </p>
                      </div>
                      {!showManualTeamCreator &&
                        session.status !== 'COMPLETED' &&
                        session.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setShowManualTeamCreator(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            + Create Team
                          </button>
                        )}
                      {(session.status === 'COMPLETED' ||
                        session.status === 'CANCELLED') && (
                        <div className="text-sm text-gray-500 italic">
                          Team creation disabled - session{' '}
                          {session.status.toLowerCase()}
                        </div>
                      )}
                    </div>

                    {showManualTeamCreator && (
                      <ManualTeamCreator
                        sessionId={id}
                        players={uiPlayers}
                        teams={uiTeams}
                        onTeamCreated={() => {
                          setShowManualTeamCreator(false)
                          // Invalidate and refetch teams data
                          queryClient.invalidateQueries({
                            queryKey: ['sessions', 'detail', id],
                          })
                        }}
                        onCancel={() => setShowManualTeamCreator(false)}
                      />
                    )}

                    {!showManualTeamCreator && teams.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="text-lg font-medium mb-2">
                          No teams created yet
                        </p>
                        <p className="text-sm">
                          Create teams manually or use automated team formation
                          below
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Team Formation Interface */}
                  <TeamFormationInterface
                    sessionId={id}
                    players={uiPlayers}
                    teams={uiTeams}
                    games={uiGamesWithTeamSize as any}
                    onTeamsCreated={() => {
                      // Invalidate and refetch teams data
                      queryClient.invalidateQueries({
                        queryKey: ['sessions', 'detail', id],
                      })
                    }}
                  />
                </>
              )}

              {/* Team Display — read-only roster, visible to everyone */}
              {teams.length > 0 && (
                <TeamDisplay
                  teams={uiTeams}
                  unassignedPlayers={uiPlayers.filter(
                    (p) =>
                      !uiTeams.some((team) =>
                        team.players.some((tp) => tp.id === p.id),
                      ),
                  )}
                />
              )}

              {/* Enhanced Team Management (host only) */}
              {isHost && teams.length > 0 && games.length > 0 && (
                <EnhancedTeamManagement
                  gameId={(activeGame ?? games[0]).id}
                  sessionId={id}
                  isHost={isHost}
                />
              )}

              {!isHost && teams.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-lg font-medium">No teams yet</p>
                  <p className="text-sm">
                    Your games master will set up teams here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <SessionChat sessionId={id} playerId={currentPlayerId} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Session History</h2>
              <GameHistoryList sessionId={id} />
            </div>
          )}
        </div>

        {/* Cancel Session Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={() => {
            cancelSessionMutation.mutate(id)
            setShowCancelConfirm(false)
          }}
          title="Cancel Session"
          message="Are you sure you want to cancel this session? This action cannot be undone."
          confirmLabel="Cancel Session"
          variant="danger"
        />

        {/* Share Session Modal */}
        <ShareSessionModal
          sessionId={id}
          joinCode={session?.joinCode || ''}
          sessionName={session?.name || ''}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          isHost={isHost}
        />

        {/* Ready Celebration Effect */}
        <ReadyCelebration
          isReady={readiness?.allReady || false}
          trigger={showReadyCelebration}
        />
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({
  session,
  players,
  justJoined,
  currentPlayer,
  onToggleReady,
  isTogglingReady,
  isHost,
  onShare,
  onManageGames,
  onCreateTeams,
}: any) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {justJoined && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Welcome! You've successfully joined this session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Player Ready Status Card */}
      {currentPlayer ? (
        <div
          className={`border-2 rounded-lg p-4 sm:p-6 ${
            currentPlayer.status === 'ready'
              ? 'bg-green-50 border-green-300'
              : 'bg-blue-50 border-blue-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                    currentPlayer.status === 'ready'
                      ? 'bg-green-100'
                      : 'bg-blue-100'
                  }`}
                >
                  {currentPlayer.status === 'ready' ? '✓' : '⏳'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentPlayer.status === 'ready'
                      ? "You're Ready!"
                      : 'Are You Ready?'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentPlayer.status === 'ready'
                      ? 'Waiting for other players...'
                      : "Mark yourself as ready when you're all set"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onToggleReady}
              disabled={
                isTogglingReady ||
                session.status === 'COMPLETED' ||
                session.status === 'CANCELLED'
              }
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none min-h-[48px] ${
                currentPlayer.status === 'ready'
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
              }`}
            >
              {isTogglingReady
                ? 'Updating...'
                : currentPlayer.status === 'ready'
                  ? 'Mark Not Ready'
                  : "I'm Ready!"}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl flex-shrink-0">
                  👤
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Not Playing Yet
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="hidden sm:inline">
                      You're viewing this session as a spectator. Join as a
                      player to participate and mark yourself ready.
                    </span>
                    <span className="sm:hidden">Join to participate!</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const joinCode = session.joinCode
                if (joinCode) {
                  navigate({ to: '/join/$joinCode', params: { joinCode } })
                }
              }}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-h-[48px]"
            >
              Join Session
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 text-sm">
              {session.description || 'No description provided'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Session Stats</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Players joined: {players.length}</div>
              <div>Status: {session.status}</div>
              <div>
                Created: {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={onShare}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-2xl mb-2 block">📱</span>
              <h4 className="font-medium">Share Join Code</h4>
              <p className="text-sm text-gray-600 mt-1">
                Send the join code to friends
              </p>
            </div>
          </button>
          {isHost && (
            <button
              type="button"
              onClick={onManageGames}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">🎯</span>
                <h4 className="font-medium">Manage Games</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add or remove games
                </p>
              </div>
            </button>
          )}
          {isHost && (
            <button
              type="button"
              onClick={onCreateTeams}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">🏆</span>
                <h4 className="font-medium">Create Teams</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Organize players into teams
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function PlayersTab({ session, players, setPlayerReadyMutation, isHost }: any) {
  const queryClient = useQueryClient()
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [playerToRemove, setPlayerToRemove] = useState<string | null>(null)

  // Fetch session readiness status (now updates via WebSocket)
  const { data: readiness } = useQuery({
    queryKey: ['session-readiness', session.id],
    queryFn: () => sessionManagementService.getSessionReadiness(session.id),
  })

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: async (playerData: { name: string }) => {
      // Create player and add to session
      const newPlayer = await playerService.create({
        name: playerData.name,
        sessionId: session.id,
      })
      return newPlayer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', session.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', session.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['sessions', session.id],
      })
      setShowAddPlayerForm(false)
      setNewPlayerName('')
    },
    onError: (error) => {
      toastHelpers.operationError('add player', error)
    },
  })

  // Remove player mutation
  const removePlayerMutation = useMutation({
    mutationFn: (playerId: string) => playerService.delete(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', session.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-readiness', session.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['sessions', session.id],
      })
    },
    onError: (error) => {
      toastHelpers.operationError('remove player', error)
    },
  })

  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: ({ playerId, data }: { playerId: string; data: any }) =>
      playerService.update(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['players', 'session', session.id],
      })
      setEditingPlayer(null)
    },
    onError: (error) => {
      toastHelpers.operationError('update player', error)
    },
  })

  // Check if session can start (now updates via WebSocket)
  const { data: canStart } = useQuery({
    queryKey: ['session-can-start', session.id],
    queryFn: () => sessionManagementService.checkSessionCanStart(session.id),
  }) as {
    data:
      | {
          canStart: boolean
          reasons: Array<string>
          checks: {
            hasGames: boolean
            playersReady: boolean
            playerCountValid: boolean
            sessionScheduled: boolean
          }
        }
      | undefined
  }

  const handleToggleReady = (playerId: string, currentReady: boolean) => {
    setPlayerReadyMutation.mutate({
      playerId,
      ready: !currentReady,
    })
  }

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPlayerName.trim()) {
      addPlayerMutation.mutate({ name: newPlayerName.trim() })
    }
  }

  const handleRemovePlayer = (playerId: string) => {
    setPlayerToRemove(playerId)
  }

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player)
  }

  const handleSavePlayerEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPlayer) {
      updatePlayerMutation.mutate({
        playerId: editingPlayer.id,
        data: { name: editingPlayer.name },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Session Players</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <OnlinePlayerCount players={players} showDetails={true} />
          {isHost &&
            session.status !== 'COMPLETED' &&
            session.status !== 'CANCELLED' && (
              <button
                onClick={() => setShowAddPlayerForm(!showAddPlayerForm)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 border-2 border-purple-300 shadow-sm min-h-[44px]"
                title="Games Master Control"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {showAddPlayerForm ? 'Cancel' : '+ Add Player'}
                </span>
                <span className="sm:hidden">
                  {showAddPlayerForm ? '✕' : '+'}
                </span>
              </button>
            )}
          {(session.status === 'COMPLETED' ||
            session.status === 'CANCELLED') && (
            <div className="text-sm text-gray-500 italic">
              <span className="hidden sm:inline">
                Player management disabled - session{' '}
                {session.status.toLowerCase()}
              </span>
              <span className="sm:hidden">
                Session {session.status.toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add Player Form */}
      {showAddPlayerForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Add New Player</h4>
          <form onSubmit={handleAddPlayer} className="flex space-x-3">
            <input
              type="text"
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={addPlayerMutation.isPending || !newPlayerName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addPlayerMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </form>
          {addPlayerMutation.error && (
            <div className="mt-2 text-red-600 text-sm">
              Error:{' '}
              {addPlayerMutation.error instanceof Error
                ? addPlayerMutation.error.message
                : 'Failed to add player'}
            </div>
          )}
        </div>
      )}

      {/* Session Readiness Status */}
      {readiness && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">Session Readiness</h4>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  readiness.allReady ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm font-medium text-blue-900">
                {readiness.readyPlayers}/{readiness.totalPlayers} Ready
              </span>
            </div>
          </div>

          {canStart && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">
                  Session Status:{' '}
                  {canStart.canStart ? '✅ Ready to Start' : '⏳ Not Ready'}
                </div>
                {!canStart.canStart && canStart.reasons.length > 0 && (
                  <ul className="text-red-600 text-xs space-y-1">
                    {canStart.reasons.map((reason: string, index: number) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {players.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No players yet
          </h4>
          <p className="text-gray-600 mb-4">
            Share the join code <strong>{session.joinCode}</strong> with your
            friends!
          </p>
          <Link
            to="/join"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📱 Share Join Code
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player: any) => {
            const isReady = player.status === 'ready'
            const canToggleReady =
              (session.status === 'SCHEDULED' ||
                session.status === 'IN_PROGRESS') &&
              player.status !== 'disconnected'

            return (
              <div
                key={player.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  {editingPlayer?.id === player.id ? (
                    <form
                      onSubmit={handleSavePlayerEdit}
                      className="flex-1 mr-2"
                    >
                      <input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) =>
                          setEditingPlayer({
                            ...editingPlayer,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        autoFocus
                      />
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {player.name}
                      </h4>
                      <PlayerStatusBadge isOnline={player.isOnline} size="sm" />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        player.status === 'ready'
                          ? 'bg-green-100 text-green-700'
                          : player.status === 'playing'
                            ? 'bg-blue-100 text-blue-700'
                            : player.status === 'joined'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {player.status}
                    </span>

                    {/* Player Management Buttons */}
                    <div className="flex space-x-1">
                      {editingPlayer?.id === player.id ? (
                        <>
                          <button
                            type="submit"
                            onClick={handleSavePlayerEdit}
                            disabled={updatePlayerMutation.isPending}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingPlayer(null)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          {isHost &&
                            session.status !== 'COMPLETED' &&
                            session.status !== 'CANCELLED' && (
                              <>
                                <button
                                  onClick={() => handleEditPlayer(player)}
                                  className="p-1 text-blue-600 hover:text-blue-700"
                                  title="Edit player"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleRemovePlayer(player.id)}
                                  disabled={removePlayerMutation.isPending}
                                  className="p-1 text-red-600 hover:text-red-700"
                                  title="Remove player"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <div>
                    Joined: {new Date(player.createdAt).toLocaleDateString()}
                  </div>
                  {player.team && <div>Team: {player.team.name}</div>}
                </div>

                {/* Ready Toggle Button */}
                {canToggleReady && editingPlayer?.id !== player.id && (
                  <button
                    onClick={() => handleToggleReady(player.id, isReady)}
                    disabled={setPlayerReadyMutation.isPending}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isReady
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {setPlayerReadyMutation.isPending
                      ? 'Updating...'
                      : isReady
                        ? '✓ Ready'
                        : 'Mark Ready'}
                  </button>
                )}

                {/* Loading States */}
                {removePlayerMutation.isPending && (
                  <div className="mt-2 text-sm text-gray-600">
                    Removing player...
                  </div>
                )}
                {updatePlayerMutation.isPending && (
                  <div className="mt-2 text-sm text-gray-600">
                    Updating player...
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Remove Player Confirmation Dialog */}
      <ConfirmDialog
        isOpen={playerToRemove !== null}
        onClose={() => setPlayerToRemove(null)}
        onConfirm={() => {
          if (playerToRemove) {
            removePlayerMutation.mutate(playerToRemove)
            setPlayerToRemove(null)
          }
        }}
        title="Remove Player"
        message="Are you sure you want to remove this player from the session?"
        confirmLabel="Remove Player"
        variant="danger"
      />
    </div>
  )
}
