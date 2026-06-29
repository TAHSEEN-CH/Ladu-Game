// src/utils/captureEngine.js

/**
 * Capture Engine Module
 * 
 * Pure, framework-independent token capture management utility for Ludo game.
 * Handles all capture rules, safe cell protection, and token stacking logic.
 * Works with both 2-player and 4-player game modes.
 */

import {
  SAFE_CELLS,
  HOME_CELLS,
  MIN_PLAYERS,
  MAX_PLAYERS,
} from './gameConstants.js';
import * as pathEngine from './pathEngine.js';
import * as moveValidator from './moveValidator.js';
import * as boardPaths from './boardPaths.js';

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Validates that a token object has required properties.
 * @param {Object} token - Token object
 * @param {string} token.id - Token ID
 * @param {string} token.playerId - Player ID
 * @param {string} token.color - Token color
 * @param {number} token.position - Current position on board
 * @param {string} token.status - Token status (active, home, finished)
 * @throws {Error} If invalid
 */
function validateToken(token) {
  if (!token || typeof token !== 'object') {
    throw new Error('Token must be an object');
  }
  if (typeof token.id !== 'string' || token.id.length === 0) {
    throw new Error('Token ID must be a non-empty string');
  }
  if (typeof token.playerId !== 'string' || token.playerId.length === 0) {
    throw new Error('Token playerId must be a non-empty string');
  }
  if (typeof token.color !== 'string' || token.color.length === 0) {
    throw new Error('Token color must be a non-empty string');
  }
  if (typeof token.position !== 'number' || token.position < -1) {
    throw new Error('Token position must be a number >= -1');
  }
  if (!['home', 'active', 'finished'].includes(token.status)) {
    throw new Error('Token status must be home, active, or finished');
  }
}

/**
 * Validates that tokens array contains valid token objects.
 * @param {Object[]} tokens - Array of token objects
 * @throws {Error} If invalid
 */
function validateTokens(tokens) {
  if (!Array.isArray(tokens)) {
    throw new Error('Tokens must be an array');
  }
  if (tokens.length === 0) {
    throw new Error('Tokens array cannot be empty');
  }
  tokens.forEach(validateToken);
}

/**
 * Validates that a cell index is valid.
 * @param {number} cellIndex - Cell index
 * @throws {Error} If invalid
 */
function validateCellIndex(cellIndex) {
  if (typeof cellIndex !== 'number' || cellIndex < 0) {
    throw new Error('Cell index must be a non-negative number');
  }
}

/**
 * Validates that a player ID is valid.
 * @param {string} playerId - Player ID
 * @throws {Error} If invalid
 */
function validatePlayerId(playerId) {
  if (typeof playerId !== 'string' || playerId.length === 0) {
    throw new Error('Player ID must be a non-empty string');
  }
}

/**
 * Checks if a cell is a safe cell.
 * @param {number} cellIndex - Cell index
 * @param {string} playerId - Player ID for context
 * @returns {boolean} True if cell is safe
 */
function isSafeCell(cellIndex, playerId) {
  // Check global safe cells
  if (SAFE_CELLS.includes(cellIndex)) {
    return true;
  }
  
  // Check player-specific home cells (entrance to home stretch)
  const homePath = boardPaths.getHomePath(playerId);
  if (homePath && homePath.includes(cellIndex)) {
    return true;
  }
  
  return false;
}

/**
 * Checks if a cell is a home stretch cell for a player.
 * @param {number} cellIndex - Cell index
 * @param {string} playerId - Player ID
 * @returns {boolean} True if cell is in home stretch
 */
function isHomeStretchCell(cellIndex, playerId) {
  const homePath = boardPaths.getHomePath(playerId);
  return homePath ? homePath.includes(cellIndex) : false;
}

/**
 * Counts tokens belonging to a specific player on a given cell.
 * @param {Object[]} tokens - Array of all tokens
 * @param {string} playerId - Player ID
 * @param {number} cellIndex - Cell index
 * @returns {number} Count of tokens
 */
