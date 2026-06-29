// src/pages/Game.jsx

/**
 * Game Page Component
 * 
 * Main game page that orchestrates the game UI.
 * Connects GameContext with the GameContainer component.
 * Handles room validation, navigation, and game state management.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { FaUsers, FaDice, FaClock, FaGamepad, FaArrowLeft } from 'react-icons/fa';

// ============================================================
// CONSTANTS
// ============================================================

const MIN_PLAYERS_TO_START = 2;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Checks if the current player is the host.
 * @param {Object} state - Game state from context
 * @param {string} playerId - Current player ID
 * @returns {boolean} True if player is host
 */
const isPlayerHost = (state, playerId) => {
  return state?.room?.hostId === playerId;
};

/**
 * Checks if enough players have joined to start the game.
 * @param {Object} state - Game state from context
 * @returns {boolean} True if enough players
 */
const hasEnoughPlayers = (state) => {
  return (state?.players?.length || 0) >= MIN_PLAYERS_TO_START;
};

/**
 * Gets the current player from the state.
 * @param {Object} state - Game state from context
 * @param {string} playerId - Current player ID
 * @returns {Object|null} Player object or null
 */
const getCurrentPlayer = (state, playerId) => {
  return state?.players?.find(p => p.id === playerId) || null;
};

/**
 * Validates room ID format.
 * @param {string} roomId - Room ID to validate
 * @returns {boolean} True if valid
 */
const isValidRoomId = (roomId) => {
  return roomId && typeof roomId === 'string' && roomId.length >= 4;
};

/**
 * Gets color class for a player.
 * @param {string} color - Player color
 * @returns {string} CSS color class
 */
const getColorClass = (color) => {
  const colorMap = {
    red: 'text-red-400 border-red-400/30 bg-red-500/10',
    green: 'text-green-400 border-green-400/30 bg-green-500/10',
    yellow: 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10',
    blue: 'text-blue-400 border-blue-400/30 bg-blue-500/10',
  };
  return colorMap[color] || 'text-gray-400 border-gray-400/30 bg-gray-500/10';
};

/**
 * Gets status display text and color.
 * @param {string} status - Game status
 * @returns {Object} Status display info
 */
const getStatusDisplay = (status) => {
  const statusMap = {
    waiting: { text: '⏳ Waiting', color: 'text-blue-400 bg-blue-500/20' },
    playing: { text: '🟢 Playing', color: 'text-green-400 bg-green-500/20' },
    finished: { text: '🏁 Finished', color: 'text-yellow-400 bg-yellow-500/20' },
    idle: { text: '⏸️ Idle', color: 'text-gray-400 bg-gray-500/20' },
  };
  return statusMap[status] || statusMap.waiting;
};

// ============================================================
// GAME COMPONENT
// ============================================================

/**
 * Main Game page component.
 * Validates room, manages game state, and renders the game UI.
 */
