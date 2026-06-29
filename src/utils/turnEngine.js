// src/utils/turnEngine.js

/**
 * Turn Engine Module
 * 
 * Pure, framework-independent turn management utility for Ludo game.
 * Handles turn order, current player tracking, extra turns, and timeout logic.
 * Supports both 2-player and 4-player game modes.
 */

import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  MAX_CONSECUTIVE_SIXES,
  TURN_TIMEOUT_MS,
  EXTRA_TURN_ON_SIX,
} from './gameConstants.js';

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Validates that the player IDs array is valid.
 * @param {string[]} playerIds - Array of player IDs
 * @throws {Error} If invalid
 */
function validatePlayerIds(playerIds) {
  if (!Array.isArray(playerIds)) {
    throw new Error('playerIds must be an array');
  }
  if (playerIds.length < MIN_PLAYERS || playerIds.length > MAX_PLAYERS) {
    throw new Error(`playerIds must contain between ${MIN_PLAYERS} and ${MAX_PLAYERS} players`);
  }
  if (!playerIds.every(id => typeof id === 'string' && id.length > 0)) {
    throw new Error('Each player ID must be a non-empty string');
  }
  const unique = new Set(playerIds);
  if (unique.size !== playerIds.length) {
    throw new Error('Player IDs must be unique');
  }
}

/**
 * Validates that a turn state object is valid.
 * @param {Object} state - Turn state object
 * @throws {Error} If invalid
 */
function validateTurnState(state) {
  if (!state || typeof state !== 'object') {
    throw new Error('Turn state must be an object');
  }
  if (!Array.isArray(state.playerIds)) {
    throw new Error('Turn state missing playerIds array');
  }
  if (typeof state.currentIndex !== 'number' || state.currentIndex < 0) {
    throw new Error('Turn state missing valid currentIndex');
  }
  if (typeof state.turnStartTime !== 'number' || state.turnStartTime < 0) {
    throw new Error('Turn state missing valid turnStartTime');
  }
  if (typeof state.consecutiveSixes !== 'number' || state.consecutiveSixes < 0) {
    throw new Error('Turn state missing valid consecutiveSixes');
  }
}

/**
 * Creates a new turn state with default values.
 * @param {string[]} playerIds - Array of player IDs
 * @param {number} [startIndex=0] - Starting player index
 * @returns {Object} Immutable turn state
 */
