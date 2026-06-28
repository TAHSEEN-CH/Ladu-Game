export const GAME_STATUS = Object.freeze({
  WAITING: "waiting",
  READY: "ready",
  PLAYING: "playing",
  PAUSED: "paused",
  FINISHED: "finished",
});

export const PLAYER_COLORS = Object.freeze({
  RED: "red",
  GREEN: "green",
  YELLOW: "yellow",
  BLUE: "blue",
});

export const PLAYER_COLORS_LIST = Object.freeze([
  PLAYER_COLORS.RED,
  PLAYER_COLORS.GREEN,
  PLAYER_COLORS.YELLOW,
  PLAYER_COLORS.BLUE,
]);

export const GAME_MODES = Object.freeze({
  TWO_PLAYER: "2 Players",
  THREE_PLAYER: "3 Players",
  FOUR_PLAYER: "4 Players",
  CLASSIC: "Classic",
  QUICK: "Quick Play",
  TOURNAMENT: "Tournament",
});

export const SUPPORTED_PLAYER_COUNTS = Object.freeze([2, 3, 4]);

export const DICE = Object.freeze({
  MIN_VALUE: 1,
  MAX_VALUE: 6,
  DEFAULT_VALUE: 1,
  ROLL_ANIMATION_DURATION: 1000,
  EXTRA_TURN_VALUE: 6,
  MAX_CONSECUTIVE_SIXES: 3,
});

export const BOARD = Object.freeze({
  SIZE: 15,
  HOME_SIZE: 6,
  PATH_WIDTH: 3,
  CENTER_SIZE: 3,
  MAX_TOKENS_PER_CELL: 4,
});

export const TOKEN = Object.freeze({
  MAX_TOKENS_PER_PLAYER: 4,
  START_POSITION: -1,
  HOME_POSITION: "home",
  WIN_POSITION: "win",
});

export const ROOM = Object.freeze({
  DEFAULT_MAX_PLAYERS: 4,
  DEFAULT_ROOM_NAME: "Ludo Room",
  ROOM_ID_PREFIX: "LUDO",
  ROOM_ID_LENGTH: 6,
  MAX_ROOM_NAME_LENGTH: 30,
  VISIBILITY: {
    PUBLIC: "public",
    PRIVATE: "private",
  },
});

export const DEFAULT_GAME_SETTINGS = Object.freeze({
  turnTimeLimit: 30,
  maxPlayers: 4,
  gameMode: GAME_MODES.CLASSIC,
  diceCount: 1,
  isPrivate: false,
  allowSpectators: true,
  showTimer: true,
  soundEnabled: true,
  animationsEnabled: true,
});

export const SOCKET_EVENTS = Object.freeze({
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  CREATE_ROOM: "createRoom",
  START_GAME: "startGame",
  ROLL_DICE: "rollDice",
  MOVE_TOKEN: "moveToken",
  END_TURN: "endTurn",
  GAME_STATE_UPDATE: "gameStateUpdate",
  PLAYER_JOINED: "playerJoined",
  PLAYER_LEFT: "playerLeft",
  PLAYER_READY: "playerReady",
  GAME_STARTED: "gameStarted",
  GAME_FINISHED: "gameFinished",
  TOKEN_MOVED: "tokenMoved",
  DICE_ROLLED: "diceRolled",
  TURN_CHANGED: "turnChanged",
  ERROR: "error",
  RECONNECT: "reconnect",
});

export const TIMER = Object.freeze({
  DEFAULT_TURN_TIME: 30,
  MIN_TURN_TIME: 10,
  MAX_TURN_TIME: 120,
  WARNING_THRESHOLD: 5,
  DANGER_THRESHOLD: 3,
  RECONNECT_TIMEOUT: 5000,
  HEARTBEAT_INTERVAL: 30000,
});

export const CELL_TYPES = Object.freeze({
  PATH: "path",
  HOME: "home",
  SAFE: "safe",
  CENTER: "center",
  EMPTY: "empty",
  HOME_PATH: "homePath",
  SPAWN: "spawn",
});

export const PLAYER_POSITIONS = Object.freeze({
  RED: "top-left",
  GREEN: "top-right",
  YELLOW: "bottom-left",
  BLUE: "bottom-right",
});

export const ANIMATION = Object.freeze({
  DURATION: {
    FAST: 200,
    NORMAL: 400,
    SLOW: 800,
    DICE_ROLL: 1000,
    TOKEN_MOVE: 600,
    CAPTURE: 500,
    WIN: 1500,
  },
  EASING: {
    DEFAULT: "ease-in-out",
    BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    SMOOTH: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
});

export const ERROR_MESSAGES = Object.freeze({
  ROOM_NOT_FOUND: "Room not found",
  ROOM_FULL: "Room is full",
  INVALID_ROOM_ID: "Invalid room ID",
  GAME_ALREADY_STARTED: "Game has already started",
  PLAYER_ALREADY_IN_ROOM: "Player already in room",
  NOT_YOUR_TURN: "Not your turn",
  INVALID_MOVE: "Invalid move",
  DICE_ALREADY_ROLLED: "Dice already rolled this turn",
  CONNECTION_ERROR: "Connection error",
  RECONNECT_FAILED: "Reconnection failed",
  GAME_NOT_FOUND: "Game not found",
});
