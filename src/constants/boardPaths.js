import { BOARD, PLAYER_COLORS } from "./gameConstants";

const { SIZE, HOME_SIZE, PATH_WIDTH, CENTER_SIZE } = BOARD;

const centerStart = (SIZE - CENTER_SIZE) / 2;
const centerEnd = (SIZE + CENTER_SIZE) / 2;
const pathStart = centerStart - 1;
const pathEnd = centerEnd;

const generateCellId = (row, col) => `cell-${row}-${col}`;

const generatePath = (startRow, startCol, direction, length) => {
  const path = [];
  let row = startRow;
  let col = startCol;

  for (let i = 0; i < length; i++) {
    path.push(generateCellId(row, col));
    if (direction === "right") col++;
    else if (direction === "left") col--;
    else if (direction === "down") row++;
    else if (direction === "up") row--;
  }

  return path;
};

const generateHomePath = (entryRow, entryCol, direction, length) => {
  const path = [];
  let row = entryRow;
  let col = entryCol;

  for (let i = 0; i < length; i++) {
    path.push(generateCellId(row, col));
    if (direction === "right") col++;
    else if (direction === "left") col--;
    else if (direction === "down") row++;
    else if (direction === "up") row--;
  }

  return path;
};

const RED_START = generateCellId(pathStart - 1, pathStart + 1);
const GREEN_START = generateCellId(pathStart + 1, pathEnd + 1);
const YELLOW_START = generateCellId(pathEnd + 1, pathStart + 1);
const BLUE_START = generateCellId(pathStart + 1, pathStart - 1);

const RED_MAIN_PATH = [
  RED_START,
  ...generatePath(pathStart - 2, pathStart + 1, "down", 1),
  ...generatePath(pathStart - 1, pathStart + 1, "right", 1),
  ...generatePath(pathStart, pathStart + 2, "down", 1),
  ...generatePath(pathStart + 1, pathStart + 2, "right", 1),
  ...generatePath(pathStart + 1, pathStart + 3, "down", 2),
  ...generatePath(pathStart + 1, pathStart + 4, "right", 2),
  ...generatePath(pathStart + 2, pathStart + 5, "down", 2),
  ...generatePath(pathStart + 3, pathStart + 5, "right", 2),
  ...generatePath(pathStart + 4, pathStart + 6, "down", 2),
  ...generatePath(pathStart + 5, pathStart + 6, "right", 1),
  ...generatePath(pathStart + 5, pathStart + 7, "down", 1),
  ...generatePath(pathStart + 6, pathStart + 7, "right", 1),
  ...generatePath(pathStart + 6, pathStart + 8, "down", 1),
  ...generatePath(pathStart + 7, pathStart + 8, "right", 1),
];

const GREEN_MAIN_PATH = [
  GREEN_START,
  ...generatePath(pathStart + 1, pathEnd + 2, "right", 1),
  ...generatePath(pathStart + 2, pathEnd + 1, "down", 1),
  ...generatePath(pathStart + 2, pathEnd + 2, "right", 1),
  ...generatePath(pathStart + 2, pathEnd + 1, "down", 2),
  ...generatePath(pathStart + 3, pathEnd + 1, "right", 2),
  ...generatePath(pathStart + 4, pathEnd + 1, "down", 2),
  ...generatePath(pathStart + 5, pathEnd + 2, "right", 2),
  ...generatePath(pathStart + 6, pathEnd + 2, "down", 1),
  ...generatePath(pathStart + 7, pathEnd + 2, "right", 1),
  ...generatePath(pathStart + 7, pathEnd + 1, "down", 1),
  ...generatePath(pathStart + 8, pathEnd + 1, "right", 1),
  ...generatePath(pathStart + 8, pathEnd, "down", 1),
  ...generatePath(pathStart + 7, pathEnd - 1, "right", 1),
];

