// src/engine/gameEngine.js

/**
 * Game Engine Module
 *
 * Master engine orchestrating all Ludo game logic.
 * Coordinates all specialized engines and maintains game state.
 * Pure JavaScript with no dependencies.
 */

import {
  rollDice,
  getLastRoll,
  getConsecutiveSixes,
  resetConsecutiveSixes,
} from "./diceEngine.js";
import {
  initializeTurns,
  getCurrentPlayer,
  getCurrentPlayerIndex,
  nextTurn,
  giveExtraTurn,
  getTurnState,
  resetTurns,
  isPlayerTurn,
  getActivePlayers,
  getRemainingPlayers,
  getFinishedPlayers,
} from "./turnEngine.js";
import {
  getPlayerPath,
  getNextPosition,
  getHomeEntryIndex,
  canEnterHome,
  getHomePath,
  getHomePathLength,
  calculateTargetPosition,
  getDistanceToFinish,
  getRemainingSteps,
  getStartPosition,
  getWinningPosition,
  getCellByIndex,
  validatePathPosition,
} from "./pathEngine.js";
import {
  canLeaveHome,
  canMoveToken,
  canEnterHome as canEnterHomeValidator,
  canMoveInsideHome,
  canFinish,
  isMoveLegal,
  hasAnyLegalMove,
  getMovableTokens,
  validateMove,
} from "./moveValidator.js";
import {
  createPlayerTokens,
  createAllTokens,
  moveToken,
  moveTokenToStart,
  moveTokenOnBoard,
  moveInsideHomePath,
  finishToken,
  resetToken,
  sendTokenHome,
  getTokenPosition,
  getTokensByPlayer,
  getFinishedTokens,
  getActiveTokens,
  getHomeTokens,
  getMovableTokens as getMovableTokensFromEngine,
  updateToken,
  replaceToken,
  cloneToken,
  cloneTokens,
  getTokenCount,
  getFinishedTokenCount,
  getActiveTokenCount,
  getHomeTokenCount,
} from "./tokenEngine.js";
import {
  isSafeCell,
  canCapture,
  getCapturableTokens,
  captureToken,
  captureTokens,
  hasCapture,
  getTokensOnCell,
  isBlockade,
  canPassBlockade,
  isCellBlocked,
  getAllBlockades,
  validateCapture,
  performCapture,
} from "./captureEngine.js";
import {
  initializeWinnerState,
  isPlayerFinished,
  getFinishedTokenCount as getFinishedTokenCountWinner,
  updatePlayerFinish,
  assignRank,
  getPlayerRank,
  getWinner,
  getWinners,
  isGameOver,
  getRemainingPlayers as getRemainingPlayersWinner,
  getFinishedPlayers as getFinishedPlayersWinner,
  calculateLeaderboard,
  resetWinnerState,
  getWinnerState,
} from "./winnerEngine.js";
import {
  createAIPlayer,
  isAIPlayer,
  getDifficulty,
  setDifficulty,
  chooseBestMove,
  getPossibleMoves,
  evaluateMove,
  pickBestMove,
  pickRandomMove,
  resetAI,
} from "./aiEngine.js";
import {
  OUTER_PATH,
  HOME_PATHS,
  START_CELLS,
  getStartCell,
  getHomePath as getHomePathConstant,
  getHomePositions,
  getPathCell,
  getNextPathIndex,
  getPathIndexByCoordinates,
  isSafeCell as isSafeCellConstant,
  getHomePathEntryIndex,
  getHomePathIndex,
  getPathColor,
  isInHomePath,
  getHomePathColor,
  COLOR_ORDER,
  BOARD_SIZE,
  CENTER_CELL,
} from "../constants/boardPaths.js";

// ============================================================
// CONSTANTS
// ============================================================

const TOKENS_PER_PLAYER = 4;
const GAME_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  PAUSED: "paused",
  FINISHED: "finished",
};

