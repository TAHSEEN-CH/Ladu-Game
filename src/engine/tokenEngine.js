// src/engine/tokenEngine.js

/**
 * Token Engine Module
 *
 * Production-ready token management for Ludo game.
 * Handles token creation, movement, state management, and position tracking.
 * Pure JavaScript with no dependencies.
 */

import {
  getStartPosition,
  getHomePath,
  getHomePathLength,
  getHomeEntryIndex,
  getCellByIndex,
  getTotalPathLength,
  getDistanceToFinish,
  getRemainingSteps,
  calculateTargetPosition,
  canEnterHome,
  isFinished,
  isInsideHomePath,
  getPlayerPath,
} from "./pathEngine.js";

import {
  canLeaveHome,
  canMoveToken,
  canMoveInsideHome,
  canFinish,
  isMoveLegal,
  validateMove,
} from "./moveValidator.js";

import {
  getHomePositions,
  getStartCell,
  OUTER_PATH,
  HOME_PATHS,
} from "../constants/boardPaths.js";

// ============================================================
// CONSTANTS
// ============================================================

const OUTER_PATH_LENGTH = OUTER_PATH.length;
const HOME_PATH_LENGTH = getHomePathLength("red");
const TOTAL_PATH_LENGTH = OUTER_PATH_LENGTH + HOME_PATH_LENGTH;
const DICE_SIX = 6;
const TOKENS_PER_PLAYER = 4;

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
 * Validates a player ID.
 * @param {string} playerId - Player ID
 * @throws {Error} If player ID is invalid
 */
const _validatePlayerId = (playerId) => {
  if (!playerId || typeof playerId !== "string") {
    throw new Error("Player ID must be a non-empty string");
  }
};

/**
 * Generates a unique token ID.
 * @param {string} playerId - Player ID
 * @param {number} index - Token index
 * @returns {string} Token ID
 */
const _generateTokenId = (playerId, index) => {
  return `${playerId}-token-${index}`;
};

/**
 * Creates a single token.
 * @param {string} playerId - Player ID
 * @param {string} color - Player color
 * @param {number} index - Token index
 * @returns {Object} Token object
 */
const _createToken = (playerId, color, index) => {
  return {
    id: _generateTokenId(playerId, index),
    playerId: playerId,
    color: color,
    state: "home",
    pathIndex: -1,
    homeIndex: -1,
    finished: false,
    moveCount: 0,
    position: null,
  };
};

/**
 * Gets the current position of a token.
 * @param {Object} token - Token to check
 * @returns {Object|null} Position object or null
 */
