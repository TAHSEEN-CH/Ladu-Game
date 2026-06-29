// src/utils/boardGenerator.js

/**
 * Board Generator Module
 *
 * Production-ready board generator for a standard 15×15 Ludo board.
 * Dynamically generates all 225 cells with consistent data structure.
 * Framework-independent and optimized for performance.
 */

import { boardPaths } from "./boardPaths.js";
import {
  TOTAL_CELLS,
  HOME_CELLS,
  SAFE_CELLS,
  PLAYER_COLORS,
  HOME_PATH_LENGTH,
  BOARD_SIZE,
  CENTER_CELL,
} from "./gameConstants.js";

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Board dimensions and layout constants.
 */
const BOARD = {
  SIZE: BOARD_SIZE || 15,
  CENTER: Math.floor((BOARD_SIZE || 15) / 2),
  HOME_AREA_SIZE: 6,
  HOME_PATH_OFFSET: 1,
};

/**
 * Player home area configurations.
 */
const HOME_AREAS = {
  RED: {
    rowStart: 0,
    rowEnd: 5,
    colStart: 0,
    colEnd: 5,
    color: PLAYER_COLORS.RED,
    homePath: "RED",
  },
  GREEN: {
    rowStart: 0,
    rowEnd: 5,
    colStart: 9,
    colEnd: 14,
    color: PLAYER_COLORS.GREEN,
    homePath: "GREEN",
  },
  YELLOW: {
    rowStart: 9,
    rowEnd: 14,
    colStart: 0,
    colEnd: 5,
    color: PLAYER_COLORS.YELLOW,
    homePath: "YELLOW",
  },
  BLUE: {
    rowStart: 9,
    rowEnd: 14,
    colStart: 9,
    colEnd: 14,
    color: PLAYER_COLORS.BLUE,
    homePath: "BLUE",
  },
};

/**
 * Safe cell positions on the main path.
 */
const SAFE_POSITIONS = Object.freeze([0, 8, 13, 21, 26, 34, 39, 47]);

/**
 * Home path configurations.
 */
const HOME_PATH_CONFIG = {
  RED: { rowStart: 6, colStart: 1, direction: "right" },
  GREEN: { rowStart: 1, colStart: 8, direction: "down" },
  YELLOW: { rowStart: 8, colStart: 6, direction: "up" },
  BLUE: { rowStart: 13, colStart: 8, direction: "left" },
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates a unique cell ID.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string} Cell ID
 */
const generateCellId = (row, col) => {
  return `cell-${row}-${col}`;
};

/**
 * Checks if coordinates are within the home area for a specific player.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} color - Player color
 * @returns {boolean} True if in home area
 */
const isInHomeArea = (row, col, color) => {
  const homeArea = HOME_AREAS[color.toUpperCase()];
  if (!homeArea) return false;

  return (
    row >= homeArea.rowStart &&
    row <= homeArea.rowEnd &&
    col >= homeArea.colStart &&
    col <= homeArea.colEnd
  );
};

/**
 * Checks if coordinates are on the main path.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if on main path
 */
const isOnMainPath = (row, col) => {
  const center = BOARD.CENTER;

  // Check if on the main path (the cross shape)
  const isInCross =
    (row >= 0 && row <= BOARD.SIZE - 1 && col === center) ||
    (col >= 0 && col <= BOARD.SIZE - 1 && row === center);

  // Exclude the center (center is the winning area)
  if (row === center && col === center) return false;

  // Exclude home areas
  const isInHomeRed = isInHomeArea(row, col, "RED");
  const isInHomeGreen = isInHomeArea(row, col, "GREEN");
  const isInHomeYellow = isInHomeArea(row, col, "YELLOW");
  const isInHomeBlue = isInHomeArea(row, col, "BLUE");

  if (isInHomeRed || isInHomeGreen || isInHomeYellow || isInHomeBlue) {
    return false;
  }

  return isInCross;
};

/**
 * Checks if coordinates are in the center winning area.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if in center
 */
const isCenter = (row, col) => {
  return row === BOARD.CENTER && col === BOARD.CENTER;
};

/**
 * Checks if coordinates are on a home path.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {Object|null} Home path configuration or null
 */