const DEFAULT_SETTINGS = {
  maxPlayers: 4,
  turnTimeLimit: 30,
  gameMode: "Classic",
  diceCount: 1,
  isPrivate: false,
  aiDifficulty: "medium",
  allowExtraTurn: true,
  maxConsecutiveSixes: 3,
};

// ============================================================
// STATE
// ============================================================

let _gameState = null;
let _gameHistory = [];
let _historyIndex = -1;
let _gameInitialized = false;
let _isPaused = false;
let _aiTimeout = null;

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Creates the initial game state.
 * @param {Object} settings - Game settings
 * @returns {Object} Initial game state
 */
const _createInitialState = (settings = {}) => {
  return {
    players: [],
    tokens: [],
    currentPlayer: null,
    currentPlayerIndex: -1,
    turnNumber: 1,
    dice: null,
    winner: null,
    leaderboard: [],
    gameStatus: GAME_STATUS.WAITING,
    settings: { ...DEFAULT_SETTINGS, ...settings },
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    moveCount: 0,
    consecutiveSixes: 0,
  };
};

/**
 * Validates game state.
 * @param {Object} state - Game state to validate
 * @throws {Error} If state is invalid
 */
const _validateGameState = (state) => {
  if (!state || typeof state !== "object") {
    throw new Error("Game state must be an object");
  }
  if (!state.players || !Array.isArray(state.players)) {
    throw new Error("Game state must have players array");
  }
  if (!state.tokens || !Array.isArray(state.tokens)) {
    throw new Error("Game state must have tokens array");
  }
  if (
    !state.gameStatus ||
    !Object.values(GAME_STATUS).includes(state.gameStatus)
  ) {
    throw new Error("Invalid game status");
  }
};

/**
 * Validates token ID.
 * @param {string} tokenId - Token ID
 * @throws {Error} If token ID is invalid
 */
const _validateTokenId = (tokenId) => {
  if (!tokenId || typeof tokenId !== "string") {
    throw new Error("Token ID must be a non-empty string");
  }
};

/**
 * Validates player ID.
 * @param {string} playerId - Player ID
 * @throws {Error} If player ID is invalid
 */
const _validatePlayerId = (playerId) => {
  if (!playerId || typeof playerId !== "string") {
    throw new Error("Player ID must be a non-empty string");
  }
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
 * Checks if game is in a valid state for actions.
 * @param {string} status - Game status
 * @throws {Error} If game is not playing
 */
const _validateGamePlaying = (status) => {
  if (status !== GAME_STATUS.PLAYING) {
    throw new Error("Game is not in playing state");
  }
};

/**
 * Gets a token by ID.
 * @param {string} tokenId - Token ID
 * @returns {Object|null} Token or null
 */
const _getTokenById = (tokenId) => {
  if (!_gameState) return null;
  return _gameState.tokens.find((t) => t.id === tokenId) || null;
};

/**
 * Gets a player by ID.
 * @param {string} playerId - Player ID
 * @returns {Object|null} Player or null
 */
const _getPlayerById = (playerId) => {
  if (!_gameState) return null;
  return _gameState.players.find((p) => p.id === playerId) || null;
};

/**
 * Saves an action to history.
 * @param {string} type - Action type
 * @param {Object} data - Action data
 */
const _saveHistory = (type, data) => {
  if (!_gameState) return;

  const entry = {
    type: type,
    playerId: data.playerId || null,
    tokenId: data.tokenId || null,
    dice: data.dice || null,
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(_gameState)),
    data: { ...data },
  };

  // Remove any future history if we're not at the end
  if (_historyIndex < _gameHistory.length - 1) {
    _gameHistory = _gameHistory.slice(0, _historyIndex + 1);
  }

  _gameHistory.push(entry);
  _historyIndex = _gameHistory.length - 1;
  _gameState.history = _gameHistory.map((h) => ({ ...h }));
};

/**
 * Processes AI turn.
 * @param {Object} player - AI player
 * @param {number} diceValue - Dice value
 * @returns {Object} AI move result
 */
