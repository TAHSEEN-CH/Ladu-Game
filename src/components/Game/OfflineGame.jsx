// src/components/Game/OfflineGame.jsx

/**
 * Offline Game Component
 * 
 * Professional offline Ludo game component.
 * Displays the complete game UI with all sections.
 * Ready for future integration with the game engine.
 * No socket.io, no backend, no room APIs.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext.jsx';

// ============================================================
// ICON COMPONENTS (Inline SVGs)
// ============================================================

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm8 0a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2z" />
  </svg>
);

const RestartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const ExitIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Gets the color classes for a player color.
 * @param {string} color - Player color name
 * @returns {string} Tailwind CSS classes
 */
const getPlayerColorClasses = (color) => {
  const colorMap = {
    Red: 'bg-red-500 border-red-400 text-red-100',
    Green: 'bg-green-500 border-green-400 text-green-100',
    Yellow: 'bg-yellow-400 border-yellow-300 text-yellow-900',
    Blue: 'bg-blue-500 border-blue-400 text-blue-100',
  };
  return colorMap[color] || 'bg-gray-500 border-gray-400 text-gray-100';
};

/**
 * Gets the dice face display based on value.
 * @param {number} value - Dice value (1-6)
 * @returns {string} Dice face dots
 */
const getDiceFace = (value) => {
  const faces = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅',
  };
  return faces[value] || '⚀';
};

/**
 * Gets the status badge class.
 * @param {string} status - Status string
 * @returns {string} Tailwind CSS classes
 */
