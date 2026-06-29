// src/hooks/useSocket.js

/**
 * useSocket Hook
 *
 * Professional, reusable custom hook for Socket.IO integration.
 * Manages connection state, room operations, and event handling.
 * Ready for future Socket.IO implementation with placeholder logic.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ============================================================
// SOCKET SERVICE IMPORT (Placeholder)
// ============================================================

// Import the socket service - will be implemented later
// import socketService from '../services/socketService.js';

// ============================================================
// PLACEHOLDER SOCKET SERVICE
// ============================================================

/**
 * Placeholder socket service for development.
 * Replace with actual socketService import when ready.
 */
const placeholderSocketService = {
  connect: () => {
    console.log("[Socket] Connecting...");
    return Promise.resolve({ connected: true });
  },
  disconnect: () => {
    console.log("[Socket] Disconnecting...");
    return Promise.resolve({ disconnected: true });
  },
  reconnect: () => {
    console.log("[Socket] Reconnecting...");
    return Promise.resolve({ reconnected: true });
  },
  createRoom: (roomData) => {
    console.log("[Socket] Creating room:", roomData);
    return Promise.resolve({ roomId: `room_${Date.now()}`, ...roomData });
  },
  joinRoom: (roomId, playerData) => {
    console.log("[Socket] Joining room:", roomId, playerData);
    return Promise.resolve({ roomId, ...playerData, joined: true });
  },
  leaveRoom: (roomId, playerId) => {
    console.log("[Socket] Leaving room:", roomId, playerId);
    return Promise.resolve({ roomId, playerId, left: true });
  },
  emit: (event, data) => {
    console.log("[Socket] Emitting event:", event, data);
    return Promise.resolve({ event, data, emitted: true });
  },
  on: (event, callback) => {
    console.log("[Socket] Registering listener for:", event);
    // Store callback for cleanup
    return () => {
      console.log("[Socket] Removing listener for:", event);
    };
  },
  off: (event, callback) => {
    console.log("[Socket] Removing listener for:", event);
  },
};

// Use real service when available, otherwise use placeholder
const socketService = placeholderSocketService;

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates a unique ID for players.
 * @returns {string} Unique ID
 */
const generateId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates room ID format.
 * @param {string} roomId - Room ID to validate
 * @returns {boolean} True if valid
 */
const isValidRoomId = (roomId) => {
  return typeof roomId === "string" && roomId.length > 0;
};

/**
 * Validates player data.
 * @param {Object} playerData - Player data to validate
 * @returns {boolean} True if valid
 */
const isValidPlayerData = (playerData) => {
  if (!playerData || typeof playerData !== "object") return false;
  if (!playerData.id && !playerData.playerId) return false;
  return true;
};

// ============================================================
// USE SOCKET HOOK
// ============================================================

/**
 * useSocket custom hook for managing Socket.IO connections.
 * Provides connection management, room operations, and event handling.
 */
