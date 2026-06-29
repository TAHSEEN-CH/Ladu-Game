// src/core/LudoEngine.js

/**
 * LudoEngine Class
 *
 * Central orchestrator for the Ludo game.
 * Manages game state and coordinates specialized engine modules.
 * Framework-independent and designed for extensibility.
 */

import * as boardGenerator from "../utils/boardGenerator.js";
import * as boardPaths from "../utils/boardPaths.js";
import * as pathEngine from "../utils/pathEngine.js";
import * as diceEngine from "../utils/diceEngine.js";
import * as tokenEngine from "../utils/tokenEngine.js";
import * as moveValidator from "../utils/moveValidator.js";
import * as turnEngine from "../utils/turnEngine.js";
import * as captureEngine from "../utils/captureEngine.js";
import * as winnerEngine from "../utils/winnerEngine.js";
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  TOTAL_TOKENS_PER_PLAYER,
  MAX_CONSECUTIVE_SIXES,
  INITIAL_DICE_VALUE,
} from "../utils/gameConstants.js";

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates a unique ID for game entities.
 * @returns {string} Unique ID
 */
function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates that the game is initialized.
 * @param {LudoEngine} engine - Engine instance
 * @throws {Error} If game not initialized
 */
function validateInitialized(engine) {
  if (!engine._initialized) {
    throw new Error("Game engine not initialized. Call initialize() first.");
  }
}

/**
 * Validates that the game has started.
 * @param {LudoEngine} engine - Engine instance
 * @throws {Error} If game not started
 */
function validateGameStarted(engine) {
  if (engine._gameStatus !== "playing") {
    throw new Error("Game has not started or has already ended.");
  }
}

/**
 * Validates that it's a player's turn to act.
 * @param {LudoEngine} engine - Engine instance
 * @param {string} playerId - Player ID
 * @throws {Error} If not player's turn
 */
function validatePlayerTurn(engine, playerId) {
  const currentPlayer = turnEngine.getCurrentPlayer(engine._turnState);
  if (currentPlayer !== playerId) {
    throw new Error(
      `It is not ${playerId}'s turn. Current turn: ${currentPlayer}`,
    );
  }
}

// ============================================================
// LudoEngine Class
// ============================================================

/**
 * Main Ludo game engine class.
 * Manages complete game state and coordinates all specialized modules.
 */
