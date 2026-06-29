// src/engine/pathEngine.js

/**
 * Path Engine Module
 *
 * Production-ready path calculation for Ludo game.
 * Handles all path-related calculations including movement, home entry, and finishing.
 * Pure JavaScript with no dependencies.
 */

import {
  OUTER_PATH,
  HOME_PATHS,
  START_CELLS,
  CENTER_CELL,
  getStartCell,
  getHomePath,
  getHomePositions,
  getPathCell,
  getNextPathIndex,
  getPathIndexByCoordinates,
  isSafeCell,
  getHomePathEntryIndex,
  getHomePathIndex,
  getPathColor,
  isInHomePath,
  getHomePathColor,
  COLOR_ORDER,
} from "../constants/boardPaths.js";

// ============================================================
// CONSTANTS
// ============================================================

const OUTER_PATH_LENGTH = OUTER_PATH.length;
const HOME_PATH_LENGTH = 6;
const TOTAL_PATH_LENGTH = OUTER_PATH_LENGTH + HOME_PATH_LENGTH;

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Validates a color.
 * @param {string} color - Player color
 * @throws {Error} If color is invalid
 */
const _validateColor = (color) => {
  if (!color || typeof color !== "string") {
    throw new Error("Color must be a non-empty string");
  }
  if (!COLOR_ORDER.includes(color)) {
    throw new Error(
      `Invalid color: ${color}. Must be one of: ${COLOR_ORDER.join(", ")}`,
    );
  }
};

/**
 * Validates a path index.
 * @param {number} index - Path index
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @throws {Error} If index is invalid
 */
