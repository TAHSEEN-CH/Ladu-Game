export const generateRoomId = () => {
  const prefix = 'LUDO';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
};

export const formatPlayerName = (name) => {
  if (!name || typeof name !== 'string') return 'Player';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Player';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

export const getPlayerColor = (playerId, players) => {
  if (!players || !Array.isArray(players) || players.length === 0) return null;
  const player = players.find(p => p.id === playerId);
  return player ? player.color : null;
};

export const getNextPlayer = (currentPlayerId, players) => {
  if (!players || !Array.isArray(players) || players.length === 0) return null;
  if (!currentPlayerId) return players[0]?.id || null;

  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  if (currentIndex === -1) return players[0]?.id || null;

  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex]?.id || null;
};

export const isValidDiceValue = (value) => {
  return Number.isInteger(value) && value >= 1 && value <= 6;
};

export const isValidPlayerCount = (count) => {
  return Number.isInteger(count) && count >= 2 && count <= 4;
};

export const isGameFinished = (players) => {
  if (!players || !Array.isArray(players) || players.length === 0) return false;
  return players.some(player => player.isWinner === true);
};

export const getWinner = (players) => {
  if (!players || !Array.isArray(players) || players.length === 0) return null;
  const winner = players.find(player => player.isWinner === true);
  return winner || null;
};

export const shufflePlayers = (players) => {
  if (!players || !Array.isArray(players) || players.length === 0) return [];
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatGameTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getRandomDiceValue = () => {
  return Math.floor(Math.random() * 6) + 1;
};

export const isTokenMovable = (token, currentPlayerId, gameState) => {
  if (!token || !currentPlayerId || !gameState) return false;
  if (token.playerId !== currentPlayerId) return false;
  if (token.isWinner) return false;
  if (gameState.gameStatus !== 'playing') return false;
  return true;
};

export const getTokenPosition = (tokenId, board) => {
  if (!tokenId || !board || !board.tokens) return null;
  const token = board.tokens.find(t => t.id === tokenId);
  return token ? token.position : null;
};

export const getCellType = (position, boardLayout) => {
  if (!position || !boardLayout || !Array.isArray(boardLayout)) return 'empty';
  const cell = boardLayout.find(c => c.id === position);
  return cell ? cell.type : 'empty';
};

export const isSafeCell = (position, boardLayout) => {
  if (!position || !boardLayout || !Array.isArray(boardLayout)) return false;
  const cell = boardLayout.find(c => c.id === position);
  return cell ? cell.isSafe : false;
};

export const getPlayerById = (playerId, players) => {
  if (!playerId || !players || !Array.isArray(players)) return null;
  return players.find(p => p.id === playerId) || null;
};

export const getActivePlayers = (players) => {
  if (!players || !Array.isArray(players)) return [];
  return players.filter(p => p.connected !== false);
};

export const getRemainingTokens = (playerId, board) => {
  if (!playerId || !board || !board.tokens) return 0;
  const playerTokens = board.tokens.filter(t => t.playerId === playerId && !t.isWinner);
  return playerTokens.length;
};

export const isRoomFull = (currentPlayers, maxPlayers) => {
  if (!currentPlayers || !Array.isArray(currentPlayers)) return false;
  if (!Number.isInteger(maxPlayers) || maxPlayers < 2) return false;
  return currentPlayers.length >= maxPlayers;
};

export const canStartGame = (players, maxPlayers) => {
  if (!players || !Array.isArray(players)) return false;
  if (players.length < 2) return false;
  if (players.length > maxPlayers) return false;
  const allConnected = players.every(p => p.connected !== false);
  return allConnected;
};

export const sortPlayersByScore = (players) => {
  if (!players || !Array.isArray(players)) return [];
  return [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
};

export const getPlayerRank = (playerId, players) => {
  if (!playerId || !players || !Array.isArray(players)) return null;
  const sorted = sortPlayersByScore(players);
  const index = sorted.findIndex(p => p.id === playerId);
  return index !== -1 ? index + 1 : null;
};