class LudoEngine {
  /**
   * Creates a new LudoEngine instance.
   */
  constructor() {
    // Core state
    this._initialized = false;
    this._gameId = null;
    this._gameStatus = "idle"; // idle | waiting | playing | finished
    this._players = [];
    this._tokens = [];
    this._board = null;
    this._diceValue = INITIAL_DICE_VALUE;
    this._lastDiceRoll = null;
    this._turnState = null;
    this._winnerState = null;
    this._moveHistory = [];
    this._totalTurns = 0;
    this._consecutiveSixes = 0;
    this._gameOptions = {};

    // Private state for internal use
    this._pendingExtraTurn = false;
    this._isInitialized = false;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Initializes the game engine with configuration.
   * @param {Object} options - Game configuration options
   * @param {string} options.gameId - Unique game identifier
   * @param {Object} options.rules - Rule variations
   * @returns {LudoEngine} This instance for chaining
   */
  initialize(options = {}) {
    if (this._initialized) {
      throw new Error(
        "Engine already initialized. Use resetGame() to start fresh.",
      );
    }

    this._gameId = options.gameId || generateId();
    this._gameOptions = Object.freeze({
      maxPlayers: options.maxPlayers || MAX_PLAYERS,
      minPlayers: options.minPlayers || MIN_PLAYERS,
      tokensPerPlayer: options.tokensPerPlayer || TOTAL_TOKENS_PER_PLAYER,
      maxConsecutiveSixes: options.maxConsecutiveSixes || MAX_CONSECUTIVE_SIXES,
      allowExtraTurnOnSix:
        options.allowExtraTurnOnSix !== undefined
          ? options.allowExtraTurnOnSix
          : true,
      rules: Object.freeze(options.rules || {}),
    });

    // Initialize board
    this._board = boardGenerator.generateBoard({
      numPlayers: MAX_PLAYERS,
      ...this._gameOptions,
    });

    this._initialized = true;
    this._isInitialized = true;
    this._gameStatus = "idle";

    return this;
  }

  /**
   * Creates a new game with the given players.
   * @param {Object[]} players - Array of player objects
   * @param {string} players[].id - Player ID
   * @param {string} players[].name - Player name
   * @param {string} players[].color - Player color
   * @returns {Object} Game creation result
   */
  createGame(players) {
    validateInitialized(this);

    if (this._gameStatus !== "idle" && this._gameStatus !== "waiting") {
      throw new Error(
        "Cannot create game when game is already active or finished.",
      );
    }

    if (
      !Array.isArray(players) ||
      players.length < this._gameOptions.minPlayers
    ) {
      throw new Error(
        `Need at least ${this._gameOptions.minPlayers} players to start.`,
      );
    }

    if (players.length > this._gameOptions.maxPlayers) {
      throw new Error(
        `Maximum ${this._gameOptions.maxPlayers} players allowed.`,
      );
    }

    // Validate players
    players.forEach((player, index) => {
      if (!player.id) throw new Error(`Player at index ${index} missing ID`);
      if (!player.name)
        throw new Error(`Player at index ${index} missing name`);
      if (!player.color)
        throw new Error(`Player at index ${index} missing color`);
    });

    // Check for duplicate player IDs
    const ids = players.map((p) => p.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error("Duplicate player IDs detected.");
    }

    this._players = Object.freeze(players.map((p) => ({ ...p })));

    // Initialize tokens for all players
    this._tokens = [];
    const colors = ["red", "green", "yellow", "blue"];
    players.forEach((player, index) => {
      const color = colors[index % colors.length];
      const playerTokens = tokenEngine.initializeTokensForPlayer(
        player.id,
        color,
        this._gameOptions.tokensPerPlayer,
      );
      this._tokens.push(...playerTokens);
    });

    // Initialize turn state
    const playerIds = players.map((p) => p.id);
    this._turnState = turnEngine.initializeTurnOrder(playerIds, 0);

    // Initialize winner state
    this._winnerState = winnerEngine.resetWinnerState(this._players);

    this._gameStatus = "waiting";
    this._totalTurns = 0;

    return {
      success: true,
      gameId: this._gameId,
      players: this._players,
      tokens: this._tokens,
      status: this._gameStatus,
    };
  }

  /**
   * Adds a player to the game before it starts.
   * @param {Object} player - Player object
   * @returns {Object} Updated game state
   */
  addPlayer(player) {
    validateInitialized(this);

    if (this._gameStatus !== "idle" && this._gameStatus !== "waiting") {
      throw new Error("Cannot add players after game has started.");
    }

    if (this._players.length >= this._gameOptions.maxPlayers) {
      throw new Error(
        `Maximum ${this._gameOptions.maxPlayers} players already added.`,
      );
    }

    // Validate player
    if (!player.id) throw new Error("Player missing ID");
    if (!player.name) throw new Error("Player missing name");
    if (!player.color) throw new Error("Player missing color");

    // Check for duplicate
    if (this._players.some((p) => p.id === player.id)) {
      throw new Error(`Player with ID ${player.id} already exists.`);
    }

    // Add player
    this._players = Object.freeze([...this._players, { ...player }]);

    // Initialize tokens for the new player
    const colors = ["red", "green", "yellow", "blue"];
    const colorIndex = this._players.length - 1;
    const color = colors[colorIndex % colors.length];
    const playerTokens = tokenEngine.initializeTokensForPlayer(
      player.id,
      color,
      this._gameOptions.tokensPerPlayer,
    );
    this._tokens = Object.freeze([...this._tokens, ...playerTokens]);

    // Update turn state with new player
    const playerIds = this._players.map((p) => p.id);
    this._turnState = turnEngine.initializeTurnOrder(playerIds, 0);

    return {
      success: true,
      players: this._players,
      tokens: this._tokens,
      status: this._gameStatus,
    };
  }

  /**
   * Removes a player from the game before it starts.
   * @param {string} playerId - Player ID to remove
   * @returns {Object} Updated game state
   */
  removePlayer(playerId) {
    validateInitialized(this);

    if (this._gameStatus !== "idle" && this._gameStatus !== "waiting") {
      throw new Error("Cannot remove players after game has started.");
    }

    if (this._players.length <= this._gameOptions.minPlayers) {
      throw new Error(
        `Cannot remove player. Need at least ${this._gameOptions.minPlayers} players.`,
      );
    }

    const playerIndex = this._players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error(`Player with ID ${playerId} not found.`);
    }

    // Remove player
    this._players = Object.freeze(
      this._players.filter((p) => p.id !== playerId),
    );

    // Remove player's tokens
    this._tokens = Object.freeze(
      this._tokens.filter((t) => t.playerId !== playerId),
    );

    // Update turn state
    const playerIds = this._players.map((p) => p.id);
    this._turnState = turnEngine.initializeTurnOrder(playerIds, 0);

    return {
      success: true,
      players: this._players,
      tokens: this._tokens,
      status: this._gameStatus,
    };
  }