const getStatusBadgeClass = (status) => {
  const statusMap = {
    playing: 'bg-green-500/20 text-green-400 border-green-500/30',
    waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    finished: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    idle: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return statusMap[status] || statusMap.idle;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * OfflineGame component for offline Ludo matches.
 * @param {Object} props - Component props
 * @param {Object} props.settings - Game settings
 */
const OfflineGame = ({ settings }) => {
  const navigate = useNavigate();
  const { initOfflineGame, startGame, state } = useGame();

  // ============================================================
  // STATE
  // ============================================================

  const [gameStatus, setGameStatus] = useState('waiting');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [turnNumber, setTurnNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================
  // DERIVED STATE
  // ============================================================

  const playerCount = settings?.players || 2;
  const playerNames = settings?.playerNames || ['Player 1', 'Player 2'];
  const playerColors = settings?.playerColors || ['Red', 'Green'];
  const gameMode = settings?.mode || 'local_multiplayer';
  const difficulty = settings?.difficulty || 'Medium';
  const timer = settings?.timer || 30;
  const gameOptions = settings?.options || {};

  // Use players from context if available, otherwise create from settings
  const players = state?.players?.length > 0 
    ? state.players 
    : playerNames.slice(0, playerCount).map((name, index) => ({
        id: `player-${index}`,
        name: name,
        color: playerColors[index] || 'Gray',
        isActive: true,
        isFinished: false,
        isCurrent: index === currentTurn,
        tokensFinished: 0,
      }));

  // ============================================================
  // EFFECTS
  // ============================================================

  /**
   * Initialize offline game with settings.
   */
  useEffect(() => {
    if (settings && !isInitialized) {
      // Initialize game state with settings
      initOfflineGame(settings);
      setIsInitialized(true);
      
      // Start the game after a short delay
      setTimeout(() => {
        startGame();
        setGameStatus('playing');
        addToHistory('🎮 Game started!');
      }, 300);
    }
  }, [settings, initOfflineGame, startGame, isInitialized]);

  /**
   * Update local state when context state changes.
   */
  useEffect(() => {
    if (state?.gameStatus) {
      setGameStatus(state.gameStatus);
    }
    if (state?.currentTurn?.playerId) {
      const turnIndex = state.players.findIndex(p => p.id === state.currentTurn.playerId);
      if (turnIndex !== -1) {
        setCurrentTurn(turnIndex);
      }
    }
    if (state?.dice?.value) {
      setDiceValue(state.dice.value);
    }
    if (state?.turnNumber) {
      setTurnNumber(state.turnNumber);
    }
    if (state?.winner?.playerId) {
      const winnerPlayer = state.players.find(p => p.id === state.winner.playerId);
      if (winnerPlayer) {
        setWinner(winnerPlayer);
        setGameStatus('finished');
        addToHistory(`🏆 ${winnerPlayer.name} won the game!`);
      }
    }
  }, [state]);

  // ============================================================
  // HANDLERS
  // ============================================================

  /**
   * Handles rolling the dice.
   */
  const handleRollDice = () => {
    if (isRolling || gameStatus === 'finished') return;

    setIsRolling(true);
    setGameStatus('playing');

    // Simulate dice roll animation
    let rollCount = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      const randomValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(randomValue);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setLastRoll({
          value: finalValue,
          timestamp: Date.now(),
        });
        setIsRolling(false);

        // Add to history
        const currentPlayer = players[currentTurn];
        addToHistory(`${currentPlayer.name} rolled ${finalValue}`);

        // Simulate turn advancement
        setTimeout(() => {
          advanceTurn();
        }, 500);
      }
    }, 100);
  };

  /**
   * Advances to the next turn.
   */
  const advanceTurn = () => {
    // Find next active player
    let nextTurn = (currentTurn + 1) % playerCount;
    let attempts = 0;
    while (attempts < playerCount) {
      if (players[nextTurn]?.isActive && !players[nextTurn]?.isFinished) {
        break;
      }
      nextTurn = (nextTurn + 1) % playerCount;
      attempts++;
    }

    setCurrentTurn(nextTurn);
    setTurnNumber(prev => prev + 1);
    setGameStatus('playing');

    // Simulate winner check
    if (Math.random() < 0.05 && turnNumber > 10) {
      const winnerPlayer = players[nextTurn];
      if (winnerPlayer) {
        setWinner(winnerPlayer);
        setGameStatus('finished');
        addToHistory(`🏆 ${winnerPlayer.name} won the game!`);
      }
    }
  };

  /**
   * Adds an entry to move history.
   * @param {string} message - History message
   */
  const addToHistory = (message) => {
    setMoveHistory(prev => [
      ...prev,
      {
        id: Date.now(),
        message: message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  /**
   * Handles pausing the game.
   */
  const handlePause = () => {
    if (gameStatus === 'finished') return;

    if (gameStatus === 'paused') {
      setGameStatus('playing');
      setIsPaused(false);
    } else {
      setGameStatus('paused');
      setIsPaused(true);
    }
  };

  /**
   * Handles restarting the game.
   */
  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart the game?')) {
      setGameStatus('waiting');
      setCurrentTurn(0);
      setDiceValue(1);
      setIsRolling(false);
      setLastRoll(null);
      setTurnNumber(0);
      setWinner(null);
      setMoveHistory([]);
      setIsPaused(false);
      
      // Re-initialize the game
      if (settings) {
        initOfflineGame(settings);
        setTimeout(() => {
          startGame();
          setGameStatus('playing');
          addToHistory('🔄 Game restarted!');
        }, 300);
      }
    }
  };

  /**
   * Handles exiting the game.
   */
  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      navigate('/');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* TOP HEADER */}
        <header className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                🎲 <span className="text-yellow-400">Offline</span> Ludo
              </h1>
              <span className="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-300">
                v1.0
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                {gameMode === 'vs_computer' ? '🤖 Vs Computer' : '👥 Local'}
              </span>
              <span className="bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                {playerCount} Players
              </span>
              {gameMode === 'vs_computer' && (
                <span className="bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                  🎯 {difficulty}
                </span>
              )}
              <span className="bg-gray-700/50 px-3 py-1 rounded-full text-gray-300">
                ⏱️ {timer === 0 ? 'Off' : `${timer}s`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePause}
                disabled={gameStatus === 'finished'}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  gameStatus === 'paused'
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Pause game"
              >
                <PauseIcon />
              </button>
              <button
                onClick={handleRestart}
                className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 transition-colors duration-200"
                aria-label="Restart game"
              >
                <RestartIcon />
              </button>
              <button
                onClick={handleExit}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200"
                aria-label="Exit game"
              >
                <ExitIcon />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN GAME AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - PLAYER LIST */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-yellow-400 mr-2">👥</span>
                Players
              </h2>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      player.isCurrent && gameStatus === 'playing'
                        ? `border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/50`
                        : 'border-gray-600/50 bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getPlayerColorClasses(
                            player.color
                          )}`}
                        >
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {player.name}
                            {player.isCurrent && gameStatus === 'playing' && (
                              <span className="ml-2 text-yellow-400 text-xs">⬅️</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">{player.color}</span>
                            <span className="text-gray-600">•</span>
                            <span
                              className={
                                player.isFinished
                                  ? 'text-blue-400'
                                  : player.isActive
                                  ? 'text-green-400'
                                  : 'text-gray-500'
                              }
                            >
                              {player.isFinished
                                ? '🏁 Finished'
                                : player.isActive
                                ? '🟢 Active'
                                : '⚫ Idle'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-xs">
                          {player.tokensFinished || 0}/4
                        </div>
                        <div className="w-12 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              player.isFinished ? 'bg-blue-400' : 'bg-yellow-400'
                            }`}
                            style={{
                              width: `${((player.tokensFinished || 0) / 4) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER - LUDO BOARD */}
          <main className="lg:col-span-6 order-1 lg:order-2">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">🎯 Board</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    gameStatus === 'finished'
                      ? 'finished'
                      : gameStatus === 'paused'
                      ? 'idle'
                      : gameStatus === 'waiting'
                      ? 'waiting'
                      : 'playing'
                  )}`}
                >
                  {gameStatus === 'finished'
                    ? '🏁 Finished'
                    : gameStatus === 'paused'
                    ? '⏸️ Paused'
                    : gameStatus === 'waiting'
                    ? '⏳ Waiting'
                    : '🟢 Playing'}
                </span>
              </div>

              {/* Board Placeholder */}
              <div className="bg-gray-900/50 rounded-lg border-2 border-gray-600/50 aspect-square flex items-center justify-center min-h-100 relative">
                {/* Pause Overlay */}
                {gameStatus === 'paused' && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="text-5xl mb-3">⏸️</div>
                      <h3 className="text-white text-xl font-bold">Game Paused</h3>
                      <p className="text-gray-400 text-sm">Click the pause button to resume</p>
                    </div>
                  </div>
                )}

                {/* Winner Overlay */}
                {gameStatus === 'finished' && winner && (
                  <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="text-6xl mb-3">🏆</div>
                      <h3 className="text-yellow-400 text-2xl font-bold">
                        {winner.name} Wins!
                      </h3>
                      <p className="text-gray-300 text-sm">Congratulations!</p>
                    </div>
                  </div>
                )}

                {/* Board Content */}
                <div className="text-center">
                  <div className="text-6xl text-yellow-400/30 mb-4">🎲</div>
                  <p className="text-gray-400 text-lg">Ludo Board</p>
                  <p className="text-gray-500 text-sm">
                    {gameStatus === 'playing' 
                      ? '🎯 Game in progress...' 
                      : gameStatus === 'finished'
                      ? '🏁 Game completed!'
                      : '⏳ Waiting for game to start...'}
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    {playerCount} players • {gameMode === 'vs_computer' ? 'AI' : 'Local'} mode
                  </p>
                  <div className="mt-4 flex gap-2 justify-center">
                    {players.map((player, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${getPlayerColorClasses(
                          player.color
                        ).split(' ')[0]}`}
                        title={player.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR - DICE & STATUS */}
          <aside className="lg:col-span-3 order-3">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 h-full">
              {/* Dice Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">🎲</span>
                  Dice
                </h2>

                <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-700">
                  <div
                    className={`text-7xl font-bold transition-all duration-200 ${
                      isRolling ? 'animate-bounce' : ''
                    }`}
                  >
                    {getDiceFace(diceValue)}
                  </div>

                  <button
                    onClick={handleRollDice}
                    disabled={
                      isRolling ||
                      gameStatus === 'finished' ||
                      gameStatus === 'paused' ||
                      gameStatus === 'waiting'
                    }
                    className={`mt-4 px-6 py-3 rounded-lg font-semibold w-full transition-all duration-200 ${
                      isRolling ||
                      gameStatus === 'finished' ||
                      gameStatus === 'paused' ||
                      gameStatus === 'waiting'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 hover:shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105'
                    }`}
                  >
                    {isRolling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Rolling...
                      </span>
                    ) : (
                      'Roll Dice'
                    )}
                  </button>

                  {lastRoll && (
                    <div className="mt-3 text-sm text-gray-400">
                      Last roll: <span className="text-white font-bold">{lastRoll.value}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(lastRoll.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Stats */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">📊</span>
                  Game Stats
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Turn</span>
                    <span className="text-white font-medium">{turnNumber}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Current Player</span>
                    <span className="text-white font-medium">
                      {players[currentTurn]?.name || '--'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span
                      className={`font-medium ${
                        gameStatus === 'finished'
                          ? 'text-blue-400'
                          : gameStatus === 'paused'
                          ? 'text-yellow-400'
                          : gameStatus === 'waiting'
                          ? 'text-gray-400'
                          : 'text-green-400'
                      }`}
                    >
                      {gameStatus === 'finished'
                        ? 'Finished'
                        : gameStatus === 'paused'
                        ? 'Paused'
                        : gameStatus === 'waiting'
                        ? 'Waiting'
                        : 'Playing'}
                    </span>
                  </div>
                  {winner && (
                    <div className="flex justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <span className="text-yellow-400 text-sm">🏆 Winner</span>
                      <span className="text-yellow-400 font-medium">{winner.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM PANEL - MOVE HISTORY */}
        <div className="mt-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-yellow-400 mr-2">📜</span>
              Move History
              <span className="ml-2 text-sm text-gray-400 font-normal">
                ({moveHistory.length} moves)
              </span>
            </h2>

            {moveHistory.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No moves yet</p>
                <p className="text-gray-600 text-xs">Roll the dice to start</p>
              </div>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {moveHistory.slice().reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30 text-sm"
                  >
                    <span className="text-gray-300">{entry.message}</span>
                    <span className="text-gray-500 text-xs">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default OfflineGame;