const _processAITurn = (player, diceValue) => {
  const move = chooseBestMove(player, _gameState.tokens, diceValue);

  if (!move.tokenId) {
    return {
      success: false,
      reason: "No valid moves",
    };
  }

  const result = _processMove(move.tokenId, player.id);
  return {
    success: true,
    result: result,
    move: move,
  };
};

/**
 * Processes a token move.
 * @param {string} tokenId - Token ID
 * @param {string} playerId - Player ID
 * @returns {Object} Move result
 */
const _processMove = (tokenId, playerId) => {
  const token = _getTokenById(tokenId);
  if (!token) {
    return {
      success: false,
      reason: "Token not found",
    };
  }

  if (token.playerId !== playerId) {
    return {
      success: false,
      reason: "Token does not belong to player",
    };
  }

  const diceValue = _gameState.dice?.value || 0;
  if (diceValue === 0) {
    return {
      success: false,
      reason: "No dice value",
    };
  }

  // Validate move
  const validation = validateMove(token, diceValue, _gameState.tokens);
  if (!validation.valid) {
    return {
      success: false,
      reason: validation.reason,
      code: validation.code,
    };
  }

  // Perform move
  const moveResult = moveToken(token, diceValue);
  if (!moveResult.success) {
    return {
      success: false,
      reason: moveResult.reason,
    };
  }

  // Update token in game state
  const updatedTokens = _gameState.tokens.map((t) =>
    t.id === tokenId ? { ...moveResult.token } : { ...t },
  );
  _gameState.tokens = updatedTokens;

  // Process capture
  const captureResult = processCapture(tokenId, _gameState.tokens);
  if (captureResult.success) {
    _gameState.tokens = captureResult.updatedTokens;
  }

  // Process winner
  const winnerResult = processWinner();
  if (winnerResult.success && winnerResult.winner) {
    _gameState.winner = winnerResult.winner;
    _gameState.gameStatus = GAME_STATUS.FINISHED;
  }

  // Save history
  _saveHistory("MOVE", {
    playerId: playerId,
    tokenId: tokenId,
    dice: diceValue,
    moveResult: moveResult,
    captureResult: captureResult,
  });

  return {
    success: true,
    moveResult: moveResult,
    captureResult: captureResult,
    winnerResult: winnerResult,
    updatedToken: moveResult.token,
  };
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Creates a new game.
 * @param {Object} settings - Game settings
 * @returns {Object} Game creation result
 */
export const createGame = (settings = {}) => {
  _gameState = _createInitialState(settings);
  _gameHistory = [];
  _historyIndex = -1;
  _gameInitialized = true;
  _isPaused = false;

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    message: "Game created successfully",
  };
};

/**
 * Starts the game.
 * @returns {Object} Start result
 */
export const startGame = () => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  if (_gameState.players.length < 2) {
    return {
      success: false,
      reason: "Need at least 2 players to start",
    };
  }

  _gameState.gameStatus = GAME_STATUS.PLAYING;
  _gameState.turnNumber = 1;
  _gameState.moveCount = 0;
  _gameState.consecutiveSixes = 0;

  // Initialize turn engine
  const turnResult = initializeTurns(_gameState.players);
  if (!turnResult.success) {
    return {
      success: false,
      reason: turnResult.reason,
    };
  }

  const currentPlayer = getCurrentPlayer();
  _gameState.currentPlayer = currentPlayer;
  _gameState.currentPlayerIndex = getCurrentPlayerIndex();

  // Initialize winner state
  initializeWinnerState(_gameState.players);

  // Save history
  _saveHistory("START_GAME", {
    players: _gameState.players.map((p) => ({ ...p })),
  });

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    message: "Game started successfully",
  };
};

/**
 * Pauses the game.
 * @returns {Object} Pause result
 */
export const pauseGame = () => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  if (_gameState.gameStatus !== GAME_STATUS.PLAYING) {
    return {
      success: false,
      reason: "Game is not playing",
    };
  }

  _gameState.gameStatus = GAME_STATUS.PAUSED;
  _isPaused = true;

  // Clear any AI timeout
  if (_aiTimeout) {
    clearTimeout(_aiTimeout);
    _aiTimeout = null;
  }

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    message: "Game paused",
  };
};