  /**
   * Starts the game.
   * @returns {Object} Initial game state
   */
  startGame() {
    validateInitialized(this);

    if (this._gameStatus === "playing") {
      throw new Error("Game is already in progress.");
    }

    if (this._gameStatus === "finished") {
      throw new Error(
        "Game has already finished. Use resetGame() to start over.",
      );
    }

    if (this._players.length < this._gameOptions.minPlayers) {
      throw new Error(
        `Need at least ${this._gameOptions.minPlayers} players to start.`,
      );
    }

    this._gameStatus = "playing";
    this._totalTurns = 0;
    this._consecutiveSixes = 0;
    this._moveHistory = [];

    // Reset tokens to home positions
    this._tokens = Object.freeze(
      this._tokens.map((t) => ({
        ...t,
        status: "home",
        position: -1,
      })),
    );

    // Reset turn state
    const playerIds = this._players.map((p) => p.id);
    this._turnState = turnEngine.initializeTurnOrder(playerIds, 0);

    // Reset winner state
    this._winnerState = winnerEngine.resetWinnerState(this._players);

    return this.getGameState();
  }

  /**
   * Rolls the dice for the current player.
   * @param {string} playerId - ID of the player rolling
   * @returns {Object} Dice roll result
   */
  rollDice(playerId) {
    validateInitialized(this);
    validateGameStarted(this);
    validatePlayerTurn(this, playerId);

    // Roll the dice
    const rollResult = diceEngine.rollDice();
    this._diceValue = rollResult.value;
    this._lastDiceRoll = rollResult;

    // Check for extra turn
    const extraTurn = turnEngine.shouldGrantExtraTurn(
      this._turnState,
      this._diceValue,
    );

    if (extraTurn) {
      this._consecutiveSixes += 1;
      this._pendingExtraTurn = true;
    } else {
      this._consecutiveSixes = 0;
      this._pendingExtraTurn = false;
    }

    return {
      success: true,
      playerId: playerId,
      diceValue: this._diceValue,
      extraTurn: extraTurn,
      consecutiveSixes: this._consecutiveSixes,
      isSix: this._diceValue === 6,
    };
  }

  /**
   * Moves a token for the current player.
   * @param {string} playerId - ID of the player moving
   * @param {string} tokenId - ID of the token to move
   * @param {number} steps - Number of steps to move (optional, uses dice value)
   * @returns {Object} Move result
   */
  moveToken(playerId, tokenId, steps = null) {
    validateInitialized(this);
    validateGameStarted(this);
    validatePlayerTurn(this, playerId);

    const moveSteps = steps !== null ? steps : this._diceValue;

    // Validate token exists and belongs to player
    const token = this._tokens.find((t) => t.id === tokenId);
    if (!token) {
      throw new Error(`Token ${tokenId} not found.`);
    }
    if (token.playerId !== playerId) {
      throw new Error(`Token ${tokenId} does not belong to ${playerId}.`);
    }

    // Validate token can move
    const moveValidation = moveValidator.validateMove(
      token,
      this._tokens,
      moveSteps,
      this._board,
      this._gameOptions,
    );

    if (!moveValidation.valid) {
      return {
        success: false,
        reason: moveValidation.reason,
        errors: moveValidation.errors,
      };
    }

    // Calculate new position
    const currentPath = boardPaths.getPathForToken(token, this._board);
    const newPosition = pathEngine.calculateNewPosition(
      token.position,
      moveSteps,
      currentPath,
    );

    // Check for captures
    const captureCheck = captureEngine.shouldCapture(
      token,
      this._tokens,
      newPosition,
    );

    let updatedTokens = [...this._tokens];
    let capturedTokens = [];

    if (captureCheck.shouldCapture) {
      const captureResult = captureEngine.captureToken(
        token,
        this._tokens,
        newPosition,
      );
      if (captureResult.success) {
        updatedTokens = captureResult.updatedTokens;
        capturedTokens = captureResult.capturedTokens;
      }
    }

    // Move the token
    const moveResult = tokenEngine.moveToken(
      token,
      newPosition,
      updatedTokens,
      this._board,
    );

    if (!moveResult.success) {
      return {
        success: false,
        reason: moveResult.reason,
      };
    }

    // Update tokens
    this._tokens = Object.freeze(moveResult.updatedTokens);

    // Check if player has won
    const winCheck = winnerEngine.hasPlayerWon(this._tokens, playerId);
    if (winCheck.hasWon) {
      // Player won
      this._winnerState = winnerEngine.checkWinner(this._tokens, this._players);
      if (this._winnerState.hasWinner) {
        this._gameStatus = "finished";
        return {
          success: true,
          moveResult: {
            tokenId: tokenId,
            fromPosition: token.position,
            toPosition: newPosition,
            captured: capturedTokens.length > 0,
            capturedTokens: capturedTokens,
            isWinner: true,
          },
          gameStatus: "finished",
        };
      }
    }

    // Record move in history
    this._moveHistory.push({
      playerId: playerId,
      tokenId: tokenId,
      fromPosition: token.position,
      toPosition: newPosition,
      diceValue: moveSteps,
      captured: capturedTokens.length > 0,
      timestamp: Date.now(),
    });

    this._totalTurns += 1;

    return {
      success: true,
      moveResult: {
        tokenId: tokenId,
        fromPosition: token.position,
        toPosition: newPosition,
        captured: capturedTokens.length > 0,
        capturedTokens: capturedTokens,
        isWinner: false,
      },
    };
  }

