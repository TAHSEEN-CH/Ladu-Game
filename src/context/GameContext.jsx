// src/context/GameContext.jsx

/**
 * Game Context
 * 
 * Production-ready React Context for Ludo game state management.
 * Uses useReducer architecture with comprehensive actions for game operations.
 * Frontend-only - ready for future Socket.IO integration.
 */

import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

// ============================================================
// INITIAL STATE
// ============================================================

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

// ============================================================
// CONTEXT
// ============================================================

const GameContext = createContext(null);

// ============================================================
// REDUCER
// ============================================================

/**
 * Game reducer - handles all game state mutations.
 * Pure function with comprehensive action handling.
 */
const gameReducer = (state, action) => {
  switch (action.type) {
    // ============================================================
    // ROOM ACTIONS
    // ============================================================

    case 'CREATE_ROOM': {
      const { roomData } = action.payload;
      return {
        ...state,
        room: {
          ...state.room,
          id: roomData.id,
          name: roomData.name || `Room ${roomData.id}`,
          hostId: roomData.hostId,
          gameMode: roomData.gameMode || state.room.gameMode,
          visibility: roomData.visibility || state.room.visibility,
          maxPlayers: roomData.maxPlayers || state.room.maxPlayers,
          connectedPlayers: 1,
          createdAt: Date.now()
        },
        players: [
          {
            id: roomData.hostId,
            name: roomData.hostName || 'Host',
            color: roomData.hostColor || 'red',
            isHost: true,
            isReady: false,
            joinedAt: Date.now()
          }
        ],
        gameStatus: 'waiting',
        settings: {
          ...state.settings,
          maxPlayers: roomData.maxPlayers || state.settings.maxPlayers,
          gameMode: roomData.gameMode || state.settings.gameMode,
          isPrivate: roomData.isPrivate !== undefined ? roomData.isPrivate : state.settings.isPrivate
        }
      };
    }

    case 'JOIN_ROOM': {
      const { playerData } = action.payload;

      // Prevent duplicate players
      if (state.players.some(p => p.id === playerData.id)) {
        return state;
      }

      // Prevent joining if room is full
      if (state.players.length >= state.room.maxPlayers) {
        return state;
      }

      return {
        ...state,
        room: {
          ...state.room,
          connectedPlayers: state.room.connectedPlayers + 1
        },
        players: [
          ...state.players,
          {
            id: playerData.id,
            name: playerData.name || `Player ${state.players.length + 1}`,
            color: playerData.color || getAvailableColor(state.players),
            isHost: false,
            isReady: false,
            joinedAt: Date.now()
          }
        ]
      };
    }

    case 'LEAVE_ROOM': {
      const { playerId } = action.payload;

      const updatedPlayers = state.players.filter(p => p.id !== playerId);
      const isHostLeaving = state.room.hostId === playerId;

      // Reset room if everyone leaves
      if (updatedPlayers.length === 0) {
        return {
          ...initialGameState,
          settings: state.settings // Preserve settings
        };
      }

      // Transfer host if host leaves
      let newHostId = state.room.hostId;
      let updatedPlayersWithHost = updatedPlayers;

      if (isHostLeaving && updatedPlayers.length > 0) {
        newHostId = updatedPlayers[0].id;
        updatedPlayersWithHost = updatedPlayers.map((p, index) => ({
          ...p,
          isHost: index === 0
        }));
      }

      return {
        ...state,
        room: {
          ...state.room,
          hostId: newHostId,
          connectedPlayers: updatedPlayersWithHost.length
        },
        players: updatedPlayersWithHost,
        // Reset game if host leaves and game was in progress
        gameStatus: state.gameStatus === 'playing' ? 'waiting' : state.gameStatus,
        winner: state.gameStatus === 'playing' ? initialGameState.winner : state.winner
      };
    }

    // ============================================================
    // GAME ACTIONS
    // ============================================================

    case 'START_GAME': {
      // Validate that we have enough players
      if (state.players.length < 2) {
        return state;
      }

      // Reset game state but keep players and room
      return {
        ...state,
        gameStatus: 'playing',
        currentTurn: {
          ...state.currentTurn,
          playerId: state.players[0]?.id || null,
          playerName: state.players[0]?.name || null,
          playerColor: state.players[0]?.color || null,
          turnNumber: 1,
          timeRemaining: state.settings.turnTimeLimit
        },
        dice: {
          ...state.dice,
          value: 1,
          isRolling: false,
          canRoll: true
        },
        board: {
          ...state.board,
          lastMove: null
        },
        winner: initialGameState.winner,
        players: state.players.map(p => ({
          ...p,
          isReady: true
        }))
      };
    }

    case 'RESET_GAME': {
      return {
        ...state,
        gameStatus: 'waiting',
        currentTurn: initialGameState.currentTurn,
        dice: initialGameState.dice,
        board: initialGameState.board,
        winner: initialGameState.winner,
        players: state.players.map(p => ({
          ...p,
          isReady: false
        }))
      };
    }

    case 'UPDATE_GAME_STATUS': {
      const { status } = action.payload;
      return {
        ...state,
        gameStatus: status
      };
    }

    // ============================================================
    // BOARD ACTIONS
    // ============================================================

    case 'UPDATE_BOARD': {
      const { board } = action.payload;
      return {
        ...state,
        board: {
          ...state.board,
          ...board
        }
      };
    }

    case 'UPDATE_DICE': {
      const { dice } = action.payload;
      return {
        ...state,
        dice: {
          ...state.dice,
          ...dice
        }
      };
    }

    case 'UPDATE_TURN': {
      const { turn } = action.payload;
      return {
        ...state,
        currentTurn: {
          ...state.currentTurn,
          ...turn
        }
      };
    }

    // ============================================================
    // PLAYER ACTIONS
    // ============================================================

    case 'UPDATE_PLAYER': {
      const { playerId, updates } = action.payload;
      return {
        ...state,
        players: state.players.map(p =>
          p.id === playerId
            ? { ...p, ...updates }
            : p
        )
      };
    }

    case 'ADD_PLAYER': {
      const { player } = action.payload;

      if (state.players.some(p => p.id === player.id)) {
        return state;
      }

      return {
        ...state,
        room: {
          ...state.room,
          connectedPlayers: state.room.connectedPlayers + 1
        },
        players: [
          ...state.players,
          {
            ...player,
            joinedAt: Date.now()
          }
        ]
      };
    }

    case 'REMOVE_PLAYER': {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.filter(p => p.id !== playerId);

      return {
        ...state,
        room: {
          ...state.room,
          connectedPlayers: updatedPlayers.length
        },
        players: updatedPlayers
      };
    }

    // ============================================================
    // WINNER ACTIONS
    // ============================================================

    case 'SET_WINNER': {
      const { player } = action.payload;
      return {
        ...state,
        winner: {
          playerId: player.id,
          playerName: player.name,
          playerColor: player.color,
          rank: player.rank || 1
        },
        gameStatus: 'finished'
      };
    }

    // ============================================================
    // SETTINGS ACTIONS
    // ============================================================

    case 'UPDATE_SETTINGS': {
      const { settings } = action.payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...settings
        }
      };
    }

    default:
      return state;
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Gets an available color for a new player.
 * @param {Array} players - Current players
 * @returns {string} Available color
 */