function Game() {
  // ============================================================
  // HOOKS
  // ============================================================

  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    state,
    leaveRoom,
    startGame,
    updatePlayer,
    updateGameStatus,
    updateBoard,
    updateDice,
    updateTurn,
    setWinner
  } = useGame();

  // ============================================================
  // STATE
  // ============================================================

  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [roomNotFound, setRoomNotFound] = useState(false);

  // ============================================================
  // EFFECTS
  // ============================================================

  /**
   * Validate room on mount and when roomId changes.
   */
  useEffect(() => {
    // Validate room ID format
    if (!isValidRoomId(roomId)) {
      setRoomNotFound(true);
      setIsLoading(false);
      return;
    }

    // Check if room exists in context
    if (state?.room?.id) {
      if (state.room.id !== roomId) {
        setRoomNotFound(true);
        setIsLoading(false);
        return;
      }

      // Room exists and matches
      setRoomNotFound(false);
      setIsLoading(false);
    } else {
      // Room not in context yet - show loading
      setIsLoading(true);

      // If we have no room after 3 seconds, show not found
      const timeoutId = setTimeout(() => {
        setRoomNotFound(true);
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [roomId, state]);

  /**
   * Set initial player ID when component mounts.
   */
  useEffect(() => {
    // Generate or retrieve player ID
    const storedPlayerId = sessionStorage.getItem('playerId');
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    } else {
      const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('playerId', newPlayerId);
      setCurrentPlayerId(newPlayerId);
    }
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  /**
   * Handles leaving the room.
   */
  const handleLeaveRoom = () => {
    if (currentPlayerId) {
      leaveRoom(currentPlayerId);
    }
    navigate('/lobby');
  };

  /**
   * Handles starting the game.
   */
  const handleStartGame = () => {
    startGame();
  };

  /**
   * Handles navigation back to lobby.
   */
  const handleGoToLobby = () => {
    navigate('/lobby');
  };

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  const currentPlayer = getCurrentPlayer(state, currentPlayerId);
  const isHost = isPlayerHost(state, currentPlayerId);
  const canStartGame = isHost && hasEnoughPlayers(state) && state?.gameStatus === 'waiting';
  const isGameActive = state?.gameStatus === 'playing' || state?.gameStatus === 'finished';
  const statusDisplay = getStatusDisplay(state?.gameStatus);
  const playerCount = state?.players?.length || 0;
  const maxPlayers = state?.room?.maxPlayers || 4;

  // ============================================================
  // RENDER
  // ============================================================

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Loading game room...</p>
        </div>
      </div>
    );
  }

  // Room Not Found State
  if (roomNotFound) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Room Not Found</h2>
          <p className="text-gray-400 mb-6">
            The room you're looking for doesn't exist or has been closed.
            Please check the room ID and try again.
          </p>
          <button
            onClick={handleGoToLobby}
            className="w-full py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-200"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Room exists - render game
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaGamepad className="text-yellow-400 mr-2" />
                {state?.room?.name || 'Ludo Game'}
              </h1>
              <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                Room: #{roomId}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="bg-gray-700/50 px-3 py-1 rounded-full flex items-center text-gray-300">
                <FaUsers className="text-yellow-400 mr-2" />
                <span>Players: {playerCount}/{maxPlayers}</span>
              </div>
              <div className="bg-gray-700/50 px-3 py-1 rounded-full flex items-center text-gray-300">
                <FaDice className="text-yellow-400 mr-2" />
                <span>Mode: {state?.settings?.gameMode || 'Classic'}</span>
              </div>
              <div className={`bg-gray-700/50 px-3 py-1 rounded-full flex items-center ${statusDisplay.color}`}>
                <span>{statusDisplay.text}</span>
              </div>
              {isHost && (
                <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                  👑 Host
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Player List */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaUsers className="text-yellow-400 mr-2" />
                Players ({playerCount}/{maxPlayers})
              </h2>
              <div className="space-y-3">
                {playerCount === 0 ? (
                  <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                    <p className="text-gray-400 text-sm text-center">Waiting for players to join...</p>
                    <p className="text-gray-500 text-xs text-center mt-1">Share the room ID to invite friends</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.players.map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded-lg border ${getColorClass(player.color)}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${player.color === 'red' ? 'bg-red-500' : player.color === 'green' ? 'bg-green-500' : player.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                          <span className="text-sm font-medium">{player.name}</span>
                          {player.isHost && <span className="text-xs text-yellow-400">👑</span>}
                          {player.id === currentPlayerId && <span className="text-xs text-blue-400">(You)</span>}
                        </div>
                        <span className="text-xs text-gray-400">
                          {player.isReady ? '✅ Ready' : '⏳ Waiting'}
                        </span>
                      </div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: maxPlayers - playerCount }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30 opacity-50"
                      >
                        <span className="text-gray-400 text-sm">Empty Slot</span>
                        <span className="text-gray-500 text-xs">(Available)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">Game Board</h2>
              <div className="bg-gray-900/50 rounded-lg border-2 border-gray-600/50 aspect-square flex items-center justify-center min-h-100 relative">
                <div className="text-center">
                  <FaGamepad className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Ludo Board</p>
                  <p className="text-gray-500 text-sm">
                    {state?.gameStatus === 'playing'
                      ? '🎯 Game in progress...'
                      : state?.gameStatus === 'finished'
                        ? '🏁 Game completed!'
                        : '⏳ Waiting for game to start...'}
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    {playerCount} player{playerCount !== 1 ? 's' : ''} connected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Game Status */}
          <div className="lg:col-span-3 order-3">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaClock className="text-yellow-400 mr-2" />
                Game Status
              </h2>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border ${statusDisplay.color} border-current/30`}>
                  <p className="text-sm font-medium text-center">{statusDisplay.text}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Current Turn</span>
                    <span className="text-gray-300 text-xs">
                      {state?.currentTurn?.playerName || '--'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Dice Roll</span>
                    <span className="text-gray-300 text-xs">
                      {state?.dice?.value || '--'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Turn Number</span>
                    <span className="text-gray-300 text-xs">
                      {state?.currentTurn?.turnNumber || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Game State</span>
                    <span className={`text-xs ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </span>
                  </div>
                  {state?.winner?.playerName && (
                    <div className="flex justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <span className="text-yellow-400 text-sm">🏆 Winner</span>
                      <span className="text-yellow-400 text-xs font-semibold">
                        {state.winner.playerName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Controls */}
        <div className="mt-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">Game Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Roll Dice */}
              <div className={`bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center ${state?.gameStatus === 'playing' ? 'hover:border-yellow-400/50 transition-colors' : 'opacity-50'}`}>
                <FaDice className={`text-3xl mx-auto mb-2 ${state?.gameStatus === 'playing' ? 'text-yellow-400' : 'text-yellow-400/30'}`} />
                <p className="text-gray-400 text-sm">
                  {state?.gameStatus === 'playing' ? 'Roll Dice' : 'Waiting...'}
                </p>
                <p className="text-gray-500 text-xs">
                  {state?.gameStatus === 'playing' && state?.dice?.canRoll ? 'Click to roll' : 'Not your turn'}
                </p>
              </div>

              {/* Timer */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center opacity-50">
                <FaClock className="text-3xl text-yellow-400/30 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Timer</p>
                <p className="text-gray-500 text-xs">
                  {state?.currentTurn?.timeRemaining || 30}s
                </p>
              </div>

              {/* Ready / Start Game */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center">
                {canStartGame ? (
                  <button
                    onClick={handleStartGame}
                    className="w-full h-full flex flex-col items-center justify-center hover:bg-green-500/10 rounded-lg transition-colors duration-200"
                  >
                    <FaGamepad className="text-3xl text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 text-sm font-semibold">Start Game</p>
                    <p className="text-gray-500 text-xs">{playerCount} players ready</p>
                  </button>
                ) : isHost ? (
                  <div className="flex flex-col items-center justify-center">
                    <FaGamepad className="text-3xl text-yellow-400/30 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Waiting for players</p>
                    <p className="text-gray-500 text-xs">Need {MIN_PLAYERS_TO_START - playerCount} more</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FaUsers className="text-3xl text-yellow-400/30 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Waiting for host</p>
                    <p className="text-gray-500 text-xs">To start the game</p>
                  </div>
                )}
              </div>

              {/* Leave Room */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center">
                <button
                  onClick={handleLeaveRoom}
                  className="w-full h-full flex flex-col items-center justify-center hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                >
                  <FaGamepad className="text-3xl text-red-400/50 mx-auto mb-2" />
                  <p className="text-red-400 text-sm">Leave Room</p>
                  <p className="text-gray-500 text-xs">Exit game</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Lobby */}
        <div className="mt-6 text-center flex items-center justify-center gap-6">
          <Link
            to="/lobby"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <FaArrowLeft className="text-xs" />
            Back to Lobby
          </Link>
          {roomId && (
            <span className="text-gray-600 text-xs">
              Room ID: #{roomId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default Game;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. How Game.jsx receives the room:
 * 
 * - The room ID is extracted from the URL using useParams()
 * - The room data is retrieved from GameContext using useGame()
 * - The component validates that the room exists and matches the ID
 * - All room data is displayed in the UI (room name, ID, players, status)
 * 
 * 2. How it validates the room ID:
 * 
 * - First, it checks if the room ID format is valid (minimum length)
 * - Then it checks if the room exists in the context state
 * - It compares the room ID from the URL with the room ID in context
 * - If the room doesn't exist or doesn't match, it shows "Room Not Found"
 * - A 3-second timeout is used to allow the context to load
 * 
 * 3. How it connects GameContext with the UI:
 * 
 * - All game state is displayed directly in the UI
 * - Player list shows all connected players with their colors and status
 * - Game status shows current state (waiting, playing, finished)
 * - Controls show the host can start the game when enough players join
 * - Leave Room button calls leaveRoom() from context
 * 
 * 4. Why this structure makes multiplayer integration easy later:
 * 
 * - The component is already using a centralized state management (GameContext)
 * - All game data flows through the context, making it easy to sync with a server
 * - Socket.IO integration would involve:
 *   * Listening for server events in Game.jsx
 *   * Dispatching context actions when receiving server data
 *   * Emitting events when actions are performed
 * 
 * - Example Socket.IO integration:
 * 
 *   useEffect(() => {
 *     if (!socket) return;
 * 
 *     // Listen for game state updates from server
 *     socket.on('gameStateUpdate', (data) => {
 *       updateBoard(data.board);
 *       updateDice(data.dice);
 *       updateTurn(data.turn);
 *     });
 * 
 *     socket.on('playerJoined', (player) => {
 *       addPlayer(player);
 *     });
 * 
 *     socket.on('gameStarted', () => {
 *       updateGameStatus('playing');
 *     });
 * 
 *     return () => {
 *       socket.off('gameStateUpdate');
 *       socket.off('playerJoined');
 *       socket.off('gameStarted');
 *     };
 *   }, [socket]);
 * 
 * - The component is ready for real-time updates because:
 *   * It uses React's state management efficiently
 *   * It handles loading and error states gracefully
 *   * It has clear separation between UI and game logic
 *   * It uses the same data flow pattern that Socket.IO uses
 *   * The UI automatically updates when context state changes
 */