const _validateIndex = (index, min = 0, max = OUTER_PATH_LENGTH - 1) => {
  if (typeof index !== "number" || isNaN(index)) {
    throw new Error("Index must be a number");
  }
  if (index < min || index > max) {
    throw new Error(`Index must be between ${min} and ${max}`);
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
};

/**
 * Gets the starting path index for a color.
 * @param {string} color - Player color
 * @returns {number} Starting path index
 */
const _getStartPathIndex = (color) => {
  const startCell = START_CELLS[color];
  if (!startCell) {
    throw new Error(`No start cell found for color: ${color}`);
  }
  return startCell.pathIndex;
};

/**
 * Gets the home entry path index for a color.
 * @param {string} color - Player color
 * @returns {number} Home entry path index
 */
const _getHomeEntryIndex = (color) => {
  const startIndex = _getStartPathIndex(color);
  // Home entry is 51 steps from the start (full loop minus 1)
  return (startIndex + OUTER_PATH_LENGTH - 1) % OUTER_PATH_LENGTH;
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Gets the complete path for a player color (outer path + home path).
 * @param {string} color - Player color
 * @returns {Array} Complete path array
 */
export const getPlayerPath = (color) => {
  _validateColor(color);

  const startIndex = _getStartPathIndex(color);
  const path = [];

  // Add outer path cells starting from the start position
  for (let i = 0; i < OUTER_PATH_LENGTH; i++) {
    const index = (startIndex + i) % OUTER_PATH_LENGTH;
    path.push({
      ...getPathCell(index),
      type: "outer",
      color: null,
    });
  }

  // Add home path cells
  const homePath = getHomePath(color);
  for (const cell of homePath) {
    path.push({
      ...cell,
      type: "home",
      color: color,
      isSafe: true,
    });
  }

  return path;
};

/**
 * Gets the next position after moving a certain number of steps.
 * @param {string} color - Player color
 * @param {number} currentIndex - Current path index
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Next position info
 */
export const getNextPosition = (color, currentIndex, diceValue) => {
  _validateColor(color);
  _validateIndex(currentIndex, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);
  _validateDiceValue(diceValue);

  const startIndex = _getStartPathIndex(color);
  const homeEntryIndex = _getHomeEntryIndex(color);

  // Check if token is on the outer path
  if (currentIndex < OUTER_PATH_LENGTH) {
    const newIndex = (currentIndex + diceValue) % OUTER_PATH_LENGTH;

    // Check if token can enter home path
    if (canEnterHome(color, currentIndex, diceValue)) {
      const homeIndex = currentIndex + diceValue - homeEntryIndex - 1;
      return {
        pathIndex: homeEntryIndex + homeIndex + 1,
        isHomePath: true,
        homeIndex: homeIndex,
        finished: homeIndex >= HOME_PATH_LENGTH - 1,
        cell: getHomePathCell(color, homeIndex),
      };
    }

    // Check if token passed the home entry and needs to wrap
    if (newIndex <= currentIndex && currentIndex < homeEntryIndex) {
      return {
        pathIndex: newIndex,
        isHomePath: false,
        homeIndex: null,
        finished: false,
        cell: getPathCell(newIndex),
      };
    }

    return {
      pathIndex: newIndex,
      isHomePath: false,
      homeIndex: null,
      finished: false,
      cell: getPathCell(newIndex),
    };
  }

  // Token is on home path
  const homePath = getHomePath(color);
  const homeIndex = currentIndex - OUTER_PATH_LENGTH;
  const newHomeIndex = homeIndex + diceValue;

  // Check if exact roll needed to finish
  if (newHomeIndex >= HOME_PATH_LENGTH) {
    return {
      pathIndex: currentIndex,
      isHomePath: true,
      homeIndex: homeIndex,
      finished: false,
      cell: homePath[homeIndex],
      exactRollRequired: true,
      stepsNeeded: HOME_PATH_LENGTH - homeIndex - 1,
      message: "Exact roll required to finish",
    };
  }

  const finished = newHomeIndex === HOME_PATH_LENGTH - 1;

  return {
    pathIndex: OUTER_PATH_LENGTH + newHomeIndex,
    isHomePath: true,
    homeIndex: newHomeIndex,
    finished: finished,
    cell: homePath[newHomeIndex],
    exactRollRequired: false,
    stepsNeeded: null,
  };
};

/**
 * Gets the previous position.
 * @param {string} color - Player color
 * @param {number} currentIndex - Current path index
 * @returns {Object} Previous position info
 */
export const getPreviousPosition = (color, currentIndex) => {
  _validateColor(color);
  _validateIndex(currentIndex, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);

  if (currentIndex < OUTER_PATH_LENGTH) {
    const prevIndex =
      (currentIndex - 1 + OUTER_PATH_LENGTH) % OUTER_PATH_LENGTH;
    return {
      pathIndex: prevIndex,
      isHomePath: false,
      cell: getPathCell(prevIndex),
    };
  }

  const homePath = getHomePath(color);
  const homeIndex = currentIndex - OUTER_PATH_LENGTH;
  const prevHomeIndex = homeIndex - 1;

  if (prevHomeIndex < 0) {
    // Move back to outer path
    const homeEntryIndex = _getHomeEntryIndex(color);
    return {
      pathIndex: homeEntryIndex,
      isHomePath: false,
      cell: getPathCell(homeEntryIndex),
    };
  }

  return {
    pathIndex: OUTER_PATH_LENGTH + prevHomeIndex,
    isHomePath: true,
    homeIndex: prevHomeIndex,
    cell: homePath[prevHomeIndex],
  };
};

/**
 * Gets the home entry path index for a color.
 * @param {string} color - Player color
 * @returns {number} Home entry path index
 */
export const getHomeEntryIndex = (color) => {
  _validateColor(color);
  return _getHomeEntryIndex(color);
};

/**
 * Checks if a position is a home entry.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {boolean} True if position is a home entry
 */
export const isHomeEntry = (color, index) => {
  _validateColor(color);
  _validateIndex(index);
  return index === _getHomeEntryIndex(color);
};

/**
 * Checks if a token can enter the home path.
 * @param {string} color - Player color
 * @param {number} currentIndex - Current path index
 * @param {number} diceValue - Dice value rolled
 * @returns {boolean} True if token can enter home path
 */
export const canEnterHome = (color, currentIndex, diceValue) => {
  _validateColor(color);
  _validateIndex(currentIndex);
  _validateDiceValue(diceValue);

  const homeEntryIndex = _getHomeEntryIndex(color);
  const startIndex = _getStartPathIndex(color);

  // Calculate distance to home entry
  let distanceToHomeEntry;
  if (currentIndex <= homeEntryIndex) {
    distanceToHomeEntry = homeEntryIndex - currentIndex;
  } else {
    distanceToHomeEntry = OUTER_PATH_LENGTH - currentIndex + homeEntryIndex;
  }

  // Can enter if dice value exactly reaches or passes home entry
  if (diceValue > distanceToHomeEntry) {
    const stepsAfterHome = diceValue - distanceToHomeEntry - 1;
    return stepsAfterHome < HOME_PATH_LENGTH;
  }

  return false;
};

/**
 * Gets the home path for a color.
 * @param {string} color - Player color
 * @returns {Array} Home path array
 */
export const getHomePath = (color) => {
  _validateColor(color);
  return getHomePath(color).map((cell) => ({ ...cell }));
};

/**
 * Gets a specific home path cell.
 * @param {string} color - Player color
 * @param {number} index - Home path index (0-5)
 * @returns {Object} Home path cell
 */
export const getHomePathCell = (color, index) => {
  _validateColor(color);
  if (typeof index !== "number" || index < 0 || index >= HOME_PATH_LENGTH) {
    throw new Error(
      `Home path index must be between 0 and ${HOME_PATH_LENGTH - 1}`,
    );
  }

  const homePath = getHomePath(color);
  return { ...homePath[index] };
};

/**
 * Gets the home path length.
 * @param {string} color - Player color
 * @returns {number} Home path length
 */
export const getHomePathLength = (color) => {
  _validateColor(color);
  return HOME_PATH_LENGTH;
};

/**
 * Checks if a path index is inside the home path.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {boolean} True if inside home path
 */
export const isInsideHomePath = (color, index) => {
  _validateColor(color);
  if (typeof index !== "number" || isNaN(index)) {
    return false;
  }
  return (
    index >= OUTER_PATH_LENGTH && index < OUTER_PATH_LENGTH + HOME_PATH_LENGTH
  );
};

/**
 * Checks if a token has finished based on its index.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {boolean} True if finished
 */
export const isFinished = (color, index) => {
  _validateColor(color);
  if (typeof index !== "number" || isNaN(index)) {
    return false;
  }
  return index === OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1;
};

/**
 * Calculates the target position for a token.
 * @param {Object} token - Token object
 * @param {number} diceValue - Dice value rolled
 * @returns {Object} Target position info
 */
export const calculateTargetPosition = (token, diceValue) => {
  _validateToken(token);
  _validateDiceValue(diceValue);

  if (token.state === "home") {
    // Can only leave home with a six
    if (diceValue === 6) {
      const startIndex = _getStartPathIndex(token.color);
      return {
        pathIndex: startIndex,
        isHomePath: false,
        state: "playing",
        cell: getPathCell(startIndex),
      };
    }
    return {
      pathIndex: null,
      isHomePath: false,
      state: "home",
      cell: null,
      message: "Need a six to leave home",
    };
  }

  if (token.state === "finished") {
    return {
      pathIndex: null,
      isHomePath: false,
      state: "finished",
      cell: null,
      message: "Token already finished",
    };
  }

  // Token is playing or in home path
  const currentIndex = token.pathIndex || 0;
  const result = getNextPosition(token.color, currentIndex, diceValue);

  return {
    pathIndex: result.pathIndex,
    isHomePath: result.isHomePath,
    state: result.finished
      ? "finished"
      : result.isHomePath
        ? "homePath"
        : "playing",
    cell: result.cell,
    finished: result.finished,
    exactRollRequired: result.exactRollRequired || false,
    stepsNeeded: result.stepsNeeded || null,
  };
};

/**
 * Gets the distance to finish for a token.
 * @param {Object} token - Token object
 * @returns {number} Distance to finish
 */
export const getDistanceToFinish = (token) => {
  _validateToken(token);

  if (token.state === "finished") {
    return 0;
  }

  if (token.state === "home") {
    return OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1;
  }

  const currentIndex = token.pathIndex || 0;
  const remainingSteps = getRemainingSteps(token);

  return remainingSteps;
};

/**
 * Gets the remaining steps to finish.
 * @param {Object} token - Token object
 * @returns {number} Remaining steps
 */
export const getRemainingSteps = (token) => {
  _validateToken(token);

  if (token.state === "finished") {
    return 0;
  }

  if (token.state === "home") {
    return OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1;
  }

  const currentIndex = token.pathIndex || 0;
  const totalLength = OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1;

  return totalLength - currentIndex;
};

/**
 * Gets the total path length for a color.
 * @param {string} color - Player color
 * @returns {number} Total path length
 */
export const getTotalPathLength = (color) => {
  _validateColor(color);
  return OUTER_PATH_LENGTH + HOME_PATH_LENGTH;
};

/**
 * Gets the start position for a color.
 * @param {string} color - Player color
 * @returns {Object} Start position
 */
export const getStartPosition = (color) => {
  _validateColor(color);
  return { ...START_CELLS[color] };
};

/**
 * Gets the winning position for a color.
 * @param {string} color - Player color
 * @returns {Object} Winning position
 */
export const getWinningPosition = (color) => {
  _validateColor(color);
  return {
    pathIndex: OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1,
    row: CENTER_CELL.row,
    col: CENTER_CELL.col,
    isSafe: true,
    isCenter: true,
  };
};

/**
 * Gets a cell by index for a specific color's path.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {Object} Cell object
 */
export const getCellByIndex = (color, index) => {
  _validateColor(color);
  _validateIndex(index, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);

  if (index < OUTER_PATH_LENGTH) {
    return { ...getPathCell(index) };
  }

  const homeIndex = index - OUTER_PATH_LENGTH;
  return { ...getHomePathCell(color, homeIndex) };
};

/**
 * Gets a cell ID by index.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {string} Cell ID
 */
export const getCellId = (color, index) => {
  _validateColor(color);
  _validateIndex(index, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);

  const cell = getCellByIndex(color, index);
  return `cell-${cell.row}-${cell.col}`;
};

/**
 * Gets a path index from a cell ID.
 * @param {string} color - Player color
 * @param {string} cellId - Cell ID
 * @returns {number|null} Path index or null
 */
export const getIndexFromCellId = (color, cellId) => {
  _validateColor(color);
  if (!cellId || typeof cellId !== "string") {
    throw new Error("Cell ID must be a non-empty string");
  }

  // Parse cell ID
  const match = cellId.match(/cell-(\d+)-(\d+)/);
  if (!match) {
    return null;
  }

  const row = parseInt(match[1]);
  const col = parseInt(match[2]);

  // Check outer path
  const pathIndex = getPathIndexByCoordinates(row, col);
  if (pathIndex !== null) {
    return pathIndex;
  }

  // Check home path
  const homePath = getHomePath(color);
  for (let i = 0; i < homePath.length; i++) {
    if (homePath[i].row === row && homePath[i].col === col) {
      return OUTER_PATH_LENGTH + i;
    }
  }

  return null;
};

/**
 * Gets the safe status of a path index.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {boolean} True if safe
 */
export const isPathSafe = (color, index) => {
  _validateColor(color);
  _validateIndex(index, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);

  if (index < OUTER_PATH_LENGTH) {
    return isSafeCell(index);
  }

  // Home path cells are always safe
  return true;
};

/**
 * Gets the color of a path index.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {string|null} Color or null
 */
export const getPathColorByIndex = (color, index) => {
  _validateColor(color);
  _validateIndex(index, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);

  if (index < OUTER_PATH_LENGTH) {
    return getPathColor(index);
  }

  return color;
};

/**
 * Validates a path position.
 * @param {string} color - Player color
 * @param {number} index - Path index
 * @returns {Object} Validation result
 */
export const validatePathPosition = (color, index) => {
  _validateColor(color);
  _validateIndex(index, 0, OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1);

  const isOuter = index < OUTER_PATH_LENGTH;
  const isHomePathCell = index >= OUTER_PATH_LENGTH;
  const homeIndex = isHomePathCell ? index - OUTER_PATH_LENGTH : null;
  const isFinished = index === OUTER_PATH_LENGTH + HOME_PATH_LENGTH - 1;
  const isSafe = isPathSafe(color, index);

  return {
    valid: true,
    isOuter: isOuter,
    isHomePath: isHomePathCell,
    homeIndex: homeIndex,
    isFinished: isFinished,
    isSafe: isSafe,
    color: color,
    cell: getCellByIndex(color, index),
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
