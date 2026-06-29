// src/components/Game/GameManager.jsx

/**
 * GameManager Component
 * 
 * Bridge between React UI and LudoEngine.
 * Manages game state synchronization and UI event coordination.
 * Serves as the single source of truth for the game UI.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Engine import
import LudoEngine from '../../core/LudoEngine.js';

// Context
import { useGame } from '../../context/GameContext.jsx';

// Components
import GameHeader from './GameHeader.jsx';
import GameStatus from './GameStatus.jsx';
import RoomInfo from './RoomInfo.jsx';
import TurnIndicator from './TurnIndicator.jsx';
import LudoBoard from './LudoBoard.jsx';
import Dice from './Dice.jsx';
import PlayersList from './PlayersList.jsx';
import GameControls from './GameControls.jsx';

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Initial game configuration for demo/offline play.
 * @returns {Object} Default game configuration
 */
const getDefaultGameConfig = () => ({
    gameId: `offline_${Date.now()}`,
    maxPlayers: 4,
    minPlayers: 2,
    tokensPerPlayer: 4,
    maxConsecutiveSixes: 3,
    allowExtraTurnOnSix: true,
});

/**
 * Default players for offline demo.
 * @returns {Object[]} Default player list
 */
const getDefaultPlayers = () => [
    { id: 'player1', name: 'Player 1', color: 'red' },
    { id: 'player2', name: 'Player 2', color: 'green' },
    { id: 'player3', name: 'Player 3', color: 'yellow' },
    { id: 'player4', name: 'Player 4', color: 'blue' },
];

/**
 * Maps engine error to user-friendly message.
 * @param {Error} error - Engine error
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (error) => {
    const errorMap = {
        'Game engine not initialized': 'Game is not ready. Please wait.',
        'Game has not started': 'Game has not started yet.',
        'Game has already finished': 'Game is over. Start a new game.',
        'It is not': 'It is not your turn.',
        'Token not found': 'Token not found.',
        'Invalid move': 'Invalid move. Please try again.',
    };

    for (const [key, message] of Object.entries(errorMap)) {
        if (error.message.includes(key)) {
            return message;
        }
    }

    return error.message || 'An error occurred. Please try again.';
};

// ============================================================
// GameManager Component
// ============================================================

/**
 * Main GameManager component.
 * Coordinates the Ludo game UI and engine state.
 */
