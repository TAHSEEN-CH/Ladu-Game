// src/engine/moveValidator.js

/**
 * Move Validator Module
 *
 * Production-ready move validation for Ludo game.
 * Validates all possible moves including leaving home, moving, and finishing.
 * Pure JavaScript with no dependencies.
 */

import {
  getStartPosition,
  getHomePath,
  getHomePathLength,
  getHomeEntryIndex,
  getCellByIndex,
  isPathSafe,
  getTotalPathLength,
  getDistanceToFinish,
  getRemainingSteps,
  calculateTargetPosition,
  canEnterHome,
  isFinished,
  isInsideHomePath,
} from "./pathEngine.js";

import {
  OUTER_PATH,
  HOME_PATHS,
  START_CELLS,
  getStartCell,
  getPathCell,
  getNextPathIndex,
  isSafeCell,
} from "../constants/boardPaths.js";

// ============================================================
// CONSTANTS
// ============================================================

const OUTER_PATH_LENGTH = OUTER_PATH.length;
const HOME_PATH_LENGTH = getHomePathLength("red");
const TOTAL_PATH_LENGTH = OUTER_PATH_LENGTH + HOME_PATH_LENGTH;
const DICE_SIX = 6;

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Validates a token object.
 * @param {Object} token - Token to validate
 * @throws {Error} If token is invalid
 */
const _validateToken = (token) => {
  if (!token || typeof token !== "object") {
    throw new Error("Token must be an object");
  }
  if (!token.id || typeof token.id !== "string") {
    throw new Error("Token must have a string id");
  }
  if (!token.playerId || typeof token.playerId !== "string") {
    throw new Error("Token must have a string playerId");
  }
  if (!token.color || typeof token.color !== "string") {
    throw new Error("Token must have a string color");
  }
  if (!["home", "playing", "homePath", "finished"].includes(token.state)) {
    throw new Error(
      'Token state must be "home", "playing", "homePath", or "finished"',
    );
  }
  if (token.pathIndex !== undefined && typeof token.pathIndex !== "number") {
    throw new Error("Token pathIndex must be a number");
  }
  if (token.homeIndex !== undefined && typeof token.homeIndex !== "number") {
    throw new Error("Token homeIndex must be a number");
  }
};

/**
 * Validates a dice value.
 * @param {number} value - Dice value
 * @throws {Error} If value is invalid
 */
const _validateDiceValue = (value) => {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error("Dice value must be a number");
  }
  if (value < 1 || value > 6) {
    throw new Error("Dice value must be between 1 and 6");
  }
};

/**
 * Validates a tokens array.
 * @param {Array} tokens - Tokens to validate
 * @throws {Error} If tokens array is invalid
 */
const _validateTokens = (tokens) => {
  if (!Array.isArray(tokens)) {
    throw new Error("Tokens must be an array");
  }
  if (tokens.length === 0) {
    throw new Error("Tokens array cannot be empty");
  }
  tokens.forEach(_validateToken);
};

/**
 * Checks if a token is at home.
 * @param {Object} token - Token to check
 * @returns {boolean} True if token is at home
 */
const _isTokenAtHome = (token) => {
  return token.state === "home";
};

/**
 * Checks if a token is finished.
 * @param {Object} token - Token to check
 * @returns {boolean} True if token is finished
 */
const _isTokenFinished = (token) => {
  return token.state === "finished";
};

/**
 * Checks if a token is in the home path.
 * @param {Object} token - Token to check
 * @returns {boolean} True if token is in home path
 */
const _isTokenInHomePath = (token) => {
  return token.state === "homePath";
};

/**
 * Checks if a token is playing on the outer path.
 * @param {Object} token - Token to check
 * @returns {boolean} True if token is playing
 */
const _isTokenPlaying = (token) => {
  return token.state === "playing";
};

/**
 * Gets the current path index of a token.
 * @param {Object} token - Token to check
 * @returns {number} Path index
 */