const getAvailableColor = (players) => {
  const colors = ['red', 'green', 'yellow', 'blue'];
  const usedColors = players.map(p => p.color);
  const available = colors.find(c => !usedColors.includes(c));
  return available || colors[0];
};

/**
 * Generates a unique room ID.
 * @returns {string} Room ID
 */
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ============================================================
// GAME PROVIDER
// ============================================================

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // ============================================================
  // ACTION FUNCTIONS
  // ============================================================

  /**
   * Creates a new game room.
   * @param {Object} roomData - Room configuration
   * @param {string} roomData.name - Room name (optional)
   * @param {string} roomData.hostId - Host player ID
   * @param {string} roomData.hostName - Host player name
   * @param {string} roomData.hostColor - Host player color
   * @param {string} roomData.gameMode - Game mode
   * @param {string} roomData.visibility - Room visibility
   * @param {number} roomData.maxPlayers - Max players
   * @param {boolean} roomData.isPrivate - Whether room is private
   */
  const createRoom = useCallback((roomData) => {
    const roomId = roomData.id || generateRoomId();
    dispatch({
      type: 'CREATE_ROOM',
      payload: {
        roomData: {
          id: roomId,
          ...roomData
        }
      }
    });
    return roomId;
  }, []);

  /**
   * Joins an existing game room.
   * @param {Object} playerData - Player information
   * @param {string} playerData.id - Player ID
   * @param {string} playerData.name - Player name
   * @param {string} playerData.color - Player color (optional)
   */
  const joinRoom = useCallback((playerData) => {
    dispatch({
      type: 'JOIN_ROOM',
      payload: { playerData }
    });
  }, []);

  /**
   * Leaves the current room.
   * @param {string} playerId - Player ID leaving
   */
  const leaveRoom = useCallback((playerId) => {
    dispatch({
      type: 'LEAVE_ROOM',
      payload: { playerId }
    });
  }, []);

  /**
   * Starts the game.
   */
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  /**
   * Resets the game.
   */
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  /**
   * Updates the game status.
   * @param {string} status - New game status
   */
  const updateGameStatus = useCallback((status) => {
    dispatch({
      type: 'UPDATE_GAME_STATUS',
      payload: { status }
    });
  }, []);

  /**
   * Updates the board.
   * @param {Object} board - Board update
   */
  const updateBoard = useCallback((board) => {
    dispatch({
      type: 'UPDATE_BOARD',
      payload: { board }
    });
  }, []);

  /**
   * Updates the dice.
   * @param {Object} dice - Dice update
   */
  const updateDice = useCallback((dice) => {
    dispatch({
      type: 'UPDATE_DICE',
      payload: { dice }
    });
  }, []);

  /**
   * Updates the turn.
   * @param {Object} turn - Turn update
   */
  const updateTurn = useCallback((turn) => {
    dispatch({
      type: 'UPDATE_TURN',
      payload: { turn }
    });
  }, []);

  /**
   * Updates a player.
   * @param {string} playerId - Player ID
   * @param {Object} updates - Player updates
   */
  const updatePlayer = useCallback((playerId, updates) => {
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: { playerId, updates }
    });
  }, []);

  /**
   * Adds a player.
   * @param {Object} player - Player to add
   */
  const addPlayer = useCallback((player) => {
    dispatch({
      type: 'ADD_PLAYER',
      payload: { player }
    });
  }, []);

  /**
   * Removes a player.
   * @param {string} playerId - Player ID to remove
   */
  const removePlayer = useCallback((playerId) => {
    dispatch({
      type: 'REMOVE_PLAYER',
      payload: { playerId }
    });
  }, []);

  /**
   * Sets the winner.
   * @param {Object} player - Winner player
   */
  const setWinner = useCallback((player) => {
    dispatch({
      type: 'SET_WINNER',
      payload: { player }
    });
  }, []);

  /**
   * Updates settings.
   * @param {Object} settings - Settings update
   */
  const updateSettings = useCallback((settings) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { settings }
    });
  }, []);

  // ============================================================
  // MEMOIZED CONTEXT VALUE
  // ============================================================

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    // Action functions
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    resetGame,
    updateGameStatus,
    updateBoard,
    updateDice,
    updateTurn,
    updatePlayer,
    addPlayer,
    removePlayer,
    setWinner,
    updateSettings
  }), [
    state,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    resetGame,
    updateGameStatus,
    updateBoard,
    updateDice,
    updateTurn,
    updatePlayer,
    addPlayer,
    removePlayer,
    setWinner,
    updateSettings
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// ============================================================
// CUSTOM HOOK
// ============================================================

/**
 * Custom hook for accessing game context.
 * @throws {Error} If used outside GameProvider
 * @returns {Object} Game context value
 */
function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// ============================================================
// EXPORT
// ============================================================

export { GameContext, GameProvider, useGame };

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. What actions were added:
 * 
 * - CREATE_ROOM: Initializes a new room with host player
 * - JOIN_ROOM: Adds a new player to the room
 * - LEAVE_ROOM: Removes a player from the room
 * - START_GAME: Transitions game from waiting to playing
 * - RESET_GAME: Resets game state while keeping players
 * - UPDATE_GAME_STATUS: Manually updates game status
 * - UPDATE_BOARD: Updates board state (cells, tokens, moves)
 * - UPDATE_DICE: Updates dice value and rolling state
 * - UPDATE_TURN: Updates current turn information
 * - UPDATE_PLAYER: Updates specific player properties
 * - ADD_PLAYER: Adds a player (alternative to JOIN_ROOM)
 * - REMOVE_PLAYER: Removes a player (alternative to LEAVE_ROOM)
 * - SET_WINNER: Sets the winner and ends the game
 * - UPDATE_SETTINGS: Updates game settings
 * 
 * 2. How createRoom() works:
 * 
 * - Generates a unique room ID if not provided
 * - Creates room object with metadata (id, name, hostId, etc.)
 * - Sets connectedPlayers to 1 (the host)
 * - Creates the host player in the players array
 *   - Sets isHost: true
 *   - Sets isReady: false
 * - Sets gameStatus to "waiting"
 * - Stores createdAt timestamp
 * - Updates settings with room configuration
 * 
 * 3. How joinRoom() works:
 * 
 * - Validates player doesn't already exist in the room
 * - Validates room isn't full (maxPlayers)
 * - Creates player object with:
 *   - Provided id, name, color (auto-assigns color if not provided)
 *   - isHost: false
 *   - isReady: false
 *   - joinedAt timestamp
 * - Increments connectedPlayers count
 * - Adds player to players array
 * - Automatically assigns available color using getAvailableColor()
 * 
 * 4. Why this design makes Socket.IO integration easy later:
 * 
 * - The reducer pattern separates state mutations from the UI:
 *   * All state updates go through well-defined actions
 *   * Actions are pure and predictable
 *   * Easy to synchronize with server via Socket.IO
 * 
 * - Socket.IO integration would involve:
 *   * Wrapping actions to send events to server
 *   * Listening for server events and dispatching local actions
 *   * Maintaining optimistic updates with rollback support
 * 
 * - Example integration:
 * 
 *   const createRoom = useCallback((roomData) => {
 *     // Send to server
 *     socket.emit('createRoom', roomData);
 *     
 *     // Optimistically update local state
 *     dispatch({ type: 'CREATE_ROOM', payload: { roomData } });
 *   }, []);
 * 
 *   // Server listener
 *   socket.on('roomCreated', (data) => {
 *     // Sync with server state
 *     dispatch({ type: 'UPDATE_ROOM', payload: data });
 *   });
 * 
 * - The action functions are separated from the UI:
 *   * Components don't need to know about Socket.IO
 *   * Can easily swap between local and server operations
 *   * Great for offline-first architecture
 * 
 * - State is serializable:
 *   * All state is plain JavaScript objects
 *   * Easy to send over Socket.IO
 *   * Easy to rehydrate from server
 * 
 * - The design is event-sourcing ready:
 *   * Actions represent all state changes
 *   * Can replay actions to rebuild state
 *   * Perfect for multiplayer synchronization
 */