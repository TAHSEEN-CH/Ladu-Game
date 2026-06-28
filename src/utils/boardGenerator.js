import {
  BOARD,
  PLAYER_COLORS,
  CELL_TYPES,
  PLAYER_COLORS_LIST
} from '../constants/gameConstants';

const createCell = (row, col, type, color = null, isSafe = false) => ({
  id: `cell-${row}-${col}`,
  row,
  col,
  type,
  color,
  isSafe,
  isPlayable: type !== CELL_TYPES.EMPTY,
  isHome: type === CELL_TYPES.HOME,
  isHomePath: type === CELL_TYPES.HOME_PATH,
  isCenter: type === CELL_TYPES.CENTER,
  token: null
});

export const generateBoard = (customConfig = null) => {
  const board = {
    cells: [],
    size: BOARD.SIZE,
    homeSize: BOARD.HOME_SIZE,
    pathWidth: BOARD.PATH_WIDTH,
    centerSize: BOARD.CENTER_SIZE
  };

  const config = customConfig || {
    size: BOARD.SIZE,
    homeSize: BOARD.HOME_SIZE,
    pathWidth: BOARD.PATH_WIDTH,
    centerSize: BOARD.CENTER_SIZE
  };

  for (let row = 0; row < config.size; row++) {
    for (let col = 0; col < config.size; col++) {
      let cell = generateCell(row, col, config);
      board.cells.push(cell);
    }
  }

  return board;
};

export const generateCell = (row, col, config) => {
  const { size, homeSize, pathWidth, centerSize } = config;

  if (row < homeSize && col < homeSize) {
    return createCell(row, col, CELL_TYPES.HOME, PLAYER_COLORS.RED);
  }

  if (row < homeSize && col >= size - homeSize) {
    return createCell(row, col, CELL_TYPES.HOME, PLAYER_COLORS.GREEN);
  }

  if (row >= size - homeSize && col < homeSize) {
    return createCell(row, col, CELL_TYPES.HOME, PLAYER_COLORS.YELLOW);
  }

  if (row >= size - homeSize && col >= size - homeSize) {
    return createCell(row, col, CELL_TYPES.HOME, PLAYER_COLORS.BLUE);
  }

  const centerStart = (size - centerSize) / 2;
  const centerEnd = (size + centerSize) / 2;

  if (row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd) {
    return createCell(row, col, CELL_TYPES.CENTER, null, true);
  }

  const pathStart = centerStart - 1;
  const pathEnd = centerEnd;

  const isTopPath = row === pathStart && col >= pathStart && col <= pathEnd;
  const isBottomPath = row === pathEnd && col >= pathStart && col <= pathEnd;
  const isLeftPath = col === pathStart && row >= pathStart && row <= pathEnd;
  const isRightPath = col === pathEnd && row >= pathStart && row <= pathEnd;

  if (isTopPath || isBottomPath || isLeftPath || isRightPath) {
    return createCell(row, col, CELL_TYPES.PATH, null, false);
  }

  const topHomePath = row > pathStart && row < pathEnd && col === pathStart + 1;
  const bottomHomePath = row > pathStart && row < pathEnd && col === pathEnd - 1;
  const leftHomePath = col > pathStart && col < pathEnd && row === pathStart + 1;
  const rightHomePath = col > pathStart && col < pathEnd && row === pathEnd - 1;

  if (topHomePath || bottomHomePath || leftHomePath || rightHomePath) {
    return createCell(row, col, CELL_TYPES.HOME_PATH, null, true);
  }

  const isRedPath = row === pathStart - 2 && col === pathStart + 1;
  const isGreenPath = col === pathEnd + 2 && row === pathStart + 1;
  const isYellowPath = row === pathEnd + 2 && col === pathStart + 1;
  const isBluePath = col === pathStart - 2 && row === pathStart + 1;

  if (isRedPath || isGreenPath || isYellowPath || isBluePath) {
    return createCell(row, col, CELL_TYPES.HOME_PATH, null, true);
  }

  return createCell(row, col, CELL_TYPES.EMPTY);
};

export const generateHomeAreas = (config) => {
  const { size, homeSize } = config;
  const homes = [];

  const homePositions = [
    { color: PLAYER_COLORS.RED, rowStart: 0, colStart: 0 },
    { color: PLAYER_COLORS.GREEN, rowStart: 0, colStart: size - homeSize },
    { color: PLAYER_COLORS.YELLOW, rowStart: size - homeSize, colStart: 0 },
    { color: PLAYER_COLORS.BLUE, rowStart: size - homeSize, colStart: size - homeSize }
  ];

  homePositions.forEach(({ color, rowStart, colStart }) => {
    const cells = [];
    for (let row = rowStart; row < rowStart + homeSize; row++) {
      for (let col = colStart; col < colStart + homeSize; col++) {
        cells.push(createCell(row, col, CELL_TYPES.HOME, color));
      }
    }
    homes.push({
      color,
      cells,
      rowStart,
      colStart
    });
  });

  return homes;
};

