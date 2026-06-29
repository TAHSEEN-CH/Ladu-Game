// src/services/socketService.js

/**
 * SocketService Class
 *
 * Professional, scalable Socket.IO service for the Ludo application.
 * Currently uses a mock implementation with internal event emitter.
 * Ready for real Socket.IO integration with minimal changes.
 */

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Default configuration for the socket service.
 */
const DEFAULT_CONFIG = {
  url: "http://localhost:3000",
  options: {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  },
};

/**
 * Event types that can be emitted/received.
 */
const EVENT_TYPES = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT_ERROR: "reconnect_error",
  CONNECT_ERROR: "connect_error",

  // Room events
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  ROOM_CREATED: "roomCreated",
  ROOM_JOINED: "roomJoined",
  ROOM_LEFT: "roomLeft",
  ROOM_UPDATED: "roomUpdated",
  PLAYER_JOINED: "playerJoined",
  PLAYER_LEFT: "playerLeft",

  // Game events
  START_GAME: "startGame",
  GAME_STARTED: "gameStarted",
  GAME_STATE_UPDATE: "gameStateUpdate",
  GAME_FINISHED: "gameFinished",

  // Dice events
  ROLL_DICE: "rollDice",
  DICE_ROLLED: "diceRolled",

  // Token events
  MOVE_TOKEN: "moveToken",
  TOKEN_MOVED: "tokenMoved",
  TOKEN_CAPTURED: "tokenCaptured",

  // Chat events
  CHAT_MESSAGE: "chatMessage",
  CHAT_RECEIVED: "chatReceived",

  // Error events
  ERROR: "error",
};

/**
 * Mock response data for various events.
 */
