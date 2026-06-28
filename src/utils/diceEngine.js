import { DICE } from '../constants/gameConstants';

export const DEFAULT_DICE_STATE = Object.freeze({
  value: DICE.DEFAULT_VALUE,
  values: [DICE.DEFAULT_VALUE],
  total: DICE.DEFAULT_VALUE,
  isRolling: false,
  isExtraTurn: false,
  isSix: false,
  allSixes: false,
  consecutiveSixes: 0,
  history: [],
  statistics: {
    totalRolls: 0,
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    },
    sixCount: 0,
    extraTurnCount: 0
  }
});

export const generateRandomValue = (min = DICE.MIN_VALUE, max = DICE.MAX_VALUE) => {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error('Min and max values must be integers');
  }

  if (min < 1) {
    throw new Error('Min value must be at least 1');
  }

  if (max > DICE.MAX_VALUE) {
    throw new Error(`Max value cannot exceed ${DICE.MAX_VALUE}`);
  }

  if (min > max) {
    throw new Error('Min value cannot be greater than max value');
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const rollDice = (diceCount = 1, diceState = DEFAULT_DICE_STATE) => {
  if (!Number.isInteger(diceCount) || diceCount < 1) {
    throw new Error('Dice count must be a positive integer');
  }

  const values = [];
  for (let i = 0; i < diceCount; i++) {
    values.push(generateRandomValue());
  }

  const total = values.reduce((sum, val) => sum + val, 0);
  const isSix = values.some(val => val === DICE.EXTRA_TURN_VALUE);
  const allSixes = values.every(val => val === DICE.EXTRA_TURN_VALUE);
  const isExtraTurn = isSix;

  const consecutiveSixes = isSix ? (diceState?.consecutiveSixes || 0) + 1 : 0;
  const shouldResetTurn = consecutiveSixes >= DICE.MAX_CONSECUTIVE_SIXES;

  const newDiceState = {
    value: total,
    values,
    total,
    isRolling: false,
    isExtraTurn: isExtraTurn && !shouldResetTurn,
    isSix,
    allSixes,
    consecutiveSixes: shouldResetTurn ? 0 : consecutiveSixes,
    history: [...(diceState?.history || []), { values, total, timestamp: Date.now() }],
    statistics: {
      totalRolls: (diceState?.statistics?.totalRolls || 0) + 1,
      distribution: { ...(diceState?.statistics?.distribution || DEFAULT_DICE_STATE.statistics.distribution) },
      sixCount: (diceState?.statistics?.sixCount || 0) + (isSix ? 1 : 0),
      extraTurnCount: (diceState?.statistics?.extraTurnCount || 0) + (isExtraTurn && !shouldResetTurn ? 1 : 0)
    }
  };

  values.forEach(val => {
    newDiceState.statistics.distribution[val] = (newDiceState.statistics.distribution[val] || 0) + 1;
  });

  return newDiceState;
};

export const isValidDiceValue = (value) => {
  return Number.isInteger(value) && value >= DICE.MIN_VALUE && value <= DICE.MAX_VALUE;
};

export const shouldGrantExtraTurn = (diceState, diceValue = null) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  const value = diceValue !== null ? diceValue : diceState.value;

  if (!isValidDiceValue(value)) {
    throw new Error(`Invalid dice value: ${value}`);
  }

  const isSix = value === DICE.EXTRA_TURN_VALUE;
  const consecutiveSixes = isSix ? (diceState.consecutiveSixes || 0) + 1 : 0;

  if (consecutiveSixes >= DICE.MAX_CONSECUTIVE_SIXES) {
    return false;
  }

  return isSix;
};

export const canReleaseToken = (diceValue) => {
  if (!isValidDiceValue(diceValue)) {
    throw new Error(`Invalid dice value: ${diceValue}`);
  }

  return diceValue === DICE.EXTRA_TURN_VALUE;
};

