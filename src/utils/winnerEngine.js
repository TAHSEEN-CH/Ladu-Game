// src/utils/winnerEngine.js

/**
 * Winner Engine Module
 *
 * Pure, framework-independent winner determination utility for Ludo game.
 * Handles win detection, player rankings, and game completion status.
 * Supports both 2-player and 4-player game modes.
 */

import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  TOTAL_TOKENS_PER_PLAYER,
} from "./gameConstants.js";

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Validates that a token object has required properties.
 * @param {Object} token - Token object
 * @param {string} token.id - Token ID
 * @param {string} token.playerId - Player ID
 * @param {string} token.status - Token status (home, active, finished)
 * @throws {Error} If invalid
 */
function validateToken(token) {
  if (!token || typeof token !== "object") {
    throw new Error("Token must be an object");
  }
  if (typeof token.id !== "string" || token.id.length === 0) {
    throw new Error("Token ID must be a non-empty string");
  }
  if (typeof token.playerId !== "string" || token.playerId.length === 0) {
    throw new Error("Token playerId must be a non-empty string");
  }
  if (!["home", "active", "finished"].includes(token.status)) {
    throw new Error("Token status must be home, active, or finished");
  }
  if (typeof token.position !== "number") {
    throw new Error("Token position must be a number");
  }
}

/**
 * Validates that a player object has required properties.
 * @param {Object} player - Player object
 * @param {string} player.id - Player ID
 * @param {string} player.name - Player name
 * @param {string} player.color - Player color
 * @throws {Error} If invalid
 */
function validatePlayer(player) {
  if (!player || typeof player !== "object") {
    throw new Error("Player must be an object");
  }
  if (typeof player.id !== "string" || player.id.length === 0) {
    throw new Error("Player ID must be a non-empty string");
  }
  if (typeof player.name !== "string" || player.name.length === 0) {
    throw new Error("Player name must be a non-empty string");
  }
  if (typeof player.color !== "string" || player.color.length === 0) {
    throw new Error("Player color must be a non-empty string");
  }
}

/**
 * Validates that tokens array contains valid token objects.
 * @param {Object[]} tokens - Array of token objects
 * @throws {Error} If invalid
 */
function validateTokens(tokens) {
  if (!Array.isArray(tokens)) {
    throw new Error("Tokens must be an array");
  }
  if (tokens.length === 0) {
    throw new Error("Tokens array cannot be empty");
  }
  tokens.forEach(validateToken);
}

/**
 * Validates that players array contains valid player objects.
 * @param {Object[]} players - Array of player objects
 * @throws {Error} If invalid
 */
function validatePlayers(players) {
  if (!Array.isArray(players)) {
    throw new Error("Players must be an array");
  }
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    throw new Error(
      `Players must contain between ${MIN_PLAYERS} and ${MAX_PLAYERS} players`,
    );
  }
  players.forEach(validatePlayer);

  // Check for duplicate player IDs
  const ids = players.map((p) => p.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new Error("Player IDs must be unique");
  }
}

/**
 * Counts how many tokens a player has finished.
 * @param {Object[]} tokens - All tokens in the game
 * @param {string} playerId - Player ID
 * @returns {number} Number of finished tokens
 */
function countFinishedTokens(tokens, playerId) {
  return tokens.filter(
    (t) => t.playerId === playerId && t.status === "finished",
  ).length;
}

/**
 * Gets all tokens for a specific player.
 * @param {Object[]} tokens - All tokens in the game
 * @param {string} playerId - Player ID
 * @returns {Object[]} Player's tokens
 */
function getPlayerTokens(tokens, playerId) {
  return tokens.filter((t) => t.playerId === playerId);
}

/**
 * Checks if a player has all tokens finished.
 * @param {Object[]} tokens - All tokens in the game
 * @param {string} playerId - Player ID
 * @returns {boolean} True if all tokens are finished
 */