const _getTokenPosition = (token) => {
  if (token.state === "home") {
    const homePositions = getHomePositions(token.color);
    return homePositions[0] || null;
  }

  if (token.state === "finished") {
    return { row: 7, col: 7, isCenter: true };
  }

  const index =
    token.state === "homePath"
      ? OUTER_PATH_LENGTH + token.homeIndex
      : token.pathIndex;

  try {
    return getCellByIndex(token.color, index);
  } catch (error) {
    return null;
  }
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Creates all tokens for a player.
 * @param {string} playerId - Player ID
 * @param {string} color - Player color
 * @param {number} count - Number of tokens to create
 * @returns {Array} Array of token objects
 */
export const createPlayerTokens = (
  playerId,
  color,
  count = TOKENS_PER_PLAYER,
) => {
  _validatePlayerId(playerId);
  if (!color || typeof color !== "string") {
    throw new Error("Color must be a non-empty string");
  }
  if (typeof count !== "number" || count < 1 || count > 4) {
    throw new Error("Token count must be between 1 and 4");
  }

  const tokens = [];
  for (let i = 0; i < count; i++) {
    tokens.push(_createToken(playerId, color, i));
  }
  return tokens;
};

/**
 * Creates all tokens for all players.
 * @param {Array} players - Array of player objects
 * @returns {Array} Array of token objects
 */
export const createAllTokens = (players) => {
  if (!Array.isArray(players) || players.length === 0) {
    throw new Error("Players must be a non-empty array");
  }

  const allTokens = [];
  for (const player of players) {
    if (!player.id || !player.color) {
      throw new Error("Each player must have id and color");
    }
    const tokens = createPlayerTokens(player.id, player.color);
    allTokens.push(...tokens);
  }
  return allTokens;
};

/**
 * Moves a token based on dice value.
 * @param {Object} token - Token to move
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Move result with updated token
 */
export const moveToken = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  // Check if token can move
  const validation = validateMove(token, diceValue);
  if (!validation.valid) {
    return {
      success: false,
      reason: validation.reason,
      code: validation.code,
      token: { ...token },
    };
  }

  let updatedToken = { ...token };
  const targetPosition = validation.targetPosition;

  // Move token based on current state
  if (token.state === "home" && diceValue === DICE_SIX) {
    // Leave home
    updatedToken.state = "playing";
    updatedToken.pathIndex = targetPosition.pathIndex;
    updatedToken.homeIndex = -1;
    updatedToken.moveCount += 1;
    updatedToken.finished = false;
  } else if (token.state === "playing") {
    // Check if entering home path
    if (targetPosition.isHomePath) {
      updatedToken.state = "homePath";
      updatedToken.homeIndex = targetPosition.homeIndex;
      updatedToken.pathIndex = OUTER_PATH_LENGTH + targetPosition.homeIndex;
      updatedToken.moveCount += 1;
    } else {
      updatedToken.pathIndex = targetPosition.pathIndex;
      updatedToken.moveCount += 1;
    }
  } else if (token.state === "homePath") {
    // Move inside home path
    if (targetPosition.finished) {
      updatedToken.state = "finished";
      updatedToken.finished = true;
      updatedToken.homeIndex = HOME_PATH_LENGTH - 1;
      updatedToken.pathIndex = TOTAL_PATH_LENGTH - 1;
    } else {
      updatedToken.homeIndex = targetPosition.homeIndex;
      updatedToken.pathIndex = OUTER_PATH_LENGTH + targetPosition.homeIndex;
    }
    updatedToken.moveCount += 1;
  }

  // Update position
  updatedToken.position = _getTokenPosition(updatedToken);

  return {
    success: true,
    reason: null,
    code: "MOVE_SUCCESSFUL",
    token: updatedToken,
    targetPosition: targetPosition,
    finished: updatedToken.state === "finished",
    moveCount: updatedToken.moveCount,
  };
};

/**
 * Moves a token to the start position.
 * @param {Object} token - Token to move
 * @returns {Object} Result with updated token
 */
export const moveTokenToStart = (token) => {
  _validateToken(token);

  const startPosition = getStartPosition(token.color);
  const updatedToken = { ...token };

  updatedToken.state = "playing";
  updatedToken.pathIndex = startPosition.pathIndex;
  updatedToken.homeIndex = -1;
  updatedToken.finished = false;
  updatedToken.moveCount += 1;
  updatedToken.position = _getTokenPosition(updatedToken);

  return {
    success: true,
    reason: null,
    token: updatedToken,
    position: startPosition,
  };
};

/**
 * Moves a token on the board.
 * @param {Object} token - Token to move
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Result with updated token
 */
export const moveTokenOnBoard = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  if (token.state !== "playing") {
    return {
      success: false,
      reason: "Token is not on the board",
      token: { ...token },
    };
  }

  return moveToken(token, diceValue);
};

/**
 * Moves a token inside the home path.
 * @param {Object} token - Token to move
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Result with updated token
 */
export const moveInsideHomePath = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  if (token.state !== "homePath") {
    return {
      success: false,
      reason: "Token is not in the home path",
      token: { ...token },
    };
  }

  return moveToken(token, diceValue);
};

/**
 * Finishes a token (moves to center).
 * @param {Object} token - Token to finish
 * @returns {Object} Result with updated token
 */