const _getTokenPathIndex = (token) => {
  if (_isTokenAtHome(token)) {
    return -1;
  }
  if (_isTokenFinished(token)) {
    return TOTAL_PATH_LENGTH - 1;
  }
  return token.pathIndex !== undefined ? token.pathIndex : 0;
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Checks if a token can leave home.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const canLeaveHome = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Token must be at home
  if (!_isTokenAtHome(token)) {
    return {
      valid: false,
      reason: "Token is not at home",
    };
  }

  // Must roll a 6 to leave home
  if (diceValue !== DICE_SIX) {
    return {
      valid: false,
      reason: `Need to roll a 6 to leave home (rolled ${diceValue})`,
    };
  }

  // Check if there's a valid start position
  try {
    const startPos = getStartPosition(token.color);
    if (!startPos) {
      return {
        valid: false,
        reason: "No valid start position found",
      };
    }
  } catch (error) {
    return {
      valid: false,
      reason: `Invalid start position: ${error.message}`,
    };
  }

  return {
    valid: true,
    reason: null,
    targetPosition: getStartPosition(token.color),
  };
};

/**
 * Checks if a token can move.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const canMoveToken = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Finished token cannot move
  if (_isTokenFinished(token)) {
    return {
      valid: false,
      reason: "Token is already finished",
    };
  }

  // Token at home can only leave
  if (_isTokenAtHome(token)) {
    return canLeaveHome(token, diceValue);
  }

  // Token in home path
  if (_isTokenInHomePath(token)) {
    return canMoveInsideHome(token, diceValue);
  }

  // Token is playing on outer path
  const currentIndex = _getTokenPathIndex(token);
  const targetResult = calculateTargetPosition(token, diceValue);

  // Check if move is valid
  if (targetResult.pathIndex === null) {
    return {
      valid: false,
      reason: targetResult.message || "Invalid move",
    };
  }

  // Check if token would overshoot home
  if (targetResult.exactRollRequired) {
    return {
      valid: false,
      reason: `Exact roll of ${targetResult.stepsNeeded} needed to finish`,
      stepsNeeded: targetResult.stepsNeeded,
    };
  }

  return {
    valid: true,
    reason: null,
    targetPosition: targetResult,
  };
};

/**
 * Checks if a token can enter the home path.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const canEnterHome = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Must be playing on outer path
  if (!_isTokenPlaying(token)) {
    return {
      valid: false,
      reason: "Token must be on the outer path to enter home",
    };
  }

  const currentIndex = _getTokenPathIndex(token);
  const homeEntryIndex = getHomeEntryIndex(token.color);

  // Calculate distance to home entry
  let distanceToHomeEntry;
  if (currentIndex <= homeEntryIndex) {
    distanceToHomeEntry = homeEntryIndex - currentIndex;
  } else {
    distanceToHomeEntry = OUTER_PATH_LENGTH - currentIndex + homeEntryIndex;
  }

  // Check if dice value reaches home entry
  if (diceValue <= distanceToHomeEntry) {
    return {
      valid: false,
      reason: `Need to reach home entry first (${distanceToHomeEntry} steps away)`,
      stepsToEntry: distanceToHomeEntry,
    };
  }

  // Check if token can enter home path
  const stepsAfterEntry = diceValue - distanceToHomeEntry - 1;
  const homePathLength = HOME_PATH_LENGTH;

  if (stepsAfterEntry >= homePathLength) {
    return {
      valid: false,
      reason: "Dice value would overshoot home path",
      overshoots: true,
    };
  }

  return {
    valid: true,
    reason: null,
    homeIndex: stepsAfterEntry,
    stepsToEntry: distanceToHomeEntry,
  };
};

/**
 * Checks if a token can move inside the home path.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const canMoveInsideHome = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Must be in home path
  if (!_isTokenInHomePath(token)) {
    return {
      valid: false,
      reason: "Token is not in the home path",
    };
  }

  const currentHomeIndex = token.homeIndex || 0;
  const newHomeIndex = currentHomeIndex + diceValue;
  const homePathLength = HOME_PATH_LENGTH;

  // Check if token would overshoot home
  if (newHomeIndex > homePathLength - 1) {
    return {
      valid: false,
      reason: `Exact roll of ${homePathLength - 1 - currentHomeIndex} needed to finish`,
      stepsNeeded: homePathLength - 1 - currentHomeIndex,
      overshoots: true,
    };
  }

  // Check if token would finish
  const wouldFinish = newHomeIndex === homePathLength - 1;

  return {
    valid: true,
    reason: null,
    newHomeIndex: newHomeIndex,
    wouldFinish: wouldFinish,
  };
};

/**
 * Checks if a token can finish.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const canFinish = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Must be in home path
  if (!_isTokenInHomePath(token)) {
    return {
      valid: false,
      reason: "Token must be in the home path to finish",
    };
  }

  const currentHomeIndex = token.homeIndex || 0;
  const homePathLength = HOME_PATH_LENGTH;
  const stepsToFinish = homePathLength - 1 - currentHomeIndex;

  // Check if exact roll needed
  if (diceValue !== stepsToFinish) {
    return {
      valid: false,
      reason: `Exact roll of ${stepsToFinish} needed to finish (rolled ${diceValue})`,
      stepsNeeded: stepsToFinish,
    };
  }

  return {
    valid: true,
    reason: null,
    stepsNeeded: stepsToFinish,
    willFinish: true,
  };
};

/**
 * Checks if a move is legal.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const isMoveLegal = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Check all possible move scenarios
  const result = canMoveToken(token, diceValue);

  if (!result.valid) {
    return result;
  }

  // Additional safety checks
  const targetPathIndex = result.targetPosition?.pathIndex;
  if (targetPathIndex !== null && targetPathIndex !== undefined) {
    // Check if target is within bounds
    const totalLength = getTotalPathLength(token.color);
    if (targetPathIndex < 0 || targetPathIndex >= totalLength) {
      return {
        valid: false,
        reason: "Target position is out of bounds",
      };
    }
  }

  return {
    valid: true,
    reason: null,
    targetPosition: result.targetPosition || null,
  };
};

/**
 * Checks if a token has any legal move.
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value rolled
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Array of legal moves
 */