const useSocket = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(true);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);

  // ============================================================
  // REFS
  // ============================================================

  const eventListenersRef = useRef(new Map());
  const reconnectTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // ============================================================
  // CLEANUP HELPERS
  // ============================================================

  /**
   * Clears all event listeners.
   */
  const clearAllListeners = useCallback(() => {
    if (eventListenersRef.current) {
      for (const [event, callback] of eventListenersRef.current) {
        socketService.off(event, callback);
      }
      eventListenersRef.current.clear();
    }
  }, []);

  /**
   * Clears reconnect timer.
   */
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ============================================================
  // CORE METHODS
  // ============================================================

  /**
   * Connects to the Socket.IO server.
   * @param {Object} options - Connection options
   * @returns {Promise} Connection result
   */
  const connect = useCallback(
    async (options = {}) => {
      try {
        if (isConnected) {
          console.log("[useSocket] Already connected");
          return { connected: true, status: "connected" };
        }

        setIsConnecting(true);
        setLoading(true);
        setError(null);

        console.log("[useSocket] Connecting with options:", options);

        // Call socket service connect
        const result = await socketService.connect(options);

        // Update state
        setIsConnected(true);
        setIsDisconnected(false);
        setSocketStatus("connected");
        setPlayerId(options.playerId || generateId());
        setPlayerName(options.playerName || null);
        setReconnectAttempts(0);

        console.log("[useSocket] Connected successfully:", result);

        return {
          connected: true,
          status: "connected",
          playerId: options.playerId || playerId,
          ...result,
        };
      } catch (err) {
        console.error("[useSocket] Connection failed:", err);
        setError(err.message || "Connection failed");
        setSocketStatus("error");

        return {
          connected: false,
          status: "error",
          error: err.message,
        };
      } finally {
        setIsConnecting(false);
        setLoading(false);
      }
    },
    [isConnected, playerId],
  );

  /**
   * Disconnects from the Socket.IO server.
   * @returns {Promise} Disconnection result
   */
  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[useSocket] Disconnecting...");

      // Clear all listeners
      clearAllListeners();

      // Clear reconnect timer
      clearReconnectTimer();

      // Call socket service disconnect
      const result = await socketService.disconnect();

      // Update state
      setIsConnected(false);
      setIsDisconnected(true);
      setSocketStatus("disconnected");
      setRoomId(null);
      setReconnectAttempts(0);

      console.log("[useSocket] Disconnected successfully:", result);

      return {
        disconnected: true,
        status: "disconnected",
        ...result,
      };
    } catch (err) {
      console.error("[useSocket] Disconnection failed:", err);
      setError(err.message || "Disconnection failed");

      return {
        disconnected: false,
        status: "error",
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  }, [clearAllListeners, clearReconnectTimer]);

  /**
   * Reconnects to the Socket.IO server.
   * @param {Object} options - Reconnection options
   * @returns {Promise} Reconnection result
   */
  const reconnect = useCallback(
    async (options = {}) => {
      try {
        setLoading(true);
        setError(null);

        console.log("[useSocket] Reconnecting...");

        // Disconnect if connected
        if (isConnected) {
          await disconnect();
        }

        // Wait a moment before reconnecting
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Increment reconnect attempts
        setReconnectAttempts((prev) => prev + 1);

        // Reconnect
        const result = await connect({
          playerId: playerId,
          playerName: playerName,
          ...options,
        });

        console.log("[useSocket] Reconnected successfully:", result);

        return {
          reconnected: true,
          attempts: reconnectAttempts + 1,
          ...result,
        };
      } catch (err) {
        console.error("[useSocket] Reconnection failed:", err);
        setError(err.message || "Reconnection failed");

        return {
          reconnected: false,
          status: "error",
          error: err.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [isConnected, disconnect, connect, playerId, playerName, reconnectAttempts],
  );

  /**
   * Creates a new room.
   * @param {Object} roomData - Room configuration data
   * @returns {Promise} Room creation result
   */
  const createRoom = useCallback(
    async (roomData = {}) => {
      try {
        if (!isConnected) {
          throw new Error("Not connected to server");
        }

        setLoading(true);
        setError(null);

        console.log("[useSocket] Creating room:", roomData);

        // Call socket service createRoom
        const result = await socketService.createRoom({
          playerId: playerId,
          playerName: playerName,
          ...roomData,
        });

        // Update state
        if (result.roomId) {
          setRoomId(result.roomId);
        }

        console.log("[useSocket] Room created:", result);

        return {
          success: true,
          ...result,
        };
      } catch (err) {
        console.error("[useSocket] Room creation failed:", err);
        setError(err.message || "Room creation failed");

        return {
          success: false,
          error: err.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [isConnected, playerId, playerName],
  );

  /**
   * Joins an existing room.
   * @param {string} roomId - Room ID to join
   * @param {Object} playerData - Player data
   * @returns {Promise} Room join result
   */
  const joinRoom = useCallback(
    async (roomId, playerData = {}) => {
      try {
        if (!isConnected) {
          throw new Error("Not connected to server");
        }

        if (!isValidRoomId(roomId)) {
          throw new Error("Invalid room ID");
        }

        setLoading(true);
        setError(null);

        console.log("[useSocket] Joining room:", roomId, playerData);

        // Call socket service joinRoom
        const result = await socketService.joinRoom(roomId, {
          playerId: playerId,
          playerName: playerName,
          ...playerData,
        });

        // Update state
        setRoomId(roomId);

        console.log("[useSocket] Joined room:", result);

        return {
          success: true,
          ...result,
        };
      } catch (err) {
        console.error("[useSocket] Room join failed:", err);
        setError(err.message || "Room join failed");

        return {
          success: false,
          error: err.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [isConnected, playerId, playerName],
  );

  /**
   * Leaves the current room.
   * @param {string} roomId - Room ID to leave
   * @param {string} playerId - Player ID
   * @returns {Promise} Room leave result
   */
  const leaveRoom = useCallback(
    async (roomId, playerId) => {
      try {
        if (!isConnected) {
          throw new Error("Not connected to server");
        }

        const roomIdToLeave = roomId || roomId;
        const playerIdToLeave = playerId || playerId;

        setLoading(true);
        setError(null);

        console.log(
          "[useSocket] Leaving room:",
          roomIdToLeave,
          playerIdToLeave,
        );

        // Call socket service leaveRoom
        const result = await socketService.leaveRoom(
          roomIdToLeave,
          playerIdToLeave,
        );

        // Update state
        setRoomId(null);

        console.log("[useSocket] Left room:", result);

        return {
          success: true,
          ...result,
        };
      } catch (err) {
        console.error("[useSocket] Room leave failed:", err);
        setError(err.message || "Room leave failed");

        return {
          success: false,
          error: err.message,
        };
      } finally {
        setLoading(false);
      }
    },
    [isConnected, roomId, playerId],
  );

  /**
   * Emits an event to the server.
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise} Emit result
   */
  const emit = useCallback(
    async (event, data) => {
      try {
        if (!isConnected) {
          throw new Error("Not connected to server");
        }

        if (!event || typeof event !== "string") {
          throw new Error("Invalid event name");
        }

        console.log("[useSocket] Emitting event:", event, data);

        // Call socket service emit
        const result = await socketService.emit(event, {
          roomId: roomId,
          playerId: playerId,
          ...data,
        });

        setLastEvent({ event, data, timestamp: Date.now() });

        return {
          success: true,
          ...result,
        };
      } catch (err) {
        console.error("[useSocket] Emit failed:", err);
        setError(err.message || "Emit failed");

        return {
          success: false,
          error: err.message,
        };
      }
    },
    [isConnected, roomId, playerId],
  );

  /**
   * Registers an event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Cleanup function
   */
  const on = useCallback((event, callback) => {
    if (!event || typeof event !== "string") {
      throw new Error("Invalid event name");
    }

    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    console.log("[useSocket] Registering event listener:", event);

    // Store callback for cleanup
    eventListenersRef.current.set(event, callback);

    // Register with socket service
    return socketService.on(event, (data) => {
      console.log("[useSocket] Received event:", event, data);
      callback(data);
    });
  }, []);

  /**
   * Removes an event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  const off = useCallback((event, callback) => {
    if (!event || typeof event !== "string") {
      throw new Error("Invalid event name");
    }

    console.log("[useSocket] Removing event listener:", event);

    // Remove from storage
    eventListenersRef.current.delete(event);

    // Remove from socket service
    socketService.off(event, callback);
  }, []);

  // ============================================================
  // EFFECTS
  // ============================================================

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Cleanup all listeners
      clearAllListeners();

      // Clear reconnect timer
      clearReconnectTimer();

      // Disconnect if connected
      if (isConnected) {
        socketService.disconnect();
      }
    };
  }, [clearAllListeners, clearReconnectTimer, isConnected]);

  /**
   * Auto-reconnect on connection loss.
   */
  useEffect(() => {
    if (!isConnected && isDisconnected && reconnectAttempts < 5) {
      clearReconnectTimer();

      reconnectTimerRef.current = setTimeout(
        () => {
          if (isMountedRef.current && !isConnected) {
            console.log("[useSocket] Auto-reconnecting...");
            reconnect({ auto: true });
          }
        },
        3000 * Math.min(reconnectAttempts + 1, 5),
      );
    }

    return () => {
      clearReconnectTimer();
    };
  }, [
    isConnected,
    isDisconnected,
    reconnectAttempts,
    reconnect,
    clearReconnectTimer,
  ]);

  // ============================================================
  // MEMOIZED RETURN VALUE
  // ============================================================

  const socketApi = useMemo(
    () => ({
      // Connection state
      isConnected,
      isConnecting,
      isDisconnected,
      socketStatus,
      roomId,
      playerId,
      playerName,
      loading,
      error,
      reconnectAttempts,
      lastEvent,

      // Methods
      connect,
      disconnect,
      reconnect,
      createRoom,
      joinRoom,
      leaveRoom,
      emit,
      on,
      off,

      // Helper methods
      clearListeners: clearAllListeners,
      getSocketStatus: () => socketStatus,
      isInRoom: () => Boolean(roomId),
      getPlayerId: () => playerId,
      getRoomId: () => roomId,
    }),
    [
      isConnected,
      isConnecting,
      isDisconnected,
      socketStatus,
      roomId,
      playerId,
      playerName,
      loading,
      error,
      reconnectAttempts,
      lastEvent,
      connect,
      disconnect,
      reconnect,
      createRoom,
      joinRoom,
      leaveRoom,
      emit,
      on,
      off,
      clearAllListeners,
    ],
  );

  return socketApi;
};

// ============================================================
// EXPORT
// ============================================================

export default useSocket;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why Socket.IO access should be wrapped in a custom hook:
 *
 * - Encapsulation: The hook encapsulates all Socket.IO logic,
 *   hiding implementation details from components. Components
 *   only interact with a clean, simple API.
 *
 * - State Management: The hook manages all socket-related state
 *   (connection, room, player, loading, error) in one place,
 *   preventing state duplication across components.
 *
 * - Lifecycle Management: The hook handles connection lifecycle
 *   (connect, disconnect, reconnect) and automatically cleans up
 *   on unmount, preventing memory leaks.
 *
 * - Reusability: Any component can use the hook to get socket
 *   functionality without duplicating logic.
 *
 * - Testing: The hook can be easily mocked and tested in isolation.
 *
 * - React Integration: The hook uses React hooks (useState, useEffect,
 *   useCallback, useMemo) for seamless integration with React's
 *   rendering lifecycle.
 *
 * - Performance: The hook memoizes methods and values, preventing
 *   unnecessary re-renders.
 *
 * 2. How this hook will simplify multiplayer integration:
 *
 * - Single Source of Truth: All socket state is managed in one place,
 *   ensuring consistency across the application.
 *
 * - Room Management: The hook provides simple methods for room
 *   operations (create, join, leave), abstracting away the complexity
 *   of Socket.IO room management.
 *
 * - Event Handling: Components can easily register and unregister
 *   event listeners using the `on` and `off` methods without
 *   worrying about cleanup.
 *
 * - Connection Recovery: The hook includes auto-reconnect logic,
 *   improving user experience during network issues.
 *
 * - Error Handling: All socket errors are caught and made available
 *   through the error state, making it easy to display error messages.
 *
 * - Real-time Updates: The hook enables real-time communication
 *   between players, essential for multiplayer Ludo.
 *
 * - Game Synchronization: Multiple players can sync their game state
 *   through the socket connection.
 *
 * 3. How it differs from socketService and why both are needed:
 *
 * socketService:
 * - Low-level Socket.IO client wrapper
 * - Handles raw socket connection and communication
 * - Manages socket instance lifecycle
 * - Provides basic methods (connect, disconnect, emit, on, off)
 * - Framework-independent
 * - Used by the hook
 *
 * useSocket:
 * - High-level React hook for components
 * - Manages socket state within React
 * - Provides application-specific features (room management, player ID)
 * - Handles React lifecycle and re-renders
 * - Provides memoized methods and values
 * - Built on top of socketService
 *
 * Why both are needed:
 * - Separation of Concerns: socketService handles the technical
 *   Socket.IO details, while useSocket handles React integration.
 *
 * - Reusability: socketService can be used outside React (in
 *   Node.js, tests, or other frameworks), while useSocket is
 *   React-specific.
 *
 * - Testability: Both can be tested independently.
 *
 * - Maintenance: Changes to Socket.IO implementation only affect
 *   socketService. Changes to React integration only affect useSocket.
 *
 * - Flexibility: You could use socketService directly in non-React
 *   parts of the application (e.g., backend services, worker threads).
 */