  /**
   * Ends the current turn and advances to the next player.
   * @param {string} playerId - ID of the player ending their turn
   * @returns {Object} Turn result
   */
  endTurn(playerId) {
    validateInitialized(this);
    validateGameStarted(this);
    validatePlayerTurn(this, playerId);

    // Check if game is finished
    const gameFinished = winnerEngine.isGameFinished(
      this._tokens,
      this._players,
    );
    if (gameFinished.gameFinished) {
      this._gameStatus = "finished";
      return {
        success: true,
        nextPlayer: null,
        gameFinished: true,
        winners: this._winnerState.winners,
      };
    }

    // Check for extra turn
    if (
      this._pendingExtraTurn &&
      this._consecutiveSixes < this._gameOptions.maxConsecutiveSixes
    ) {
      // Same player gets another turn
      return {
        success: true,
        nextPlayer: playerId,
        extraTurn: true,
        gameFinished: false,
      };
    }

    // Advance to next player
    this._turnState = turnEngine.advanceTurn(this._turnState, this._diceValue);
    const nextPlayer = turnEngine.getCurrentPlayer(this._turnState);

    // Reset extra turn flag
    this._pendingExtraTurn = false;
    this._consecutiveSixes = 0;

    return {
      success: true,
      nextPlayer: nextPlayer,
      extraTurn: false,
      gameFinished: false,
    };
  }

  /**
   * Gets the current game state.
   * @returns {Object} Immutable game state snapshot
   */
  getGameState() {
    validateInitialized(this);

    const currentPlayer = this._turnState
      ? turnEngine.getCurrentPlayer(this._turnState)
      : null;

    const gameFinished = this._gameStatus === "finished";

    return Object.freeze({
      gameId: this._gameId,
      status: this._gameStatus,
      players: this._players,
      tokens: this._tokens,
      board: this._board,
      currentPlayer: currentPlayer,
      diceValue: this._diceValue,
      turnState: this._turnState,
      winnerState: this._winnerState,
      totalTurns: this._totalTurns,
      moveHistory: this._moveHistory,
      gameFinished: gameFinished,
      gameOptions: this._gameOptions,
      pendingExtraTurn: this._pendingExtraTurn,
      consecutiveSixes: this._consecutiveSixes,
      isInitialized: this._isInitialized,
    });
  }

  /**
   * Resets the game to initial state.
   * @param {Object} options - Reset options
   * @returns {Object} Reset result
   */
  resetGame(options = {}) {
    validateInitialized(this);

    // Clear all state
    this._gameStatus = "idle";
    this._players = [];
    this._tokens = [];
    this._diceValue = INITIAL_DICE_VALUE;
    this._lastDiceRoll = null;
    this._turnState = null;
    this._winnerState = null;
    this._moveHistory = [];
    this._totalTurns = 0;
    this._consecutiveSixes = 0;
    this._pendingExtraTurn = false;

    // Re-initialize if specified
    if (options.reinitialize) {
      this.initialize(options);
    }

    return {
      success: true,
      status: this._gameStatus,
    };
  }

