// src/engine/turnEngine.js

/**
 * Turn Engine Module
 *
 * Production-ready turn management for Ludo game.
 * Handles player turn order, extra turns, skipping, and player state.
 * Pure JavaScript with no dependencies.
 */

// ============================================================
// CONSTANTS
// ============================================================

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const MAX_CONSECUTIVE_SIXES = 3;

// ============================================================
// STATE
// ============================================================

let _players = [];
let _currentPlayerIndex = 0;
let _turnNumber = 0;
let _consecutiveSixes = 0;
let _extraTurnPending = false;
let _initialized = false;

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Validates a player object.
 * @param {Object} player - Player to validate
 * @throws {Error} If player is invalid
 */
const _validatePlayer = (player) => {
  if (!player || typeof player !== "object") {
    throw new Error("Player must be an object");
  }
  if (!player.id || typeof player.id !== "string") {
    throw new Error("Player must have a string id");
  }
  if (!player.name || typeof player.name !== "string") {
    throw new Error("Player must have a string name");
  }
  if (!player.color || typeof player.color !== "string") {
    throw new Error("Player must have a string color");
  }
  if (!["human", "ai"].includes(player.type)) {
    throw new Error('Player type must be "human" or "ai"');
  }
};

/**
 * Validates a players array.
 * @param {Array} players - Players to validate
 * @throws {Error} If players array is invalid
 */
const _validatePlayers = (players) => {
  if (!Array.isArray(players)) {
    throw new Error("Players must be an array");
  }
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    throw new Error(
      `Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`,
    );
  }

  const ids = new Set();
  for (const player of players) {
    _validatePlayer(player);
    if (ids.has(player.id)) {
      throw new Error(`Duplicate player id: ${player.id}`);
    }
    ids.add(player.id);
  }
};

/**
 * Finds the next eligible player index.
 * @param {number} startIndex - Starting index
 * @param {number} direction - 1 for forward, -1 for backward
 * @returns {number} Next eligible player index
 */
const _findNextEligiblePlayer = (startIndex, direction = 1) => {
  const count = _players.length;
  let index = (startIndex + direction + count) % count;
  let attempts = 0;

  while (attempts < count) {
    const player = _players[index];
    if (player.active && !player.finished && !player.disconnected) {
      return index;
    }
    index = (index + direction + count) % count;
    attempts++;
  }

  // No eligible player found
  return -1;
};

/**
 * Checks if all players are finished.
 * @returns {boolean} True if all players are finished
 */
const _allPlayersFinished = () => {
  return _players.every((p) => p.finished || !p.active || p.disconnected);
};

/**
 * Gets the next valid player index.
 * @param {number} currentIndex - Current player index
 * @returns {number} Next valid player index
 */
const _getNextPlayerIndex = (currentIndex) => {
  if (_allPlayersFinished()) {
    return -1;
  }

  let nextIndex = _findNextEligiblePlayer(currentIndex, 1);

  // If no eligible player found, try from the beginning
  if (nextIndex === -1) {
    nextIndex = _findNextEligiblePlayer(-1, 1);
  }

  return nextIndex;
};

/**
 * Gets the previous valid player index.
 * @param {number} currentIndex - Current player index
 * @returns {number} Previous valid player index
 */