/**
 * Resumes the game.
 * @returns {Object} Resume result
 */
export const resumeGame = () => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  if (_gameState.gameStatus !== GAME_STATUS.PAUSED) {
    return {
      success: false,
      reason: "Game is not paused",
    };
  }

  _gameState.gameStatus = GAME_STATUS.PLAYING;
  _isPaused = false;

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    message: "Game resumed",
  };
};

/**
 * Ends the game.
 * @returns {Object} End result
 */
export const endGame = () => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  _gameState.gameStatus = GAME_STATUS.FINISHED;

  // Calculate final leaderboard
  const leaderboard = calculateLeaderboard(
    _gameState.players,
    _gameState.tokens,
  );
  _gameState.leaderboard = leaderboard;

  // Get winners
  const winnerResult = getWinner(_gameState.players);
  if (winnerResult.hasWinner) {
    _gameState.winner = winnerResult.winner;
  }

  // Save history
  _saveHistory("END_GAME", {
    winner: _gameState.winner,
    leaderboard: _gameState.leaderboard,
  });

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    message: "Game ended",
  };
};

/**
 * Resets the game.
 * @param {Object} options - Reset options
 * @returns {Object} Reset result
 */
export const resetGame = (options = {}) => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  const keepPlayers = options.keepPlayers || false;

  // Reset game state
  _gameState = _createInitialState(_gameState.settings);

  if (keepPlayers) {
    // Keep players but reset their tokens
    // This would need to re-create tokens
  }

  _gameHistory = [];
  _historyIndex = -1;
  _isPaused = false;

  if (_aiTimeout) {
    clearTimeout(_aiTimeout);
    _aiTimeout = null;
  }

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    message: "Game reset successfully",
  };
};

/**
 * Restarts the game.
 * @returns {Object} Restart result
 */
export const restartGame = () => {
  return resetGame({ keepPlayers: true });
};

/**
 * Gets the current game state.
 * @returns {Object} Game state
 */
export const getGameState = () => {
  if (!_gameState) {
    return null;
  }
  return JSON.parse(JSON.stringify(_gameState));
};

/**
 * Sets the game state.
 * @param {Object} state - New game state
 * @returns {Object} Set result
 */
export const setGameState = (state) => {
  _validateGameState(state);
  _gameState = JSON.parse(JSON.stringify(state));
  return {
    success: true,
    message: "Game state updated",
  };
};

/**
 * Rolls the dice for the current player.
 * @param {string} playerId - Player ID
 * @returns {Object} Dice roll result
 */
export const rollDice = (playerId) => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  _validateGamePlaying(_gameState.gameStatus);
  _validatePlayerId(playerId);

  // Check if it's the player's turn
  if (!isPlayerTurn(playerId)) {
    return {
      success: false,
      reason: "Not your turn",
    };
  }

  // Roll dice
  const diceResult = rollDice();
  _gameState.dice = diceResult;
  _gameState.moveCount++;
  _gameState.consecutiveSixes = diceResult.consecutiveSixes;

  // Save history
  _saveHistory("ROLL_DICE", {
    playerId: playerId,
    dice: diceResult,
  });

  return {
    success: true,
    dice: diceResult,
    gameState: JSON.parse(JSON.stringify(_gameState)),
  };
};

/**
 * Moves a token.
 * @param {string} tokenId - Token ID
 * @param {string} playerId - Player ID
 * @returns {Object} Move result
 */
