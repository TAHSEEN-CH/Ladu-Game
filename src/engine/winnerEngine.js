// src/engine/winnerEngine.js

/**
 * Winner Engine Module
 *
 * Production-ready winner detection and ranking for Ludo game.
 * Handles player finishing, ranking, and game completion logic.
 * Pure JavaScript with no dependencies.
 */

import {
  getFinishedTokens,
  getTokensByPlayer,
  isTokenFinished,
  cloneTokens,
} from "./tokenEngine.js";

// ============================================================
// CONSTANTS
// ============================================================

const TOKENS_PER_PLAYER = 4;
const TOTAL_PLAYERS = 4;

// ============================================================
// STATE
// ============================================================

let _players = [];
let _rankCounter = 0;
let _gameOver = false;
let _winners = [];
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
  if (player.active !== undefined && typeof player.active !== "boolean") {
    throw new Error("Player active must be a boolean");
  }
  if (player.finished !== undefined && typeof player.finished !== "boolean") {
    throw new Error("Player finished must be a boolean");
  }
  if (
    player.rank !== undefined &&
    player.rank !== null &&
    typeof player.rank !== "number"
  ) {
    throw new Error("Player rank must be a number or null");
  }
  if (
    player.score !== undefined &&
    player.score !== null &&
    typeof player.score !== "number"
  ) {
    throw new Error("Player score must be a number or null");
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
  if (players.length < 2 || players.length > 4) {
    throw new Error("Players must be between 2 and 4");
  }
  players.forEach(_validatePlayer);
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
 * Gets the number of finished tokens for a player.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {number} Number of finished tokens
 */
const _getFinishedTokenCount = (tokens, playerId) => {
  const playerTokens = getTokensByPlayer(tokens, playerId);
  return playerTokens.filter((t) => t.state === "finished").length;
};

/**
 * Gets the total move count for a player's tokens.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {number} Total move count
 */
const _getTotalMoves = (tokens, playerId) => {
  const playerTokens = getTokensByPlayer(tokens, playerId);
  return playerTokens.reduce((sum, t) => sum + (t.moveCount || 0), 0);
};

/**
 * Gets the rank of a player.
 * @param {Object} player - Player to check
 * @returns {number|null} Player rank or null
 */
const _getPlayerRank = (player) => {
  return player.rank || null;
};

/**
 * Checks if all tokens for a player are finished.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {boolean} True if all tokens are finished
 */
const _isPlayerFinished = (tokens, playerId) => {
  const finishedCount = _getFinishedTokenCount(tokens, playerId);
  return finishedCount === TOKENS_PER_PLAYER;
};

/**
 * Gets the next rank.
 * @returns {number} Next rank
 */
const _getNextRank = () => {
  return _rankCounter + 1;
};

/**
 * Updates player ranking.
 * @param {Object} player - Player to rank
 * @param {Array} tokens - All tokens
 * @returns {Object} Updated player
 */
const _rankPlayer = (player, tokens) => {
  const updatedPlayer = { ...player };
  if (player.finished && !player.rank) {
    _rankCounter++;
    updatedPlayer.rank = _rankCounter;
    updatedPlayer.score = _calculateScore(player, tokens);
  }
  return updatedPlayer;
};

/**
 * Calculates a player's score.
 * @param {Object} player - Player
 * @param {Array} tokens - All tokens
 * @returns {number} Player score
 */
const _calculateScore = (player, tokens) => {
  const finishedTokens = _getFinishedTokenCount(tokens, player.id);
  const totalMoves = _getTotalMoves(tokens, player.id);

  // Score calculation: base score + bonus for finishing quickly
  let score = finishedTokens * 100;
  score += Math.max(0, 100 - totalMoves);

  // Bonus for rank
  if (player.rank) {
    score += (TOTAL_PLAYERS - player.rank + 1) * 50;
  }

  return score;
};

/**
 * Checks if the game is over.
 * @param {Array} players - All players
 * @returns {boolean} True if game is over
 */
const _isGameOver = (players) => {
  const activePlayers = players.filter(
    (p) => p.active && !p.finished && !p.disconnected,
  );
  return (
    activePlayers.length <= 1 ||
    players.every((p) => p.finished || !p.active || p.disconnected)
  );
};

/**
 * Gets the remaining players.
 * @param {Array} players - All players
 * @returns {Array} Remaining players
 */
const _getRemainingPlayers = (players) => {
  return players.filter((p) => p.active && !p.finished && !p.disconnected);
};

/**
 * Gets the finished players.
 * @param {Array} players - All players
 * @returns {Array} Finished players
 */
const _getFinishedPlayers = (players) => {
  return players.filter((p) => p.finished);
};

/**
 * Gets the winner(s) of the game.
 * @param {Array} players - All players
 * @returns {Array} Winners
 */
const _getWinners = (players) => {
  const finished = _getFinishedPlayers(players);
  if (finished.length === 0) return [];

  // Sort by rank
  return finished
    .filter((p) => p.rank !== null)
    .sort((a, b) => a.rank - b.rank)
    .map((p) => ({ ...p }));
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Initializes the winner state.
 * @param {Array} players - All players
 * @returns {Object} Initialized state
 */
export const initializeWinnerState = (players) => {
  _validatePlayers(players);

  _players = players.map((p) => ({
    ...p,
    active: p.active !== undefined ? p.active : true,
    finished: p.finished || false,
    disconnected: p.disconnected || false,
    rank: p.rank || null,
    score: p.score || null,
  }));

  _rankCounter = 0;
  _gameOver = false;
  _winners = [];
  _initialized = true;

  return {
    success: true,
    players: _players.map((p) => ({ ...p })),
    rankCounter: _rankCounter,
    gameOver: _gameOver,
    winners: [],
    message: "Winner state initialized successfully",
  };
};

/**
 * Checks if a player is finished.
 * @param {Array} tokens - All tokens
 * @param {string} playerId - Player ID
 * @returns {Object} Result
 */
export const isPlayerFinished = (tokens, playerId) => {
  _validateTokens(tokens);
  _validatePlayerId(playerId);

  const finished = _isPlayerFinished(tokens, playerId);

  return {
    isFinished: finished,
    playerId: playerId,
    finishedTokens: _getFinishedTokenCount(tokens, playerId),
    totalTokens: TOKENS_PER_PLAYER,
  };
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
  return _getFinishedTokenCount(tokens, playerId);
};

/**
 * Updates player finish status.
 * @param {Array} players - All players
 * @param {Array} tokens - All tokens
 * @returns {Object} Update result
 */
export const updatePlayerFinish = (players, tokens) => {
  _validatePlayers(players);
  _validateTokens(tokens);

  let updatedPlayers = players.map((p) => ({ ...p }));
  let anyUpdated = false;

  for (let i = 0; i < updatedPlayers.length; i++) {
    const player = updatedPlayers[i];

    // Skip already finished players
    if (player.finished) continue;

    // Skip inactive or disconnected players
    if (!player.active || player.disconnected) {
      player.finished = true;
      player.rank = _getNextRank();
      anyUpdated = true;
      continue;
    }

    // Check if player has finished all tokens
    if (_isPlayerFinished(tokens, player.id)) {
      player.finished = true;
      player.rank = _getNextRank();
      player.score = _calculateScore(player, tokens);
      anyUpdated = true;
    }
  }

  // If only one player remains, automatically finish them
  const remaining = _getRemainingPlayers(updatedPlayers);
  if (remaining.length === 1 && !_gameOver) {
    const lastPlayer = remaining[0];
    if (!lastPlayer.finished) {
      lastPlayer.finished = true;
      lastPlayer.rank = _getNextRank();
      lastPlayer.score = _calculateScore(lastPlayer, tokens);
      anyUpdated = true;
    }
  }

  _players = updatedPlayers;

  if (anyUpdated) {
    _gameOver = _isGameOver(updatedPlayers);
    _winners = _getWinners(updatedPlayers);
  }

  return {
    success: true,
    players: updatedPlayers.map((p) => ({ ...p })),
    gameOver: _gameOver,
    winners: _winners.map((w) => ({ ...w })),
    anyUpdated: anyUpdated,
    rankCounter: _rankCounter,
  };
};

/**
 * Assigns a rank to a player.
 * @param {Object} player - Player to rank
 * @returns {Object} Rank assignment result
 */
export const assignRank = (player) => {
  _validatePlayer(player);

  if (!_initialized) {
    throw new Error("Winner state not initialized");
  }

  const playerIndex = _players.findIndex((p) => p.id === player.id);
  if (playerIndex === -1) {
    return {
      success: false,
      reason: "Player not found",
    };
  }

  const existingPlayer = _players[playerIndex];
  if (existingPlayer.finished && existingPlayer.rank) {
    return {
      success: false,
      reason: "Player already has a rank",
    };
  }

  const updatedPlayer = {
    ...existingPlayer,
    finished: true,
    rank: _getNextRank(),
  };

  _players[playerIndex] = updatedPlayer;
  _gameOver = _isGameOver(_players);
  _winners = _getWinners(_players);

  return {
    success: true,
    player: { ...updatedPlayer },
    rank: updatedPlayer.rank,
    gameOver: _gameOver,
    winners: _winners.map((w) => ({ ...w })),
  };
};

/**
 * Assigns the next rank to a player.
 * @param {Array} players - All players
 * @returns {Object} Result
 */
export const assignNextRank = (players) => {
  _validatePlayers(players);

  const remaining = _getRemainingPlayers(players);
  if (remaining.length === 0) {
    return {
      success: false,
      reason: "No remaining players to rank",
    };
  }

  const nextPlayer = remaining[0];
  const result = assignRank(nextPlayer);

  return result;
};

/**
 * Gets a player's rank.
 * @param {string} playerId - Player ID
 * @returns {Object} Rank result
 */
export const getPlayerRank = (playerId) => {
  _validatePlayerId(playerId);

  if (!_initialized) {
    throw new Error("Winner state not initialized");
  }

  const player = _players.find((p) => p.id === playerId);
  if (!player) {
    return {
      success: false,
      reason: "Player not found",
    };
  }

  return {
    success: true,
    playerId: playerId,
    rank: player.rank || null,
    finished: player.finished || false,
  };
};

/**
 * Gets the winner of the game.
 * @param {Array} players - All players
 * @returns {Object} Winner result
 */
export const getWinner = (players) => {
  _validatePlayers(players);

  const finished = _getFinishedPlayers(players);
  if (finished.length === 0) {
    return {
      hasWinner: false,
      winner: null,
      reason: "No players have finished",
    };
  }

  const sorted = finished
    .filter((p) => p.rank !== null)
    .sort((a, b) => a.rank - b.rank);

  if (sorted.length === 0) {
    return {
      hasWinner: false,
      winner: null,
      reason: "No ranks assigned",
    };
  }

  return {
    hasWinner: true,
    winner: { ...sorted[0] },
    allWinners: sorted.map((w) => ({ ...w })),
  };
};

/**
 * Gets all winners of the game.
 * @param {Array} players - All players
 * @returns {Array} Winners
 */
export const getWinners = (players) => {
  _validatePlayers(players);
  return _getWinners(players);
};

/**
 * Checks if the game is over.
 * @param {Array} players - All players
 * @returns {Object} Result
 */
export const isGameOver = (players) => {
  _validatePlayers(players);

  const gameOver = _isGameOver(players);
  const remaining = _getRemainingPlayers(players);
  const finished = _getFinishedPlayers(players);

  return {
    gameOver: gameOver,
    remainingPlayers: remaining.map((p) => ({ ...p })),
    remainingCount: remaining.length,
    finishedPlayers: finished.map((p) => ({ ...p })),
    finishedCount: finished.length,
    totalPlayers: players.length,
  };
};

/**
 * Gets the remaining players.
 * @param {Array} players - All players
 * @returns {Array} Remaining players
 */
export const getRemainingPlayers = (players) => {
  _validatePlayers(players);
  return _getRemainingPlayers(players).map((p) => ({ ...p }));
};

/**
 * Gets the finished players.
 * @param {Array} players - All players
 * @returns {Array} Finished players
 */
export const getFinishedPlayers = (players) => {
  _validatePlayers(players);
  return _getFinishedPlayers(players).map((p) => ({ ...p }));
};

/**
 * Calculates a player's score.
 * @param {Object} player - Player
 * @param {Array} tokens - All tokens
 * @returns {number} Player score
 */
export const calculatePlayerScore = (player, tokens) => {
  _validatePlayer(player);
  _validateTokens(tokens);

  return _calculateScore(player, tokens);
};

/**
 * Calculates the leaderboard.
 * @param {Array} players - All players
 * @param {Array} tokens - All tokens
 * @returns {Array} Leaderboard
 */
export const calculateLeaderboard = (players, tokens) => {
  _validatePlayers(players);
  _validateTokens(tokens);

  const leaderboard = players.map((player) => {
    const finishedTokens = _getFinishedTokenCount(tokens, player.id);
    const totalMoves = _getTotalMoves(tokens, player.id);
    const score = _calculateScore(player, tokens);

    return {
      ...player,
      finishedTokens: finishedTokens,
      totalMoves: totalMoves,
      score: score,
      isFinished: player.finished || false,
      rank: player.rank || null,
    };
  });

  // Sort by: rank (finished players first), then by finished tokens, then by score
  return leaderboard
    .sort((a, b) => {
      // Finished players first
      if (a.isFinished && !b.isFinished) return -1;
      if (!a.isFinished && b.isFinished) return 1;

      // Then by rank
      if (a.rank !== null && b.rank !== null) {
        return a.rank - b.rank;
      }

      // Then by finished tokens
      if (a.finishedTokens !== b.finishedTokens) {
        return b.finishedTokens - a.finishedTokens;
      }

      // Then by score
      if (a.score !== null && b.score !== null) {
        return b.score - a.score;
      }

      // Finally by name
      return a.name.localeCompare(b.name);
    })
    .map((p) => ({ ...p }));
};

/**
 * Gets the current winner state.
 * @returns {Object} Current winner state
 */
export const getWinnerState = () => {
  if (!_initialized) {
    return {
      initialized: false,
      players: [],
      rankCounter: 0,
      gameOver: false,
      winners: [],
    };
  }

  return {
    initialized: true,
    players: _players.map((p) => ({ ...p })),
    rankCounter: _rankCounter,
    gameOver: _gameOver,
    winners: _winners.map((w) => ({ ...w })),
  };
};

/**
 * Resets the winner state.
 * @param {Array} players - Players to reset (optional)
 * @returns {Object} Reset result
 */
export const resetWinnerState = (players = null) => {
  if (players) {
    _validatePlayers(players);
    _players = players.map((p) => ({
      ...p,
      active: p.active !== undefined ? p.active : true,
      finished: p.finished || false,
      disconnected: p.disconnected || false,
      rank: null,
      score: null,
    }));
  } else {
    _players = [];
  }

  _rankCounter = 0;
  _gameOver = false;
  _winners = [];
  _initialized = players !== null;

  return {
    success: true,
    players: _players.map((p) => ({ ...p })),
    rankCounter: _rankCounter,
    gameOver: _gameOver,
    winners: [],
    message: "Winner state reset successfully",
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