const _getPreviousPlayerIndex = (currentIndex) => {
  if (_allPlayersFinished()) {
    return -1;
  }

  let prevIndex = _findNextEligiblePlayer(currentIndex, -1);

  if (prevIndex === -1) {
    prevIndex = _findNextEligiblePlayer(_players.length, -1);
  }

  return prevIndex;
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Initializes the turn engine with players.
 * @param {Array} players - Array of player objects
 * @param {Object} options - Initialization options
 * @param {number} options.startIndex - Starting player index
 * @returns {Object} Initialization result
 */
export const initializeTurns = (players, options = {}) => {
  _validatePlayers(players);

  // Create deep copy of players
  _players = players.map((p) => ({
    ...p,
    active: p.active !== undefined ? p.active : true,
    finished: p.finished || false,
    disconnected: p.disconnected || false,
  }));

  const startIndex = options.startIndex || 0;
  if (startIndex < 0 || startIndex >= _players.length) {
    throw new Error("Start index out of bounds");
  }

  _currentPlayerIndex = startIndex;
  _turnNumber = 0;
  _consecutiveSixes = 0;
  _extraTurnPending = false;
  _initialized = true;

  return {
    success: true,
    players: _players.map((p) => ({ ...p })),
    currentIndex: _currentPlayerIndex,
    currentPlayer: { ..._players[_currentPlayerIndex] },
    turnNumber: _turnNumber,
    message: "Turn engine initialized successfully",
  };
};

/**
 * Gets the current player.
 * @returns {Object|null} Current player or null
 */
export const getCurrentPlayer = () => {
  if (!_initialized || _players.length === 0) {
    return null;
  }

  if (_currentPlayerIndex < 0 || _currentPlayerIndex >= _players.length) {
    return null;
  }

  const player = _players[_currentPlayerIndex];
  if (!player.active || player.finished || player.disconnected) {
    // Skip to next eligible player
    const nextIndex = _getNextPlayerIndex(_currentPlayerIndex);
    if (nextIndex !== -1) {
      _currentPlayerIndex = nextIndex;
      return { ..._players[_currentPlayerIndex] };
    }
    return null;
  }

  return { ...player };
};

/**
 * Gets the current player index.
 * @returns {number} Current player index or -1
 */
export const getCurrentPlayerIndex = () => {
  if (!_initialized) {
    return -1;
  }
  return _currentPlayerIndex;
};

/**
 * Advances to the next turn.
 * @param {Object} options - Next turn options
 * @param {boolean} options.extraTurn - Whether this is an extra turn
 * @param {number} options.diceValue - Dice value rolled
 * @returns {Object} Next turn result
 */
export const nextTurn = (options = {}) => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  const extraTurn = options.extraTurn || false;
  const diceValue = options.diceValue || 0;

  // Check if extra turn should be canceled (three consecutive sixes)
  if (extraTurn && _consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
    // Cancel extra turn
    const result = {
      success: true,
      currentIndex: _currentPlayerIndex,
      currentPlayer: { ..._players[_currentPlayerIndex] },
      turnNumber: _turnNumber,
      extraTurn: false,
      extraTurnCancelled: true,
      consecutiveSixes: _consecutiveSixes,
      message: "Extra turn cancelled due to three consecutive sixes",
    };
    _extraTurnPending = false;
    return result;
  }

  // If extra turn is pending, keep the same player
  if (extraTurn || _extraTurnPending) {
    _extraTurnPending = false;
    _turnNumber++;

    return {
      success: true,
      currentIndex: _currentPlayerIndex,
      currentPlayer: { ..._players[_currentPlayerIndex] },
      turnNumber: _turnNumber,
      extraTurn: true,
      extraTurnCancelled: false,
      consecutiveSixes: _consecutiveSixes,
      message: "Extra turn granted",
    };
  }

  // Find next eligible player
  const nextIndex = _getNextPlayerIndex(_currentPlayerIndex);

  if (nextIndex === -1) {
    return {
      success: false,
      message: "No eligible players found",
      gameFinished: true,
    };
  }

  _currentPlayerIndex = nextIndex;
  _turnNumber++;
  _extraTurnPending = false;

  return {
    success: true,
    currentIndex: _currentPlayerIndex,
    currentPlayer: { ..._players[_currentPlayerIndex] },
    turnNumber: _turnNumber,
    extraTurn: false,
    extraTurnCancelled: false,
    consecutiveSixes: _consecutiveSixes,
    message: "Turn advanced successfully",
  };
};

/**
 * Moves to the previous turn.
 * @returns {Object} Previous turn result
 */
export const previousTurn = () => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  const prevIndex = _getPreviousPlayerIndex(_currentPlayerIndex);

  if (prevIndex === -1) {
    return {
      success: false,
      message: "No eligible players found",
    };
  }

  _currentPlayerIndex = prevIndex;
  _turnNumber = Math.max(0, _turnNumber - 1);
  _extraTurnPending = false;

  return {
    success: true,
    currentIndex: _currentPlayerIndex,
    currentPlayer: { ..._players[_currentPlayerIndex] },
    turnNumber: _turnNumber,
    message: "Turn reverted successfully",
  };
};

/**
 * Skips the current player.
 * @param {string} reason - Reason for skipping
 * @returns {Object} Skip result
 */
export const skipCurrentPlayer = (reason = "Skipped") => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  const currentPlayer = _players[_currentPlayerIndex];
  if (currentPlayer) {
    currentPlayer.active = false;
  }

  const result = nextTurn();

  return {
    success: result.success,
    currentIndex: result.currentIndex,
    currentPlayer: result.currentPlayer,
    turnNumber: _turnNumber,
    skippedPlayer: currentPlayer ? { ...currentPlayer } : null,
    reason: reason,
    message: "Player skipped successfully",
  };
};