  /**
   * Gets the current player's ID.
   * @returns {string|null} Current player ID or null if no turn state
   */
  getCurrentPlayer() {
    validateInitialized(this);
    if (!this._turnState) return null;
    return turnEngine.getCurrentPlayer(this._turnState);
  }

  /**
   * Gets the next player's ID.
   * @returns {string|null} Next player ID or null if no turn state
   */
  getNextPlayer() {
    validateInitialized(this);
    if (!this._turnState) return null;
    return turnEngine.getNextPlayer(this._turnState);
  }

  /**
   * Checks if it's a specific player's turn.
   * @param {string} playerId - Player ID to check
   * @returns {boolean} True if it's the player's turn
   */
  isPlayerTurn(playerId) {
    validateInitialized(this);
    if (!this._turnState) return false;
    return turnEngine.isPlayerTurn(this._turnState, playerId);
  }

  /**
   * Gets the winner(s) of the game.
   * @returns {Object} Winner information
   */
  getWinner() {
    validateInitialized(this);
    if (this._gameStatus !== "finished") {
      return { hasWinner: false, winners: [] };
    }
    return winnerEngine.checkWinner(this._tokens, this._players);
  }

  /**
   * Gets player rankings.
   * @returns {Object} Rankings
   */
  getRankings() {
    validateInitialized(this);
    return winnerEngine.calculateRankings(
      this._tokens,
      this._players,
      this._totalTurns,
    );
  }

  /**
   * Gets the current game status.
   * @returns {string} Game status
   */
  getStatus() {
    validateInitialized(this);
    return this._gameStatus;
  }
}

// ============================================================
// EXPORT
// ============================================================

export default LudoEngine;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why LudoEngine acts as the central orchestrator rather than containing all logic itself:
 *
 * - Separation of Concerns: Each specialized module handles one aspect of the game,
 *   making the code more maintainable and easier to understand.
 *
 * - Single Responsibility: LudoEngine only coordinates between modules and manages
 *   state, not implementing complex game logic itself.
 *
 * - Reusability: Specialized modules can be used independently or in different
 *   contexts (e.g., AI simulation, testing, different game variants).
 *
 * - Testability: Each module can be tested in isolation, and LudoEngine can be
 *   tested with mocked dependencies.
 *
 * - Extensibility: New features (e.g., different rule variants) can be added by
 *   replacing or extending specific modules without affecting the entire engine.
 *
 * 2. How it coordinates the specialized engine modules:
 *
 * - Board Management: Uses boardGenerator for board creation and boardPaths for
 *   path calculations.
 *
 * - Token Management: Delegates to tokenEngine for token initialization, movement,
 *   and position tracking.
 *
 * - Move Logic: Uses moveValidator to check legal moves and pathEngine for
 *   path calculations.
 *
 * - Turn Management: Uses turnEngine for turn order, current player, and
 *   extra turn logic.
 *
 * - Capture Logic: Delegates to captureEngine for capture validation and execution.
 *
 * - Winner Detection: Uses winnerEngine to check win conditions and calculate
 *   rankings.
 *
 * - Dice Rolling: Uses diceEngine for random dice generation.
 *
 * The engine maintains the game state and calls the appropriate module methods
 * in the correct order, handling the flow of the game.
 *
 * 3. How this design supports future multiplayer synchronization, AI players,
 *    and backend integration:
 *
 * - Multiplayer Synchronization: Since the engine is pure and framework-independent,
 *   it can be used on both client and server. Game state can be serialized and
 *   synchronized between clients. The deterministic nature ensures all clients
 *   have the same game state.
 *
 * - AI Players: AI can use the same engine APIs as human players. The AI module
 *   can call rollDice() and moveToken() with simulated decisions, using the
 *   engine's validation to ensure legal moves.
 *
 * - Backend Integration: The engine can run on a Node.js server without modification.
 *   The state can be stored in a database, and REST or WebSocket APIs can be built
 *   around the engine's public methods.
 *
 * - Persistence: The game state can be serialized to JSON for saving/loading
 *   games, enabling features like game resume and replay.
 *
 * - Scalability: Multiple game instances can run concurrently on the server,
 *   each with its own LudoEngine instance, making it suitable for multiplayer
 *   servers hosting multiple games simultaneously.
 */