const GameManager = () => {
    // Context
    const {
        gameState: contextGameState,
        setGameState: setContextGameState,
        isLoading: contextLoading,
        error: contextError,
        setError: setContextError,
        clearError: clearContextError,
    } = useGame();

    // Local state
    const [engineState, setEngineState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTokenId, setSelectedTokenId] = useState(null);
    const [gameStatus, setGameStatus] = useState('idle');
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [diceValue, setDiceValue] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);
    const [players, setPlayers] = useState([]);
    const [tokens, setTokens] = useState([]);

    // Refs
    const engineRef = useRef(null);
    const isMountedRef = useRef(true);
    const gameConfigRef = useRef(null);

    // ============================================================
    // ENGINE INITIALIZATION
    // ============================================================

    /**
     * Initializes the LudoEngine instance.
     */
    const initializeEngine = useCallback(async (config = null) => {
        try {
            setIsLoading(true);
            clearError();

            // Create engine instance if not exists
            if (!engineRef.current) {
                engineRef.current = new LudoEngine();
            }

            const gameConfig = config || getDefaultGameConfig();
            gameConfigRef.current = gameConfig;

            // Initialize engine
            engineRef.current.initialize(gameConfig);

            // Create game with default players
            const defaultPlayers = getDefaultPlayers();
            const createResult = engineRef.current.createGame(defaultPlayers);

            if (!createResult.success) {
                throw new Error('Failed to create game');
            }

            // Start the game
            const startResult = engineRef.current.startGame();

            // Update local state
            const state = engineRef.current.getGameState();
            updateLocalState(state);

            // Update context
            if (setContextGameState) {
                setContextGameState(state);
            }

            setIsLoading(false);
        } catch (err) {
            handleError(err);
        }
    }, [clearError, setContextGameState]);

    /**
     * Updates local state from engine state.
     */
    const updateLocalState = useCallback((state) => {
        if (!isMountedRef.current) return;

        setEngineState(state);
        setGameStatus(state.status || 'idle');
        setCurrentPlayer(state.currentPlayer || null);
        setDiceValue(state.diceValue || null);
        setPlayers(state.players || []);
        setTokens(state.tokens || []);
        setMoveHistory(state.moveHistory || []);
        setGameStatus(state.status || 'idle');
    }, []);

    /**
     * Handles errors and updates UI state.
     */
    const handleError = useCallback((err) => {
        const message = getErrorMessage(err);
        setError(message);
        setContextError && setContextError(message);
        console.error('GameManager Error:', err);
    }, [setContextError]);

    /**
     * Clears error state.
     */
    const clearError = useCallback(() => {
        setError(null);
        clearContextError && clearContextError();
    }, [clearContextError]);

    // ============================================================
    // GAME ACTIONS
    // ============================================================

    /**
     * Handles dice roll action.
     */
    const handleRollDice = useCallback(async () => {
        try {
            clearError();

            if (!engineRef.current || !currentPlayer) {
                throw new Error('Game engine not ready');
            }

            if (gameStatus !== 'playing') {
                throw new Error('Game is not active');
            }

            setIsRolling(true);
            setSelectedTokenId(null);

            // Roll dice
            const rollResult = engineRef.current.rollDice(currentPlayer);

            if (!rollResult.success) {
                throw new Error(rollResult.reason || 'Failed to roll dice');
            }

            // Update state
            const state = engineRef.current.getGameState();
            updateLocalState(state);

            // Update context
            if (setContextGameState) {
                setContextGameState(state);
            }

            setDiceValue(rollResult.diceValue);

            // Auto-end turn if not a six or no extra turn
            if (!rollResult.extraTurn && !rollResult.isSix) {
                // Check if player can move any token
                const playerTokens = state.tokens.filter(
                    t => t.playerId === currentPlayer && t.status !== 'finished'
                );

                const canMove = playerTokens.some(token => {
                    try {
                        const validation = engineRef.current._moveValidator.validateMove?.(
                            token,
                            state.tokens,
                            rollResult.diceValue,
                            state.board,
                            state.gameOptions
                        );
                        return validation?.valid || false;
                    } catch {
                        return false;
                    }
                });

                if (!canMove) {
                    // Auto-end turn if no moves available
                    await handleEndTurn();
                }
            }

            setIsRolling(false);
        } catch (err) {
            handleError(err);
            setIsRolling(false);
        }
    }, [currentPlayer, gameStatus, clearError, updateLocalState, setContextGameState]);

    /**
     * Handles token selection for movement.
     */
    const handleTokenSelect = useCallback((tokenId) => {
        setSelectedTokenId(tokenId);
    }, []);

    /**
     * Handles token movement action.
     */
    const handleMoveToken = useCallback(async (tokenId) => {
        try {
            clearError();

            if (!engineRef.current || !currentPlayer) {
                throw new Error('Game engine not ready');
            }

            if (gameStatus !== 'playing') {
                throw new Error('Game is not active');
            }

            if (!tokenId && !selectedTokenId) {
                throw new Error('No token selected');
            }

            const moveTokenId = tokenId || selectedTokenId;

            setIsMoving(true);

            // Move token
            const moveResult = engineRef.current.moveToken(
                currentPlayer,
                moveTokenId
            );

            if (!moveResult.success) {
                throw new Error(moveResult.reason || 'Failed to move token');
            }

            // Update state
            const state = engineRef.current.getGameState();
            updateLocalState(state);

            // Update context
            if (setContextGameState) {
                setContextGameState(state);
            }

            // Check if game finished
            if (state.status === 'finished') {
                setGameStatus('finished');
                setIsMoving(false);
                setSelectedTokenId(null);
                return;
            }

            // Auto-end turn if no extra turn pending
            const turnResult = engineRef.current.endTurn(currentPlayer);

            if (turnResult.success && !turnResult.extraTurn) {
                // Update state after turn end
                const newState = engineRef.current.getGameState();
                updateLocalState(newState);
                if (setContextGameState) {
                    setContextGameState(newState);
                }
            }

            setSelectedTokenId(null);
            setIsMoving(false);
        } catch (err) {
            handleError(err);
            setIsMoving(false);
        }
    }, [currentPlayer, gameStatus, selectedTokenId, clearError, updateLocalState, setContextGameState]);

    /**
     * Handles ending the current turn.
     */
    const handleEndTurn = useCallback(async () => {
        try {
            clearError();

            if (!engineRef.current || !currentPlayer) {
                throw new Error('Game engine not ready');
            }

            if (gameStatus !== 'playing') {
                throw new Error('Game is not active');
            }

            // End turn
            const turnResult = engineRef.current.endTurn(currentPlayer);

            if (!turnResult.success) {
                throw new Error(turnResult.reason || 'Failed to end turn');
            }

            // Update state
            const state = engineRef.current.getGameState();
            updateLocalState(state);

            // Update context
            if (setContextGameState) {
                setContextGameState(state);
            }

            setSelectedTokenId(null);

            // Auto-roll if extra turn
            if (turnResult.extraTurn) {
                setTimeout(() => {
                    handleRollDice();
                }, 500);
            }
        } catch (err) {
            handleError(err);
        }
    }, [currentPlayer, gameStatus, clearError, updateLocalState, setContextGameState]);

    /**
     * Handles game restart.
     */
    const handleRestartGame = useCallback(async () => {
        try {
            clearError();

            if (!engineRef.current) {
                throw new Error('Game engine not ready');
            }

            // Reset game
            engineRef.current.resetGame({ reinitialize: true });

            // Re-initialize with same config
            const config = gameConfigRef.current || getDefaultGameConfig();

            engineRef.current.initialize(config);

            // Create game
            const defaultPlayers = getDefaultPlayers();
            engineRef.current.createGame(defaultPlayers);
            engineRef.current.startGame();

            // Update state
            const state = engineRef.current.getGameState();
            updateLocalState(state);

            if (setContextGameState) {
                setContextGameState(state);
            }

            setSelectedTokenId(null);
            setError(null);
        } catch (err) {
            handleError(err);
        }
    }, [clearError, updateLocalState, setContextGameState]);

    /**
     * Handles leaving the game.
     */
    const handleLeaveGame = useCallback(() => {
        // Clean up engine
        if (engineRef.current) {
            engineRef.current.resetGame();
            engineRef.current = null;
        }

        // Reset state
        setEngineState(null);
        setGameStatus('idle');
        setCurrentPlayer(null);
        setDiceValue(null);
        setSelectedTokenId(null);
        setPlayers([]);
        setTokens([]);
        setMoveHistory([]);
        clearError();

        // Update context
        if (setContextGameState) {
            setContextGameState(null);
        }

        // Navigate to lobby (handled by parent)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('leaveGame'));
        }
    }, [clearError, setContextGameState]);

    // ============================================================
    // EFFECTS
    // ============================================================

    /**
     * Initialize engine on mount.
     */
    useEffect(() => {
        isMountedRef.current = true;

        // Initialize engine with default config
        initializeEngine();

        // Cleanup on unmount
        return () => {
            isMountedRef.current = false;
            if (engineRef.current) {
                engineRef.current.resetGame();
                engineRef.current = null;
            }
        };
    }, [initializeEngine]);

    /**
     * Sync engine state with context if provided.
     */
    useEffect(() => {
        if (contextGameState && isMountedRef.current) {
            updateLocalState(contextGameState);
        }
    }, [contextGameState, updateLocalState]);

    /**
     * Handle window resize for responsive layout.
     */
    useEffect(() => {
        const handleResize = () => {
            // Re-render on resize for responsive layout
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ============================================================
    // COMPUTED VALUES
    // ============================================================

    /**
     * Determines if the current player can roll dice.
     */
    const canRoll = useMemo(() => {
        return gameStatus === 'playing' &&
            currentPlayer &&
            !isRolling &&
            !isMoving &&
            !engineState?.pendingExtraTurn;
    }, [gameStatus, currentPlayer, isRolling, isMoving, engineState]);

    /**
     * Determines if the current player can move tokens.
     */
    const canMove = useMemo(() => {
        return gameStatus === 'playing' &&
            currentPlayer &&
            !isRolling &&
            !isMoving &&
            diceValue !== null &&
            diceValue !== undefined &&
            !engineState?.pendingExtraTurn;
    }, [gameStatus, currentPlayer, isRolling, isMoving, diceValue, engineState]);

    /**
     * Determines if the current player can end their turn.
     */
    const canEndTurn = useMemo(() => {
        return gameStatus === 'playing' &&
            currentPlayer &&
            !isRolling &&
            !isMoving &&
            !engineState?.pendingExtraTurn;
    }, [gameStatus, currentPlayer, isRolling, isMoving, engineState]);

    /**
     * Gets player tokens that can be moved.
     */
    const movableTokens = useMemo(() => {
        if (!currentPlayer || !diceValue) return [];

        return tokens.filter(token => {
            if (token.playerId !== currentPlayer) return false;
            if (token.status === 'finished') return false;
            if (token.status === 'home' && diceValue !== 6) return false;

            // Check if token can move (using engine validation)
            try {
                const state = engineRef.current?.getGameState();
                if (!state) return false;

                const validation = engineRef.current._moveValidator?.validateMove?.(
                    token,
                    state.tokens,
                    diceValue,
                    state.board,
                    state.gameOptions
                );

                return validation?.valid || false;
            } catch {
                return false;
            }
        });
    }, [currentPlayer, diceValue, tokens]);

    /**
     * Gets the current player object.
     */
    const currentPlayerObj = useMemo(() => {
        return players.find(p => p.id === currentPlayer) || null;
    }, [players, currentPlayer]);

    // ============================================================
    // RENDER
    // ============================================================

    if (isLoading) {
        return (
            <div className="game-manager-loading" data-testid="game-manager-loading">
                <div className="loading-spinner" />
                <p>Loading game...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="game-manager-error" data-testid="game-manager-error">
                <div className="error-container">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button
                        onClick={handleRestartGame}
                        className="error-retry-button"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-manager" data-testid="game-manager">
            {/* Game Header */}
            <GameHeader
                gameId={engineState?.gameId}
                gameStatus={gameStatus}
                players={players}
                onLeave={handleLeaveGame}
            />

            <div className="game-manager-content">
                {/* Left Sidebar - Room Info & Players */}
                <aside className="game-manager-sidebar">
                    <RoomInfo
                        gameId={engineState?.gameId}
                        playerCount={players.length}
                        gameStatus={gameStatus}
                        totalTurns={engineState?.totalTurns || 0}
                    />

                    <PlayersList
                        players={players}
                        currentPlayerId={currentPlayer}
                        tokens={tokens}
                        gameStatus={gameStatus}
                        rankings={engineState?.winnerState?.rankings}
                    />
                </aside>

                {/* Main Game Area */}
                <main className="game-manager-main">
                    {/* Game Status */}
                    <GameStatus
                        status={gameStatus}
                        currentPlayer={currentPlayerObj}
                        message={engineState?.pendingExtraTurn ? 'Extra turn!' : null}
                    />

                    {/* Turn Indicator */}
                    <TurnIndicator
                        currentPlayer={currentPlayerObj}
                        isExtraTurn={engineState?.pendingExtraTurn || false}
                        consecutiveSixes={engineState?.consecutiveSixes || 0}
                        maxConsecutiveSixes={engineState?.gameOptions?.maxConsecutiveSixes || 3}
                    />

                    {/* Ludo Board */}
                    <div className="game-manager-board-container">
                        <LudoBoard
                            board={engineState?.board}
                            tokens={tokens}
                            players={players}
                            selectedTokenId={selectedTokenId}
                            onTokenSelect={handleTokenSelect}
                            movableTokens={movableTokens}
                            currentPlayerId={currentPlayer}
                            isEditable={canMove}
                        />
                    </div>

                    {/* Game Controls */}
                    <div className="game-manager-controls">
                        <div className="game-manager-dice-section">
                            <Dice
                                value={diceValue}
                                isRolling={isRolling}
                                onRoll={handleRollDice}
                                disabled={!canRoll}
                                size="large"
                            />
                        </div>

                        <GameControls
                            canRoll={canRoll}
                            canMove={canMove}
                            canEndTurn={canEndTurn}
                            isRolling={isRolling}
                            isMoving={isMoving}
                            onRoll={handleRollDice}
                            onEndTurn={handleEndTurn}
                            onRestart={handleRestartGame}
                            onLeave={handleLeaveGame}
                            selectedTokenId={selectedTokenId}
                            movableTokens={movableTokens}
                            onMoveToken={handleMoveToken}
                            gameStatus={gameStatus}
                        />
                    </div>

                    {/* Move History (optional) */}
                    {moveHistory.length > 0 && (
                        <div className="game-manager-history">
                            <details>
                                <summary>Move History ({moveHistory.length})</summary>
                                <ul>
                                    {moveHistory.slice(-10).reverse().map((move, index) => (
                                        <li key={index}>
                                            Player {move.playerId} moved token from {move.fromPosition}
                                            to {move.toPosition} (dice: {move.diceValue})
                                            {move.captured && ' 🎯'}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </div>
                    )}
                </main>
            </div>

            {/* CSS Styles */}
            <style jsx>{`
        .game-manager {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .game-manager-content {
          display: flex;
          flex: 1;
          padding: 20px;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .game-manager-sidebar {
          flex: 0 0 280px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .game-manager-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .game-manager-board-container {
          flex: 1;
          min-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .game-manager-controls {
          display: flex;
          gap: 20px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .game-manager-dice-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .game-manager-history {
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-height: 150px;
          overflow-y: auto;
        }

        .game-manager-history details summary {
          cursor: pointer;
          font-weight: 500;
          color: #333;
        }

        .game-manager-history ul {
          list-style: none;
          padding: 10px 0 0 0;
          margin: 0;
        }

        .game-manager-history li {
          padding: 4px 0;
          font-size: 14px;
          color: #555;
          border-bottom: 1px solid #eee;
        }

        .game-manager-history li:last-child {
          border-bottom: none;
        }

        .game-manager-loading,
        .game-manager-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e0e0e0;
          border-top-color: #1976d2;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .game-manager-loading p {
          color: #666;
          font-size: 18px;
          margin: 0;
        }

        .error-container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }

        .error-container h3 {
          color: #d32f2f;
          margin: 0 0 12px 0;
        }

        .error-container p {
          color: #555;
          margin: 0 0 20px 0;
        }

        .error-retry-button {
          padding: 10px 24px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .error-retry-button:hover {
          background: #1565c0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .game-manager-content {
            flex-direction: column;
            padding: 16px;
          }

          .game-manager-sidebar {
            flex: 1;
            flex-direction: row;
            flex-wrap: wrap;
          }

          .game-manager-sidebar > * {
            flex: 1;
            min-width: 200px;
          }

          .game-manager-board-container {
            min-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .game-manager-content {
            padding: 12px;
          }

          .game-manager-sidebar {
            flex-direction: column;
          }

          .game-manager-sidebar > * {
            min-width: 100%;
          }

          .game-manager-board-container {
            min-height: 300px;
            padding: 12px;
          }

          .game-manager-controls {
            flex-direction: column;
            padding: 16px;
          }

          .game-manager-dice-section {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .game-manager-board-container {
            min-height: 250px;
            padding: 8px;
          }

          .game-manager-controls {
            padding: 12px;
          }
        }
      `}</style>
        </div>
    );
};

// ============================================================
// EXPORT
// ============================================================

export default GameManager;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why GameManager is responsible for coordinating the UI instead of 
 *    implementing game rules:
 * 
 * - Separation of Concerns: GameManager handles UI coordination, while
 *   LudoEngine handles all game logic and rules. This makes each layer
 *   simpler, more maintainable, and easier to test.
 * 
 * - Single Responsibility: GameManager's job is to:
 *   * Initialize and manage the engine lifecycle
 *   * Sync engine state with React state
 *   * Transform engine data for UI consumption
 *   * Delegate user actions to the engine
 *   * Handle loading and error states
 * 
 * - Reusability: The same GameManager can work with different UI layouts
 *   or component libraries. The engine can be used with different frontends
 *   (React, Vue, mobile apps) without modification.
 * 
 * - Testability: GameManager can be tested with mocked engine, focusing
 *   on UI coordination logic. Engine logic is tested independently.
 * 
 * 2. How it connects React components to the LudoEngine:
 * 
 * - Engine Instance: Uses useRef to maintain a single engine instance
 *   across re-renders, ensuring state persistence.
 * 
 * - State Synchronization: Uses useState to store engine state in
 *   React's state system. The updateLocalState function transforms
 *   engine state into UI-friendly format.
 * 
 * - Action Handlers: Each UI action (roll dice, move token, end turn)
 *   has a corresponding handler that calls the engine method, then
 *   syncs the updated state back to React.
 * 
 * - Data Flow:
 *   UI Event → Handler → Engine Method → Engine Updates State →
 *   getGameState() → updateLocalState() → React Re-render
 * 
 * - Context Integration: Uses GameContext to share game state with
 *   deeply nested components, avoiding prop drilling.
 * 
 * - Computed Values: Uses useMemo for derived state (canRoll, canMove,
 *   movableTokens) to optimize rendering.
 * 
 * 3. How this architecture will simplify adding Socket.IO and 
 *    backend synchronization later:
 * 
 * - Clear Layer Separation: The UI coordination (GameManager) is
 *   completely separated from game logic (LudoEngine). This means:
 *   * Socket.IO can be added as a middleware layer between the UI
 *     and the engine, or as a replacement for the engine on clients.
 *   * The same GameManager can work with either local engine or
 *     remote server, with minimal changes.
 * 
 * - Event-Driven Architecture: Actions are already encapsulated in
 *   handlers. Adding Socket.IO would involve:
 *   * Sending action events to server via Socket.IO
 *   * Receiving state updates from server and calling updateLocalState
 *   * The engine could run on server, with clients being thin views
 * 
 * - State Serialization: The engine state is already plain JavaScript
 *   objects that can be serialized to JSON, making network transmission
 *   straightforward.
 * 
 * - Reconnection Handling: The updateLocalState function can be reused
 *   to apply state received from the server after reconnection.
 * 
 * - Optimistic Updates: The current architecture can be extended with
 *   optimistic updates by applying local state changes before server
 *   confirmation, then rolling back if rejected.
 * 
 * - Multiplayer Synchronization: With Socket.IO, the GameManager would
 *   listen for server-sent state updates instead of calling the local
 *   engine directly. The same UI components would render the state
 *   regardless of its source.
 */