/**
 * Grants an extra turn to the current player.
 * @param {number} diceValue - Dice value rolled (for tracking)
 * @returns {Object} Extra turn result
 */
export const giveExtraTurn = (diceValue = 6) => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  if (diceValue === 6) {
    _consecutiveSixes += 1;
  }

  _extraTurnPending = true;

  // Check if we've hit three consecutive sixes
  if (_consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
    _extraTurnPending = false;
    return {
      success: true,
      extraTurn: true,
      extraTurnCancelled: true,
      consecutiveSixes: _consecutiveSixes,
      message: "Extra turn cancelled due to three consecutive sixes",
    };
  }

  return {
    success: true,
    extraTurn: true,
    extraTurnCancelled: false,
    consecutiveSixes: _consecutiveSixes,
    message: "Extra turn granted",
  };
};

/**
 * Sets the current player by index.
 * @param {number} index - Player index to set
 * @returns {Object} Set result
 */
export const setCurrentPlayer = (index) => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  if (typeof index !== "number" || index < 0 || index >= _players.length) {
    throw new Error("Invalid player index");
  }

  const player = _players[index];
  if (!player.active || player.finished || player.disconnected) {
    return {
      success: false,
      message:
        "Cannot set current player to inactive/finished/disconnected player",
    };
  }

  _currentPlayerIndex = index;
  _extraTurnPending = false;

  return {
    success: true,
    currentIndex: _currentPlayerIndex,
    currentPlayer: { ..._players[_currentPlayerIndex] },
    turnNumber: _turnNumber,
    message: "Current player set successfully",
  };
};

/**
 * Gets the current turn number.
 * @returns {number} Turn number
 */
export const getTurnNumber = () => {
  return _turnNumber;
};

/**
 * Increments the turn number.
 * @param {number} increment - Number to increment by
 * @returns {Object} Increment result
 */
export const incrementTurn = (increment = 1) => {
  if (typeof increment !== "number" || increment < 0) {
    throw new Error("Increment must be a non-negative number");
  }

  _turnNumber += increment;

  return {
    success: true,
    turnNumber: _turnNumber,
    message: "Turn number incremented",
  };
};

/**
 * Resets the turn engine.
 * @param {Object} options - Reset options
 * @param {Array} options.players - New players array (optional)
 * @param {number} options.startIndex - Starting index (optional)
 * @returns {Object} Reset result
 */
export const resetTurns = (options = {}) => {
  if (options.players) {
    _validatePlayers(options.players);
    _players = options.players.map((p) => ({
      ...p,
      active: p.active !== undefined ? p.active : true,
      finished: p.finished || false,
      disconnected: p.disconnected || false,
    }));
  }

  _currentPlayerIndex = options.startIndex || 0;
  _turnNumber = 0;
  _consecutiveSixes = 0;
  _extraTurnPending = false;
  _initialized = true;

  return {
    success: true,
    players: _players.map((p) => ({ ...p })),
    currentIndex: _currentPlayerIndex,
    currentPlayer:
      _players.length > 0 ? { ..._players[_currentPlayerIndex] } : null,
    turnNumber: _turnNumber,
    message: "Turn engine reset successfully",
  };
};

/**
 * Removes a player by ID.
 * @param {string} id - Player ID to remove
 * @returns {Object} Removal result
 */
export const removePlayer = (id) => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  if (typeof id !== "string") {
    throw new Error("Player ID must be a string");
  }

  const index = _players.findIndex((p) => p.id === id);
  if (index === -1) {
    return {
      success: false,
      message: `Player ${id} not found`,
    };
  }

  // Mark player as inactive instead of removing
  _players[index].active = false;
  _players[index].disconnected = true;

  // If this was the current player, advance to next
  if (index === _currentPlayerIndex) {
    const result = nextTurn();
    return {
      success: true,
      removedPlayer: { ..._players[index] },
      currentIndex: result.currentIndex,
      currentPlayer: result.currentPlayer,
      message: `Player ${id} removed successfully`,
    };
  }

  return {
    success: true,
    removedPlayer: { ..._players[index] },
    currentIndex: _currentPlayerIndex,
    currentPlayer: { ..._players[_currentPlayerIndex] },
    message: `Player ${id} removed successfully`,
  };
};

/**
 * Adds a new player.
 * @param {Object} player - Player to add
 * @param {number} position - Position to insert at (optional)
 * @returns {Object} Addition result
 */