export const moveToken = (tokenId, playerId) => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  _validateGamePlaying(_gameState.gameStatus);
  _validateTokenId(tokenId);
  _validatePlayerId(playerId);

  // Check if it's the player's turn
  if (!isPlayerTurn(playerId)) {
    return {
      success: false,
      reason: "Not your turn",
    };
  }

  // Check if dice has been rolled
  if (!_gameState.dice) {
    return {
      success: false,
      reason: "Roll the dice first",
    };
  }

  // Process move
  const result = _processMove(tokenId, playerId);

  if (!result.success) {
    return result;
  }

  // Check for extra turn
  const extraTurn =
    _gameState.dice.rolledSix &&
    _gameState.consecutiveSixes < 3 &&
    _gameState.settings.allowExtraTurn;

  if (extraTurn) {
    // Give extra turn to same player
    const turnResult = giveExtraTurn(_gameState.dice.value);
    if (turnResult.success) {
      return {
        success: true,
        moveResult: result,
        extraTurn: true,
        gameState: JSON.parse(JSON.stringify(_gameState)),
      };
    }
  }

  // Advance to next turn
  const turnResult = nextTurn();
  if (turnResult.success) {
    _gameState.currentPlayer = turnResult.currentPlayer;
    _gameState.currentPlayerIndex = turnResult.currentIndex;
    _gameState.turnNumber = turnResult.turnNumber;
  }

  // Check if AI turn
  if (turnResult.currentPlayer && isAIPlayer(turnResult.currentPlayer)) {
    // Schedule AI turn
    if (_aiTimeout) {
      clearTimeout(_aiTimeout);
    }
    _aiTimeout = setTimeout(() => {
      processAITurn();
    }, 500);
  }

  return {
    success: true,
    moveResult: result,
    extraTurn: false,
    turnResult: turnResult,
    gameState: JSON.parse(JSON.stringify(_gameState)),
  };
};

/**
 * Processes a capture.
 * @param {string} tokenId - Token that captured
 * @param {Array} tokens - All tokens
 * @returns {Object} Capture result
 */
export const processCapture = (tokenId, tokens) => {
  const token = _getTokenById(tokenId);
  if (!token) {
    return {
      success: false,
      reason: "Token not found",
    };
  }

  const captureResult = captureTokens(token, tokens);
  if (captureResult.success) {
    return {
      success: true,
      capturedTokens: captureResult.capturedTokens,
      updatedTokens: captureResult.updatedTokens,
      count: captureResult.capturedCount,
    };
  }

  return {
    success: false,
    reason: captureResult.reason,
  };
};

/**
 * Processes winner detection.
 * @returns {Object} Winner result
 */
export const processWinner = () => {
  const winnerResult = getWinner(_gameState.players);
  if (winnerResult.hasWinner) {
    return {
      success: true,
      winner: winnerResult.winner,
      allWinners: winnerResult.allWinners,
    };
  }

  return {
    success: false,
    reason: "No winner yet",
  };
};

/**
 * Undoes the last move.
 * @returns {Object} Undo result
 */
export const undoLastMove = () => {
  if (_historyIndex < 0) {
    return {
      success: false,
      reason: "No moves to undo",
    };
  }

  const entry = _gameHistory[_historyIndex];
  _historyIndex--;

  // Restore state from before the move
  if (_historyIndex >= 0) {
    const restoreState = _gameHistory[_historyIndex].state;
    _gameState = JSON.parse(JSON.stringify(restoreState));
  } else {
    // If no more history, restore initial state
    _gameState = _createInitialState(_gameState.settings);
  }

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    undoneAction: entry,
  };
};

/**
 * Redoes a move.
 * @returns {Object} Redo result
 */
export const redoMove = () => {
  if (_historyIndex >= _gameHistory.length - 1) {
    return {
      success: false,
      reason: "No moves to redo",
    };
  }

  _historyIndex++;
  const entry = _gameHistory[_historyIndex];
  _gameState = JSON.parse(JSON.stringify(entry.state));

  return {
    success: true,
    gameState: JSON.parse(JSON.stringify(_gameState)),
    redoneAction: entry,
  };
};

/**
 * Saves an action to history.
 * @param {string} type - Action type
 * @param {Object} data - Action data
 * @returns {Object} Save result
 */
