// src/engine/diceEngine.js

/**
 * Dice Engine Module
 *
 * Production-ready dice logic for Ludo game.
 * Handles dice rolling, tracking, and validation.
 * Pure JavaScript with no dependencies.
 */

// ============================================================
// CONSTANTS
// ============================================================

const MIN_DICE_VALUE = 1;
const MAX_DICE_VALUE = 6;
const SIX_VALUE = 6;
const MAX_CONSECUTIVE_SIXES = 3;
const DEFAULT_HISTORY_LIMIT = 100;

// ============================================================
// STATE
// ============================================================

let _lastRoll = null;
let _rollHistory = [];
let _consecutiveSixes = 0;
let _randomGenerator = null;

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Gets the random number generator.
 * Uses Math.random() as fallback if no custom generator is set.
 * @returns {Function} Random number generator function
 */
const _getRandomGenerator = () => {
  if (_randomGenerator && typeof _randomGenerator === "function") {
    return _randomGenerator;
  }
  return Math.random;
};

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Function} randomFn - Random number generator
 * @returns {number} Random integer
 */
const _randomInt = (min, max, randomFn) => {
  return Math.floor(randomFn() * (max - min + 1)) + min;
};

/**
 * Validates a dice value.
 * @param {number} value - Dice value to validate
 * @throws {Error} If value is invalid
 */
const _validateDiceValue = (value) => {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error("Dice value must be a number");
  }
  if (value < MIN_DICE_VALUE || value > MAX_DICE_VALUE) {
    throw new Error(
      `Dice value must be between ${MIN_DICE_VALUE} and ${MAX_DICE_VALUE}`,
    );
  }
};

/**
 * Validates a roll history array.
 * @param {Array} history - Roll history to validate
 * @throws {Error} If history is invalid
 */
const _validateHistory = (history) => {
  if (!Array.isArray(history)) {
    throw new Error("Roll history must be an array");
  }
};

// ============================================================
// PUBLIC FUNCTIONS
// ============================================================

/**
 * Rolls the dice.
 * @param {Object} options - Roll options
 * @param {Function} options.randomGenerator - Custom random generator
 * @param {number} options.historyLimit - Maximum history length
 * @returns {Object} Roll result
 */
export const rollDice = (options = {}) => {
  const randomFn = options.randomGenerator || _getRandomGenerator();
  const historyLimit = options.historyLimit || DEFAULT_HISTORY_LIMIT;

  // Generate dice value
  const value = _randomInt(MIN_DICE_VALUE, MAX_DICE_VALUE, randomFn);

  // Update consecutive sixes
  if (value === SIX_VALUE) {
    _consecutiveSixes += 1;
  } else {
    _consecutiveSixes = 0;
  }

  // Create roll result
  const rolledSix = value === SIX_VALUE;
  const extraTurn = rolledSix && _consecutiveSixes < MAX_CONSECUTIVE_SIXES;
  const isThreeConsecutive = _consecutiveSixes >= MAX_CONSECUTIVE_SIXES;

  const result = {
    value: value,
    rolledSix: rolledSix,
    consecutiveSixes: _consecutiveSixes,
    extraTurn: extraTurn,
    isThreeConsecutiveSixes: isThreeConsecutive,
    timestamp: Date.now(),
  };

  // Update state
  _lastRoll = result;
  _rollHistory.push(result);

  // Trim history if limit is exceeded
  if (_rollHistory.length > historyLimit) {
    _rollHistory = _rollHistory.slice(-historyLimit);
  }

  return result;
};

/**
 * Gets the last roll result.
 * @returns {Object|null} Last roll result or null if no rolls
 */
export const getLastRoll = () => {
  return _lastRoll ? { ..._lastRoll } : null;
};

/**
 * Gets the roll history.
 * @param {number} limit - Maximum number of history items to return
 * @returns {Array} Array of roll results
 */
export const getRollHistory = (limit = null) => {
  if (limit !== null) {
    if (typeof limit !== "number" || limit < 0) {
      throw new Error("History limit must be a non-negative number");
    }
    return _rollHistory.slice(-limit).map((roll) => ({ ...roll }));
  }
  return _rollHistory.map((roll) => ({ ...roll }));
};

/**
 * Clears the roll history.
 * @returns {Object} Result of clear operation
 */
export const clearRollHistory = () => {
  const oldLength = _rollHistory.length;
  _rollHistory = [];
  _consecutiveSixes = 0;
  _lastRoll = null;

  return {
    success: true,
    clearedCount: oldLength,
    message: "Roll history cleared successfully",
  };
};

/**
 * Checks if a value is a six.
 * @param {number} value - Dice value to check
 * @returns {boolean} True if value is six
 */
export const isSix = (value) => {
  _validateDiceValue(value);
  return value === SIX_VALUE;
};

/**
 * Checks if there are three consecutive sixes in the history.
 * @param {Array} history - Roll history to check
 * @param {number} count - Number of consecutive sixes to check for
 * @returns {boolean} True if three consecutive sixes exist
 */
export const isThreeConsecutiveSixes = (
  history,
  count = MAX_CONSECUTIVE_SIXES,
) => {
  _validateHistory(history);

  if (history.length < count) {
    return false;
  }

  // Check the last 'count' rolls
  const lastRolls = history.slice(-count);
  return lastRolls.every((roll) => {
    const value = roll.value !== undefined ? roll.value : roll;
    return value === SIX_VALUE;
  });
};

/**
 * Resets the consecutive sixes counter.
 * @returns {Object} Result of reset operation
 */
export const resetConsecutiveSixes = () => {
  const oldCount = _consecutiveSixes;
  _consecutiveSixes = 0;

  return {
    success: true,
    oldCount: oldCount,
    newCount: 0,
    message: "Consecutive sixes counter reset",
  };
};

/**
 * Sets a custom random generator function.
 * Useful for testing deterministic dice rolls.
 * @param {Function} fn - Random generator function (returns 0-1)
 * @throws {Error} If function is invalid
 */
export const setRandomGenerator = (fn) => {
  if (fn !== null && typeof fn !== "function") {
    throw new Error("Random generator must be a function or null");
  }
  if (fn && typeof fn() !== "number") {
    throw new Error("Random generator must return a number");
  }
  _randomGenerator = fn;
};

/**
 * Gets the current random generator function.
 * @returns {Function|null} Random generator function
 */
export const getRandomGenerator = () => {
  return _randomGenerator;
};

/**
 * Gets the current consecutive sixes count.
 * @returns {number} Consecutive sixes count
 */
export const getConsecutiveSixes = () => {
  return _consecutiveSixes;
};

/**
 * Resets the entire dice engine state.
 * @returns {Object} Result of reset operation
 */
export const resetDiceEngine = () => {
  _lastRoll = null;
  _rollHistory = [];
  _consecutiveSixes = 0;

  return {
    success: true,
    message: "Dice engine reset successfully",
  };
};

/**
 * Gets the current dice engine state.
 * @returns {Object} Current state snapshot
 */
export const getDiceState = () => {
  return {
    lastRoll: _lastRoll ? { ..._lastRoll } : null,
    rollHistory: _rollHistory.map((roll) => ({ ...roll })),
    consecutiveSixes: _consecutiveSixes,
    historyLength: _rollHistory.length,
    randomGeneratorSet: _randomGenerator !== null,
  };
};

// ============================================================
// EXPORT
// ============================================================

// All functions are exported as named exports above.
// This module has no default export.
