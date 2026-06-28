class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.roomId = null;
    this.playerId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventListeners = new Map();
  }

  connect(options = {}) {
    try {
      console.log("[SocketService] Connecting...");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("[SocketService] Connection failed:", error);
      return false;
    }
  }

  disconnect() {
    try {
      console.log("[SocketService] Disconnecting...");
      this.isConnected = false;
      this.roomId = null;
      this.playerId = null;
      this.eventListeners.clear();
      return true;
    } catch (error) {
      console.error("[SocketService] Disconnect failed:", error);
      return false;
    }
  }

  reconnect() {
    try {
      console.log("[SocketService] Reconnecting...");
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[SocketService] Max reconnect attempts reached");
        return false;
      }
      this.reconnectAttempts++;
      this.disconnect();
      return this.connect();
    } catch (error) {
      console.error("[SocketService] Reconnect failed:", error);
      return false;
    }
  }

  emit(event, data = {}) {
    try {
      if (!this.isConnected) {
        console.warn("[SocketService] Cannot emit event - not connected");
        return false;
      }
      console.log(`[SocketService] Emitting: ${event}`, data);
      return true;
    } catch (error) {
      console.error(`[SocketService] Emit failed for ${event}:`, error);
      return false;
    }
  }

  on(event, callback) {
    try {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
      console.log(`[SocketService] Listener added for: ${event}`);
      return true;
    } catch (error) {
      console.error(
        `[SocketService] Failed to add listener for ${event}:`,
        error,
      );
      return false;
    }
  }

  off(event, callback) {
    try {
      if (!this.eventListeners.has(event)) return false;

      if (callback) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      } else {
        this.eventListeners.delete(event);
      }

      console.log(`[SocketService] Listener removed for: ${event}`);
      return true;
    } catch (error) {
      console.error(
        `[SocketService] Failed to remove listener for ${event}:`,
        error,
      );
      return false;
    }
  }

  once(event, callback) {
    try {
      const onceWrapper = (data) => {
        callback(data);
        this.off(event, onceWrapper);
      };
      return this.on(event, onceWrapper);
    } catch (error) {
      console.error(
        `[SocketService] Failed to add once listener for ${event}:`,
        error,
      );
      return false;
    }
  }

  joinRoom(roomId, playerData = {}) {
    try {
      if (!roomId) {
        console.warn("[SocketService] Cannot join room - no room ID provided");
        return false;
      }
      this.roomId = roomId;
      this.playerId = playerData.id || null;
      console.log(`[SocketService] Joining room: ${roomId}`, playerData);
      return this.emit("joinRoom", { roomId, ...playerData });
    } catch (error) {
      console.error("[SocketService] Join room failed:", error);
      return false;
    }
  }

  leaveRoom() {
    try {
      if (!this.roomId) {
        console.warn("[SocketService] Cannot leave room - not in a room");
        return false;
      }
      console.log(`[SocketService] Leaving room: ${this.roomId}`);
      const roomId = this.roomId;
      this.roomId = null;
      this.playerId = null;
      return this.emit("leaveRoom", { roomId });
    } catch (error) {
      console.error("[SocketService] Leave room failed:", error);
      return false;
    }
  }

  createRoom(roomData = {}) {
    try {
      console.log("[SocketService] Creating room:", roomData);
      return this.emit("createRoom", roomData);
    } catch (error) {
      console.error("[SocketService] Create room failed:", error);
      return false;
    }
  }

  startGame() {
    try {
      if (!this.roomId) {
        console.warn("[SocketService] Cannot start game - not in a room");
        return false;
      }
      console.log(`[SocketService] Starting game in room: ${this.roomId}`);
      return this.emit("startGame", { roomId: this.roomId });
    } catch (error) {
      console.error("[SocketService] Start game failed:", error);
      return false;
    }
  }

  sendMove(moveData = {}) {
    try {
      if (!this.roomId) {
        console.warn("[SocketService] Cannot send move - not in a room");
        return false;
      }
      console.log("[SocketService] Sending move:", moveData);
      return this.emit("moveToken", { roomId: this.roomId, ...moveData });
    } catch (error) {
      console.error("[SocketService] Send move failed:", error);
      return false;
    }
  }

  rollDice() {
    try {
      if (!this.roomId) {
        console.warn("[SocketService] Cannot roll dice - not in a room");
        return false;
      }
      console.log(`[SocketService] Rolling dice in room: ${this.roomId}`);
      return this.emit("rollDice", { roomId: this.roomId });
    } catch (error) {
      console.error("[SocketService] Roll dice failed:", error);
      return false;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      roomId: this.roomId,
      playerId: this.playerId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

const socketService = new SocketService();
export default socketService;