function createTurnState(playerIds, startIndex = 0) {
  validatePlayerIds(playerIds);
  if (typeof startIndex !== 'number' || startIndex < 0 || startIndex >= playerIds.length) {
    throw new Error('startIndex must be a valid index within playerIds range');
  }

  return Object.freeze({
    playerIds: Object.freeze([...playerIds]),
    currentIndex: startIndex,
    turnStartTime: Date.now(),
    consecutiveSixes: 0,
    isExtraTurnPending: false,
  });
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Initializes the turn order for a game.
 * @param {string[]} playerIds - Array of player IDs in order of play
 * @param {number} [startIndex=0] - Index of the player who starts
 * @returns {Object} Immutable turn state
 */
export function initializeTurnOrder(playerIds, startIndex = 0) {
  return createTurnState(playerIds, startIndex);
}

/**
 * Gets the current player's ID.
 * @param {Object} state - Turn state
 * @returns {string} Current player ID
 */
export function getCurrentPlayer(state) {
  validateTurnState(state);
  return state.playerIds[state.currentIndex];
}

/**
 * Gets the next player's ID without advancing the turn.
 * @param {Object} state - Turn state
 * @returns {string} Next player ID
 */
export function getNextPlayer(state) {
  validateTurnState(state);
  const nextIndex = (state.currentIndex + 1) % state.playerIds.length;
  return state.playerIds[nextIndex];
}

/**
 * Advances the turn to the next player.
 * Resets consecutive sixes counter and updates turn start time.
 * @param {Object} state - Current turn state
 * @param {number} [diceValue] - Optional dice value to determine if extra turn is needed
 * @returns {Object} New immutable turn state
 */
export function advanceTurn(state, diceValue) {
  validateTurnState(state);

  // If dice value is 6 and extra turns are enabled, grant extra turn
  if (diceValue === 6 && EXTRA_TURN_ON_SIX) {
    const newSixes = state.consecutiveSixes + 1;
    if (newSixes > MAX_CONSECUTIVE_SIXES) {
      // Maximum sixes reached - force advance
      const nextIndex = (state.currentIndex + 1) % state.playerIds.length;
      return Object.freeze({
        ...state,
        currentIndex: nextIndex,
        turnStartTime: Date.now(),
        consecutiveSixes: 0,
        isExtraTurnPending: false,
      });
    }
    // Grant extra turn to same player
    return Object.freeze({
      ...state,
      turnStartTime: Date.now(),
      consecutiveSixes: newSixes,
      isExtraTurnPending: true,
    });
  }

  // Normal turn advancement
  const nextIndex = (state.currentIndex + 1) % state.playerIds.length;
  return Object.freeze({
    ...state,
    currentIndex: nextIndex,
    turnStartTime: Date.now(),
    consecutiveSixes: 0,
    isExtraTurnPending: false,
  });
}

/**
 * Determines if the current player should be granted an extra turn.
 * @param {Object} state - Turn state
 * @param {number} diceValue - The dice value rolled
 * @returns {boolean} True if extra turn should be granted
 */
export function shouldGrantExtraTurn(state, diceValue) {
  validateTurnState(state);
  if (typeof diceValue !== 'number' || diceValue < 1 || diceValue > 6) {
    throw new Error('diceValue must be a number between 1 and 6');
  }

  if (!EXTRA_TURN_ON_SIX) return false;
  if (diceValue !== 6) return false;
  if (state.consecutiveSixes >= MAX_CONSECUTIVE_SIXES) return false;

  return true;
}

/**
 * Resets the turn state to initial configuration.
 * @param {string[]} playerIds - Array of player IDs
 * @param {number} [startIndex=0] - Starting player index
 * @returns {Object} New immutable turn state
 */
export function resetTurnState(playerIds, startIndex = 0) {
  return createTurnState(playerIds, startIndex);
}

/**
 * Checks if it's a specific player's turn.
 * @param {Object} state - Turn state
 * @param {string} playerId - Player ID to check
 * @returns {boolean} True if it's the player's turn
 */
export function isPlayerTurn(state, playerId) {
  validateTurnState(state);
  if (typeof playerId !== 'string' || playerId.length === 0) {
    throw new Error('playerId must be a non-empty string');
  }
  return getCurrentPlayer(state) === playerId;
}

/**
 * Gets the remaining time for the current turn.
 * Placeholder - returns configured timeout value minus elapsed time.
 * @param {Object} state - Turn state
 * @returns {number} Milliseconds remaining (capped at 0)
 */
export function getTurnTimeRemaining(state) {
  validateTurnState(state);
  const elapsed = Date.now() - state.turnStartTime;
  const remaining = TURN_TIMEOUT_MS - elapsed;
  return Math.max(0, remaining);
}

/**
 * Checks if the current turn has timed out.
 * Placeholder - compares elapsed time against configured timeout.
 * @param {Object} state - Turn state
 * @returns {boolean} True if turn has timed out
 */
export function hasTurnTimedOut(state) {
  validateTurnState(state);
  return getTurnTimeRemaining(state) === 0;
}

/**
 * Creates a new turn state with default values.
 * Useful for initializing a game from scratch.
 * @param {string[]} playerIds - Array of player IDs
 * @param {number} [startIndex=0] - Starting player index
 * @returns {Object} Immutable turn state
 */
export function createTurnStatePublic(playerIds, startIndex = 0) {
  return createTurnState(playerIds, startIndex);
}

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why turn management is isolated from the game engine:
 * 
 * Turn management is a cross-cutting concern that affects many aspects of
 * gameplay. By isolating it, we achieve:
 * - Single Responsibility: The turn engine only handles turn logic
 * - Reusability: Can be used across different game modes and UI frameworks
 * - Testability: Pure functions are easy to unit test in isolation
 * - Maintainability: Changes to turn rules don't affect other game logic
 * - Framework independence: Works with React, Vue, vanilla JS, or backend
 * 
 * 2. How this module interacts with other modules:
 * 
 * - moveValidator: Validates if current player can make a move, uses
 *   isPlayerTurn() to ensure only active player can move tokens.
 * 
 * - diceEngine: After dice roll, turnEngine processes the result via
 *   advanceTurn(diceValue) and shouldGrantExtraTurn() to determine
 *   if the same player gets another turn.
 * 
 * - ludoEngine: Orchestrates the game loop, calling turnEngine to get
 *   current player, advancing turns, and checking timeouts before
 *   processing moves.
 * 
 * 3. Support for pause/resume, reconnection, spectators, and tournaments:
 * 
 * - Pause/Resume: Since state is serializable, save the turn state
 *   object. On resume, restore it and recalculate time remaining
 *   from turnStartTime.
 * 
 * - Reconnection: Serialize turn state and send to client on reconnect.
 *   Client can display current player and remaining time.
 * 
 * - Spectators: Same as reconnection - send read-only turn state to
 *   spectators for real-time updates without modifying it.
 * 
 * - Tournament Mode: Turn state can be extended with additional metadata
 *   (round number, match ID) while keeping core logic unchanged.
 *   The pure nature allows running multiple tournament games
 *   simultaneously with separate turn states.
 */