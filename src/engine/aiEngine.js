// src/engine/aiEngine.js

/**
 * AI Engine Module
 *
 * Production-ready AI logic for Ludo game.
 * Supports multiple difficulty levels with strategic decision making.
 * Pure JavaScript with no dependencies.
 */

import { rollDice, getLastRoll, getConsecutiveSixes } from "./diceEngine.js";

import {
  getTokenPosition,
  getTokensByPlayer,
  getMovableTokens,
  isTokenActive,
  isTokenHome,
  isTokenFinished,
  cloneToken,
  cloneTokens,
  getDistanceToFinish,
  getRemainingSteps,
} from "./tokenEngine.js";

import {
  isMoveLegal,
  validateMove,
  hasAnyLegalMove,
  getMovableTokens as getValidMovableTokens,
} from "./moveValidator.js";

import {
  getCapturableTokens,
  hasCapture,
  isSafeCell,
  isBlockade,
  canPassBlockade,
} from "./captureEngine.js";

import {
  getPlayerPath,
  getHomePath,
  getHomeEntryIndex,
  isInsideHomePath,
  isFinished,
  getCellByIndex,
} from "./pathEngine.js";

// ============================================================
// CONSTANTS
// ============================================================

const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

const TOKENS_PER_PLAYER = 4;

const SCORE_WEIGHTS = {
  // Easy difficulty
  EASY: {
    FINISH: 100,
    CAPTURE: 80,
    LEAVE_HOME: 60,
    ENTER_HOME: 50,
    SAFE_CELL: 40,
    PROGRESS: 30,
    RANDOM: 20,
  },
  // Medium difficulty
  MEDIUM: {
    FINISH: 200,
    CAPTURE: 150,
    LEAVE_HOME: 120,
    ENTER_HOME: 100,
    SAFE_CELL: 80,
    BLOCKADE: 70,
    PROGRESS: 50,
    RANDOM: 30,
  },
  // Hard difficulty
  HARD: {
    FINISH: 300,
    CAPTURE: 250,
    AVOID_DANGER: 200,
    CREATE_BLOCKADE: 180,
    BREAK_BLOCKADE: 170,
    ENTER_HOME: 150,
    SAFE_CELL: 120,
    PROGRESS: 80,
    STRATEGIC: 60,
    RANDOM: 10,
  },
};

// ============================================================
// STATE
// ============================================================

let _aiPlayers = [];
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
  if (player.type !== "ai") {
    throw new Error('Player type must be "ai"');
  }
  if (
    player.difficulty &&
    !Object.values(DIFFICULTY_LEVELS).includes(player.difficulty)
  ) {
    throw new Error(
      `Difficulty must be one of: ${Object.values(DIFFICULTY_LEVELS).join(", ")}`,
    );
  }
};

/**
 * Validates a token.
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
};

/**
 * Validates tokens array.
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
 * Validates dice value.
 * @param {number} diceValue - Dice value
 * @throws {Error} If dice value is invalid
 */
const _validateDiceValue = (diceValue) => {
  if (typeof diceValue !== "number" || isNaN(diceValue)) {
    throw new Error("Dice value must be a number");
  }
  if (diceValue < 1 || diceValue > 6) {
    throw new Error("Dice value must be between 1 and 6");
  }
};

/**
 * Gets the difficulty weights for a player.
 * @param {Object} player - AI player
 * @returns {Object} Score weights
 */
const _getWeights = (player) => {
  const difficulty = player.difficulty || DIFFICULTY_LEVELS.EASY;
  return SCORE_WEIGHTS[difficulty.toUpperCase()] || SCORE_WEIGHTS.EASY;
};

/**
 * Checks if a token is in danger.
 * @param {Object} token - Token to check
 * @param {Array} allTokens - All tokens
 * @returns {boolean} True if token is in danger
 */