function countTokensOnCell(tokens, playerId, cellIndex) {
  return tokens.filter(t => 
    t.playerId === playerId && 
    t.position === cellIndex && 
    t.status === 'active'
  ).length;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Determines if a token can capture another token on a target cell.
 * @param {Object} sourceToken - The moving token
 * @param {Object[]} allTokens - All tokens in the game
 * @param {number} targetCellIndex - Target cell index
 * @returns {Object} Result with success, reason, and capturable tokens
 */
export function canCaptureToken(sourceToken, allTokens, targetCellIndex) {
  validateToken(sourceToken);
  validateTokens(allTokens);
  validateCellIndex(targetCellIndex);

  // Validate source token is active
  if (sourceToken.status !== 'active') {
    return {
      success: false,
      reason: 'Source token is not active',
      capturableTokens: [],
    };
  }

  // Find tokens on target cell
  const targetTokens = allTokens.filter(t => 
    t.position === targetCellIndex && 
    t.status === 'active'
  );

  if (targetTokens.length === 0) {
    return {
      success: false,
      reason: 'No tokens on target cell',
      capturableTokens: [],
    };
  }

  // Check if target cell is safe
  if (isSafeCell(targetCellIndex, sourceToken.playerId)) {
    return {
      success: false,
      reason: 'Target cell is protected',
      capturableTokens: [],
    };
  }

  // Filter capturable tokens (not own, not same color)
  const capturableTokens = targetTokens.filter(t => 
    t.playerId !== sourceToken.playerId
  );

  if (capturableTokens.length === 0) {
    return {
      success: false,
      reason: 'Only own tokens on target cell',
      capturableTokens: [],
    };
  }

  return {
    success: true,
    reason: 'Capturable tokens found',
    capturableTokens: capturableTokens,
  };
}

/**
 * Gets all tokens that can be captured on a given cell.
 * @param {Object[]} allTokens - All tokens in the game
 * @param {string} playerId - Player ID of the capturing player
 * @param {number} cellIndex - Cell index to check
 * @returns {Object[]} Array of capturable tokens
 */
export function getCapturableTokens(allTokens, playerId, cellIndex) {
  validateTokens(allTokens);
  validatePlayerId(playerId);
  validateCellIndex(cellIndex);

  // Check if cell is safe
  if (isSafeCell(cellIndex, playerId)) {
    return [];
  }

  // Get all tokens on the cell
  const tokensOnCell = allTokens.filter(t => 
    t.position === cellIndex && 
    t.status === 'active' &&
    t.playerId !== playerId
  );

  // Check if any of these tokens belong to other players
  return tokensOnCell.filter(t => t.playerId !== playerId);
}

/**
 * Performs a capture operation on a target cell.
 * @param {Object} sourceToken - The moving token
 * @param {Object[]} allTokens - All tokens in the game
 * @param {number} targetCellIndex - Target cell index
 * @returns {Object} Result with success, captured tokens, and updated tokens
 */
export function captureToken(sourceToken, allTokens, targetCellIndex) {
  validateToken(sourceToken);
  validateTokens(allTokens);
  validateCellIndex(targetCellIndex);

  // Validate source token is active
  if (sourceToken.status !== 'active') {
    return {
      success: false,
      capturedTokens: [],
      updatedTokens: [...allTokens],
      reason: 'Source token is not active',
    };
  }

  // Check if capture is possible
  const captureCheck = canCaptureToken(sourceToken, allTokens, targetCellIndex);
  if (!captureCheck.success) {
    return {
      success: false,
      capturedTokens: [],
      updatedTokens: [...allTokens],
      reason: captureCheck.reason,
    };
  }

  // Perform capture - send captured tokens home
  const updatedTokens = allTokens.map(token => {
    const isCaptured = captureCheck.capturableTokens.some(ct => ct.id === token.id);
    if (isCaptured) {
      return {
        ...token,
        status: 'home',
        position: -1,
      };
    }
    return token;
  });

  return {
    success: true,
    capturedTokens: captureCheck.capturableTokens,
    updatedTokens: updatedTokens,
    reason: 'Capture successful',
  };
}

/**
 * Sends a token back to its home position.
 * @param {Object} token - Token to send home
 * @param {Object[]} allTokens - All tokens in the game
 * @returns {Object} Result with success and updated tokens
 */
export function sendTokenToHome(token, allTokens) {
  validateToken(token);
  validateTokens(allTokens);

  if (token.status === 'home' || token.status === 'finished') {
    return {
      success: false,
      updatedTokens: [...allTokens],
      reason: 'Token is already home or finished',
    };
  }

  const updatedTokens = allTokens.map(t => {
    if (t.id === token.id) {
      return {
        ...t,
        status: 'home',
        position: -1,
      };
    }
    return t;
  });

  return {
    success: true,
    updatedTokens: updatedTokens,
    reason: 'Token sent home',
  };
}

/**
 * Checks if a cell is protected (safe).
 * @param {number} cellIndex - Cell index
 * @param {string} playerId - Player ID for context
 * @returns {boolean} True if cell is protected
 */
export function isProtectedCell(cellIndex, playerId) {
  validateCellIndex(cellIndex);
  validatePlayerId(playerId);
  return isSafeCell(cellIndex, playerId);
}

/**
 * Checks if a token belongs to the specified player.
 * @param {Object} token - Token to check
 * @param {string} playerId - Player ID
 * @returns {boolean} True if token belongs to player
 */
export function isOwnToken(token, playerId) {
  validateToken(token);
  validatePlayerId(playerId);
  return token.playerId === playerId;
}

/**
 * Checks if a player has multiple tokens on a specific cell.
 * @param {Object[]} allTokens - All tokens in the game
 * @param {string} playerId - Player ID
 * @param {number} cellIndex - Cell index
 * @returns {Object} Result with count and tokens
 */
export function hasMultipleTokens(allTokens, playerId, cellIndex) {
  validateTokens(allTokens);
  validatePlayerId(playerId);
  validateCellIndex(cellIndex);

  const playerTokens = allTokens.filter(t => 
    t.playerId === playerId && 
    t.position === cellIndex && 
    t.status === 'active'
  );

  return {
    hasMultiple: playerTokens.length > 1,
    count: playerTokens.length,
    tokens: playerTokens,
  };
}

/**
 * Determines if a capture should occur on a given cell.
 * @param {Object} sourceToken - The moving token
 * @param {Object[]} allTokens - All tokens in the game
 * @param {number} targetCellIndex - Target cell index
 * @returns {Object} Result with shouldCapture and reason
 */
export function shouldCapture(sourceToken, allTokens, targetCellIndex) {
  validateToken(sourceToken);
  validateTokens(allTokens);
  validateCellIndex(targetCellIndex);

  // Check if target is safe
  if (isProtectedCell(targetCellIndex, sourceToken.playerId)) {
    return {
      shouldCapture: false,
      reason: 'Target is protected',
    };
  }

  // Get tokens on target cell from other players
  const otherTokens = allTokens.filter(t => 
    t.position === targetCellIndex && 
    t.status === 'active' &&
    t.playerId !== sourceToken.playerId
  );

  if (otherTokens.length === 0) {
    return {
      shouldCapture: false,
      reason: 'No opponent tokens to capture',
    };
  }

  // Check if any opponent token is on the cell
  const hasOpponent = otherTokens.some(t => t.playerId !== sourceToken.playerId);
  
  return {
    shouldCapture: hasOpponent,
    reason: hasOpponent ? 'Opponent tokens present' : 'Only own tokens present',
    opponentTokens: otherTokens,
  };
}

/**
 * Gets all tokens on a specific cell.
 * @param {Object[]} allTokens - All tokens in the game
 * @param {number} cellIndex - Cell index
 * @param {string} [playerId] - Optional player ID filter
 * @returns {Object[]} Array of tokens on the cell
 */
export function getTokensOnCell(allTokens, cellIndex, playerId = null) {
  validateTokens(allTokens);
  validateCellIndex(cellIndex);
  if (playerId !== null) {
    validatePlayerId(playerId);
  }

  let tokens = allTokens.filter(t => 
    t.position === cellIndex && 
    t.status === 'active'
  );

  if (playerId !== null) {
    tokens = tokens.filter(t => t.playerId === playerId);
  }

  return tokens;
}

/**
 * Validates if a capture operation is legal.
 * @param {Object} sourceToken - The moving token
 * @param {Object[]} allTokens - All tokens in the game
 * @param {number} targetCellIndex - Target cell index
 * @param {Object} gameRules - Game rules configuration
 * @returns {Object} Validation result
 */
export function validateCapture(sourceToken, allTokens, targetCellIndex, gameRules = {}) {
  validateToken(sourceToken);
  validateTokens(allTokens);
  validateCellIndex(targetCellIndex);

  const result = {
    valid: false,
    errors: [],
    warnings: [],
  };

  // Check source token status
  if (sourceToken.status !== 'active') {
    result.errors.push('Source token is not active');
    return result;
  }

  // Check if target is in valid range
  const maxCellIndex = 51; // Standard Ludo board has 52 cells
  if (targetCellIndex > maxCellIndex) {
    result.errors.push('Target cell index out of range');
    return result;
  }

  // Check if target is protected
  if (isProtectedCell(targetCellIndex, sourceToken.playerId)) {
    result.errors.push('Target cell is protected');
    return result;
  }

  // Get tokens on target
  const targetTokens = getTokensOnCell(allTokens, targetCellIndex);
  
  if (targetTokens.length === 0) {
    result.errors.push('No tokens on target cell');
    return result;
  }

  // Check if there are opponent tokens
  const opponentTokens = targetTokens.filter(t => t.playerId !== sourceToken.playerId);
  
  if (opponentTokens.length === 0) {
    result.errors.push('No opponent tokens to capture');
    return result;
  }

  // Check for multi-token capture rules if configured
  if (gameRules.maxTokensPerCell) {
    const ownTokensOnTarget = targetTokens.filter(t => t.playerId === sourceToken.playerId);
    if (ownTokensOnTarget.length >= gameRules.maxTokensPerCell) {
      result.errors.push('Cell already has maximum own tokens');
      return result;
    }
  }

  result.valid = true;
  result.opponentTokens = opponentTokens;
  result.targetTokens = targetTokens;

  return result;
}

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why capture logic is separated from movement logic:
 * 
 * Capture logic involves complex rules (safe cells, stacking, home stretch
 * protection) that are independent of how a token moves. Separation allows:
 * - Independent evolution of movement and capture rules
 * - Clearer code with single responsibilities
 * - Easier rule modification (e.g., adding "no capture on safe cells")
 * - Reusability across different game variants
 * - Better testability (capture rules tested separately from movement)
 * 
 * 2. How this module works with moveValidator, tokenEngine, and ludoEngine:
 * 
 * - moveValidator: During move validation, it calls captureEngine to check
 *   if landing on a cell would result in a capture. This ensures illegal
 *   captures are prevented early.
 * 
 * - tokenEngine: Manages token positions and state. After a capture,
 *   tokenEngine updates the captured token's status to 'home' and resets
 *   its position.
 * 
 * - ludoEngine: Orchestrates the game loop. After a move is made, it
 *   calls captureEngine to determine if any captures occurred, then
 *   coordinates with tokenEngine to update the game state and
 *   with turnEngine to handle extra turns from captures (if applicable).
 * 
 * 3. How this design simplifies testing and future multiplayer synchronization:
 * 
 * - Testing: Pure functions with well-defined inputs/outputs make unit
 *   testing straightforward. Each capture rule can be tested in isolation.
 *   Mocking dependencies is easy because functions are pure.
 * 
 * - Multiplayer Synchronization: Since captureEngine is stateless and
 *   deterministic, all clients can independently compute capture outcomes
 *   from the same game state. Only the initial state needs to be
 *   synchronized, not every capture event.
 * 
 * - Extensibility: New capture rules (e.g., "cannot capture on home stretch")
 *   can be added by modifying the relevant functions without affecting
 *   other modules. The module can be extended for different game variants
 *   (e.g., international Ludo, Indian Ludo) by passing different
 *   rule configurations.
 */