export const finishToken = (token) => {
  _validateToken(token);

  if (token.state === "finished") {
    return {
      success: false,
      reason: "Token is already finished",
      token: { ...token },
    };
  }

  const updatedToken = { ...token };
  updatedToken.state = "finished";
  updatedToken.finished = true;
  updatedToken.homeIndex = HOME_PATH_LENGTH - 1;
  updatedToken.pathIndex = TOTAL_PATH_LENGTH - 1;
  updatedToken.position = { row: 7, col: 7, isCenter: true };

  return {
    success: true,
    reason: null,
    token: updatedToken,
    position: updatedToken.position,
  };
};

/**
 * Resets a token to home state.
 * @param {Object} token - Token to reset
 * @returns {Object} Result with updated token
 */
export const resetToken = (token) => {
  _validateToken(token);

  const updatedToken = {
    ...token,
    state: "home",
    pathIndex: -1,
    homeIndex: -1,
    finished: false,
    moveCount: 0,
    position: null,
  };

  return {
    success: true,
    reason: null,
    token: updatedToken,
  };
};

/**
 * Sends a token back home (capture).
 * @param {Object} token - Token to send home
 * @returns {Object} Result with updated token
 */
export const sendTokenHome = (token) => {
  _validateToken(token);

  if (token.state === "home" || token.state === "finished") {
    return {
      success: false,
      reason: "Token is already home or finished",
      token: { ...token },
    };
  }

  const updatedToken = {
    ...token,
    state: "home",
    pathIndex: -1,
    homeIndex: -1,
    finished: false,
    position: null,
    // Keep moveCount for statistics
  };

  return {
    success: true,
    reason: "Token sent home",
    token: updatedToken,
    captured: true,
  };
};

/**
 * Gets the position of a token.
 * @param {Object} token - Token to check
 * @returns {Object|null} Position object or null
 */
export const getTokenPosition = (token) => {
  _validateToken(token);
  return _getTokenPosition(token);
};

/**
 * Gets all tokens for a specific player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {Array} Player's tokens
 */
export const getTokensByPlayer = (tokens, playerId) => {
  _validateTokens(tokens);
  _validatePlayerId(playerId);

  return tokens.filter((t) => t.playerId === playerId).map((t) => ({ ...t }));
};

/**
 * Gets all finished tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Finished tokens
 */
export const getFinishedTokens = (tokens, playerId = null) => {
  _validateTokens(tokens);

  let filteredTokens = tokens.filter((t) => t.state === "finished");
  if (playerId) {
    _validatePlayerId(playerId);
    filteredTokens = filteredTokens.filter((t) => t.playerId === playerId);
  }

  return filteredTokens.map((t) => ({ ...t }));
};

/**
 * Gets all active tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Active tokens
 */
export const getActiveTokens = (tokens, playerId = null) => {
  _validateTokens(tokens);

  let filteredTokens = tokens.filter(
    (t) => t.state === "playing" || t.state === "homePath",
  );
  if (playerId) {
    _validatePlayerId(playerId);
    filteredTokens = filteredTokens.filter((t) => t.playerId === playerId);
  }

  return filteredTokens.map((t) => ({ ...t }));
};

/**
 * Gets all home tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Home tokens
 */
export const getHomeTokens = (tokens, playerId = null) => {
  _validateTokens(tokens);

  let filteredTokens = tokens.filter((t) => t.state === "home");
  if (playerId) {
    _validatePlayerId(playerId);
    filteredTokens = filteredTokens.filter((t) => t.playerId === playerId);
  }

  return filteredTokens.map((t) => ({ ...t }));
};

/**
 * Gets all movable tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value rolled
 * @param {string} playerId - Player ID (optional)
 * @returns {Array} Movable tokens
 */
