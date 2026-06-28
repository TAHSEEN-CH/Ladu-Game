import { createContext, useContext, useReducer, useMemo } from 'react';

const initialGameState = {
  room: {
    id: null,
    name: null,
    hostId: null,
    gameMode: '4 Players',
    visibility: 'public',
    maxPlayers: 4,
    connectedPlayers: 0,
    createdAt: null
  },
  players: [],
  board: {
    cells: [],
    tokens: [],
    lastMove: null
  },
  dice: {
    value: 1,
    isRolling: false,
    canRoll: false
  },
  currentTurn: {
    playerId: null,
    playerName: null,
    playerColor: null,
    turnNumber: 0,
    timeRemaining: 30
  },
  gameStatus: 'waiting',
  winner: {
    playerId: null,
    playerName: null,
    playerColor: null,
    rank: null
  },
  settings: {
    turnTimeLimit: 30,
    maxPlayers: 4,
    gameMode: 'Classic',
    diceCount: 1,
    isPrivate: false
  }
};

const GameContext = createContext(null);

const gameReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const contextValue = useMemo(() => ({
    state,
    dispatch
  }), [state]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { GameContext, GameProvider, useGame };