const MOCK_RESPONSES = {
  [EVENT_TYPES.CREATE_ROOM]: (data) => ({
    success: true,
    message: "Room created successfully",
    data: {
      roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...data,
      createdAt: new Date().toISOString(),
    },
  }),
  [EVENT_TYPES.JOIN_ROOM]: (data) => ({
    success: true,
    message: "Joined room successfully",
    data: {
      ...data,
      joinedAt: new Date().toISOString(),
    },
  }),
  [EVENT_TYPES.LEAVE_ROOM]: (data) => ({
    success: true,
    message: "Left room successfully",
    data,
  }),
  [EVENT_TYPES.START_GAME]: (data) => ({
    success: true,
    message: "Game started successfully",
    data: {
      ...data,
      startedAt: new Date().toISOString(),
    },
  }),
  [EVENT_TYPES.ROLL_DICE]: (data) => ({
    success: true,
    message: "Dice rolled successfully",
    data: {
      ...data,
      value: Math.floor(Math.random() * 6) + 1,
      timestamp: new Date().toISOString(),
    },
  }),
  [EVENT_TYPES.MOVE_TOKEN]: (data) => ({
    success: true,
    message: "Token moved successfully",
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
  }),
  [EVENT_TYPES.CHAT_MESSAGE]: (data) => ({
    success: true,
    message: "Message sent successfully",
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
  }),
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generates a unique ID for events and callbacks.
 * @returns {string} Unique ID
 */
const generateId = () => {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Checks if a value is a valid event name.
 * @param {string} event - Event name to validate
 * @returns {boolean} True if valid
 */
const isValidEvent = (event) => {
  return event && typeof event === "string" && event.length > 0;
};

/**
 * Checks if a value is a valid callback function.
 * @param {Function} callback - Callback to validate
 * @returns {boolean} True if valid
 */
const isValidCallback = (callback) => {
  return callback && typeof callback === "function";
};

/**
 * Simulates network delay.
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {Promise} Promise that resolves after delay
 */
const simulateNetworkDelay = (min = 100, max = 800) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// ============================================================
// SOCKET SERVICE CLASS
// ============================================================

/**
 * SocketService class for managing Socket.IO connections.
 * Uses mock implementation with internal event emitter.
 * Ready for real Socket.IO integration.
 */
class SocketService {
  constructor(config = {}) {
    // ============================================================
    // CONFIGURATION
    // ============================================================

    this.config = {
      url: config.url || DEFAULT_CONFIG.url,
      options: {
        ...DEFAULT_CONFIG.options,
        ...config.options,
      },
    };

    // ============================================================
    // STATE
    // ============================================================

    this._socket = null; // Real Socket.IO instance (future)
    this._isConnected = false;
    this._isConnecting = false;
    this._roomId = null;
    this._playerId = null;
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = this.config.options.reconnectionAttempts || 5;
    this._reconnectTimer = null;
    this._connectionId = null;

    // ============================================================
    // EVENT SYSTEM (Internal Event Emitter)
    // ============================================================

    // Map of event names to sets of callbacks
    this._eventListeners = new Map();
    // Map of event names to sets of once callbacks
    this._onceListeners = new Map();
    // Map of callback IDs to cleanup functions
    this._listenerCleanup = new Map();

    // ============================================================
    // MOCK STATE
    // ============================================================

    this._mockRooms = new Map();
    this._mockPlayers = new Map();
    this._mockGameStates = new Map();

    // ============================================================
    // BIND METHODS
    // ============================================================

    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.isConnected = this.isConnected.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.startGame = this.startGame.bind(this);
    this.sendDiceRoll = this.sendDiceRoll.bind(this);
    this.moveToken = this.moveToken.bind(this);
    this.sendChatMessage = this.sendChatMessage.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.once.bind(this);
    this.removeAllListeners = this.removeAllListeners.bind(this);
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Internal method to trigger event listeners.
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  _triggerEvent(event, data) {
    if (!isValidEvent(event)) return;

    // Trigger regular listeners
    if (this._eventListeners.has(event)) {
      const listeners = this._eventListeners.get(event);
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[SocketService] Error in listener for ${event}:`,
            error,
          );
        }
      }
    }

    // Trigger once listeners
    if (this._onceListeners.has(event)) {
      const listeners = this._onceListeners.get(event);
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[SocketService] Error in once listener for ${event}:`,
            error,
          );
        }
      }
      // Clear once listeners after triggering
      this._onceListeners.delete(event);
    }
  }

  /**
   * Internal method to handle mock responses.
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @param {number} delay - Delay in ms
   */
  async _handleMockResponse(event, data, delay = 300) {
    await simulateNetworkDelay(delay / 2, delay);

    // Get mock response
    const mockResponse = MOCK_RESPONSES[event];
    if (mockResponse) {
      const response = mockResponse(data);

      // Trigger response event
      const responseEvent = `${event}Response`;
      this._triggerEvent(responseEvent, response);

      // Trigger generic event
      this._triggerEvent(event, response);

      // Trigger success/error events
      if (response.success) {
        this._triggerEvent(`${event}Success`, response);
      } else {
        this._triggerEvent(`${event}Error`, response);
      }
    }

    // Update mock state for certain events
    await this._updateMockState(event, data);
  }

  /**
   * Updates mock state for specific events.
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  async _updateMockState(event, data) {
    switch (event) {
      case EVENT_TYPES.CREATE_ROOM:
        if (data) {
          const roomId = `room_${Date.now()}`;
          this._mockRooms.set(roomId, {
            ...data,
            roomId,
            createdAt: new Date().toISOString(),
            players: [],
          });
          this._roomId = roomId;
        }
        break;

      case EVENT_TYPES.JOIN_ROOM:
        if (data?.roomId && data?.playerId) {
          const room = this._mockRooms.get(data.roomId);
          if (room) {
            const player = {
              id: data.playerId,
              name: data.playerName || "Player",
              joinedAt: new Date().toISOString(),
            };
            if (!room.players.some((p) => p.id === player.id)) {
              room.players.push(player);
            }
            this._mockRooms.set(data.roomId, room);
          }
        }
        break;

      case EVENT_TYPES.LEAVE_ROOM:
        if (data?.roomId && data?.playerId) {
          const room = this._mockRooms.get(data.roomId);
          if (room) {
            room.players = room.players.filter((p) => p.id !== data.playerId);
            this._mockRooms.set(data.roomId, room);
          }
        }
        break;

      default:
        break;
    }
  }

  /**
   * Validates connection state.
   * @throws {Error} If not connected
   */
  _validateConnection() {
    if (!this._isConnected) {
      throw new Error("Socket is not connected");
    }
  }

  /**
   * Validates room state.
   * @param {string} roomId - Room ID to validate
   * @throws {Error} If room ID is invalid
   */
  _validateRoom(roomId) {
    if (!roomId || typeof roomId !== "string") {
      throw new Error("Invalid room ID");
    }
  }

  /**
   * Validates player data.
   * @param {Object} playerData - Player data to validate
   * @throws {Error} If player data is invalid
   */
  _validatePlayerData(playerData) {
    if (!playerData || typeof playerData !== "object") {
      throw new Error("Invalid player data");
    }
    if (!playerData.id) {
      throw new Error("Player ID is required");
    }
  }

  /**
   * Attempts to reconnect with exponential backoff.
   */
  _attemptReconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }

    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error("[SocketService] Max reconnect attempts reached");
      this._triggerEvent(EVENT_TYPES.RECONNECT_ERROR, {
        message: "Max reconnect attempts reached",
        attempts: this._reconnectAttempts,
      });
      return;
    }

    this._reconnectAttempts++;
    const delay = Math.min(
      this.config.options.reconnectionDelay *
        Math.pow(1.5, this._reconnectAttempts - 1),
      this.config.options.reconnectionDelayMax || 5000,
    );

    console.log(
      `[SocketService] Reconnect attempt ${this._reconnectAttempts} in ${delay}ms`,
    );
    this._triggerEvent(EVENT_TYPES.RECONNECT_ATTEMPT, {
      attempt: this._reconnectAttempts,
      maxAttempts: this._maxReconnectAttempts,
      delay,
    });

    this._reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ============================================================
  // PUBLIC METHODS - Connection
  // ============================================================

  /**
   * Connects to the Socket.IO server.
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connection result
   */
  async connect(options = {}) {
    if (this._isConnected) {
      return {
        success: true,
        message: "Already connected",
        data: { connectionId: this._connectionId },
      };
    }

    if (this._isConnecting) {
      return { success: false, message: "Connection already in progress" };
    }

    try {
      this._isConnecting = true;
      console.log("[SocketService] Connecting...", options);

      // Simulate connection delay
      await simulateNetworkDelay(200, 500);

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // this._socket = io(this.config.url, {
      //   ...this.config.options,
      //   ...options,
      // });
      //
      // this._socket.on('connect', () => {
      //   this._handleConnect();
      // });
      //
      // this._socket.on('disconnect', (reason) => {
      //   this._handleDisconnect(reason);
      // });
      //
      // this._socket.on('connect_error', (error) => {
      //   this._handleConnectError(error);
      // });
      // ============================================================

      // Mock connection
      this._isConnected = true;
      this._isConnecting = false;
      this._connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      this._reconnectAttempts = 0;

      const result = {
        success: true,
        message: "Connected successfully",
        data: {
          connectionId: this._connectionId,
          timestamp: new Date().toISOString(),
        },
      };

      // Trigger connect event
      this._triggerEvent(EVENT_TYPES.CONNECT, result);

      console.log("[SocketService] Connected successfully");
      return result;
    } catch (error) {
      this._isConnecting = false;
      console.error("[SocketService] Connection failed:", error);

      const errorResult = {
        success: false,
        message: error.message || "Connection failed",
        error: error.message,
      };

      this._triggerEvent(EVENT_TYPES.CONNECT_ERROR, errorResult);
      return errorResult;
    }
  }

  /**
   * Disconnects from the Socket.IO server.
   * @returns {Promise<Object>} Disconnection result
   */
  async disconnect() {
    try {
      console.log("[SocketService] Disconnecting...");

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // if (this._socket) {
      //   this._socket.disconnect();
      //   this._socket = null;
      // }
      // ============================================================

      // Clear reconnect timer
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }

      // Reset state
      this._isConnected = false;
      this._isConnecting = false;
      this._roomId = null;
      this._playerId = null;

      // Clear all listeners (optional - keep them for reconnection)
      // this.removeAllListeners();

      const result = {
        success: true,
        message: "Disconnected successfully",
        data: {
          timestamp: new Date().toISOString(),
        },
      };

      this._triggerEvent(EVENT_TYPES.DISCONNECT, result);
      console.log("[SocketService] Disconnected successfully");
      return result;
    } catch (error) {
      console.error("[SocketService] Disconnect failed:", error);
      return {
        success: false,
        message: error.message || "Disconnect failed",
        error: error.message,
      };
    }
  }

  /**
   * Reconnects to the Socket.IO server.
   * @param {Object} options - Reconnection options
   * @returns {Promise<Object>} Reconnection result
   */
  async reconnect(options = {}) {
    try {
      console.log("[SocketService] Reconnecting...");

      // Disconnect if connected
      if (this._isConnected) {
        await this.disconnect();
      }

      // Wait a moment
      await simulateNetworkDelay(200, 500);

      // Reconnect
      const result = await this.connect(options);

      if (result.success) {
        this._triggerEvent(EVENT_TYPES.RECONNECT, result);
      }

      return result;
    } catch (error) {
      console.error("[SocketService] Reconnect failed:", error);

      // Trigger reconnect error
      const errorResult = {
        success: false,
        message: error.message || "Reconnect failed",
        error: error.message,
      };
      this._triggerEvent(EVENT_TYPES.RECONNECT_ERROR, errorResult);

      return errorResult;
    }
  }

  /**
   * Checks if the socket is connected.
   * @returns {boolean} True if connected
   */
  isConnected() {
    return this._isConnected;
  }

  // ============================================================
  // PUBLIC METHODS - Room Operations
  // ============================================================

  /**
   * Creates a new game room.
   * @param {Object} roomData - Room configuration
   * @param {string} roomData.name - Room name
   * @param {string} roomData.hostId - Host player ID
   * @param {number} roomData.maxPlayers - Maximum players
   * @param {string} roomData.gameMode - Game mode
   * @param {string} roomData.visibility - Room visibility
   * @returns {Promise<Object>} Room creation result
   */
  async createRoom(roomData = {}) {
    try {
      this._validateConnection();

      if (!roomData.name) {
        throw new Error("Room name is required");
      }
      if (!roomData.hostId) {
        throw new Error("Host ID is required");
      }

      console.log("[SocketService] Creating room:", roomData);

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.CREATE_ROOM, roomData, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation
      const result = {
        success: true,
        message: "Room created successfully",
        data: {
          roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          ...roomData,
          createdAt: new Date().toISOString(),
        },
      };

      // Update mock state
      this._roomId = result.data.roomId;
      this._mockRooms.set(result.data.roomId, {
        ...result.data,
        players: [{ id: roomData.hostId, name: roomData.hostName || "Host" }],
      });

      // Trigger events
      this._triggerEvent(EVENT_TYPES.ROOM_CREATED, result);
      this._triggerEvent(EVENT_TYPES.CREATE_ROOM, result);

      console.log("[SocketService] Room created:", result.data.roomId);
      return result;
    } catch (error) {
      console.error("[SocketService] Create room failed:", error);
      return {
        success: false,
        message: error.message || "Create room failed",
        error: error.message,
      };
    }
  }

  /**
   * Joins an existing game room.
   * @param {string} roomId - Room ID to join
   * @param {Object} playerData - Player information
   * @param {string} playerData.id - Player ID
   * @param {string} playerData.name - Player name
   * @param {string} playerData.color - Player color
   * @returns {Promise<Object>} Room join result
   */
  async joinRoom(roomId, playerData = {}) {
    try {
      this._validateConnection();
      this._validateRoom(roomId);
      this._validatePlayerData(playerData);

      console.log(`[SocketService] Joining room: ${roomId}`, playerData);

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.JOIN_ROOM, { roomId, ...playerData }, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Check if room exists in mock
      const room = this._mockRooms.get(roomId);
      if (!room) {
        return {
          success: false,
          message: "Room not found",
          error: "Room not found",
        };
      }

      // Check if room is full
      if (room.players && room.players.length >= (room.maxPlayers || 4)) {
        return {
          success: false,
          message: "Room is full",
          error: "Room is full",
        };
      }

      // Mock implementation
      const result = {
        success: true,
        message: "Joined room successfully",
        data: {
          roomId,
          player: {
            ...playerData,
            joinedAt: new Date().toISOString(),
          },
          room: {
            ...room,
            players: [
              ...room.players,
              { ...playerData, joinedAt: new Date().toISOString() },
            ],
          },
        },
      };

      // Update state
      this._roomId = roomId;
      this._playerId = playerData.id;

      // Update mock state
      await this._updateMockState(EVENT_TYPES.JOIN_ROOM, {
        roomId,
        ...playerData,
      });

      // Trigger events
      this._triggerEvent(EVENT_TYPES.ROOM_JOINED, result);
      this._triggerEvent(EVENT_TYPES.JOIN_ROOM, result);
      this._triggerEvent(EVENT_TYPES.PLAYER_JOINED, {
        roomId,
        player: playerData,
      });

      console.log("[SocketService] Joined room:", roomId);
      return result;
    } catch (error) {
      console.error("[SocketService] Join room failed:", error);
      return {
        success: false,
        message: error.message || "Join room failed",
        error: error.message,
      };
    }
  }

  /**
   * Leaves the current room.
   * @param {string} roomId - Room ID to leave
   * @param {string} playerId - Player ID leaving
   * @returns {Promise<Object>} Room leave result
   */
  async leaveRoom(roomId, playerId) {
    try {
      this._validateConnection();
      this._validateRoom(roomId || this._roomId);

      const targetRoomId = roomId || this._roomId;
      const targetPlayerId = playerId || this._playerId;

      if (!targetPlayerId) {
        throw new Error("Player ID is required");
      }

      console.log(
        `[SocketService] Leaving room: ${targetRoomId}`,
        targetPlayerId,
      );

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.LEAVE_ROOM, { roomId: targetRoomId, playerId: targetPlayerId }, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation
      const result = {
        success: true,
        message: "Left room successfully",
        data: {
          roomId: targetRoomId,
          playerId: targetPlayerId,
          timestamp: new Date().toISOString(),
        },
      };

      // Update state
      if (this._roomId === targetRoomId) {
        this._roomId = null;
        this._playerId = null;
      }

      // Update mock state
      await this._updateMockState(EVENT_TYPES.LEAVE_ROOM, {
        roomId: targetRoomId,
        playerId: targetPlayerId,
      });

      // Trigger events
      this._triggerEvent(EVENT_TYPES.ROOM_LEFT, result);
      this._triggerEvent(EVENT_TYPES.LEAVE_ROOM, result);
      this._triggerEvent(EVENT_TYPES.PLAYER_LEFT, {
        roomId: targetRoomId,
        playerId: targetPlayerId,
      });

      console.log("[SocketService] Left room:", targetRoomId);
      return result;
    } catch (error) {
      console.error("[SocketService] Leave room failed:", error);
      return {
        success: false,
        message: error.message || "Leave room failed",
        error: error.message,
      };
    }
  }

  // ============================================================
  // PUBLIC METHODS - Game Operations
  // ============================================================

  /**
   * Starts the game in the current room.
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Start game result
   */
  async startGame(roomId) {
    try {
      this._validateConnection();
      this._validateRoom(roomId || this._roomId);

      const targetRoomId = roomId || this._roomId;

      console.log(`[SocketService] Starting game in room: ${targetRoomId}`);

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.START_GAME, { roomId: targetRoomId }, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation
      const result = {
        success: true,
        message: "Game started successfully",
        data: {
          roomId: targetRoomId,
          startedAt: new Date().toISOString(),
        },
      };

      // Trigger events
      this._triggerEvent(EVENT_TYPES.GAME_STARTED, result);
      this._triggerEvent(EVENT_TYPES.START_GAME, result);

      console.log("[SocketService] Game started:", targetRoomId);
      return result;
    } catch (error) {
      console.error("[SocketService] Start game failed:", error);
      return {
        success: false,
        message: error.message || "Start game failed",
        error: error.message,
      };
    }
  }

  /**
   * Sends a dice roll event.
   * @param {string} roomId - Room ID
   * @param {number} value - Dice value
   * @returns {Promise<Object>} Dice roll result
   */
  async sendDiceRoll(roomId, value) {
    try {
      this._validateConnection();
      this._validateRoom(roomId || this._roomId);

      const targetRoomId = roomId || this._roomId;
      const diceValue = value || Math.floor(Math.random() * 6) + 1;

      console.log(`[SocketService] Rolling dice in room: ${targetRoomId}`);

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.ROLL_DICE, { roomId: targetRoomId, value: diceValue }, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation
      const result = {
        success: true,
        message: "Dice rolled successfully",
        data: {
          roomId: targetRoomId,
          value: diceValue,
          timestamp: new Date().toISOString(),
        },
      };

      // Trigger events
      this._triggerEvent(EVENT_TYPES.DICE_ROLLED, result);
      this._triggerEvent(EVENT_TYPES.ROLL_DICE, result);

      console.log("[SocketService] Dice rolled:", diceValue);
      return result;
    } catch (error) {
      console.error("[SocketService] Roll dice failed:", error);
      return {
        success: false,
        message: error.message || "Roll dice failed",
        error: error.message,
      };
    }
  }

  /**
   * Sends a token move event.
   * @param {string} roomId - Room ID
   * @param {Object} moveData - Move data
   * @param {string} moveData.tokenId - Token ID
   * @param {number} moveData.fromPosition - From position
   * @param {number} moveData.toPosition - To position
   * @returns {Promise<Object>} Move result
   */
  async moveToken(roomId, moveData = {}) {
    try {
      this._validateConnection();
      this._validateRoom(roomId || this._roomId);

      const targetRoomId = roomId || this._roomId;

      if (!moveData.tokenId) {
        throw new Error("Token ID is required");
      }

      console.log(
        `[SocketService] Moving token in room: ${targetRoomId}`,
        moveData,
      );

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.MOVE_TOKEN, { roomId: targetRoomId, ...moveData }, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation
      const result = {
        success: true,
        message: "Token moved successfully",
        data: {
          roomId: targetRoomId,
          ...moveData,
          timestamp: new Date().toISOString(),
        },
      };

      // Trigger events
      this._triggerEvent(EVENT_TYPES.TOKEN_MOVED, result);
      this._triggerEvent(EVENT_TYPES.MOVE_TOKEN, result);

      console.log("[SocketService] Token moved:", moveData.tokenId);
      return result;
    } catch (error) {
      console.error("[SocketService] Move token failed:", error);
      return {
        success: false,
        message: error.message || "Move token failed",
        error: error.message,
      };
    }
  }

  /**
   * Sends a chat message.
   * @param {string} roomId - Room ID
   * @param {Object} message - Message data
   * @param {string} message.playerId - Sender player ID
   * @param {string} message.playerName - Sender player name
   * @param {string} message.text - Message text
   * @returns {Promise<Object>} Chat result
   */
  async sendChatMessage(roomId, message = {}) {
    try {
      this._validateConnection();
      this._validateRoom(roomId || this._roomId);

      const targetRoomId = roomId || this._roomId;

      if (!message.text) {
        throw new Error("Message text is required");
      }

      console.log(
        `[SocketService] Sending chat message in room: ${targetRoomId}`,
        message,
      );

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(EVENT_TYPES.CHAT_MESSAGE, { roomId: targetRoomId, ...message }, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation
      const result = {
        success: true,
        message: "Message sent successfully",
        data: {
          roomId: targetRoomId,
          ...message,
          timestamp: new Date().toISOString(),
        },
      };

      // Trigger events
      this._triggerEvent(EVENT_TYPES.CHAT_RECEIVED, result);
      this._triggerEvent(EVENT_TYPES.CHAT_MESSAGE, result);

      console.log("[SocketService] Chat message sent");
      return result;
    } catch (error) {
      console.error("[SocketService] Send chat message failed:", error);
      return {
        success: false,
        message: error.message || "Send chat message failed",
        error: error.message,
      };
    }
  }

  // ============================================================
  // PUBLIC METHODS - Event System
  // ============================================================

  /**
   * Emits an event to the server.
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise<Object>} Emit result
   */
  async emit(event, data = {}) {
    try {
      this._validateConnection();

      if (!isValidEvent(event)) {
        throw new Error("Invalid event name");
      }

      console.log(`[SocketService] Emitting: ${event}`, data);

      // ============================================================
      // REAL SOCKET.IO IMPLEMENTATION (Future)
      // ============================================================
      // return new Promise((resolve) => {
      //   this._socket.emit(event, data, (response) => {
      //     resolve(response);
      //   });
      // });
      // ============================================================

      // Mock implementation - simulate response for known events
      if (MOCK_RESPONSES[event]) {
        await this._handleMockResponse(event, data);
      }

      const result = {
        success: true,
        message: `Event emitted: ${event}`,
        data: {
          event,
          timestamp: new Date().toISOString(),
        },
      };

      return result;
    } catch (error) {
      console.error(`[SocketService] Emit failed for ${event}:`, error);
      return {
        success: false,
        message: error.message || `Emit failed for ${event}`,
        error: error.message,
      };
    }
  }

  /**
   * Registers a listener for an event.
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Cleanup function
   */
  on(event, callback) {
    if (!isValidEvent(event)) {
      throw new Error("Invalid event name");
    }

    if (!isValidCallback(callback)) {
      throw new Error("Callback must be a function");
    }

    // ============================================================
    // REAL SOCKET.IO IMPLEMENTATION (Future)
    // ============================================================
    // this._socket.on(event, callback);
    // return () => this._socket.off(event, callback);
    // ============================================================

    // Mock implementation
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }

    this._eventListeners.get(event).add(callback);
    console.log(`[SocketService] Listener added for: ${event}`);

    // Return cleanup function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Removes a listener for an event.
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {boolean} True if removed
   */
  off(event, callback) {
    if (!isValidEvent(event)) {
      return false;
    }

    // ============================================================
    // REAL SOCKET.IO IMPLEMENTATION (Future)
    // ============================================================
    // this._socket.off(event, callback);
    // ============================================================

    // Mock implementation
    if (this._eventListeners.has(event)) {
      if (callback) {
        const listeners = this._eventListeners.get(event);
        listeners.delete(callback);
        console.log(`[SocketService] Listener removed for: ${event}`);
        return true;
      } else {
        this._eventListeners.delete(event);
        console.log(`[SocketService] All listeners removed for: ${event}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Registers a one-time listener for an event.
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Cleanup function
   */
  once(event, callback) {
    if (!isValidEvent(event)) {
      throw new Error("Invalid event name");
    }

    if (!isValidCallback(callback)) {
      throw new Error("Callback must be a function");
    }

    // ============================================================
    // REAL SOCKET.IO IMPLEMENTATION (Future)
    // ============================================================
    // this._socket.once(event, callback);
    // return () => this._socket.off(event, callback);
    // ============================================================

    // Mock implementation
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };

    this.on(event, onceWrapper);
    console.log(`[SocketService] Once listener added for: ${event}`);

    // Return cleanup function
    return () => {
      this.off(event, onceWrapper);
    };
  }

  /**
   * Removes all listeners for all events.
   * @returns {boolean} True if cleared
   */
  removeAllListeners() {
    // ============================================================
    // REAL SOCKET.IO IMPLEMENTATION (Future)
    // ============================================================
    // this._socket.removeAllListeners();
    // ============================================================

    // Mock implementation
    this._eventListeners.clear();
    this._onceListeners.clear();
    console.log("[SocketService] All listeners removed");
    return true;
  }

  // ============================================================
  // PUBLIC METHODS - Utility
  // ============================================================

  /**
   * Gets the current connection status.
   * @returns {Object} Connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this._isConnected,
      isConnecting: this._isConnecting,
      roomId: this._roomId,
      playerId: this._playerId,
      reconnectAttempts: this._reconnectAttempts,
      maxReconnectAttempts: this._maxReconnectAttempts,
      connectionId: this._connectionId,
    };
  }

  /**
   * Gets the current room ID.
   * @returns {string|null} Room ID
   */
  getRoomId() {
    return this._roomId;
  }

  /**
   * Gets the current player ID.
   * @returns {string|null} Player ID
   */
  getPlayerId() {
    return this._playerId;
  }

  /**
   * Sets the player ID.
   * @param {string} playerId - Player ID
   */
  setPlayerId(playerId) {
    if (playerId && typeof playerId === "string") {
      this._playerId = playerId;
    }
  }

  /**
   * Gets mock room data (for testing).
   * @param {string} roomId - Room ID
   * @returns {Object|null} Room data
   */
  getMockRoom(roomId) {
    return this._mockRooms.get(roomId) || null;
  }

  /**
   * Gets all mock rooms (for testing).
   * @returns {Map} Mock rooms
   */
  getMockRooms() {
    return new Map(this._mockRooms);
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

/**
 * Default singleton instance of SocketService.
 */
const socketService = new SocketService();

// ============================================================
// EXPORT
// ============================================================

export default socketService;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. How the mock event system works:
 *
 * - The service uses internal Maps to store event listeners:
 *   * _eventListeners: Map of event names to Sets of callbacks
 *   * _onceListeners: Map of event names to Sets of once callbacks
 *
 * - When an event is triggered:
 *   1. All regular listeners for the event are called
 *   2. All once listeners for the event are called and removed
 *   3. The service triggers success/error events based on response
 *
 * - Mock responses simulate network behavior:
 *   * setTimeout/setInterval simulate network delay
 *   * MOCK_RESPONSES provide structured responses
 *   * Internal state updates maintain mock data consistency
 *
 * - Components can subscribe using on() and once():
 *   * Returns a cleanup function for easy removal
 *   * Supports multiple listeners for the same event
 *
 * 2. Why this abstraction allows switching to real Socket.IO
 *    with minimal changes:
 *
 * - The API is designed to match Socket.IO's API exactly:
 *   * connect(), disconnect(), emit(), on(), off(), once()
 *   * Same method signatures and return patterns
 *
 * - The service is framework-independent:
 *   * No React imports or dependencies
 *   * Can be used in any JavaScript environment
 *
 * - All real Socket.IO code is clearly commented:
 *   * Lines with "REAL SOCKET.IO IMPLEMENTATION" show where changes go
 *   * The mock implementation is separated from the real logic
 *
 * - To switch to real Socket.IO:
 *   1. Uncomment the real implementation in each method
 *   2. Remove or comment out the mock implementation
 *   3. Import the socket.io-client library
 *   4. The rest of the application continues to work unchanged
 *
 * 3. Which methods will later communicate with the backend:
 *
 * Connection Methods:
 * - connect(): Establishes WebSocket connection to the server
 * - disconnect(): Closes the WebSocket connection
 * - reconnect(): Attempts to re-establish connection
 *
 * Room Methods:
 * - createRoom(): Sends room creation request to the server
 * - joinRoom(): Sends join room request to the server
 * - leaveRoom(): Sends leave room request to the server
 *
 * Game Methods:
 * - startGame(): Sends start game request to the server
 * - sendDiceRoll(): Sends dice roll to the server
 * - moveToken(): Sends token move to the server
 * - sendChatMessage(): Sends chat message to the server
 *
 * Event Methods:
 * - emit(): Low-level event emission to the server
 * - on(): Subscribes to server events
 * - once(): Subscribes to one-time server events
 * - off(): Unsubscribes from server events
 *
 * These methods will all use the real Socket.IO client
 * to communicate with the backend server, enabling
 * real-time multiplayer functionality.
 */