export const hasAnyLegalMove = (tokens, diceValue, playerId = null) => {
  _validateTokens(tokens);
  _validateDiceValue(diceValue);

  const playerTokens = playerId
    ? tokens.filter((t) => t.playerId === playerId)
    : tokens;

  if (playerTokens.length === 0) {
    return {
      hasMove: false,
      reason: "No tokens found for player",
      moves: [],
    };
  }

  const legalMoves = [];
  for (const token of playerTokens) {
    const result = isMoveLegal(token, diceValue);
    if (result.valid) {
      legalMoves.push({
        tokenId: token.id,
        token: { ...token },
        targetPosition: result.targetPosition || null,
      });
    }
  }

  return {
    hasMove: legalMoves.length > 0,
    reason: legalMoves.length > 0 ? null : "No legal moves available",
    moves: legalMoves,
  };
};

/**
 * Gets all movable tokens.
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value rolled
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Array of movable tokens
 */
export const getMovableTokens = (tokens, diceValue, playerId = null) => {
  _validateTokens(tokens);
  _validateDiceValue(diceValue);

  const result = hasAnyLegalMove(tokens, diceValue, playerId);
  return result.moves.map((move) => ({
    ...move.token,
    targetPosition: move.targetPosition,
  }));
};

/**
 * Checks if a move is blocked.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const isBlockedMove = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  const result = isMoveLegal(token, diceValue);

  if (result.valid) {
    return {
      blocked: false,
      reason: null,
    };
  }

  // Check if blocked due to overshooting
  if (result.reason && result.reason.includes("overshoot")) {
    return {
      blocked: true,
      reason: "Move would overshoot home",
      overshoots: true,
    };
  }

  // Check if blocked due to need for exact roll
  if (result.reason && result.reason.includes("Exact roll")) {
    return {
      blocked: true,
      reason: result.reason,
      exactRollNeeded: true,
    };
  }

  return {
    blocked: true,
    reason: result.reason || "Move is not legal",
  };
};

/**
 * Checks if a move would overshoot home.
 * @param {Object} token - Token to check
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Validation result
 */
