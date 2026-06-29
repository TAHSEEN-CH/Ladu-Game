// src/engine/captureEngine.js

/**
 * Capture Engine Module
 *
 * Production-ready capture logic for Ludo game.
 * Handles token capture, safe cells, and blockade mechanics.
 * Pure JavaScript with no dependencies.
 */

import {
  isPathSafe,
  getCellByIndex,
  getPathIndexByCoordinates,
  isInsideHomePath,
  isFinished,
  getHomePath,
  getHomePathLength,
  OUTER_PATH,
} from "./pathEngine.js";

import {
  isTokenFinished,
  isTokenHome,
  isTokenActive,
  getTokenPosition,
  sendTokenHome,
  cloneTokens,
  getTokensByPlayer,
} from "./tokenEngine.js";

import {
  getHomePositions,
  getStartCell,
  OUTER_PATH as OUTER_PATH_CONST,
} from "../constants/boardPaths.js";

// ============================================================
// CONSTANTS
// ============================================================

const OUTER_PATH_LENGTH = OUTER_PATH.length;
const HOME_PATH_LENGTH = getHomePathLength("red");
const TOTAL_PATH_LENGTH = OUTER_PATH_LENGTH + HOME_PATH_LENGTH;

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
  if (typeof token.finished !== "boolean") {
    throw new Error("Token finished must be a boolean");
  }
  if (typeof token.moveCount !== "number" || token.moveCount < 0) {
    throw new Error("Token moveCount must be a non-negative number");
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
 * Validates a path index.
 * @param {number} index - Path index
 * @throws {Error} If index is invalid
 */
const _validatePathIndex = (index) => {
  if (typeof index !== "number" || isNaN(index)) {
    throw new Error("Path index must be a number");
  }
  if (index < 0 || index >= TOTAL_PATH_LENGTH) {
    throw new Error(
      `Path index must be between 0 and ${TOTAL_PATH_LENGTH - 1}`,
    );
  }
};

/**
 * Checks if a token is on a safe cell.
 * @param {Object} token - Token to check
 * @returns {boolean} True if token is on a safe cell
 */
const _isTokenOnSafeCell = (token) => {
  if (token.state === "home" || token.state === "finished") {
    return true;
  }

  if (token.state === "homePath") {
    return true;
  }

  // Token is playing on outer path
  const pathIndex = token.pathIndex;
  if (pathIndex === undefined || pathIndex < 0) {
    return false;
  }

  return isPathSafe(token.color, pathIndex);
};

/**
 * Checks if a token is an opponent.
 * @param {Object} attacker - Attacker token
 * @param {Object} target - Target token
 * @returns {boolean} True if target is an opponent
 */
const _isOpponent = (attacker, target) => {
  return attacker.playerId !== target.playerId;
};

/**
 * Gets all tokens on a specific path index.
 * @param {Array} tokens - All tokens
 * @param {number} pathIndex - Path index to check
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Tokens on the path index
 */
const _getTokensOnPathIndex = (tokens, pathIndex, playerId = null) => {
  return tokens.filter((t) => {
    const tokenPathIndex =
      t.state === "homePath" ? OUTER_PATH_LENGTH + t.homeIndex : t.pathIndex;
    if (tokenPathIndex !== pathIndex) return false;
    if (playerId && t.playerId !== playerId) return false;
    return t.state === "playing" || t.state === "homePath";
  });
};

/**
 * Checks if a position has a blockade.
 * @param {Array} tokens - All tokens
 * @param {number} pathIndex - Path index to check
 * @returns {Object} Blockade info
 */
const _checkBlockade = (tokens, pathIndex) => {
  const tokensOnCell = _getTokensOnPathIndex(tokens, pathIndex);

  // Check if two tokens of the same player are on the cell
  const playerGroups = {};
  for (const token of tokensOnCell) {
    if (!playerGroups[token.playerId]) {
      playerGroups[token.playerId] = [];
    }
    playerGroups[token.playerId].push(token);
  }

  for (const [playerId, playerTokens] of Object.entries(playerGroups)) {
    if (playerTokens.length >= 2) {
      // Check if any token is in home path (blockade only on outer path)
      const isOuterPath = playerTokens.every((t) => t.state === "playing");
      if (isOuterPath) {
        return {
          hasBlockade: true,
          playerId: playerId,
          tokens: playerTokens,
          pathIndex: pathIndex,
        };
      }
    }
  }

  return {
    hasBlockade: false,
    playerId: null,
    tokens: [],
    pathIndex: pathIndex,
  };
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Checks if a token is on a safe cell.
 * @param {Object} token - Token to check
 * @returns {boolean} True if token is on a safe cell
 */
export const isSafeCell = (token) => {
  _validateToken(token);
  return _isTokenOnSafeCell(token);
};

/**
 * Checks if an attacker can capture a target token.
 * @param {Object} attacker - Attacker token
 * @param {Object} target - Target token
 * @returns {Object} Capture validation result
 */
export const canCapture = (attacker, target) => {
  _validateToken(attacker);
  _validateToken(target);

  // Cannot capture yourself
  if (attacker.id === target.id) {
    return {
      canCapture: false,
      reason: "Cannot capture yourself",
    };
  }

  // Cannot capture tokens of same player
  if (!_isOpponent(attacker, target)) {
    return {
      canCapture: false,
      reason: "Cannot capture own tokens",
    };
  }

  // Cannot capture home tokens
  if (target.state === "home") {
    return {
      canCapture: false,
      reason: "Cannot capture home tokens",
    };
  }

  // Cannot capture finished tokens
  if (target.state === "finished") {
    return {
      canCapture: false,
      reason: "Cannot capture finished tokens",
    };
  }

  // Cannot capture home path tokens
  if (target.state === "homePath") {
    return {
      canCapture: false,
      reason: "Cannot capture tokens in home path",
    };
  }

  // Cannot capture tokens on safe cells
  if (_isTokenOnSafeCell(target)) {
    return {
      canCapture: false,
      reason: "Target is on a safe cell",
    };
  }

  // Check if tokens are on the same cell
  if (attacker.state === "playing" && target.state === "playing") {
    if (attacker.pathIndex !== target.pathIndex) {
      return {
        canCapture: false,
        reason: "Tokens are not on the same cell",
      };
    }
  } else {
    return {
      canCapture: false,
      reason: "Attacker must be on the outer path",
    };
  }

  return {
    canCapture: true,
    reason: null,
  };
};

/**
 * Gets all tokens that can be captured by an attacker.
 * @param {Object} attacker - Attacker token
 * @param {Array} allTokens - All tokens in the game
 * @returns {Array} Capturable tokens
 */
export const getCapturableTokens = (attacker, allTokens) => {
  _validateToken(attacker);
  _validateTokens(allTokens);

  if (attacker.state !== "playing") {
    return [];
  }

  const capturable = [];
  const pathIndex = attacker.pathIndex;

  for (const token of allTokens) {
    const result = canCapture(attacker, token);
    if (result.canCapture) {
      capturable.push({ ...token });
    }
  }

  return capturable;
};

/**
 * Captures a single token.
 * @param {Object} targetToken - Token to capture
 * @returns {Object} Capture result
 */
export const captureToken = (targetToken) => {
  _validateToken(targetToken);

  // Cannot capture home or finished tokens
  if (targetToken.state === "home" || targetToken.state === "finished") {
    return {
      success: false,
      reason: "Cannot capture home or finished tokens",
      token: { ...targetToken },
    };
  }

  // Cannot capture home path tokens
  if (targetToken.state === "homePath") {
    return {
      success: false,
      reason: "Cannot capture tokens in home path",
    };
  }

  // Cannot capture tokens on safe cells
  if (_isTokenOnSafeCell(targetToken)) {
    return {
      success: false,
      reason: "Token is on a safe cell",
    };
  }

  const capturedToken = {
    ...targetToken,
    state: "home",
    pathIndex: -1,
    homeIndex: -1,
    finished: false,
    position: null,
    // Preserve moveCount for statistics
  };

  return {
    success: true,
    reason: null,
    capturedToken: capturedToken,
  };
};

/**
 * Captures all capturable tokens for an attacker.
 * @param {Object} attacker - Attacker token
 * @param {Array} allTokens - All tokens in the game
 * @returns {Object} Capture result
 */
export const captureTokens = (attacker, allTokens) => {
  _validateToken(attacker);
  _validateTokens(allTokens);

  // Check if attacker can capture
  if (attacker.state !== "playing") {
    return {
      success: false,
      reason: "Attacker must be on the outer path",
      capturedTokens: [],
      updatedTokens: cloneTokens(allTokens),
    };
  }

  const capturableTokens = getCapturableTokens(attacker, allTokens);

  if (capturableTokens.length === 0) {
    return {
      success: false,
      reason: "No capturable tokens found",
      capturedTokens: [],
      updatedTokens: cloneTokens(allTokens),
    };
  }

  const capturedTokenIds = new Set();
  const updatedTokens = allTokens.map((token) => {
    const isCapturable = capturableTokens.some((t) => t.id === token.id);
    if (isCapturable && !capturedTokenIds.has(token.id)) {
      capturedTokenIds.add(token.id);
      return {
        ...token,
        state: "home",
        pathIndex: -1,
        homeIndex: -1,
        finished: false,
        position: null,
      };
    }
    return { ...token };
  });

  return {
    success: true,
    reason: null,
    capturedTokens: capturableTokens.map((t) => ({ ...t })),
    updatedTokens: updatedTokens,
    capturedCount: capturableTokens.length,
  };
};

/**
 * Sends a captured token home.
 * @param {Object} token - Token to send home
 * @returns {Object} Result
 */
export const sendCapturedTokenHome = (token) => {
  _validateToken(token);

  const result = sendTokenHome(token);

  if (!result.success) {
    return {
      success: false,
      reason: result.reason,
      token: { ...token },
    };
  }

  return {
    success: true,
    reason: "Token sent home",
    token: result.token,
    captured: true,
  };
};

/**
 * Checks if an attacker has any capture available.
 * @param {Object} attacker - Attacker token
 * @param {Array} allTokens - All tokens in the game
 * @returns {Object} Result
 */
export const hasCapture = (attacker, allTokens) => {
  _validateToken(attacker);
  _validateTokens(allTokens);

  const capturable = getCapturableTokens(attacker, allTokens);

  return {
    hasCapture: capturable.length > 0,
    capturableTokens: capturable,
    count: capturable.length,
  };
};

/**
 * Gets all tokens on a specific path index.
 * @param {Array} allTokens - All tokens in the game
 * @param {number} pathIndex - Path index to check
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Tokens on the path index
 */
export const getTokensOnCell = (allTokens, pathIndex, playerId = null) => {
  _validateTokens(allTokens);
  _validatePathIndex(pathIndex);

  let tokens = _getTokensOnPathIndex(allTokens, pathIndex, playerId);
  return tokens.map((t) => ({ ...t }));
};

/**
 * Checks if a blockade exists on a path index.
 * @param {Array} allTokens - All tokens in the game
 * @param {number} pathIndex - Path index to check
 * @returns {Object} Blockade result
 */
export const isBlockade = (allTokens, pathIndex) => {
  _validateTokens(allTokens);
  _validatePathIndex(pathIndex);

  // Blockade only on outer path
  if (pathIndex >= OUTER_PATH_LENGTH) {
    return {
      hasBlockade: false,
      reason: "Blockade cannot be formed on home path",
    };
  }

  return _checkBlockade(allTokens, pathIndex);
};

/**
 * Checks if a token can pass through a path index.
 * @param {Object} token - Token attempting to move
 * @param {number} pathIndex - Path index to check
 * @param {Array} allTokens - All tokens in the game
 * @returns {Object} Result
 */
export const canPassBlockade = (token, pathIndex, allTokens) => {
  _validateToken(token);
  _validatePathIndex(pathIndex);
  _validateTokens(allTokens);

  const blockadeResult = isBlockade(allTokens, pathIndex);

  // No blockade, can pass freely
  if (!blockadeResult.hasBlockade) {
    return {
      canPass: true,
      reason: null,
    };
  }

  // Check if token belongs to the blockade owner
  if (blockadeResult.playerId === token.playerId) {
    return {
      canPass: true,
      reason: "Token belongs to blockade owner",
      blockadeOwner: blockadeResult.playerId,
    };
  }

  return {
    canPass: false,
    reason: "Blockade prevents passage",
    blockadeOwner: blockadeResult.playerId,
    blockadeTokens: blockadeResult.tokens.map((t) => ({ ...t })),
  };
};

/**
 * Checks if a cell is blocked by a blockade for a specific player.
 * @param {Array} allTokens - All tokens in the game
 * @param {number} pathIndex - Path index to check
 * @param {string} playerId - Player ID to check against
 * @returns {Object} Result
 */
export const isCellBlocked = (allTokens, pathIndex, playerId) => {
  _validateTokens(allTokens);
  _validatePathIndex(pathIndex);
  _validatePlayerId(playerId);

  const blockadeResult = isBlockade(allTokens, pathIndex);

  if (!blockadeResult.hasBlockade) {
    return {
      blocked: false,
      reason: null,
    };
  }

  if (blockadeResult.playerId === playerId) {
    return {
      blocked: false,
      reason: "Own blockade",
    };
  }

  return {
    blocked: true,
    reason: "Opponent blockade prevents landing",
    blockadeOwner: blockadeResult.playerId,
  };
};

/**
 * Gets all blockades on the board.
 * @param {Array} allTokens - All tokens in the game
 * @returns {Array} Blockade list
 */
export const getAllBlockades = (allTokens) => {
  _validateTokens(allTokens);

  const blockades = [];
  const checkedIndices = new Set();

  for (const token of allTokens) {
    if (token.state === "playing") {
      const pathIndex = token.pathIndex;
      if (!checkedIndices.has(pathIndex)) {
        checkedIndices.add(pathIndex);
        const blockadeResult = isBlockade(allTokens, pathIndex);
        if (blockadeResult.hasBlockade) {
          blockades.push(blockadeResult);
        }
      }
    }
  }

  return blockades;
};

/**
 * Validates a capture move.
 * @param {Object} attacker - Attacker token
 * @param {Object} target - Target token
 * @param {Array} allTokens - All tokens in the game
 * @returns {Object} Validation result
 */
export const validateCapture = (attacker, target, allTokens) => {
  _validateToken(attacker);
  _validateToken(target);
  _validateTokens(allTokens);

  // Check if capture is possible
  const captureResult = canCapture(attacker, target);
  if (!captureResult.canCapture) {
    return {
      valid: false,
      reason: captureResult.reason,
    };
  }

  // Check if target is already captured
  if (target.state === "home") {
    return {
      valid: false,
      reason: "Target token is already home",
    };
  }

  // Check if target is in the home path
  if (target.state === "homePath") {
    return {
      valid: false,
      reason: "Cannot capture tokens in home path",
    };
  }

  // Check if target is on a safe cell
  if (_isTokenOnSafeCell(target)) {
    return {
      valid: false,
      reason: "Target is on a safe cell",
    };
  }

  // Check if target is same as attacker
  if (attacker.id === target.id) {
    return {
      valid: false,
      reason: "Cannot capture yourself",
    };
  }

  // Check if target belongs to same player
  if (attacker.playerId === target.playerId) {
    return {
      valid: false,
      reason: "Cannot capture own tokens",
    };
  }

  return {
    valid: true,
    reason: null,
  };
};

/**
 * Performs a complete capture operation.
 * @param {Object} attacker - Attacker token
 * @param {Array} allTokens - All tokens in the game
 * @param {number} targetPathIndex - Path index where capture occurs
 * @returns {Object} Capture operation result
 */
export const performCapture = (attacker, allTokens, targetPathIndex) => {
  _validateToken(attacker);
  _validateTokens(allTokens);
  _validatePathIndex(targetPathIndex);

  // Find tokens at the target path index
  const tokensAtTarget = getTokensOnCell(allTokens, targetPathIndex);

  if (tokensAtTarget.length === 0) {
    return {
      success: false,
      reason: "No tokens at target position",
      capturedTokens: [],
      updatedTokens: cloneTokens(allTokens),
    };
  }

  // Find capturable tokens
  const capturable = tokensAtTarget.filter((target) => {
    const result = canCapture(attacker, target);
    return result.canCapture;
  });

  if (capturable.length === 0) {
    return {
      success: false,
      reason: "No capturable tokens at target position",
      capturedTokens: [],
      updatedTokens: cloneTokens(allTokens),
    };
  }

  // Perform capture
  const capturedTokenIds = new Set();
  const updatedTokens = allTokens.map((token) => {
    const isCapturable = capturable.some((t) => t.id === token.id);
    if (isCapturable && !capturedTokenIds.has(token.id)) {
      capturedTokenIds.add(token.id);
      return {
        ...token,
        state: "home",
        pathIndex: -1,
        homeIndex: -1,
        finished: false,
        position: null,
        // Preserve moveCount for statistics
      };
    }
    return { ...token };
  });

  return {
    success: true,
    reason: null,
    capturedTokens: capturable.map((t) => ({ ...t })),
    updatedTokens: updatedTokens,
    capturedCount: capturable.length,
    attacker: { ...attacker },
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