export const saveHistory = (type, data) => {
  _saveHistory(type, data);
  return {
    success: true,
    message: "History saved",
  };
};

/**
 * Clears the history.
 * @returns {Object} Clear result
 */
export const clearHistory = () => {
  _gameHistory = [];
  _historyIndex = -1;
  _gameState.history = [];
  return {
    success: true,
    message: "History cleared",
  };
};

/**
 * Gets the history.
 * @param {number} limit - Number of entries to return
 * @returns {Array} History entries
 */
export const getHistory = (limit = null) => {
  if (limit !== null && typeof limit === "number") {
    return _gameHistory.slice(-limit).map((h) => ({ ...h }));
  }
  return _gameHistory.map((h) => ({ ...h }));
};

/**
 * Gets the current player.
 * @returns {Object|null} Current player
 */
export const getCurrentPlayer = () => {
  if (!_gameState) return null;
  return getCurrentPlayer();
};

/**
 * Gets tokens for the current player.
 * @returns {Array} Current player's tokens
 */
export const getCurrentPlayerTokens = () => {
  if (!_gameState) return [];
  const currentPlayer = getCurrentPlayer();
  if (!currentPlayer) return [];
  return getTokensByPlayer(_gameState.tokens, currentPlayer.id);
};

/**
 * Gets a player by ID.
 * @param {string} playerId - Player ID
 * @returns {Object|null} Player
 */
export const getPlayer = (playerId) => {
  return _getPlayerById(playerId);
};

/**
 * Gets all players.
 * @returns {Array} Players
 */
export const getPlayers = () => {
  if (!_gameState) return [];
  return _gameState.players.map((p) => ({ ...p }));
};

/**
 * Gets all tokens.
 * @returns {Array} Tokens
 */
export const getTokens = () => {
  if (!_gameState) return [];
  return _gameState.tokens.map((t) => ({ ...t }));
};

/**
 * Gets a token by ID.
 * @param {string} tokenId - Token ID
 * @returns {Object|null} Token
 */
export const getToken = (tokenId) => {
  return _getTokenById(tokenId);
};

/**
 * Checks if the game is over.
 * @returns {boolean} True if game is over
 */
export const isGameOver = () => {
  if (!_gameState) return false;
  return _gameState.gameStatus === GAME_STATUS.FINISHED;
};

/**
 * Checks if the game is paused.
 * @returns {boolean} True if paused
 */
export const isPaused = () => {
  return _isPaused;
};

/**
 * Checks if the game is running.
 * @returns {boolean} True if running
 */
export const isRunning = () => {
  if (!_gameState) return false;
  return _gameState.gameStatus === GAME_STATUS.PLAYING;
};

/**
 * Sets game settings.
 * @param {Object} settings - New settings
 * @returns {Object} Set result
 */
export const setSettings = (settings) => {
  if (!_gameState) {
    throw new Error("Game not initialized");
  }
  _gameState.settings = { ..._gameState.settings, ...settings };
  return {
    success: true,
    settings: { ..._gameState.settings },
  };
};

/**
 * Gets game settings.
 * @returns {Object} Settings
 */
export const getSettings = () => {
  if (!_gameState) return { ...DEFAULT_SETTINGS };
  return { ..._gameState.settings };
};

/**
 * Adds a player to the game.
 * @param {Object} player - Player to add
 * @returns {Object} Add result
 */
export const addPlayer = (player) => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  if (_gameState.players.length >= _gameState.settings.maxPlayers) {
    return {
      success: false,
      reason: "Maximum players reached",
    };
  }

  if (_gameState.players.some((p) => p.id === player.id)) {
    return {
      success: false,
      reason: "Player already exists",
    };
  }

  const newPlayer = { ...player };
  _gameState.players.push(newPlayer);

  // Create tokens for the player
  const tokens = createPlayerTokens(newPlayer.id, newPlayer.color);
  _gameState.tokens.push(...tokens);

  // Initialize winner state
  initializeWinnerState(_gameState.players);

  return {
    success: true,
    player: newPlayer,
    tokens: tokens,
    gameState: JSON.parse(JSON.stringify(_gameState)),
  };
};