export const getMovableTokens = (tokens, diceValue, playerId = null) => {
  _validateTokens(tokens);
  _validateDiceValue(diceValue);

  let playerTokens = tokens;
  if (playerId) {
    _validatePlayerId(playerId);
    playerTokens = tokens.filter((t) => t.playerId === playerId);
  }

  const movable = [];
  for (const token of playerTokens) {
    const validation = validateMove(token, diceValue);
    if (validation.valid) {
      movable.push({
        ...token,
        targetPosition: validation.targetPosition,
      });
    }
  }

  return movable;
};

/**
 * Updates a token in the tokens array.
 * @param {Array} tokens - All tokens
 * @param {Object} updatedToken - Updated token
 * @returns {Array} Updated tokens array
 */
export const updateToken = (tokens, updatedToken) => {
  _validateTokens(tokens);
  _validateToken(updatedToken);

  return tokens.map((t) =>
    t.id === updatedToken.id ? { ...updatedToken } : { ...t },
  );
};

/**
 * Replaces a token in the tokens array (alias for updateToken).
 * @param {Array} tokens - All tokens
 * @param {Object} updatedToken - Updated token
 * @returns {Array} Updated tokens array
 */
export const replaceToken = (tokens, updatedToken) => {
  return updateToken(tokens, updatedToken);
};

/**
 * Clones a token.
 * @param {Object} token - Token to clone
 * @returns {Object} Cloned token
 */
export const cloneToken = (token) => {
  _validateToken(token);
  return { ...token };
};

/**
 * Clones all tokens.
 * @param {Array} tokens - Tokens to clone
 * @returns {Array} Cloned tokens
 */
export const cloneTokens = (tokens) => {
  _validateTokens(tokens);
  return tokens.map((t) => ({ ...t }));
};

/**
 * Gets the distance to finish for a token.
 * @param {Object} token - Token to check
 * @returns {number} Distance to finish
 */
export const getDistanceToFinish = (token) => {
  _validateToken(token);
  return getDistanceToFinish(token);
};

/**
 * Gets the remaining steps for a token.
 * @param {Object} token - Token to check
 * @returns {number} Remaining steps
 */
export const getRemainingSteps = (token) => {
  _validateToken(token);
  return getRemainingSteps(token);
};

/**
 * Checks if a token is finished.
 * @param {Object} token - Token to check
 * @returns {boolean} True if finished
 */
export const isTokenFinished = (token) => {
  _validateToken(token);
  return token.state === "finished";
};

/**
 * Checks if a token is at home.
 * @param {Object} token - Token to check
 * @returns {boolean} True if at home
 */
export const isTokenHome = (token) => {
  _validateToken(token);
  return token.state === "home";
};

/**
 * Checks if a token is active.
 * @param {Object} token - Token to check
 * @returns {boolean} True if active
 */
export const isTokenActive = (token) => {
  _validateToken(token);
  return token.state === "playing" || token.state === "homePath";
};

/**
 * Gets the total number of tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {number} Token count
 */
export const getTokenCount = (tokens, playerId) => {
  _validateTokens(tokens);
  _validatePlayerId(playerId);
  return tokens.filter((t) => t.playerId === playerId).length;
};

/**
 * Gets the number of finished tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {number} Finished token count
 */
export const getFinishedTokenCount = (tokens, playerId) => {
  _validateTokens(tokens);
  _validatePlayerId(playerId);
  return tokens.filter((t) => t.playerId === playerId && t.state === "finished")
    .length;
};

/**
 * Gets the number of active tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {number} Active token count
 */
export const getActiveTokenCount = (tokens, playerId) => {
  _validateTokens(tokens);
  _validatePlayerId(playerId);
  return tokens.filter(
    (t) =>
      t.playerId === playerId &&
      (t.state === "playing" || t.state === "homePath"),
  ).length;
};

/**
 * Gets the number of home tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {number} Home token count
 */
export const getHomeTokenCount = (tokens, playerId) => {
  _validateTokens(tokens);
  _validatePlayerId(playerId);
  return tokens.filter((t) => t.playerId === playerId && t.state === "home")
    .length;
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
