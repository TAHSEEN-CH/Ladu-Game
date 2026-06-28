import {
  DICE,
  BOARD,
  TOKEN,
  PLAYER_COLORS,
  CELL_TYPES,
  PLAYER_COLORS_LIST,
  GAME_STATUS
} from '../constants/gameConstants';

export const initializeGame = (players = [], settings = {}) => {
  if (!players || players.length < 2) {
    throw new Error('At least 2 players required to initialize game');
  }

  const board = initializeBoard();
  const initializedPlayers = initializePlayers(players);

  return {
    board,
    players: initializedPlayers,
    settings: {
      turnTimeLimit: settings.turnTimeLimit || 30,
      maxPlayers: settings.maxPlayers || 4,
      gameMode: settings.gameMode || 'Classic',
      diceCount: settings.diceCount || 1,
      isPrivate: settings.isPrivate || false,
      ...settings
    },
    currentTurn: {
      playerId: null,
      turnNumber: 0,
      timeRemaining: settings.turnTimeLimit || 30
    },
    gameStatus: GAME_STATUS.WAITING,
    winner: null,
    dice: {
      value: DICE.DEFAULT_VALUE,
      isRolling: false,
      canRoll: false
    }
  };
};

export const initializeBoard = () => {
  const board = {
    cells: [],
    tokens: [],
    lastMove: null
  };

  for (let row = 0; row < BOARD.SIZE; row++) {
    for (let col = 0; col < BOARD.SIZE; col++) {
      let type = CELL_TYPES.EMPTY;
      let color = null;
      let isSafe = false;
      let isPlayable = false;

      if (row < BOARD.HOME_SIZE && col < BOARD.HOME_SIZE) {
        type = CELL_TYPES.HOME;
        color = PLAYER_COLORS.RED;
      } else if (row < BOARD.HOME_SIZE && col >= BOARD.SIZE - BOARD.HOME_SIZE) {
        type = CELL_TYPES.HOME;
        color = PLAYER_COLORS.GREEN;
      } else if (row >= BOARD.SIZE - BOARD.HOME_SIZE && col < BOARD.HOME_SIZE) {
        type = CELL_TYPES.HOME;
        color = PLAYER_COLORS.YELLOW;
      } else if (row >= BOARD.SIZE - BOARD.HOME_SIZE && col >= BOARD.SIZE - BOARD.HOME_SIZE) {
        type = CELL_TYPES.HOME;
        color = PLAYER_COLORS.BLUE;
      } else if (
        row >= (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 &&
        row < (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 &&
        col >= (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 &&
        col < (BOARD.SIZE + BOARD.CENTER_SIZE) / 2
      ) {
        type = CELL_TYPES.CENTER;
        isSafe = true;
        isPlayable = true;
      } else if (
        (row === (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 - 1 &&
          col >= (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 - 1 &&
          col < (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 + 1) ||
        (row === (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 &&
          col >= (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 - 1 &&
          col < (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 + 1) ||
        (col === (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 - 1 &&
          row >= (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 - 1 &&
          row < (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 + 1) ||
        (col === (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 &&
          row >= (BOARD.SIZE - BOARD.CENTER_SIZE) / 2 - 1 &&
          row < (BOARD.SIZE + BOARD.CENTER_SIZE) / 2 + 1)
      ) {
        type = CELL_TYPES.PATH;
        isPlayable = true;
      }

      board.cells.push({
        id: `cell-${row}-${col}`,
        row,
        col,
        type,
        color,
        isSafe,
        isPlayable,
        token: null
      });
    }
  }

  return board;
};

export const initializePlayers = (players) => {
  if (!players || players.length === 0) {
    throw new Error('Players array cannot be empty');
  }

  const colors = [...PLAYER_COLORS_LIST];
  const shuffledColors = colors.slice(0, players.length);

  return players.map((player, index) => ({
    id: player.id || `player-${index + 1}`,
    name: player.name || `Player ${index + 1}`,
    color: shuffledColors[index % shuffledColors.length],
    connected: player.connected !== false,
    isWinner: false,
    rank: null,
    score: 0,
    tokens: Array(TOKEN.MAX_TOKENS_PER_PLAYER).fill(null).map((_, tokenIndex) => ({
      id: `token-${player.id || index + 1}-${tokenIndex + 1}`,
      playerId: player.id || `player-${index + 1}`,
      color: shuffledColors[index % shuffledColors.length],
      position: TOKEN.START_POSITION,
      isWinner: false,
      isHome: true
    }))
  }));
};

export const rollDice = (diceCount = 1) => {
  if (diceCount < 1) {
    throw new Error('Dice count must be at least 1');
  }

  const values = [];
  for (let i = 0; i < diceCount; i++) {
    values.push(Math.floor(Math.random() * (DICE.MAX_VALUE - DICE.MIN_VALUE + 1)) + DICE.MIN_VALUE);
  }

  const total = values.reduce((sum, val) => sum + val, 0);
  const isExtraTurn = values.some(val => val === DICE.EXTRA_TURN_VALUE);

  return {
    values,
    total,
    isExtraTurn,
    isSix: values.some(val => val === DICE.EXTRA_TURN_VALUE),
    allSixes: values.every(val => val === DICE.EXTRA_TURN_VALUE)
  };
};

export const getValidMoves = (token, board, diceValue, currentPlayer) => {
  if (!token) {
    throw new Error('Token is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  if (!diceValue || diceValue < DICE.MIN_VALUE || diceValue > DICE.MAX_VALUE) {
    throw new Error(`Dice value must be between ${DICE.MIN_VALUE} and ${DICE.MAX_VALUE}`);
  }

  const moves = [];
  const currentPosition = token.position;

  if (token.isHome && diceValue === DICE.EXTRA_TURN_VALUE) {
    moves.push({
      position: 0,
      action: 'spawn',
      description: 'Spawn token from home'
    });
    return moves;
  }

  if (token.isWinner) {
    return moves;
  }

  const newPosition = currentPosition + diceValue;
  if (isWinningMove(newPosition, token, board)) {
    moves.push({
      position: newPosition,
      action: 'win',
      description: 'Move token to winning position'
    });
  } else if (isValidPosition(newPosition, board)) {
    moves.push({
      position: newPosition,
      action: 'move',
      description: 'Move token forward'
    });
  }

  return moves;
};

export const moveToken = (token, newPosition, board) => {
  if (!token) {
    throw new Error('Token is required');
  }

  if (newPosition === undefined || newPosition === null) {
    throw new Error('New position is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  const validMoves = getValidMoves(token, board, DICE.DEFAULT_VALUE, null);
  const isValid = validMoves.some(move => move.position === newPosition);

  if (!isValid) {
    throw new Error('Invalid move');
  }

  const capturedToken = captureToken(newPosition, board, token.playerId);

  return {
    token: {
      ...token,
      position: newPosition,
      isHome: false
    },
    capturedToken,
    board: {
      ...board,
      tokens: board.tokens.map(t =>
        t.id === token.id
          ? { ...t, position: newPosition, isHome: false }
          : t
      ),
      lastMove: {
        tokenId: token.id,
        fromPosition: token.position,
        toPosition: newPosition,
        timestamp: Date.now()
      }
    }
  };
};

export const captureToken = (position, board, playerId) => {
  if (!board) {
    throw new Error('Board is required');
  }

  const targetCell = board.cells.find(cell => cell.id === position);
  if (!targetCell) {
    return null;
  }

  if (isSafeCell(position, board)) {
    return null;
  }

  const capturedToken = board.tokens.find(
    t => t.position === position && t.playerId !== playerId && !t.isWinner
  );

  if (!capturedToken) {
    return null;
  }

  return {
    ...capturedToken,
    position: TOKEN.START_POSITION,
    isHome: true
  };
};

export const releaseToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  return {
    ...token,
    position: TOKEN.START_POSITION,
    isHome: true,
    isWinner: false
  };
};

export const canMoveToken = (token, diceValue, board) => {
  if (!token) {
    throw new Error('Token is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  if (token.isWinner) {
    return false;
  }

  if (token.isHome) {
    return diceValue === DICE.EXTRA_TURN_VALUE;
  }

  const validMoves = getValidMoves(token, board, diceValue, null);
  return validMoves.length > 0;
};

export const isSafeCell = (position, board) => {
  if (!position) {
    throw new Error('Position is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  const cell = board.cells.find(c => c.id === position);
  return cell ? cell.isSafe : false;
};

export const isHomeCell = (position, board) => {
  if (!position) {
    throw new Error('Position is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  const cell = board.cells.find(c => c.id === position);
  return cell ? cell.type === CELL_TYPES.HOME : false;
};

export const isWinningMove = (position, token, board) => {
  if (!position) {
    throw new Error('Position is required');
  }

  if (!token) {
    throw new Error('Token is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  const cell = board.cells.find(c => c.id === position);
  return cell ? cell.type === CELL_TYPES.CENTER : false;
};

export const isValidPosition = (position, board) => {
  if (!position) {
    throw new Error('Position is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  const cell = board.cells.find(c => c.id === position);
  return cell ? cell.isPlayable : false;
};

export const getNextTurn = (currentPlayerId, players) => {
  if (!players || players.length === 0) {
    throw new Error('Players array cannot be empty');
  }

  if (!currentPlayerId) {
    return players[0]?.id || null;
  }

  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  if (currentIndex === -1) {
    return players[0]?.id || null;
  }

  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex]?.id || null;
};

export const checkWinner = (players) => {
  if (!players || players.length === 0) {
    return null;
  }

  const winner = players.find(player => player.isWinner === true);
  return winner || null;
};

export const resetGame = (gameState) => {
  if (!gameState) {
    throw new Error('Game state is required');
  }

  return {
    ...gameState,
    board: initializeBoard(),
    players: gameState.players.map(player => ({
      ...player,
      isWinner: false,
      rank: null,
      tokens: player.tokens.map(token => ({
        ...token,
        position: TOKEN.START_POSITION,
        isWinner: false,
        isHome: true
      }))
    })),
    currentTurn: {
      playerId: null,
      turnNumber: 0,
      timeRemaining: gameState.settings.turnTimeLimit || 30
    },
    gameStatus: GAME_STATUS.WAITING,
    winner: null,
    dice: {
      value: DICE.DEFAULT_VALUE,
      isRolling: false,
      canRoll: false
    }
  };
};

export const getTokenById = (tokenId, board) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  return board.tokens.find(t => t.id === tokenId) || null;
};

export const getPlayerTokens = (playerId, board) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  return board.tokens.filter(t => t.playerId === playerId);
};

export const getActiveTokens = (playerId, board) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  return board.tokens.filter(t => t.playerId === playerId && !t.isHome && !t.isWinner);
};

export const getHomeTokens = (playerId, board) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  return board.tokens.filter(t => t.playerId === playerId && t.isHome);
};

export const getWinningTokens = (playerId, board) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  return board.tokens.filter(t => t.playerId === playerId && t.isWinner);
};

export const countActiveTokens = (playerId, board) => {
  return getActiveTokens(playerId, board).length;
};

export const countHomeTokens = (playerId, board) => {
  return getHomeTokens(playerId, board).length;
};

export const countWinningTokens = (playerId, board) => {
  return getWinningTokens(playerId, board).length;
};

export const hasAllTokensWon = (playerId, board) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!board) {
    throw new Error('Board is required');
  }

  const playerTokens = board.tokens.filter(t => t.playerId === playerId);
  return playerTokens.length > 0 && playerTokens.every(t => t.isWinner);
};