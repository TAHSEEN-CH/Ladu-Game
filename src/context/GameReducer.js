export const actionTypes = {
  SET_ROOM: "SET_ROOM",
  SET_PLAYERS: "SET_PLAYERS",
  UPDATE_PLAYER: "UPDATE_PLAYER",
  SET_BOARD: "SET_BOARD",
  MOVE_TOKEN: "MOVE_TOKEN",
  ROLL_DICE: "ROLL_DICE",
  SET_CURRENT_TURN: "SET_CURRENT_TURN",
  SET_GAME_STATUS: "SET_GAME_STATUS",
  SET_WINNER: "SET_WINNER",
  RESET_GAME: "RESET_GAME",
  CONNECT_SOCKET: "CONNECT_SOCKET",
  DISCONNECT_SOCKET: "DISCONNECT_SOCKET",
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ROOM:
      return {
        ...state,
        room: {
          ...state.room,
          ...action.payload,
        },
      };

    case actionTypes.SET_PLAYERS:
      return {
        ...state,
        players: action.payload,
      };

    case actionTypes.UPDATE_PLAYER:
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.payload.id
            ? { ...player, ...action.payload.updates }
            : player,
        ),
      };

    case actionTypes.SET_BOARD:
      return {
        ...state,
        board: {
          ...state.board,
          ...action.payload,
        },
      };

    case actionTypes.MOVE_TOKEN:
      return {
        ...state,
        board: {
          ...state.board,
          lastMove: action.payload,
          tokens: state.board.tokens.map((token) =>
            token.id === action.payload.tokenId
              ? { ...token, position: action.payload.newPosition }
              : token,
          ),
        },
      };

    case actionTypes.ROLL_DICE:
      return {
        ...state,
        dice: {
          ...state.dice,
          value: action.payload.value,
          isRolling: false,
          canRoll: false,
        },
      };

    case actionTypes.SET_CURRENT_TURN:
      return {
        ...state,
        currentTurn: {
          ...state.currentTurn,
          ...action.payload,
        },
      };

    case actionTypes.SET_GAME_STATUS:
      return {
        ...state,
        gameStatus: action.payload,
      };

    case actionTypes.SET_WINNER:
      return {
        ...state,
        winner: {
          ...state.winner,
          ...action.payload,
        },
        gameStatus: "finished",
      };

    case actionTypes.RESET_GAME:
      return {
        ...state,
        board: {
          cells: [],
          tokens: [],
          lastMove: null,
        },
        dice: {
          value: 1,
          isRolling: false,
          canRoll: false,
        },
        currentTurn: {
          playerId: null,
          playerName: null,
          playerColor: null,
          turnNumber: 0,
          timeRemaining: 30,
        },
        gameStatus: "waiting",
        winner: {
          playerId: null,
          playerName: null,
          playerColor: null,
          rank: null,
        },
      };

    case actionTypes.CONNECT_SOCKET:
      return {
        ...state,
        socket: {
          ...state.socket,
          connected: true,
          ...action.payload,
        },
      };

    case actionTypes.DISCONNECT_SOCKET:
      return {
        ...state,
        socket: {
          ...state.socket,
          connected: false,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};

export default gameReducer;