const YELLOW_MAIN_PATH = [
  YELLOW_START,
  ...generatePath(pathEnd + 2, pathStart + 1, "up", 1),
  ...generatePath(pathEnd + 1, pathStart + 2, "left", 1),
  ...generatePath(pathEnd + 1, pathStart + 1, "up", 1),
  ...generatePath(pathEnd + 2, pathStart + 1, "left", 1),
  ...generatePath(pathEnd + 1, pathStart, "up", 2),
  ...generatePath(pathEnd, pathStart, "left", 2),
  ...generatePath(pathEnd - 1, pathStart, "up", 2),
  ...generatePath(pathEnd - 2, pathStart + 1, "left", 2),
  ...generatePath(pathEnd - 3, pathStart + 1, "up", 2),
  ...generatePath(pathEnd - 4, pathStart + 2, "left", 1),
  ...generatePath(pathEnd - 4, pathStart + 1, "up", 1),
  ...generatePath(pathEnd - 5, pathStart + 1, "left", 1),
  ...generatePath(pathEnd - 5, pathStart, "up", 1),
  ...generatePath(pathEnd - 6, pathStart, "left", 1),
];

const BLUE_MAIN_PATH = [
  BLUE_START,
  ...generatePath(pathStart + 1, pathStart - 2, "left", 1),
  ...generatePath(pathStart + 2, pathStart - 1, "up", 1),
  ...generatePath(pathStart + 2, pathStart - 2, "left", 1),
  ...generatePath(pathStart + 3, pathStart - 1, "up", 2),
  ...generatePath(pathStart + 4, pathStart - 1, "left", 2),
  ...generatePath(pathStart + 5, pathStart - 2, "up", 2),
  ...generatePath(pathStart + 6, pathStart - 2, "left", 2),
  ...generatePath(pathStart + 7, pathStart - 2, "up", 1),
  ...generatePath(pathStart + 8, pathStart - 2, "left", 1),
  ...generatePath(pathStart + 8, pathStart - 1, "up", 1),
  ...generatePath(pathStart + 7, pathStart - 1, "left", 1),
  ...generatePath(pathStart + 7, pathStart, "up", 1),
  ...generatePath(pathStart + 6, pathStart, "left", 1),
];

export const RED_PATH = Object.freeze(RED_MAIN_PATH);
export const GREEN_PATH = Object.freeze(GREEN_MAIN_PATH);
export const YELLOW_PATH = Object.freeze(YELLOW_MAIN_PATH);
export const BLUE_PATH = Object.freeze(BLUE_MAIN_PATH);

export const SAFE_CELLS = Object.freeze([
  generateCellId(pathStart - 1, pathStart + 1),
  generateCellId(pathStart + 1, pathEnd + 1),
  generateCellId(pathEnd + 1, pathStart + 1),
  generateCellId(pathStart + 1, pathStart - 1),
  ...generatePath(pathStart - 2, pathStart + 1, "down", 1),
  ...generatePath(pathStart + 1, pathEnd + 2, "right", 1),
  ...generatePath(pathEnd + 2, pathStart + 1, "up", 1),
  ...generatePath(pathStart + 1, pathStart - 2, "left", 1),
]);

export const HOME_ENTRIES = Object.freeze({
  [PLAYER_COLORS.RED]: generateCellId(pathStart - 1, pathStart + 1),
  [PLAYER_COLORS.GREEN]: generateCellId(pathStart + 1, pathEnd + 1),
  [PLAYER_COLORS.YELLOW]: generateCellId(pathEnd + 1, pathStart + 1),
  [PLAYER_COLORS.BLUE]: generateCellId(pathStart + 1, pathStart - 1),
});

export const HOME_PATHS = Object.freeze({
  [PLAYER_COLORS.RED]: Object.freeze(
    generateHomePath(pathStart - 1, pathStart + 2, "down", 2),
  ),
  [PLAYER_COLORS.GREEN]: Object.freeze(
    generateHomePath(pathStart + 2, pathEnd + 1, "right", 2),
  ),
  [PLAYER_COLORS.YELLOW]: Object.freeze(
    generateHomePath(pathEnd + 1, pathStart + 2, "up", 2),
  ),
  [PLAYER_COLORS.BLUE]: Object.freeze(
    generateHomePath(pathStart + 2, pathStart - 1, "left", 2),
  ),
});