export const getDiceStatistics = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  const stats = diceState.statistics || DEFAULT_DICE_STATE.statistics;
  const totalRolls = stats.totalRolls || 0;

  if (totalRolls === 0) {
    return {
      totalRolls: 0,
      average: 0,
      distribution: stats.distribution,
      sixPercentage: 0,
      extraTurnPercentage: 0,
      mostCommonValue: null,
      leastCommonValue: null
    };
  }

  const distribution = stats.distribution || DEFAULT_DICE_STATE.statistics.distribution;
  const sixCount = stats.sixCount || 0;
  const extraTurnCount = stats.extraTurnCount || 0;

  const totalSum = Object.entries(distribution).reduce(
    (sum, [value, count]) => sum + parseInt(value, 10) * count,
    0
  );

  const average = totalSum / totalRolls;
  const sixPercentage = (sixCount / totalRolls) * 100;
  const extraTurnPercentage = (extraTurnCount / totalRolls) * 100;

  const distributionArray = Object.entries(distribution).map(([value, count]) => ({
    value: parseInt(value, 10),
    count,
    percentage: (count / totalRolls) * 100
  }));

  const sorted = [...distributionArray].sort((a, b) => b.count - a.count);
  const mostCommonValue = sorted.length > 0 ? sorted[0].value : null;
  const leastCommonValue = sorted.length > 0 ? sorted[sorted.length - 1].value : null;

  return {
    totalRolls,
    average,
    distribution: distributionArray,
    sixPercentage,
    extraTurnPercentage,
    mostCommonValue,
    leastCommonValue
  };
};

export const resetDiceState = (diceState = null) => {
  if (diceState) {
    return {
      ...diceState,
      value: DICE.DEFAULT_VALUE,
      values: [DICE.DEFAULT_VALUE],
      total: DICE.DEFAULT_VALUE,
      isRolling: false,
      isExtraTurn: false,
      isSix: false,
      allSixes: false,
      consecutiveSixes: 0,
      history: [],
      statistics: {
        totalRolls: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0
        },
        sixCount: 0,
        extraTurnCount: 0
      }
    };
  }

  return { ...DEFAULT_DICE_STATE };
};

export const getDiceValue = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.value || DICE.DEFAULT_VALUE;
};

export const getDiceTotal = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.total || DICE.DEFAULT_VALUE;
};

export const getDiceValues = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.values || [DICE.DEFAULT_VALUE];
};

export const isRolling = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.isRolling || false;
};

export const getConsecutiveSixes = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.consecutiveSixes || 0;
};

export const hasExtraTurn = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.isExtraTurn || false;
};

export const rollDiceForTesting = (diceCount = 1, fixedValues = null) => {
  if (!Number.isInteger(diceCount) || diceCount < 1) {
    throw new Error('Dice count must be a positive integer');
  }

  if (fixedValues) {
    if (!Array.isArray(fixedValues)) {
      throw new Error('Fixed values must be an array');
    }

    if (fixedValues.length !== diceCount) {
      throw new Error(`Fixed values length must match dice count (${diceCount})`);
    }

    const values = fixedValues.map(val => {
      if (!isValidDiceValue(val)) {
        throw new Error(`Invalid dice value: ${val}`);
      }
      return val;
    });

    const total = values.reduce((sum, val) => sum + val, 0);
    const isSix = values.some(val => val === DICE.EXTRA_TURN_VALUE);
    const allSixes = values.every(val => val === DICE.EXTRA_TURN_VALUE);
    const isExtraTurn = isSix;

    return {
      value: total,
      values,
      total,
      isRolling: false,
      isExtraTurn,
      isSix,
      allSixes,
      consecutiveSixes: isSix ? 1 : 0,
      history: [],
      statistics: {
        totalRolls: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0
        },
        sixCount: 0,
        extraTurnCount: 0
      }
    };
  }

  return rollDice(diceCount);
};

export const getDiceHistory = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return diceState.history || [];
};

export const clearDiceHistory = (diceState) => {
  if (!diceState) {
    throw new Error('Dice state is required');
  }

  return {
    ...diceState,
    history: []
  };
};