const _isTokenInDanger = (token, allTokens) => {
  if (token.state !== "playing") return false;
  if (isSafeCell(token)) return false;

  const pathIndex = token.pathIndex;
  const opponentTokens = allTokens.filter(
    (t) => t.playerId !== token.playerId && t.state === "playing",
  );

  // Check if any opponent token can reach this token's position
  for (const opponent of opponentTokens) {
    const distance = getDistanceToFinish(opponent);
    if (distance <= 6) {
      // Check if opponent can land on this token's position
      for (let d = 1; d <= 6; d++) {
        const result = validateMove(opponent, d);
        if (result.valid && result.targetPosition?.pathIndex === pathIndex) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Checks if a move creates a blockade.
 * @param {Object} token - Token to move
 * @param {Array} allTokens - All tokens
 * @param {number} targetIndex - Target path index
 * @returns {boolean} True if move creates blockade
 */
const _willCreateBlockade = (token, allTokens, targetIndex) => {
  const playerTokens = allTokens.filter(
    (t) =>
      t.playerId === token.playerId &&
      t.state === "playing" &&
      t.id !== token.id,
  );

  // Check if another token of the same player is on the target cell
  const tokenOnTarget = playerTokens.find((t) => t.pathIndex === targetIndex);
  if (tokenOnTarget) {
    const blockadeResult = isBlockade(allTokens, targetIndex);
    return !blockadeResult.hasBlockade;
  }

  return false;
};

/**
 * Checks if a move breaks an opponent's blockade.
 * @param {Object} token - Token to move
 * @param {Array} allTokens - All tokens
 * @param {number} targetIndex - Target path index
 * @returns {boolean} True if move breaks blockade
 */
const _willBreakBlockade = (token, allTokens, targetIndex) => {
  const blockadeResult = isBlockade(allTokens, targetIndex);
  if (
    blockadeResult.hasBlockade &&
    blockadeResult.playerId !== token.playerId
  ) {
    // Check if moving to this cell would break the blockade
    const tokensOnCell = allTokens.filter(
      (t) => t.pathIndex === targetIndex && t.state === "playing",
    );
    // If there are two opponent tokens, moving there would break the blockade
    return tokensOnCell.length === 2;
  }
  return false;
};

/**
 * Calculates the progress score for a move.
 * @param {Object} token - Token to move
 * @param {number} diceValue - Dice value
 * @param {Array} allTokens - All tokens
 * @returns {number} Progress score
 */
const _calculateProgressScore = (token, diceValue, allTokens) => {
  const result = validateMove(token, diceValue);
  if (!result.valid) return 0;

  const currentDistance = getDistanceToFinish(token);
  const targetPosition = result.targetPosition;
  let newDistance = currentDistance - diceValue;

  if (targetPosition?.isHomePath) {
    newDistance = currentDistance - diceValue - 1;
  }

  // Bonus for progress
  const progressBonus = (currentDistance - newDistance) * 10;

  // Bonus for moving to safe cell
  let safeBonus = 0;
  if (targetPosition && token.state === "playing") {
    const targetIndex = targetPosition.pathIndex;
    const isSafe = isSafeCell(token);
    if (isSafe) safeBonus = 20;
  }

  return progressBonus + safeBonus;
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Creates an AI player.
 * @param {string} name - Player name
 * @param {string} color - Player color
 * @param {string} difficulty - AI difficulty
 * @returns {Object} AI player object
 */
export const createAIPlayer = (
  name,
  color,
  difficulty = DIFFICULTY_LEVELS.EASY,
) => {
  if (!name || typeof name !== "string") {
    throw new Error("Name must be a non-empty string");
  }
  if (!color || typeof color !== "string") {
    throw new Error("Color must be a non-empty string");
  }
  if (!Object.values(DIFFICULTY_LEVELS).includes(difficulty)) {
    throw new Error(
      `Difficulty must be one of: ${Object.values(DIFFICULTY_LEVELS).join(", ")}`,
    );
  }

  const player = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name,
    color: color,
    type: "ai",
    difficulty: difficulty,
    active: true,
    finished: false,
    disconnected: false,
    rank: null,
    score: null,
  };

  return player;
};

/**
 * Checks if a player is an AI player.
 * @param {Object} player - Player to check
 * @returns {boolean} True if player is AI
 */
export const isAIPlayer = (player) => {
  _validatePlayer(player);
  return player.type === "ai";
};

/**
 * Gets the difficulty of an AI player.
 * @param {Object} player - AI player
 * @returns {string} Difficulty level
 */
export const getDifficulty = (player) => {
  _validatePlayer(player);
  return player.difficulty || DIFFICULTY_LEVELS.EASY;
};

/**
 * Sets the difficulty of an AI player.
 * @param {Object} player - AI player
 * @param {string} difficulty - Difficulty level
 * @returns {Object} Updated player
 */
export const setDifficulty = (player, difficulty) => {
  _validatePlayer(player);
  if (!Object.values(DIFFICULTY_LEVELS).includes(difficulty)) {
    throw new Error(
      `Difficulty must be one of: ${Object.values(DIFFICULTY_LEVELS).join(", ")}`,
    );
  }

  const updatedPlayer = { ...player, difficulty: difficulty };
  return updatedPlayer;
};

/**
 * Gets all possible moves for an AI player.
 * @param {Object} player - AI player
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value
 * @returns {Array} Possible moves
 */
export const getPossibleMoves = (player, tokens, diceValue) => {
  _validatePlayer(player);
  _validateTokens(tokens);
  _validateDiceValue(diceValue);

  const playerTokens = getTokensByPlayer(tokens, player.id);
  const validMoves = getValidMovableTokens(tokens, diceValue, player.id);

  return validMoves.map((token) => ({
    tokenId: token.id,
    token: { ...token },
    diceValue: diceValue,
    targetPosition: token.targetPosition || null,
    score: 0,
    reason: null,
  }));
};

/**
 * Chooses the best move for an AI player.
 * @param {Object} player - AI player
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value
 * @returns {Object} Best move
 */
export const chooseBestMove = (player, tokens, diceValue) => {
  _validatePlayer(player);
  _validateTokens(tokens);
  _validateDiceValue(diceValue);

  const possibleMoves = getPossibleMoves(player, tokens, diceValue);

  if (possibleMoves.length === 0) {
    return {
      tokenId: null,
      diceValue: diceValue,
      score: 0,
      reason: "No possible moves",
    };
  }

  // Evaluate each move
  const evaluatedMoves = possibleMoves.map((move) => {
    const score = evaluateMove(move.token, tokens, diceValue, player);
    return {
      ...move,
      score: score,
      reason: getMoveReason(move.token, tokens, diceValue, player, score),
    };
  });

  // Sort by score (highest first)
  evaluatedMoves.sort((a, b) => b.score - a.score);

  // Pick the best move
  const bestMove = pickBestMove(evaluatedMoves, player.difficulty);

  return {
    tokenId: bestMove.tokenId,
    token: { ...bestMove.token },
    diceValue: bestMove.diceValue,
    score: bestMove.score,
    reason: bestMove.reason || "Best move selected",
    targetPosition: bestMove.targetPosition,
  };
};

/**
 * Evaluates a move for an AI player.
 * @param {Object} token - Token to evaluate
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value
 * @param {Object} player - AI player
 * @returns {number} Score
 */
export const evaluateMove = (token, tokens, diceValue, player) => {
  _validateToken(token);
  _validateTokens(tokens);
  _validateDiceValue(diceValue);
  _validatePlayer(player);

  const weights = _getWeights(player);
  let score = 0;

  // 1. Check if move finishes token
  const finishResult = validateMove(token, diceValue);
  if (finishResult.valid && finishResult.targetPosition?.finished) {
    score += weights.FINISH;
  }

  // 2. Check if move captures opponent token
  const captureResult = hasCapture(token, tokens);
  if (captureResult.hasCapture) {
    const capturable = captureResult.capturableTokens;
    for (const target of capturable) {
      // Check if we can capture with this move
      const canCapture = isMoveLegal(token, diceValue);
      if (canCapture.valid) {
        score += weights.CAPTURE * (1 - getDistanceToFinish(token) / 100);
      }
    }
  }

  // 3. Check if move enters home path
  if (finishResult.valid && finishResult.targetPosition?.isHomePath) {
    score += weights.ENTER_HOME;
  }

  // 4. Check if move goes to safe cell
  if (finishResult.valid && token.state === "playing") {
    const targetIndex = finishResult.targetPosition?.pathIndex;
    if (targetIndex !== undefined && isSafeCell(token)) {
      score += weights.SAFE_CELL;
    }
  }

  // 5. Check if move creates a blockade (hard difficulty)
  if (player.difficulty === DIFFICULTY_LEVELS.HARD) {
    const targetIndex = finishResult.targetPosition?.pathIndex;
    if (
      targetIndex !== undefined &&
      _willCreateBlockade(token, tokens, targetIndex)
    ) {
      score += weights.CREATE_BLOCKADE;
    }

    // Check if move breaks opponent blockade
    if (
      targetIndex !== undefined &&
      _willBreakBlockade(token, tokens, targetIndex)
    ) {
      score += weights.BREAK_BLOCKADE;
    }

    // Check if move avoids danger
    if (!_isTokenInDanger(token, tokens)) {
      score += weights.AVOID_DANGER;
    }
  }

  // 6. Check if token leaves home
  if (token.state === "home" && diceValue === 6) {
    score += weights.LEAVE_HOME;
  }

  // 7. Progress score
  const progressScore = _calculateProgressScore(token, diceValue, tokens);
  score += progressScore;

  // 8. Strategic bonus (hard difficulty)
  if (player.difficulty === DIFFICULTY_LEVELS.HARD) {
    // Bonus for moving tokens that are ahead
    const distance = getDistanceToFinish(token);
    if (distance < 20) {
      score += weights.STRATEGIC;
    }

    // Bonus for moving tokens that are in danger
    if (_isTokenInDanger(token, tokens)) {
      score += weights.AVOID_DANGER * 0.5;
    }
  }

  // Add some randomness to prevent deterministic behavior
  const randomBonus = Math.random() * weights.RANDOM;
  score += randomBonus;

  return Math.round(score);
};

/**
 * Gets the reason for a move.
 * @param {Object} token - Token to evaluate
 * @param {Array} tokens - All tokens
 * @param {number} diceValue - Dice value
 * @param {Object} player - AI player
 * @param {number} score - Move score
 * @returns {string} Move reason
 */
export const getMoveReason = (token, tokens, diceValue, player, score) => {
  const finishResult = validateMove(token, diceValue);

  if (finishResult.valid && finishResult.targetPosition?.finished) {
    return "Finishing token";
  }

  const captureResult = hasCapture(token, tokens);
  if (captureResult.hasCapture && finishResult.valid) {
    return "Capturing opponent token";
  }

  if (finishResult.valid && finishResult.targetPosition?.isHomePath) {
    return "Entering home path";
  }

  if (token.state === "home" && diceValue === 6) {
    return "Leaving home";
  }

  if (finishResult.valid && token.state === "playing") {
    const targetIndex = finishResult.targetPosition?.pathIndex;
    if (targetIndex !== undefined && isSafeCell(token)) {
      return "Moving to safe cell";
    }
  }

  if (player.difficulty === DIFFICULTY_LEVELS.HARD) {
    const targetIndex = finishResult.targetPosition?.pathIndex;
    if (
      targetIndex !== undefined &&
      _willCreateBlockade(token, tokens, targetIndex)
    ) {
      return "Creating blockade";
    }
    if (
      targetIndex !== undefined &&
      _willBreakBlockade(token, tokens, targetIndex)
    ) {
      return "Breaking opponent blockade";
    }
    if (_isTokenInDanger(token, tokens)) {
      return "Avoiding danger";
    }
  }

  const progress = _calculateProgressScore(token, diceValue, tokens);
  if (progress > 20) {
    return "Making progress";
  }

  return "Strategic move";
};

/**
 * Picks the best move from a list of moves.
 * @param {Array} moves - List of moves
 * @param {string} difficulty - AI difficulty
 * @returns {Object} Best move
 */
export const pickBestMove = (moves, difficulty = DIFFICULTY_LEVELS.EASY) => {
  if (!Array.isArray(moves) || moves.length === 0) {
    throw new Error("Moves must be a non-empty array");
  }

  // For easy difficulty, sometimes pick a random move
  if (difficulty === DIFFICULTY_LEVELS.EASY && Math.random() < 0.3) {
    return pickRandomMove(moves);
  }

  // Sort by score (highest first)
  const sorted = [...moves].sort((a, b) => b.score - a.score);
  return { ...sorted[0] };
};

/**
 * Picks a random move from a list of moves.
 * @param {Array} moves - List of moves
 * @returns {Object} Random move
 */
export const pickRandomMove = (moves) => {
  if (!Array.isArray(moves) || moves.length === 0) {
    throw new Error("Moves must be a non-empty array");
  }

  const randomIndex = Math.floor(Math.random() * moves.length);
  return { ...moves[randomIndex] };
};

/**
 * Resets the AI engine state.
 * @returns {Object} Reset result
 */
export const resetAI = () => {
  _aiPlayers = [];
  _initialized = false;

  return {
    success: true,
    message: "AI engine reset successfully",
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