export const addPlayer = (player, position = null) => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  _validatePlayer(player);

  if (_players.length >= MAX_PLAYERS) {
    return {
      success: false,
      message: `Maximum ${MAX_PLAYERS} players allowed`,
    };
  }

  // Check for duplicate ID
  if (_players.some((p) => p.id === player.id)) {
    return {
      success: false,
      message: `Player with id ${player.id} already exists`,
    };
  }

  const newPlayer = {
    ...player,
    active: true,
    finished: false,
    disconnected: false,
  };

  if (position !== null && position >= 0 && position <= _players.length) {
    _players.splice(position, 0, newPlayer);
  } else {
    _players.push(newPlayer);
  }

  return {
    success: true,
    addedPlayer: { ...newPlayer },
    players: _players.map((p) => ({ ...p })),
    message: "Player added successfully",
  };
};

/**
 * Checks if it's a specific player's turn.
 * @param {string} id - Player ID to check
 * @returns {boolean} True if it's the player's turn
 */
export const isPlayerTurn = (id) => {
  if (!_initialized) {
    return false;
  }
  if (typeof id !== "string") {
    return false;
  }

  const currentPlayer = getCurrentPlayer();
  return currentPlayer ? currentPlayer.id === id : false;
};

/**
 * Gets all active players.
 * @returns {Array} Array of active players
 */
export const getActivePlayers = () => {
  if (!_initialized) {
    return [];
  }
  return _players
    .filter((p) => p.active && !p.finished && !p.disconnected)
    .map((p) => ({ ...p }));
};

/**
 * Gets all finished players.
 * @returns {Array} Array of finished players
 */
export const getFinishedPlayers = () => {
  if (!_initialized) {
    return [];
  }
  return _players.filter((p) => p.finished).map((p) => ({ ...p }));
};

/**
 * Gets all remaining (active and not finished) players.
 * @returns {Array} Array of remaining players
 */
export const getRemainingPlayers = () => {
  if (!_initialized) {
    return [];
  }
  return _players
    .filter((p) => p.active && !p.finished && !p.disconnected)
    .map((p) => ({ ...p }));
};

/**
 * Gets the current consecutive sixes count.
 * @returns {number} Consecutive sixes count
 */
export const getConsecutiveSixes = () => {
  return _consecutiveSixes;
};

/**
 * Resets the consecutive sixes counter.
 * @returns {Object} Reset result
 */
export const resetConsecutiveSixes = () => {
  const oldCount = _consecutiveSixes;
  _consecutiveSixes = 0;

  return {
    success: true,
    oldCount: oldCount,
    newCount: 0,
    message: "Consecutive sixes reset",
  };
};

/**
 * Sets a player's finished status.
 * @param {string} id - Player ID
 * @param {boolean} finished - Finished status
 * @returns {Object} Update result
 */
export const setPlayerFinished = (id, finished = true) => {
  if (!_initialized) {
    throw new Error("Turn engine not initialized");
  }

  if (typeof id !== "string") {
    throw new Error("Player ID must be a string");
  }

  const player = _players.find((p) => p.id === id);
  if (!player) {
    return {
      success: false,
      message: `Player ${id} not found`,
    };
  }

  player.finished = finished;

  // If current player is finished, advance to next
  if (finished && _currentPlayerIndex === _players.indexOf(player)) {
    const result = nextTurn();
    return {
      success: true,
      player: { ...player },
      currentIndex: result.currentIndex,
      currentPlayer: result.currentPlayer,
      message: `Player ${id} finished status updated`,
    };
  }

  return {
    success: true,
    player: { ...player },
    currentIndex: _currentPlayerIndex,
    currentPlayer: { ..._players[_currentPlayerIndex] },
    message: `Player ${id} finished status updated`,
  };
};

/**
 * Gets the current turn state.
 * @returns {Object} Current turn state
 */
export const getTurnState = () => {
  if (!_initialized) {
    return {
      initialized: false,
      players: [],
      currentIndex: -1,
      currentPlayer: null,
      turnNumber: 0,
      consecutiveSixes: 0,
      extraTurnPending: false,
    };
  }

  return {
    initialized: true,
    players: _players.map((p) => ({ ...p })),
    currentIndex: _currentPlayerIndex,
    currentPlayer:
      _players.length > 0 ? { ..._players[_currentPlayerIndex] } : null,
    turnNumber: _turnNumber,
    consecutiveSixes: _consecutiveSixes,
    extraTurnPending: _extraTurnPending,
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