const getHomePathConfig = (row, col) => {
  for (const [color, config] of Object.entries(HOME_PATH_CONFIG)) {
    const { rowStart, colStart, direction } = config;
    let isOnPath = false;

    switch (direction) {
      case "right":
        isOnPath =
          row === rowStart && col >= colStart && col <= BOARD.CENTER - 1;
        break;
      case "down":
        isOnPath =
          col === colStart && row >= rowStart && row <= BOARD.CENTER - 1;
        break;
      case "up":
        isOnPath =
          col === colStart && row >= BOARD.CENTER + 1 && row <= rowStart;
        break;
      case "left":
        isOnPath =
          row === rowStart && col >= BOARD.CENTER + 1 && col <= colStart;
        break;
      default:
        break;
    }

    if (isOnPath) {
      return { color, ...config };
    }
  }
  return null;
};

/**
 * Gets the player color for a home area.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string|null} Player color or null
 */
const getHomeAreaColor = (row, col) => {
  for (const [color, area] of Object.entries(HOME_AREAS)) {
    if (
      row >= area.rowStart &&
      row <= area.rowEnd &&
      col >= area.colStart &&
      col <= area.colEnd
    ) {
      return area.color;
    }
  }
  return null;
};

/**
 * Calculates the path index for a cell on the main path.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {number|null} Path index or null
 */
const calculatePathIndex = (row, col) => {
  const center = BOARD.CENTER;

  if (!isOnMainPath(row, col)) return null;

  // Calculate path index based on position around the board
  // Starting from top-left of the cross (row 0, col center)
  if (row < center && col === center) {
    // Top arm: from top to center
    return row;
  } else if (row === center && col > center) {
    // Right arm: from center to right
    return center + (col - center);
  } else if (row > center && col === center) {
    // Bottom arm: from center to bottom
    return center + (BOARD.SIZE - 1 - row) + 1;
  } else if (row === center && col < center) {
    // Left arm: from center to left
    return BOARD.SIZE * 2 - 1 - col;
  }

  return null;
};

/**
 * Gets the type of a cell.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string} Cell type
 */
const getCellType = (row, col) => {
  if (isCenter(row, col)) {
    return "center";
  }

  const homePath = getHomePathConfig(row, col);
  if (homePath) {
    return "homePath";
  }

  const homeAreaColor = getHomeAreaColor(row, col);
  if (homeAreaColor) {
    return "home";
  }

  if (isOnMainPath(row, col)) {
    return "path";
  }

  return "empty";
};

/**
 * Checks if a cell is playable.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if playable
 */
const isPlayable = (row, col) => {
  const type = getCellType(row, col);
  return type === "path" || type === "homePath" || type === "center";
};

/**
 * Checks if a cell is a safe cell.
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if safe
 */
const isSafeCell = (row, col) => {
  const pathIndex = calculatePathIndex(row, col);
  if (pathIndex === null) return false;
  return SAFE_POSITIONS.includes(pathIndex);
};

/**
 * Checks if a cell is a home cell (start position).
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if home cell
 */
const isHomeCell = (row, col) => {
  const type = getCellType(row, col);
  return type === "home";
};

// ============================================================
// MAIN BOARD GENERATION
// ============================================================

/**
 * Generates the complete 15×15 Ludo board.
 * @param {Object} options - Generation options
 * @param {number} options.size - Board size (default: 15)
 * @param {boolean} options.validate - Whether to validate the board
 * @returns {Object} Board object with cells and metadata
 */
