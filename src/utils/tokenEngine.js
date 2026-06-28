import { TOKEN, PLAYER_COLORS_LIST } from '../constants/gameConstants';

export const createTokens = (playerId, color, count = TOKEN.MAX_TOKENS_PER_PLAYER) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!color || !PLAYER_COLORS_LIST.includes(color)) {
    throw new Error(`Invalid color: ${color}`);
  }

  if (count < 1 || count > TOKEN.MAX_TOKENS_PER_PLAYER) {
    throw new Error(`Token count must be between 1 and ${TOKEN.MAX_TOKENS_PER_PLAYER}`);
  }

  const tokens = [];
  for (let i = 0; i < count; i++) {
    tokens.push({
      id: `token-${playerId}-${i + 1}`,
      playerId,
      color,
      position: TOKEN.START_POSITION,
      isHome: true,
      isWinner: false,
      isFinished: false,
      order: i + 1,
      moveHistory: []
    });
  }

  return tokens;
};

export const initializePlayerTokens = (players) => {
  if (!players || !Array.isArray(players) || players.length === 0) {
    throw new Error('Players array cannot be empty');
  }

  const allTokens = [];
  players.forEach((player) => {
    const tokens = createTokens(player.id, player.color);
    allTokens.push(...tokens);
  });

  return allTokens;
};

export const getTokenById = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  return tokens.find(token => token.id === tokenId) || null;
};

export const getTokensByPlayer = (playerId, tokens) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  return tokens.filter(token => token.playerId === playerId);
};

export const getTokensAtCell = (position, tokens) => {
  if (position === undefined || position === null) {
    throw new Error('Position is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  return tokens.filter(token => token.position === position && !token.isFinished);
};

export const moveToken = (tokenId, newPosition, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (newPosition === undefined || newPosition === null) {
    throw new Error('New position is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    throw new Error(`Token with ID ${tokenId} not found`);
  }

  const oldPosition = token.position;
  const wasHome = token.isHome;

  return tokens.map(t => {
    if (t.id === tokenId) {
      return {
        ...t,
        position: newPosition,
        isHome: false,
        moveHistory: [
          ...t.moveHistory,
          {
            from: oldPosition,
            to: newPosition,
            timestamp: Date.now()
          }
        ]
      };
    }
    return t;
  });
};

export const resetToken = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    throw new Error(`Token with ID ${tokenId} not found`);
  }

  return tokens.map(t => {
    if (t.id === tokenId) {
      return {
        ...t,
        position: TOKEN.START_POSITION,
        isHome: true,
        isWinner: false,
        isFinished: false,
        moveHistory: []
      };
    }
    return t;
  });
};

export const releaseToken = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    throw new Error(`Token with ID ${tokenId} not found`);
  }

  if (!token.isHome) {
    return tokens;
  }

  return tokens.map(t => {
    if (t.id === tokenId) {
      return {
        ...t,
        isHome: false,
        moveHistory: [
          ...t.moveHistory,
          {
            from: TOKEN.START_POSITION,
            to: 0,
            timestamp: Date.now(),
            action: 'release'
          }
        ]
      };
    }
    return t;
  });
};

export const sendTokenHome = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    throw new Error(`Token with ID ${tokenId} not found`);
  }

  if (token.isHome || token.isFinished) {
    return tokens;
  }

  return tokens.map(t => {
    if (t.id === tokenId) {
      return {
        ...t,
        position: TOKEN.START_POSITION,
        isHome: true,
        isWinner: false,
        isFinished: false,
        moveHistory: [
          ...t.moveHistory,
          {
            from: token.position,
            to: TOKEN.START_POSITION,
            timestamp: Date.now(),
            action: 'captured'
          }
        ]
      };
    }
    return t;
  });
};

export const captureToken = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    throw new Error(`Token with ID ${tokenId} not found`);
  }

  if (token.isFinished || token.isHome) {
    return tokens;
  }

  return sendTokenHome(tokenId, tokens);
};