export const START_CELLS = Object.freeze({
  [PLAYER_COLORS.RED]: RED_START,
  [PLAYER_COLORS.GREEN]: GREEN_START,
  [PLAYER_COLORS.YELLOW]: YELLOW_START,
  [PLAYER_COLORS.BLUE]: BLUE_START,
});

export const WINNING_CELL = Object.freeze({
  [PLAYER_COLORS.RED]: generateCellId(pathStart + 1, pathStart + 3),
  [PLAYER_COLORS.GREEN]: generateCellId(pathStart + 3, pathEnd + 1),
  [PLAYER_COLORS.YELLOW]: generateCellId(pathEnd + 1, pathStart + 3),
  [PLAYER_COLORS.BLUE]: generateCellId(pathStart + 3, pathStart - 1),
});

export const PATH_LENGTH = Object.freeze({
  [PLAYER_COLORS.RED]: RED_PATH.length,
  [PLAYER_COLORS.GREEN]: GREEN_PATH.length,
  [PLAYER_COLORS.YELLOW]: YELLOW_PATH.length,
  [PLAYER_COLORS.BLUE]: BLUE_PATH.length,
});

export const ALL_PATHS = Object.freeze({
  [PLAYER_COLORS.RED]: RED_PATH,
  [PLAYER_COLORS.GREEN]: GREEN_PATH,
  [PLAYER_COLORS.YELLOW]: YELLOW_PATH,
  [PLAYER_COLORS.BLUE]: BLUE_PATH,
});

export const PATH_MAP = Object.freeze({
  [PLAYER_COLORS.RED]: RED_PATH,
  [PLAYER_COLORS.GREEN]: GREEN_PATH,
  [PLAYER_COLORS.YELLOW]: YELLOW_PATH,
  [PLAYER_COLORS.BLUE]: BLUE_PATH,
});

export const getPathByColor = (color) => {
  const pathMap = {
    [PLAYER_COLORS.RED]: RED_PATH,
    [PLAYER_COLORS.GREEN]: GREEN_PATH,
    [PLAYER_COLORS.YELLOW]: YELLOW_PATH,
    [PLAYER_COLORS.BLUE]: BLUE_PATH,
  };
  return pathMap[color] || null;
};

export const getHomePathByColor = (color) => {
  const homePathMap = {
    [PLAYER_COLORS.RED]: HOME_PATHS[PLAYER_COLORS.RED],
    [PLAYER_COLORS.GREEN]: HOME_PATHS[PLAYER_COLORS.GREEN],
    [PLAYER_COLORS.YELLOW]: HOME_PATHS[PLAYER_COLORS.YELLOW],
    [PLAYER_COLORS.BLUE]: HOME_PATHS[PLAYER_COLORS.BLUE],
  };
  return homePathMap[color] || null;
};

export const getStartCellByColor = (color) => {
  const startMap = {
    [PLAYER_COLORS.RED]: RED_START,
    [PLAYER_COLORS.GREEN]: GREEN_START,
    [PLAYER_COLORS.YELLOW]: YELLOW_START,
    [PLAYER_COLORS.BLUE]: BLUE_START,
  };
  return startMap[color] || null;
};

export const getWinningCellByColor = (color) => {
  const winningMap = {
    [PLAYER_COLORS.RED]: WINNING_CELL[PLAYER_COLORS.RED],
    [PLAYER_COLORS.GREEN]: WINNING_CELL[PLAYER_COLORS.GREEN],
    [PLAYER_COLORS.YELLOW]: WINNING_CELL[PLAYER_COLORS.YELLOW],
    [PLAYER_COLORS.BLUE]: WINNING_CELL[PLAYER_COLORS.BLUE],
  };
  return winningMap[color] || null;
};