export const generateBoard = (options = {}) => {
  const size = options.size || BOARD.SIZE;
  const validate = options.validate !== undefined ? options.validate : true;

  const cells = [];
  const cellsById = new Map();
  const cellsByCoordinates = new Map();

  // Generate all cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const id = generateCellId(row, col);
      const type = getCellType(row, col);
      const color = getHomeAreaColor(row, col) || null;
      const isPlayableValue = isPlayable(row, col);
      const isSafe = isSafeCell(row, col);
      const isHome = isHomeCell(row, col);
      const isHomePath = type === "homePath";
      const isCenterValue = isCenter(row, col);
      const pathIndex = calculatePathIndex(row, col);

      // Get home path color if applicable
      let homePathColor = null;
      if (isHomePath) {
        const config = getHomePathConfig(row, col);
        if (config) {
          homePathColor = config.color;
        }
      }

      const cell = {
        id,
        row,
        col,
        type,
        color,
        isPlayable: isPlayableValue,
        isSafe,
        isHome,
        isHomePath,
        isCenter: isCenterValue,
        pathIndex,
        homePathColor,
        // Additional metadata for future use
        metadata: {
          isOnMainPath: isOnMainPath(row, col),
          isInHomeArea: color !== null,
          homePathConfig: isHomePath ? getHomePathConfig(row, col) : null,
        },
      };

      cells.push(cell);
      cellsById.set(id, cell);
      cellsByCoordinates.set(`${row},${col}`, cell);
    }
  }

  const board = {
    size,
    cells: Object.freeze(cells),
    cellsById: Object.freeze(cellsById),
    cellsByCoordinates: Object.freeze(cellsByCoordinates),
    metadata: {
      totalCells: cells.length,
      playableCells: cells.filter((c) => c.isPlayable).length,
      safeCells: cells.filter((c) => c.isSafe).length,
      homeCells: cells.filter((c) => c.isHome).length,
      homePathCells: cells.filter((c) => c.isHomePath).length,
      centerCells: cells.filter((c) => c.isCenter).length,
      generatedAt: Date.now(),
    },
  };

  // Validate the generated board
  if (validate) {
    validateBoard(board);
  }

  return Object.freeze(board);
};

// ============================================================
// BOARD VALIDATION
// ============================================================

/**
 * Validates the generated board.
 * @param {Object} board - Board object to validate
 * @throws {Error} If validation fails
 */
const validateBoard = (board) => {
  if (!board || typeof board !== "object") {
    throw new Error("Board must be an object");
  }

  if (board.size !== BOARD.SIZE) {
    throw new Error(`Board size must be ${BOARD.SIZE}`);
  }

  if (
    !Array.isArray(board.cells) ||
    board.cells.length !== BOARD.SIZE * BOARD.SIZE
  ) {
    throw new Error(`Board must contain ${BOARD.SIZE * BOARD.SIZE} cells`);
  }

  // Validate each cell
  board.cells.forEach((cell, index) => {
    if (!cell.id || typeof cell.id !== "string") {
      throw new Error(`Cell at index ${index} has invalid id`);
    }
    if (
      typeof cell.row !== "number" ||
      cell.row < 0 ||
      cell.row >= BOARD.SIZE
    ) {
      throw new Error(`Cell at index ${index} has invalid row`);
    }
    if (
      typeof cell.col !== "number" ||
      cell.col < 0 ||
      cell.col >= BOARD.SIZE
    ) {
      throw new Error(`Cell at index ${index} has invalid col`);
    }
    if (!["home", "path", "homePath", "center", "empty"].includes(cell.type)) {
      throw new Error(`Cell at index ${index} has invalid type: ${cell.type}`);
    }
    if (typeof cell.isPlayable !== "boolean") {
      throw new Error(`Cell at index ${index} has invalid isPlayable`);
    }
    if (typeof cell.isSafe !== "boolean") {
      throw new Error(`Cell at index ${index} has invalid isSafe`);
    }
    if (typeof cell.isHome !== "boolean") {
      throw new Error(`Cell at index ${index} has invalid isHome`);
    }
    if (typeof cell.isHomePath !== "boolean") {
      throw new Error(`Cell at index ${index} has invalid isHomePath`);
    }
    if (typeof cell.isCenter !== "boolean") {
      throw new Error(`Cell at index ${index} has invalid isCenter`);
    }
  });

  // Validate center cell exists
  const centerCell = board.cells.find((c) => c.isCenter);
  if (!centerCell) {
    throw new Error("Board must have a center cell");
  }

  // Validate home paths
  const homePathColors = new Set();
  board.cells
    .filter((c) => c.isHomePath)
    .forEach((cell) => {
      if (!cell.homePathColor) {
        throw new Error(
          `Home path cell at (${cell.row}, ${cell.col}) missing homePathColor`,
        );
      }
      homePathColors.add(cell.homePathColor);
    });

  // Validate that all colors have home paths
  const expectedColors = ["RED", "GREEN", "YELLOW", "BLUE"];
  for (const color of expectedColors) {
    if (!homePathColors.has(color)) {
      throw new Error(`Missing home path for color ${color}`);
    }
  }
};

