const BOARD_SIZE = 15;
const HOME_SIZE = 6;
const PATH_WIDTH = 3;

const createCell = (row, column, type, color = null, isSafe = false, isPlayable = false) => ({
  id: `cell-${row}-${column}`,
  row,
  column,
  type,
  color,
  isSafe,
  isPlayable,
  token: null
});

const generateBoard = () => {
  const board = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      let type = 'empty';
      let color = null;
      let isSafe = false;
      let isPlayable = false;

      // Red Home (Top Left)
      if (row < HOME_SIZE && col < HOME_SIZE) {
        type = 'home';
        color = 'red';
      }
      // Green Home (Top Right)
      else if (row < HOME_SIZE && col >= BOARD_SIZE - HOME_SIZE) {
        type = 'home';
        color = 'green';
      }
      // Yellow Home (Bottom Left)
      else if (row >= BOARD_SIZE - HOME_SIZE && col < HOME_SIZE) {
        type = 'home';
        color = 'yellow';
      }
      // Blue Home (Bottom Right)
      else if (row >= BOARD_SIZE - HOME_SIZE && col >= BOARD_SIZE - HOME_SIZE) {
        type = 'home';
        color = 'blue';
      }
      // Center Winning Area
      else if (
        row >= 6 && row <= 8 &&
        col >= 6 && col <= 8
      ) {
        type = 'center';
        color = null;
        isSafe = true;
        isPlayable = true;
      }
      // Path Cells
      else if (
        // Top path row
        (row === 6 && col >= 6 && col <= 8) ||
        // Bottom path row
        (row === 8 && col >= 6 && col <= 8) ||
        // Left path column
        (col === 6 && row >= 6 && row <= 8) ||
        // Right path column
        (col === 8 && row >= 6 && row <= 8)
      ) {
        type = 'path';
        color = null;
        isSafe = false;
        isPlayable = true;
      }
      // Home Paths (colored paths leading to center)
      else if (
        // Red home path (top)
        (row >= 6 && row <= 8 && col >= 6 && col <= 8) ||
        // Green home path (right)
        (row >= 6 && row <= 8 && col >= 6 && col <= 8) ||
        // Yellow home path (bottom)
        (row >= 6 && row <= 8 && col >= 6 && col <= 8) ||
        // Blue home path (left)
        (row >= 6 && row <= 8 && col >= 6 && col <= 8)
      ) {
        type = 'homePath';
        color = null;
        isSafe = true;
        isPlayable = true;
      }
      // Walking path cells
      else if (
        // Top horizontal path
        (row === 6 && col > 6 && col < 8) ||
        // Bottom horizontal path
        (row === 8 && col > 6 && col < 8) ||
        // Left vertical path
        (col === 6 && row > 6 && row < 8) ||
        // Right vertical path
        (col === 8 && row > 6 && row < 8)
      ) {
        type = 'path';
        color = null;
        isSafe = false;
        isPlayable = true;
      }

      board.push(createCell(row, col, type, color, isSafe, isPlayable));
    }
  }

  return board;
};

const BOARD_LAYOUT = generateBoard();

export default BOARD_LAYOUT;