export const willOvershootHome = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // If token is at home or finished, it can't overshoot
  if (_isTokenAtHome(token) || _isTokenFinished(token)) {
    return {
      overshoots: false,
      reason: "Token is not in play",
    };
  }

  const currentIndex = _getTokenPathIndex(token);
  const totalLength = getTotalPathLength(token.color);
  const newIndex = currentIndex + diceValue;

  // Check if token would go beyond finish
  if (newIndex >= totalLength) {
    const overshoot = newIndex - (totalLength - 1);
    return {
      overshoots: true,
      overshootAmount: overshoot,
      newIndex: newIndex,
      maxIndex: totalLength - 1,
      reason: `Would overshoot home by ${overshoot} steps`,
    };
  }

  // Check if token would overshoot home path entry
  if (_isTokenPlaying(token)) {
    const homeEntryIndex = getHomeEntryIndex(token.color);
    let distanceToHomeEntry;
    if (currentIndex <= homeEntryIndex) {
      distanceToHomeEntry = homeEntryIndex - currentIndex;
    } else {
      distanceToHomeEntry = OUTER_PATH_LENGTH - currentIndex + homeEntryIndex;
    }

    // Check if token would pass home entry and enter home path
    if (diceValue > distanceToHomeEntry) {
      const stepsAfterEntry = diceValue - distanceToHomeEntry - 1;
      if (stepsAfterEntry >= HOME_PATH_LENGTH) {
        return {
          overshoots: true,
          overshootAmount: stepsAfterEntry - HOME_PATH_LENGTH + 1,
          reason: "Would overshoot home path",
        };
      }
    }
  }

  return {
    overshoots: false,
    reason: null,
  };
};

/**
 * Validates a complete move.
 * @param {Object} token - Token to move
 * @param {number} diceValue - Dice value rolled
 * @param {Array} allTokens - All tokens in the game
 * @returns {Object} Complete validation result
 */
export const validateMove = (token, diceValue, allTokens = null) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  if (allTokens) {
    _validateTokens(allTokens);
  }

  // Step 1: Check if token is valid
  if (_isTokenFinished(token)) {
    return {
      valid: false,
      reason: "Token is already finished",
      code: "TOKEN_FINISHED",
    };
  }

  // Step 2: Check if token can move
  const moveResult = isMoveLegal(token, diceValue);
  if (!moveResult.valid) {
    return {
      valid: false,
      reason: moveResult.reason,
      code: "MOVE_ILLEGAL",
    };
  }

  // Step 3: Check if move would overshoot
  const overshootResult = willOvershootHome(token, diceValue);
  if (overshootResult.overshoots) {
    return {
      valid: false,
      reason: overshootResult.reason,
      code: "OVERSHOOTS_HOME",
      overshootAmount: overshootResult.overshootAmount,
    };
  }

  // Step 4: Check for blocked moves (if allTokens provided)
  if (allTokens) {
    // Check if target position is occupied by own token (blocked)
    const targetIndex = moveResult.targetPosition?.pathIndex;
    if (targetIndex !== null && targetIndex !== undefined) {
      const ownTokensAtTarget = allTokens.filter(
        (t) =>
          t.playerId === token.playerId &&
          t.state === "playing" &&
          t.pathIndex === targetIndex,
      );

      // In some Ludo variants, you can't land on your own token
      if (ownTokensAtTarget.length > 0) {
        return {
          valid: true,
          warning: "Landing on own token",
          code: "OWN_TOKEN_BLOCKED",
          tokenCount: ownTokensAtTarget.length,
          targetPosition: moveResult.targetPosition,
        };
      }
    }
  }

  return {
    valid: true,
    reason: null,
    code: "MOVE_VALID",
    targetPosition: moveResult.targetPosition,
    willFinish: moveResult.targetPosition?.finished || false,
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