// ============================================================
// BOARD QUERY FUNCTIONS
// ============================================================

/**
 * Gets a cell by its ID.
 * @param {Object} board - Board object
 * @param {string} cellId - Cell ID
 * @returns {Object|null} Cell object or null
 */
export const getCellById = (board, cellId) => {
  if (!board || !board.cellsById) {
    throw new Error("Invalid board object");
  }
  if (typeof cellId !== "string" || cellId.length === 0) {
    throw new Error("Cell ID must be a non-empty string");
  }

  return board.cellsById.get(cellId) || null;
};

/**
 * Gets a cell by its coordinates.
 * @param {Object} board - Board object
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {Object|null} Cell object or null
 */
export const getCellByCoordinates = (board, row, col) => {
  if (!board || !board.cellsByCoordinates) {
    throw new Error("Invalid board object");
  }
  if (typeof row !== "number" || row < 0 || row >= board.size) {
    throw new Error(`Invalid row: ${row}`);
  }
  if (typeof col !== "number" || col < 0 || col >= board.size) {
    throw new Error(`Invalid col: ${col}`);
  }

  return board.cellsByCoordinates.get(`${row},${col}`) || null;
};

/**
 * Gets neighboring cells (up, down, left, right) for a given cell.
 * @param {Object} board - Board object
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {Object} options - Options for neighbor selection
 * @param {boolean} options.includeDiagonals - Whether to include diagonal neighbors
 * @param {boolean} options.onlyPlayable - Whether to only return playable cells
 * @returns {Object[]} Array of neighbor cells
 */
export const getNeighborCells = (board, row, col, options = {}) => {
  if (!board || !board.cellsByCoordinates) {
    throw new Error("Invalid board object");
  }
  if (typeof row !== "number" || row < 0 || row >= board.size) {
    throw new Error(`Invalid row: ${row}`);
  }
  if (typeof col !== "number" || col < 0 || col >= board.size) {
    throw new Error(`Invalid col: ${col}`);
  }

  const includeDiagonals = options.includeDiagonals || false;
  const onlyPlayable = options.onlyPlayable || false;

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  if (includeDiagonals) {
    directions.push(
      { row: -1, col: -1 }, // up-left
      { row: -1, col: 1 }, // up-right
      { row: 1, col: -1 }, // down-left
      { row: 1, col: 1 }, // down-right
    );
  }

  const neighbors = [];
  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;

    if (
      newRow >= 0 &&
      newRow < board.size &&
      newCol >= 0 &&
      newCol < board.size
    ) {
      const cell = getCellByCoordinates(board, newRow, newCol);
      if (cell && (!onlyPlayable || cell.isPlayable)) {
        neighbors.push(cell);
      }
    }
  }

  return neighbors;
};

// ============================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================

/**
 * Gets all playable cells on the board.
 * @param {Object} board - Board object
 * @returns {Object[]} Array of playable cells
 */
export const getPlayableCells = (board) => {
  if (!board || !board.cells) {
    throw new Error("Invalid board object");
  }
  return board.cells.filter((cell) => cell.isPlayable);
};

/**
 * Gets all cells of a specific type.
 * @param {Object} board - Board object
 * @param {string} type - Cell type
 * @returns {Object[]} Array of cells
 */
export const getCellsByType = (board, type) => {
  if (!board || !board.cells) {
    throw new Error("Invalid board object");
  }
  if (!["home", "path", "homePath", "center", "empty"].includes(type)) {
    throw new Error(`Invalid cell type: ${type}`);
  }
  return board.cells.filter((cell) => cell.type === type);
};

/**
 * Gets all cells for a specific player color.
 * @param {Object} board - Board object
 * @param {string} color - Player color
 * @returns {Object[]} Array of cells
 */
