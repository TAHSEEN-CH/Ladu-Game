import {
  getPlayerPath,
  getHomePath,
  getStartCell,
  getHomeEntry,
  getWinningCell,
  getNextCell,
  getCellIndex,
  getRemainingSteps,
  hasReachedHome,
  isSafeCell,
  isHomePathCell,
  isValidCellForColor,
} from "./pathEngine";
import {
  getTokenById,
  getTokensAtCell,
  canReleaseToken as canReleaseTokenUtil,
} from "./tokenEngine";
import { DICE, TOKEN } from "../constants/gameConstants";

const validateToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }
  return token;
};

const validatePlayerId = (playerId) => {
  if (!playerId) {
    throw new Error("Player ID is required");
  }
  return playerId;
};

const validateDiceValue = (diceValue) => {
  if (diceValue === undefined || diceValue === null) {
    throw new Error("Dice value is required");
  }
  if (
    !Number.isInteger(diceValue) ||
    diceValue < DICE.MIN_VALUE ||
    diceValue > DICE.MAX_VALUE
  ) {
    throw new Error(
      `Dice value must be between ${DICE.MIN_VALUE} and ${DICE.MAX_VALUE}`,
    );
  }
  return diceValue;
};

const validateBoard = (board) => {
  if (!board || !board.cells || !board.tokens) {
    throw new Error("Board is required with cells and tokens");
  }
  return board;
};

export const canReleaseToken = (token, diceValue, board) => {
  const validToken = validateToken(token);
  const validDiceValue = validateDiceValue(diceValue);
  const validBoard = validateBoard(board);

  if (!validToken.isHome) {
    return { valid: false, reason: "Token is not in home" };
  }

  if (validToken.isWinner) {
    return { valid: false, reason: "Token has already won" };
  }

  const playerTokens = validBoard.tokens.filter(
    (t) => t.playerId === validToken.playerId && !t.isHome && !t.isWinner,
  );

  if (playerTokens.length === 0) {
    return { valid: true, reason: "No active tokens, release is allowed" };
  }

  const canRelease =
    validDiceValue === DICE.EXTRA_TURN_VALUE || validDiceValue === 1;

  if (!canRelease) {
    return {
      valid: false,
      reason: `Need ${DICE.EXTRA_TURN_VALUE} or 1 to release token`,
    };
  }

  return { valid: true, reason: "Token can be released" };
};

export const canMoveToken = (token, diceValue, board, color) => {
  const validToken = validateToken(token);
  const validDiceValue = validateDiceValue(diceValue);
  const validBoard = validateBoard(board);

  if (validToken.isWinner) {
    return { valid: false, reason: "Token has already won" };
  }

  if (validToken.isHome) {
    return canReleaseToken(validToken, validDiceValue, validBoard);
  }

  const startCell = getStartCell(color);
  const currentIndex = getCellIndex(color, validToken.position);

  if (currentIndex === -1) {
    return {
      valid: false,
      reason: "Token is not on a valid cell for this player",
    };
  }

  const remainingSteps = getRemainingSteps(color, validToken.position);

  if (validDiceValue > remainingSteps) {
    return { valid: false, reason: "Move would overshoot home" };
  }

  const willOvershoot = willOvershootHome(
    color,
    validToken.position,
    validDiceValue,
  );
  if (willOvershoot) {
    return { valid: false, reason: "Move would overshoot home" };
  }

  return { valid: true, reason: "Token can move" };
};

export const getValidMoves = (token, diceValue, board, color) => {
  const validToken = validateToken(token);
  const validDiceValue = validateDiceValue(diceValue);
  const validBoard = validateBoard(board);

  const moves = [];

  if (validToken.isWinner) {
    return moves;
  }

  if (validToken.isHome) {
    const releaseResult = canReleaseToken(
      validToken,
      validDiceValue,
      validBoard,
    );
    if (releaseResult.valid) {
      const startCell = getStartCell(color);
      moves.push({
        tokenId: validToken.id,
        targetCell: startCell,
        action: "release",
        valid: true,
        reason: "Release token from home",
      });
    }
    return moves;
  }

  const currentIndex = getCellIndex(color, validToken.position);
  if (currentIndex === -1) {
    return moves;
  }

  const path = getPlayerPath(color);
  const homePath = getHomePath(color);
  const totalSteps = path.length + homePath.length;
  const targetIndex = currentIndex + validDiceValue;

  if (targetIndex >= totalSteps) {
    return moves;
  }

  const willOvershoot = willOvershootHome(
    color,
    validToken.position,
    validDiceValue,
  );
  if (willOvershoot) {
    return moves;
  }

  let targetCell;
  if (targetIndex < path.length) {
    targetCell = path[targetIndex];
  } else {
    const homeIndex = targetIndex - path.length;
    targetCell = homePath[homeIndex];
  }

  const isWinning = isWinningMove(color, targetCell);
  const requiresCapture = requiresCaptureCheck(targetCell, validBoard);

  moves.push({
    tokenId: validToken.id,
    targetCell,
    action: isWinning ? "win" : "move",
    valid: true,
    reason: "Valid move",
    isWinning,
    requiresCapture,
    targetIndex,
  });

  return moves;
};

