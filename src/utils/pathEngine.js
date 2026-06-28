import {
  RED_PATH,
  GREEN_PATH,
  YELLOW_PATH,
  BLUE_PATH,
  SAFE_CELLS,
  HOME_ENTRIES,
  HOME_PATHS,
  START_CELLS,
  WINNING_CELL,
  ALL_PATHS,
  getPathByColor,
  getHomePathByColor,
  getStartCellByColor,
  getWinningCellByColor,
} from "../constants/boardPaths";
import { PLAYER_COLORS } from "../constants/gameConstants";

const VALID_COLORS = Object.values(PLAYER_COLORS);

const validateColor = (color) => {
  if (!color || !VALID_COLORS.includes(color)) {
    throw new Error(
      `Invalid player color: ${color}. Must be one of: ${VALID_COLORS.join(", ")}`,
    );
  }
  return color;
};

const validateCellId = (cellId) => {
  if (!cellId || typeof cellId !== "string") {
    throw new Error(`Invalid cell ID: ${cellId}`);
  }
  return cellId;
};

export const getPlayerPath = (color) => {
  const validColor = validateColor(color);
  const path = getPathByColor(validColor);
  if (!path) {
    throw new Error(`No path found for color: ${validColor}`);
  }
  return path;
};

export const getStartCell = (color) => {
  const validColor = validateColor(color);
  const startCell = getStartCellByColor(validColor);
  if (!startCell) {
    throw new Error(`No start cell found for color: ${validColor}`);
  }
  return startCell;
};

export const getHomeEntry = (color) => {
  const validColor = validateColor(color);
  const entry = HOME_ENTRIES[validColor];
  if (!entry) {
    throw new Error(`No home entry found for color: ${validColor}`);
  }
  return entry;
};

export const getHomePath = (color) => {
  const validColor = validateColor(color);
  const homePath = getHomePathByColor(validColor);
  if (!homePath) {
    throw new Error(`No home path found for color: ${validColor}`);
  }
  return homePath;
};

export const getWinningCell = (color) => {
  const validColor = validateColor(color);
  const winningCell = getWinningCellByColor(validColor);
  if (!winningCell) {
    throw new Error(`No winning cell found for color: ${validColor}`);
  }
  return winningCell;
};

export const getNextCell = (color, currentCellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(currentCellId);

  const path = getPlayerPath(validColor);
  const index = path.indexOf(validCellId);

  if (index === -1) {
    throw new Error(
      `Cell ${validCellId} not found in path for color ${validColor}`,
    );
  }

  if (index === path.length - 1) {
    return null;
  }

  return path[index + 1];
};

export const getPreviousCell = (color, currentCellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(currentCellId);

  const path = getPlayerPath(validColor);
  const index = path.indexOf(validCellId);

  if (index === -1) {
    throw new Error(
      `Cell ${validCellId} not found in path for color ${validColor}`,
    );
  }

  if (index === 0) {
    return null;
  }

  return path[index - 1];
};

export const getCellIndex = (color, cellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(cellId);

  const path = getPlayerPath(validColor);
  const index = path.indexOf(validCellId);

  if (index === -1) {
    const homePath = getHomePath(validColor);
    const homeIndex = homePath.indexOf(validCellId);
    if (homeIndex !== -1) {
      return path.length + homeIndex;
    }
    return -1;
  }

  return index;
};

export const getRemainingSteps = (color, cellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(cellId);

  const path = getPlayerPath(validColor);
  const index = path.indexOf(validCellId);

  if (index === -1) {
    const homePath = getHomePath(validColor);
    const homeIndex = homePath.indexOf(validCellId);
    if (homeIndex !== -1) {
      return homePath.length - homeIndex - 1;
    }
    throw new Error(
      `Cell ${validCellId} not found in path or home path for color ${validColor}`,
    );
  }

  return path.length - index - 1 + getHomePath(validColor).length;
};

export const hasReachedHome = (color, cellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(cellId);

  const homePath = getHomePath(validColor);
  return homePath.includes(validCellId);
};

export const isSafeCell = (cellId) => {
  const validCellId = validateCellId(cellId);
  return SAFE_CELLS.includes(validCellId);
};

export const isHomePathCell = (color, cellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(cellId);

  const homePath = getHomePath(validColor);
  return homePath.includes(validCellId);
};

export const getPathLength = (color) => {
  const validColor = validateColor(color);
  const path = getPlayerPath(validColor);
  return path.length;
};

export const getTotalPathLength = (color) => {
  const validColor = validateColor(color);
  const path = getPlayerPath(validColor);
  const homePath = getHomePath(validColor);
  return path.length + homePath.length;
};

export const getCellsAtDistance = (color, startCellId, distance) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(startCellId);

  if (distance < 0) {
    throw new Error("Distance must be a non-negative number");
  }

  const path = getPlayerPath(validColor);
  const startIndex = path.indexOf(validCellId);

  if (startIndex === -1) {
    throw new Error(
      `Cell ${validCellId} not found in path for color ${validColor}`,
    );
  }

  const cells = [];
  const totalPathLength = getTotalPathLength(validColor);

  for (let i = 0; i < distance; i++) {
    const currentIndex = startIndex + i;
    if (currentIndex < path.length) {
      cells.push(path[currentIndex]);
    } else {
      const homeIndex = currentIndex - path.length;
      const homePath = getHomePath(validColor);
      if (homeIndex < homePath.length) {
        cells.push(homePath[homeIndex]);
      }
    }
  }

  return cells;
};

export const getPathSegment = (color, startCellId, endCellId) => {
  const validColor = validateColor(color);
  const validStartCellId = validateCellId(startCellId);
  const validEndCellId = validateCellId(endCellId);

  const path = getPlayerPath(validColor);
  const startIndex = path.indexOf(validStartCellId);
  const endIndex = path.indexOf(validEndCellId);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `Start or end cell not found in path for color ${validColor}`,
    );
  }

  if (startIndex > endIndex) {
    throw new Error("Start cell must be before end cell in the path");
  }

  return path.slice(startIndex, endIndex + 1);
};

export const isPathCell = (color, cellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(cellId);

  const path = getPlayerPath(validColor);
  return path.includes(validCellId);
};

export const getAllPathCells = (color) => {
  const validColor = validateColor(color);
  const path = getPlayerPath(validColor);
  const homePath = getHomePath(validColor);
  return [...path, ...homePath];
};

export const getSafeCells = () => {
  return [...SAFE_CELLS];
};

export const getColorFromCell = (cellId) => {
  const validCellId = validateCellId(cellId);

  for (const color of VALID_COLORS) {
    const path = getPlayerPath(color);
    if (path.includes(validCellId)) {
      return color;
    }
    const homePath = getHomePath(color);
    if (homePath.includes(validCellId)) {
      return color;
    }
  }

  return null;
};

export const isValidCellForColor = (color, cellId) => {
  const validColor = validateColor(color);
  const validCellId = validateCellId(cellId);

  const allCells = getAllPathCells(validColor);
  return allCells.includes(validCellId);
};