function hasAllTokensFinished(tokens, playerId) {
  const playerTokens = getPlayerTokens(tokens, playerId);
  if (playerTokens.length === 0) return false;
  return playerTokens.every((t) => t.status === "finished");
}

/**
 * Calculates the finish time/order for ranking.
 * @param {Object[]} tokens - All tokens in the game
 * @param {string} playerId - Player ID
 * @param {number} [turnCount] - Optional turn count for tie-breaking
 * @returns {number} Finish score (lower is better)
 */
function calculateFinishScore(tokens, playerId, turnCount = 0) {
  const finishedCount = countFinishedTokens(tokens, playerId);
  const totalTokens = TOTAL_TOKENS_PER_PLAYER;

  // Primary: number of finished tokens (more is better)
  // Secondary: if same, use turnCount (lower is better)
  // Convert to a score where lower is better for ranking
  const finishRatio = finishedCount / totalTokens;
  const score = (1 - finishRatio) * 10000 + turnCount;
  return score;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Checks if there is a winner in the current game state.
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @returns {Object} Result with winner information
 */
export function checkWinner(tokens, players) {
  validateTokens(tokens);
  validatePlayers(players);

  const winners = [];
  let gameFinished = false;

  for (const player of players) {
    if (hasAllTokensFinished(tokens, player.id)) {
      winners.push({
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        finishedAt: Date.now(),
      });
    }
  }

  if (winners.length > 0) {
    gameFinished = true;
  }

  return {
    hasWinner: winners.length > 0,
    winners: Object.freeze(winners),
    gameFinished: gameFinished,
    winnerCount: winners.length,
  };
}

/**
 * Checks if a specific player has won the game.
 * @param {Object[]} tokens - All tokens in the game
 * @param {string} playerId - Player ID to check
 * @returns {Object} Result indicating if player has won
 */
export function hasPlayerWon(tokens, playerId) {
  validateTokens(tokens);
  if (typeof playerId !== "string" || playerId.length === 0) {
    throw new Error("Player ID must be a non-empty string");
  }

  const hasWon = hasAllTokensFinished(tokens, playerId);
  const finishedCount = countFinishedTokens(tokens, playerId);
  const totalTokens = TOTAL_TOKENS_PER_PLAYER;

  return {
    hasWon: hasWon,
    finishedTokens: finishedCount,
    totalTokens: totalTokens,
    progress: finishedCount / totalTokens,
    playerId: playerId,
  };
}

/**
 * Gets all players who have won the game.
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @returns {Object[]} Array of winning players with details
 */
export function getWinningPlayers(tokens, players) {
  validateTokens(tokens);
  validatePlayers(players);

  return players
    .filter((player) => hasAllTokensFinished(tokens, player.id))
    .map((player) => ({
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      finishedTokens: countFinishedTokens(tokens, player.id),
      totalTokens: TOTAL_TOKENS_PER_PLAYER,
      rank: 1, // Will be recalculated in calculateRankings
    }));
}

/**
 * Calculates rankings for all players based on their progress.
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @param {number} [currentTurn] - Current turn count for tie-breaking
 * @returns {Object} Rankings with all players ordered by position
 */
export function calculateRankings(tokens, players, currentTurn = 0) {
  validateTokens(tokens);
  validatePlayers(players);
  if (typeof currentTurn !== "number" || currentTurn < 0) {
    throw new Error("Current turn must be a non-negative number");
  }

  // Calculate finish scores for each player
  const playerScores = players.map((player) => {
    const finishedCount = countFinishedTokens(tokens, player.id);
    const isFinished = finishedCount === TOTAL_TOKENS_PER_PLAYER;
    const score = calculateFinishScore(tokens, player.id, currentTurn);

    return {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      finishedCount: finishedCount,
      totalTokens: TOTAL_TOKENS_PER_PLAYER,
      isFinished: isFinished,
      score: score,
      progress: finishedCount / TOTAL_TOKENS_PER_PLAYER,
    };
  });

  // Sort by score (lower is better)
  const sorted = [...playerScores].sort((a, b) => {
    // First by finished status (finished players rank higher)
    if (a.isFinished && !b.isFinished) return -1;
    if (!a.isFinished && b.isFinished) return 1;
    // Then by score
    return a.score - b.score;
  });

  // Assign ranks
  const ranked = sorted.map((player, index) => ({
    ...player,
    rank: index + 1,
    isWinner: player.isFinished,
  }));

  return {
    rankings: Object.freeze(ranked),
    totalPlayers: ranked.length,
    finishedPlayers: ranked.filter((p) => p.isFinished).length,
    remainingPlayers: ranked.filter((p) => !p.isFinished).length,
  };
}

/**
 * Checks if the game has finished (all players have finished or only one remains).
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @returns {Object} Game finished status with details
 */
export function isGameFinished(tokens, players) {
  validateTokens(tokens);
  validatePlayers(players);

  const finishedPlayers = players.filter((player) =>
    hasAllTokensFinished(tokens, player.id),
  );

  const remainingPlayers = players.filter(
    (player) => !hasAllTokensFinished(tokens, player.id),
  );

  const gameFinished =
    finishedPlayers.length === players.length || remainingPlayers.length === 1;

  return {
    gameFinished: gameFinished,
    finishedPlayers: finishedPlayers.map((p) => p.id),
    remainingPlayers: remainingPlayers.map((p) => p.id),
    finishedCount: finishedPlayers.length,
    remainingCount: remainingPlayers.length,
    totalPlayers: players.length,
  };
}

/**
 * Gets all players who have finished the game.
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @returns {Object[]} Array of finished players
 */
export function getFinishedPlayers(tokens, players) {
  validateTokens(tokens);
  validatePlayers(players);

  return players
    .filter((player) => hasAllTokensFinished(tokens, player.id))
    .map((player) => ({
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      finishedAt: Date.now(),
      finishedTokens: countFinishedTokens(tokens, player.id),
    }));
}

/**
 * Gets all players who are still playing (not finished).
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @returns {Object[]} Array of remaining players
 */
export function getRemainingPlayers(tokens, players) {
  validateTokens(tokens);
  validatePlayers(players);

  return players
    .filter((player) => !hasAllTokensFinished(tokens, player.id))
    .map((player) => ({
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      finishedTokens: countFinishedTokens(tokens, player.id),
      totalTokens: TOTAL_TOKENS_PER_PLAYER,
      remainingTokens:
        TOTAL_TOKENS_PER_PLAYER - countFinishedTokens(tokens, player.id),
      progress:
        countFinishedTokens(tokens, player.id) / TOTAL_TOKENS_PER_PLAYER,
    }));
}

/**
 * Gets detailed statistics about winners.
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @returns {Object} Winner statistics
 */
export function getWinnerStatistics(tokens, players) {
  validateTokens(tokens);
  validatePlayers(players);

  const rankings = calculateRankings(tokens, players);
  const finished = getFinishedPlayers(tokens, players);
  const remaining = getRemainingPlayers(tokens, players);
  const winnerCheck = checkWinner(tokens, players);

  return {
    hasWinner: winnerCheck.hasWinner,
    winners: winnerCheck.winners,
    rankings: rankings.rankings,
    totalPlayers: players.length,
    finishedCount: finished.length,
    remainingCount: remaining.length,
    fastestPlayer: finished.length > 0 ? finished[0] : null,
    averageProgress:
      players.reduce((sum, p) => {
        const progress =
          countFinishedTokens(tokens, p.id) / TOTAL_TOKENS_PER_PLAYER;
        return sum + progress;
      }, 0) / players.length,
    timestamp: Date.now(),
  };
}

/**
 * Creates a complete game result object.
 * @param {Object[]} tokens - All tokens in the game
 * @param {Object[]} players - All players in the game
 * @param {number} totalTurns - Total turns taken in the game
 * @param {Object} gameOptions - Additional game options
 * @returns {Object} Complete game result
 */
export function createGameResult(
  tokens,
  players,
  totalTurns = 0,
  gameOptions = {},
) {
  validateTokens(tokens);
  validatePlayers(players);
  if (typeof totalTurns !== "number" || totalTurns < 0) {
    throw new Error("Total turns must be a non-negative number");
  }

  const winnerCheck = checkWinner(tokens, players);
  const rankings = calculateRankings(tokens, players, totalTurns);
  const statistics = getWinnerStatistics(tokens, players);

  return {
    gameId: gameOptions.gameId || `game_${Date.now()}`,
    completed: true,
    completedAt: Date.now(),
    totalTurns: totalTurns,
    players: Object.freeze(players.map((p) => ({ ...p }))),
    winners: Object.freeze(winnerCheck.winners),
    rankings: Object.freeze(rankings.rankings),
    statistics: Object.freeze(statistics),
    isComplete: winnerCheck.gameFinished,
    gameMode: players.length === 2 ? "2-player" : "4-player",
    options: Object.freeze({ ...gameOptions }),
  };
}

/**
 * Resets winner state to initial configuration.
 * @param {Object[]} players - All players in the game
 * @returns {Object} Initial winner state
 */
export function resetWinnerState(players) {
  validatePlayers(players);

  return {
    winners: Object.freeze([]),
    rankings: Object.freeze(
      players.map((player, index) => ({
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        rank: index + 1,
        finishedCount: 0,
        totalTokens: TOTAL_TOKENS_PER_PLAYER,
        isFinished: false,
        isWinner: false,
        progress: 0,
      })),
    ),
    gameFinished: false,
    finishedPlayers: Object.freeze([]),
    remainingPlayers: Object.freeze(players.map((p) => p.id)),
    timestamp: Date.now(),
  };
}

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why winner detection is isolated from the rest of the game engine:
 *
 * Winner detection involves complex logic that depends on the state of
 * all tokens across all players. Isolating it provides:
 * - Clear separation of concerns from game mechanics
 * - Easier rule changes without affecting core gameplay
 * - Reusability across different game modes and variants
 * - Independent testing of win conditions
 * - Ability to add new victory conditions (e.g., first to reach home)
 *
 * 2. How this module integrates with ludoEngine, turnEngine, and tokenEngine:
 *
 * - ludoEngine: After each move, calls checkWinner() to determine if
 *   the game should end. Uses isGameFinished() to stop the game loop.
 *   Uses createGameResult() to generate final game statistics.
 *
 * - turnEngine: Winner detection may affect turn order. If a player
 *   wins, turnEngine may need to skip their turn or end the game.
 *   The turnEngine uses getRemainingPlayers() to know who still plays.
 *
 * - tokenEngine: Whenever token status changes to 'finished',
 *   winnerEngine re-evaluates win conditions. TokenEngine notifies
 *   ludoEngine, which then checks with winnerEngine.
 *
 * 3. How it can later support tournaments, match history, statistics,
 *    and leaderboards:
 *
 * - Tournaments: createGameResult() provides complete game data that can
 *   be stored and aggregated across multiple matches. Rankings can be
 *   combined to determine tournament winners.
 *
 * - Match History: The detailed result objects from createGameResult()
 *   can be serialized and stored in a database. Each game record
 *   contains players, winners, rankings, and timing information.
 *
 * - Statistics: getWinnerStatistics() provides aggregated data like
 *   average progress, fastest player, and completion rates. This can
 *   feed into player performance analytics.
 *
 * - Leaderboards: Rankings from calculateRankings() can be combined
 *   across games to generate global leaderboards. The modular design
 *   allows adding ELO ratings or other ranking systems without
 *   modifying core game logic.
 *
 * - Replay/Analysis: The complete game result includes all necessary
 *   data to reconstruct game endings for post-game analysis or
 *   spectator review.
 */