/**
 * Removes a player from the game.
 * @param {string} playerId - Player ID
 * @returns {Object} Remove result
 */
export const removePlayer = (playerId) => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  const player = _getPlayerById(playerId);
  if (!player) {
    return {
      success: false,
      reason: "Player not found",
    };
  }

  // Remove player's tokens
  _gameState.tokens = _gameState.tokens.filter((t) => t.playerId !== playerId);
  _gameState.players = _gameState.players.filter((p) => p.id !== playerId);

  // Initialize winner state
  initializeWinnerState(_gameState.players);

  return {
    success: true,
    removedPlayer: player,
    gameState: JSON.parse(JSON.stringify(_gameState)),
  };
};

/**
 * Processes AI turn.
 * @returns {Object} AI turn result
 */
export const processAITurn = () => {
  if (!_gameInitialized) {
    throw new Error("Game not initialized");
  }

  _validateGamePlaying(_gameState.gameStatus);

  const currentPlayer = getCurrentPlayer();
  if (!currentPlayer) {
    return {
      success: false,
      reason: "No current player",
    };
  }

  if (!isAIPlayer(currentPlayer)) {
    return {
      success: false,
      reason: "Current player is not AI",
    };
  }

  // Roll dice for AI
  const diceResult = rollDice();
  _gameState.dice = diceResult;
  _gameState.moveCount++;
  _gameState.consecutiveSixes = diceResult.consecutiveSixes;

  // Process AI move
  const aiResult = _processAITurn(currentPlayer, diceResult.value);

  if (!aiResult.success) {
    // No valid moves, advance to next turn
    const turnResult = nextTurn();
    if (turnResult.success) {
      _gameState.currentPlayer = turnResult.currentPlayer;
      _gameState.currentPlayerIndex = turnResult.currentIndex;
      _gameState.turnNumber = turnResult.turnNumber;
    }
    return {
      success: false,
      reason: aiResult.reason,
    };
  }

  // Update state
  _gameState = { ..._gameState };

  // Check for extra turn
  const extraTurn =
    diceResult.rolledSix &&
    _gameState.consecutiveSixes < 3 &&
    _gameState.settings.allowExtraTurn;

  if (extraTurn) {
    giveExtraTurn(diceResult.value);
    // Schedule next AI turn
    if (_aiTimeout) {
      clearTimeout(_aiTimeout);
    }
    _aiTimeout = setTimeout(() => {
      processAITurn();
    }, 500);

    return {
      success: true,
      aiResult: aiResult,
      extraTurn: true,
      gameState: JSON.parse(JSON.stringify(_gameState)),
    };
  }

  // Advance to next turn
  const turnResult = nextTurn();
  if (turnResult.success) {
    _gameState.currentPlayer = turnResult.currentPlayer;
    _gameState.currentPlayerIndex = turnResult.currentIndex;
    _gameState.turnNumber = turnResult.turnNumber;
  }

  // Check if next player is AI
  if (turnResult.currentPlayer && isAIPlayer(turnResult.currentPlayer)) {
    if (_aiTimeout) {
      clearTimeout(_aiTimeout);
    }
    _aiTimeout = setTimeout(() => {
      processAITurn();
    }, 500);
  }

  return {
    success: true,
    aiResult: aiResult,
    extraTurn: false,
    turnResult: turnResult,
    gameState: JSON.parse(JSON.stringify(_gameState)),
  };
};

/**
 * Checks if it's an AI player's turn.
 * @returns {boolean} True if AI turn
 */
export const isAITurn = () => {
  if (!_gameState) return false;
  const currentPlayer = getCurrentPlayer();
  return currentPlayer ? isAIPlayer(currentPlayer) : false;
};

/**
 * Runs an automatic AI turn.
 * @returns {Object} AI turn result
 */
export const runAutomaticAITurn = () => {
  return processAITurn();
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