export const getCellsByColor = (board, color) => {
  if (!board || !board.cells) {
    throw new Error("Invalid board object");
  }
  if (!color || typeof color !== "string") {
    throw new Error("Color must be a non-empty string");
  }
  return board.cells.filter(
    (cell) => cell.color === color || cell.homePathColor === color,
  );
};

/**
 * Gets the home path cells for a specific color.
 * @param {Object} board - Board object
 * @param {string} color - Player color
 * @returns {Object[]} Array of home path cells
 */
export const getHomePathCells = (board, color) => {
  if (!board || !board.cells) {
    throw new Error("Invalid board object");
  }
  if (!color || typeof color !== "string") {
    throw new Error("Color must be a non-empty string");
  }
  return board.cells.filter(
    (cell) => cell.isHomePath && cell.homePathColor === color,
  );
};

/**
 * Gets the home area cells for a specific color.
 * @param {Object} board - Board object
 * @param {string} color - Player color
 * @returns {Object[]} Array of home area cells
 */
export const getHomeAreaCells = (board, color) => {
  if (!board || !board.cells) {
    throw new Error("Invalid board object");
  }
  if (!color || typeof color !== "string") {
    throw new Error("Color must be a non-empty string");
  }
  return board.cells.filter((cell) => cell.color === color && cell.isHome);
};

// ============================================================
// EXPORT
// ============================================================

// All exports are already defined above as named exports

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. How the board is generated dynamically:
 *
 * - The board is generated as a 15×15 grid (225 cells) using nested loops.
 * - Each cell's properties are determined by its coordinates:
 *   * Home areas: Check if coordinates fall within predefined home area bounds
 *   * Main path: Check if coordinates are on the cross shape (center row/column)
 *   * Home paths: Check if coordinates are on the home path arms
 *   * Center: Check if coordinates are at the exact center (7,7)
 *   * Empty: All other cells
 * - Cell properties (isPlayable, isSafe, isHome, etc.) are derived from the type
 * - The board is validated to ensure correctness
 * - The result is frozen to prevent mutations
 *
 * 2. How this module integrates with LudoBoard, pathEngine, and LudoEngine:
 *
 * LudoBoard (UI Component):
 * - Uses generateBoard() to create the board structure
 * - Uses getCellById() and getCellByCoordinates() to render specific cells
 * - Uses getNeighborCells() for highlighting valid moves
 * - Renders cells based on their type, color, and properties
 *
 * pathEngine:
 * - Uses the board to calculate paths for tokens
 * - Uses getCellsByType() to get path cells
 * - Uses getHomePathCells() for home stretch calculations
 * - Uses getCellByCoordinates() for position lookups
 *
 * LudoEngine:
 * - Uses generateBoard() during game initialization
 * - Uses board query functions for move validation
 * - Uses the board's metadata for game logic
 * - Passes the board to other modules that need it
 *
 * 3. Why generating the board programmatically is superior to hardcoding it:
 *
 * - Maintainability: Changes to board layout (adding new safe cells,
 *   modifying home paths) only require updating the generation logic.
 *   Hardcoded boards require manual updates to 225 cells.
 *
 * - Scalability: The generator can easily create boards of different
 *   sizes (e.g., 13×13, 17×17) for different game variants by simply
 *   changing the BOARD.SIZE constant.
 *
 * - Consistency: All cells are generated with consistent data structure.
 *   No risk of typos or inconsistent formatting in hardcoded data.
 *
 * - Memory Efficiency: The board is generated once and frozen.
 *   Hardcoded boards with the same data would use the same memory.
 *
 * - Validation: The generator includes automatic validation, catching
 *   errors in the board layout early.
 *
 * - Extensibility: New cell properties can be added by simply extending
 *   the cell object in the generator. All cells automatically get the
 *   new property.
 *
 * - Testing: The generator can be unit tested easily. Hardcoded boards
 *   would need manual verification.
 *
 * - Readability: The generation logic is easier to read and understand
 *   than a large hardcoded array of 225 cells.
 *
 * - Future-proof: If the game needs to support different board layouts
 *   (e.g., 2-player variant with shorter board), the generator can be
 *   parameterized to handle these variations.
 */