export const generateMainPath = (config) => {
  const { size, pathWidth, centerSize } = config;
  const centerStart = (size - centerSize) / 2;
  const centerEnd = (size + centerSize) / 2;
  const pathStart = centerStart - 1;
  const pathEnd = centerEnd;

  const pathCells = [];

  for (let i = pathStart; i <= pathEnd; i++) {
    pathCells.push(createCell(pathStart, i, CELL_TYPES.PATH));
    pathCells.push(createCell(pathEnd, i, CELL_TYPES.PATH));
    pathCells.push(createCell(i, pathStart, CELL_TYPES.PATH));
    pathCells.push(createCell(i, pathEnd, CELL_TYPES.PATH));
  }

  return pathCells;
};

export const generateHomePaths = (config) => {
  const { size, centerSize } = config;
  const centerStart = (size - centerSize) / 2;
  const centerEnd = (size + centerSize) / 2;
  const pathStart = centerStart - 1;
  const pathEnd = centerEnd;

  const homePathCells = [];

  for (let row = pathStart + 1; row < pathEnd; row++) {
    homePathCells.push(createCell(row, pathStart + 1, CELL_TYPES.HOME_PATH, null, true));
    homePathCells.push(createCell(row, pathEnd - 1, CELL_TYPES.HOME_PATH, null, true));
  }

  for (let col = pathStart + 1; col < pathEnd; col++) {
    homePathCells.push(createCell(pathStart + 1, col, CELL_TYPES.HOME_PATH, null, true));
    homePathCells.push(createCell(pathEnd - 1, col, CELL_TYPES.HOME_PATH, null, true));
  }

  return homePathCells;
};

export const generateSafeCells = (config) => {
  const { size, centerSize } = config;
  const centerStart = (size - centerSize) / 2;
  const centerEnd = (size + centerSize) / 2;
  const pathStart = centerStart - 1;
  const pathEnd = centerEnd;

  const safeCells = [];

  const safePositions = [
    { row: pathStart - 1, col: pathStart + 1 },
    { row: pathStart + 1, col: pathEnd + 1 },
    { row: pathEnd + 1, col: pathStart + 1 },
    { row: pathStart + 1, col: pathStart - 1 }
  ];

  safePositions.forEach(({ row, col }) => {
    const cell = createCell(row, col, CELL_TYPES.SAFE, null, true);
    cell.isSafe = true;
    safeCells.push(cell);
  });

  return safeCells;
};

export const generateCenterArea = (config) => {
  const { size, centerSize } = config;
  const centerStart = (size - centerSize) / 2;
  const centerEnd = (size + centerSize) / 2;

  const centerCells = [];

  for (let row = centerStart; row < centerEnd; row++) {
    for (let col = centerStart; col < centerEnd; col++) {
      centerCells.push(createCell(row, col, CELL_TYPES.CENTER, null, true));
    }
  }

  return centerCells;
};

export const getCellById = (cellId, board) => {
  if (!cellId) {
    throw new Error('Cell ID is required');
  }

  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  return board.cells.find(cell => cell.id === cellId) || null;
};

export const getCellByCoordinates = (row, col, board) => {
  if (row === undefined || row === null || col === undefined || col === null) {
    throw new Error('Row and column are required');
  }

  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  const cellId = `cell-${row}-${col}`;
  return getCellById(cellId, board);
};

export const getNeighborCells = (row, col, board, includeDiagonals = false) => {
  if (row === undefined || row === null || col === undefined || col === null) {
    throw new Error('Row and column are required');
  }

  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  const neighbors = [];
  const directions = includeDiagonals
    ? [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ]
    : [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];

  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    if (newRow >= 0 && newRow < board.size && newCol >= 0 && newCol < board.size) {
      const cell = getCellByCoordinates(newRow, newCol, board);
      if (cell) {
        neighbors.push(cell);
      }
    }
  });

  return neighbors;
};

export const getPathCells = (board) => {
  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  return board.cells.filter(cell => cell.type === CELL_TYPES.PATH || cell.type === CELL_TYPES.HOME_PATH);
};

export const getPlayableCells = (board) => {
  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  return board.cells.filter(cell => cell.isPlayable);
};

export const getHomeCells = (board, color = null) => {
  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  if (color) {
    return board.cells.filter(cell => cell.type === CELL_TYPES.HOME && cell.color === color);
  }

  return board.cells.filter(cell => cell.type === CELL_TYPES.HOME);
};

export const getColorHomeCells = (board) => {
  if (!board || !board.cells) {
    throw new Error('Board is required');
  }

  const result = {};
  PLAYER_COLORS_LIST.forEach(color => {
    result[color] = board.cells.filter(cell => cell.type === CELL_TYPES.HOME && cell.color === color);
  });
  return result;
};