export const validateMove = (token, targetCell, board, color) => {
  const validToken = validateToken(token);
  const validTargetCell = targetCell;
  const validBoard = validateBoard(board);

  if (validToken.isWinner) {
    return { valid: false, reason: "Token has already won" };
  }

  if (!validTargetCell) {
    return { valid: false, reason: "Target cell is required" };
  }

  if (validToken.isHome) {
    const startCell = getStartCell(color);
    if (validTargetCell !== startCell) {
      return { valid: false, reason: "Token must be released to start cell" };
    }
    return { valid: true, reason: "Valid release move" };
  }

  const currentIndex = getCellIndex(color, validToken.position);
  if (currentIndex === -1) {
    return { valid: false, reason: "Token not on a valid path cell" };
  }

  const validMoves = getValidMoves(
    validToken,
    DICE.DEFAULT_VALUE,
    validBoard,
    color,
  );
  const isValidMove = validMoves.some(
    (move) => move.targetCell === validTargetCell,
  );

  if (!isValidMove) {
    return { valid: false, reason: "Target cell is not a valid move" };
  }

  const isWinning = isWinningMove(color, validTargetCell);
  const isOvershoot = willOvershootHome(
    color,
    validToken.position,
    DICE.DEFAULT_VALUE,
  );

  if (isOvershoot) {
    return { valid: false, reason: "Move would overshoot home" };
  }

  return {
    valid: true,
    reason: "Valid move",
    isWinning,
    targetCell: validTargetCell,
  };
};

export const willOvershootHome = (color, currentCellId, diceValue) => {
  const validCurrentCellId = currentCellId;
  const validDiceValue = validateDiceValue(diceValue);

  const remainingSteps = getRemainingSteps(color, validCurrentCellId);
  return validDiceValue > remainingSteps;
};

export const isWinningMove = (color, cellId) => {
  const winningCell = getWinningCell(color);
  return cellId === winningCell;
};

export const requiresCaptureCheck = (targetCell, board) => {
  const validTargetCell = targetCell;
  const validBoard = validateBoard(board);

  const tokensAtTarget = validBoard.tokens.filter(
    (t) => t.position === validTargetCell,
  );
  if (tokensAtTarget.length === 0) {
    return false;
  }

  const activeTokens = tokensAtTarget.filter((t) => !t.isHome && !t.isWinner);
  if (activeTokens.length === 0) {
    return false;
  }

  const isSafe = isSafeCell(validTargetCell);
  if (isSafe) {
    return false;
  }

  return true;
};

export const isBlockedMove = (token, targetCell, board, color) => {
  const validToken = validateToken(token);
  const validTargetCell = targetCell;
  const validBoard = validateBoard(board);

  const tokensAtTarget = validBoard.tokens.filter(
    (t) => t.position === validTargetCell,
  );
  if (tokensAtTarget.length === 0) {
    return false;
  }

  const samePlayerTokens = tokensAtTarget.filter(
    (t) => t.playerId === validToken.playerId,
  );
  if (samePlayerTokens.length > 0) {
    return true;
  }

  const isSafe = isSafeCell(validTargetCell);
  if (isSafe) {
    return true;
  }

  return false;
};

export const canEnterHomePath = (token, board, color) => {
  const validToken = validateToken(token);
  const validBoard = validateBoard(board);

  if (validToken.isHome || validToken.isWinner) {
    return false;
  }

  const homeEntry = getHomeEntry(color);
  const currentCell = validToken.position;

  return currentCell === homeEntry;
};

export const getValidCaptureTargets = (token, board, color) => {
  const validToken = validateToken(token);
  const validBoard = validateBoard(board);

  const captures = [];
  const validMoves = getValidMoves(
    validToken,
    DICE.DEFAULT_VALUE,
    validBoard,
    color,
  );

  validMoves.forEach((move) => {
    const requiresCapture = requiresCaptureCheck(move.targetCell, validBoard);
    if (requiresCapture) {
      const tokensAtTarget = validBoard.tokens.filter(
        (t) => t.position === move.targetCell && !t.isHome && !t.isWinner,
      );
      tokensAtTarget.forEach((targetToken) => {
        captures.push({
          tokenId: targetToken.id,
          targetCell: move.targetCell,
          playerId: targetToken.playerId,
          color: targetToken.color,
        });
      });
    }
  });

  return captures;
};

export const canCompleteMove = (token, targetCell, board, color) => {
  const validationResult = validateMove(token, targetCell, board, color);
  if (!validationResult.valid) {
    return false;
  }

  const isBlocked = isBlockedMove(token, targetCell, board, color);
  if (isBlocked) {
    return false;
  }

  const isWinning = isWinningMove(color, targetCell);
  if (isWinning) {
    return (
      token.position === getHomeEntry(color) ||
      getCellIndex(color, token.position) === getPlayerPath(color).length - 1
    );
  }

  return true;
};