export const canReleaseToken = (tokenId, diceValue, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (diceValue === undefined || diceValue === null) {
    throw new Error('Dice value is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    return false;
  }

  if (!token.isHome) {
    return false;
  }

  return diceValue === 6 || diceValue === 1;
};

export const canMoveToken = (tokenId, diceValue, tokens, board) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (diceValue === undefined || diceValue === null) {
    throw new Error('Dice value is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    return false;
  }

  if (token.isFinished || token.isWinner) {
    return false;
  }

  if (token.isHome) {
    return canReleaseToken(tokenId, diceValue, tokens);
  }

  if (!board) {
    return true;
  }

  return true;
};

export const hasReachedHome = (tokenId, tokens, homePosition) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    return false;
  }

  if (!homePosition && homePosition !== 0) {
    return token.position === TOKEN.WIN_POSITION;
  }

  return token.position === homePosition;
};

export const isTokenFinished = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    return false;
  }

  return token.isFinished || token.isWinner;
};

export const getMovableTokens = (playerId, diceValue, tokens, board) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (diceValue === undefined || diceValue === null) {
    throw new Error('Dice value is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const playerTokens = getTokensByPlayer(playerId, tokens);
  return playerTokens.filter(token => canMoveToken(token.id, diceValue, tokens, board));
};

export const getAvailableTokens = (playerId, tokens) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const playerTokens = getTokensByPlayer(playerId, tokens);
  return playerTokens.filter(token => !token.isFinished && !token.isWinner);
};

export const getActiveTokens = (playerId, tokens) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const playerTokens = getTokensByPlayer(playerId, tokens);
  return playerTokens.filter(token => !token.isHome && !token.isFinished && !token.isWinner);
};

export const getHomeTokens = (playerId, tokens) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const playerTokens = getTokensByPlayer(playerId, tokens);
  return playerTokens.filter(token => token.isHome && !token.isFinished);
};

export const getWinningTokens = (playerId, tokens) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const playerTokens = getTokensByPlayer(playerId, tokens);
  return playerTokens.filter(token => token.isWinner || token.isFinished);
};

export const countActiveTokens = (playerId, tokens) => {
  return getActiveTokens(playerId, tokens).length;
};

export const countHomeTokens = (playerId, tokens) => {
  return getHomeTokens(playerId, tokens).length;
};

export const countWinningTokens = (playerId, tokens) => {
  return getWinningTokens(playerId, tokens).length;
};

export const hasAllTokensWon = (playerId, tokens) => {
  if (!playerId) {
    throw new Error('Player ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const playerTokens = getTokensByPlayer(playerId, tokens);
  if (playerTokens.length === 0) {
    return false;
  }

  return playerTokens.every(token => token.isFinished || token.isWinner);
};

export const getTokenPosition = (tokenId, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  return token ? token.position : null;
};

export const setTokenPosition = (tokenId, newPosition, tokens) => {
  if (!tokenId) {
    throw new Error('Token ID is required');
  }

  if (newPosition === undefined || newPosition === null) {
    throw new Error('New position is required');
  }

  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  const token = getTokenById(tokenId, tokens);
  if (!token) {
    throw new Error(`Token with ID ${tokenId} not found`);
  }

  return tokens.map(t => {
    if (t.id === tokenId) {
      return {
        ...t,
        position: newPosition,
        isHome: newPosition === TOKEN.START_POSITION
      };
    }
    return t;
  });
};

export const resetAllTokens = (tokens) => {
  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  return tokens.map(token => ({
    ...token,
    position: TOKEN.START_POSITION,
    isHome: true,
    isWinner: false,
    isFinished: false,
    moveHistory: []
  }));
};

export const cloneTokens = (tokens) => {
  if (!tokens || !Array.isArray(tokens)) {
    throw new Error('Tokens array is required');
  }

  return tokens.map(token => ({
    ...token,
    moveHistory: [...token.moveHistory]
  }));
};