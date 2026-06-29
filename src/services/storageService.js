// src/services/storageService.js

/**
 * StorageService Class
 *
 * Professional, production-ready browser storage abstraction.
 * Supports localStorage and sessionStorage with automatic serialization.
 * Provides TTL, key prefixing, and graceful error handling.
 */

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Default configuration for the storage service.
 */
const DEFAULT_CONFIG = {
  prefix: "ludo_",
  storage: "local",
  serialize: true,
  ttl: null, // Time to live in milliseconds
};

/**
 * Storage type mapping.
 */
const STORAGE_TYPES = {
  local: "localStorage",
  session: "sessionStorage",
};

/**
 * Error messages for various failure scenarios.
 */
const ERROR_MESSAGES = {
  INVALID_KEY: "Key must be a non-empty string",
  INVALID_VALUE: "Value cannot be undefined",
  STORAGE_UNAVAILABLE: "Storage is not available in this environment",
  QUOTA_EXCEEDED: "Storage quota exceeded",
  SERIALIZATION_FAILED: "Failed to serialize value",
  DESERIALIZATION_FAILED: "Failed to deserialize stored data",
  INVALID_TTL: "TTL must be a positive number",
  INVALID_OPTIONS: "Options must be an object",
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Checks if storage is available in the current environment.
 * @param {string} storageType - Type of storage to check
 * @returns {boolean} True if storage is available
 */
const isStorageAvailable = (storageType) => {
  try {
    const storage = window[storageType];
    if (!storage) return false;

    // Test write/read capability
    const testKey = "__storage_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Gets the appropriate storage object.
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {Storage} Storage object
 * @throws {Error} If storage is not available
 */
const getStorage = (type) => {
  const storageType = STORAGE_TYPES[type] || STORAGE_TYPES.local;

  if (!isStorageAvailable(storageType)) {
    throw new Error(ERROR_MESSAGES.STORAGE_UNAVAILABLE);
  }

  return window[storageType];
};

/**
 * Validates a key.
 * @param {string} key - Key to validate
 * @throws {Error} If key is invalid
 */
const validateKey = (key) => {
  if (!key || typeof key !== "string") {
    throw new Error(ERROR_MESSAGES.INVALID_KEY);
  }
};

/**
 * Validates TTL.
 * @param {number} ttl - TTL in milliseconds
 * @throws {Error} If TTL is invalid
 */
const validateTTL = (ttl) => {
  if (
    ttl !== null &&
    ttl !== undefined &&
    (typeof ttl !== "number" || ttl <= 0)
  ) {
    throw new Error(ERROR_MESSAGES.INVALID_TTL);
  }
};

/**
 * Validates options.
 * @param {Object} options - Options object
 * @throws {Error} If options is invalid
 */
const validateOptions = (options) => {
  if (
    options !== null &&
    options !== undefined &&
    typeof options !== "object"
  ) {
    throw new Error(ERROR_MESSAGES.INVALID_OPTIONS);
  }
};

/**
 * Prefixes a key with the configured prefix.
 * @param {string} key - Original key
 * @param {string} prefix - Key prefix
 * @returns {string} Prefixed key
 */
const getPrefixedKey = (key, prefix) => {
  return prefix ? `${prefix}${key}` : key;
};

/**
 * Serializes a value to JSON.
 * @param {*} value - Value to serialize
 * @returns {string} Serialized value
 * @throws {Error} If serialization fails
 */
const serializeValue = (value) => {
  try {
    if (typeof value === "string") {
      // If it's already a string, check if it looks like JSON
      if (value.startsWith("{") || value.startsWith("[")) {
        return value;
      }
      return JSON.stringify(value);
    }
    return JSON.stringify(value);
  } catch (error) {
    throw new Error(`${ERROR_MESSAGES.SERIALIZATION_FAILED}: ${error.message}`);
  }
};

/**
 * Deserializes a value from JSON.
 * @param {string} value - Serialized value
 * @returns {*} Deserialized value
 * @throws {Error} If deserialization fails
 */
const deserializeValue = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    // If it's not valid JSON, return the raw value
    return value;
  }
};

/**
 * Checks if a stored item has expired.
 * @param {Object} item - Stored item with metadata
 * @returns {boolean} True if expired
 */
const isExpired = (item) => {
  if (!item || typeof item !== "object") return false;
  if (!item.expiresAt) return false;

  const now = Date.now();
  return now >= item.expiresAt;
};

// ============================================================
// STORAGE SERVICE CLASS
// ============================================================

/**
 * StorageService class for managing browser storage operations.
 * Provides a unified interface for localStorage and sessionStorage.
 */
class StorageService {
  /**
   * Creates a new StorageService instance.
   * @param {Object} config - Configuration options
   * @param {string} config.prefix - Key prefix
   * @param {string} config.storage - Storage type ('local' or 'session')
   * @param {boolean} config.serialize - Whether to serialize values
   * @param {number} config.ttl - Default TTL in milliseconds
   */
  constructor(config = {}) {
    this.config = {
      prefix: config.prefix || DEFAULT_CONFIG.prefix,
      storage: config.storage || DEFAULT_CONFIG.storage,
      serialize:
        config.serialize !== undefined
          ? config.serialize
          : DEFAULT_CONFIG.serialize,
      ttl: config.ttl || DEFAULT_CONFIG.ttl,
    };

    // Storage availability flag
    this._isAvailable = false;
    try {
      this._storage = getStorage(this.config.storage);
      this._isAvailable = true;
    } catch (error) {
      console.warn("[StorageService] Storage not available:", error.message);
      this._storage = null;
      this._isAvailable = false;
    }

    // Memory fallback for when storage is not available
    this._memoryFallback = new Map();
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Gets the actual storage object or fallback.
   * @returns {Storage|Map} Storage object or memory fallback
   */
  _getStorage() {
    if (this._isAvailable && this._storage) {
      return this._storage;
    }
    return this._memoryFallback;
  }

  /**
   * Gets an item from storage.
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @param {Object} options - Options for retrieval
   * @param {boolean} options.raw - Whether to return raw value without deserialization
   * @returns {*} Stored value or default
   */
  _getItem(key, defaultValue = null, options = {}) {
    validateKey(key);

    const prefixedKey = getPrefixedKey(key, this.config.prefix);
    const storage = this._getStorage();

    try {
      let value;

      if (storage instanceof Map) {
        // Memory fallback
        value = storage.get(prefixedKey);
      } else {
        value = storage.getItem(prefixedKey);
      }

      if (value === null || value === undefined) {
        return defaultValue;
      }

      // Check for expiration
      if (
        typeof value === "string" &&
        value.startsWith("{") &&
        value.includes("expiresAt")
      ) {
        try {
          const parsed = JSON.parse(value);
          if (isExpired(parsed)) {
            this.remove(key);
            return defaultValue;
          }
          // Return the actual value without metadata
          return options.raw ? value : deserializeValue(parsed.value);
        } catch (e) {
          // Not a valid JSON object with expiration
          return options.raw ? value : deserializeValue(value);
        }
      }

      return options.raw ? value : deserializeValue(value);
    } catch (error) {
      console.error("[StorageService] Get failed:", error.message);
      return defaultValue;
    }
  }

  /**
   * Sets an item in storage.
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Options for storage
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {boolean} options.serialize - Whether to serialize the value
   * @returns {boolean} True if successful
   */
  _setItem(key, value, options = {}) {
    validateKey(key);
    if (value === undefined) {
      throw new Error(ERROR_MESSAGES.INVALID_VALUE);
    }
    validateOptions(options);

    const prefixedKey = getPrefixedKey(key, this.config.prefix);
    const storage = this._getStorage();
    const shouldSerialize =
      options.serialize !== undefined
        ? options.serialize
        : this.config.serialize;
    const ttl = options.ttl !== undefined ? options.ttl : this.config.ttl;

    validateTTL(ttl);

    try {
      let storedValue = value;

      // Add TTL if specified
      if (ttl !== null && ttl !== undefined) {
        const expiresAt = Date.now() + ttl;
        storedValue = {
          value: value,
          expiresAt: expiresAt,
          createdAt: Date.now(),
        };
        shouldSerialize = true;
      }

      const serializedValue = shouldSerialize
        ? serializeValue(storedValue)
        : storedValue;

      if (storage instanceof Map) {
        // Memory fallback
        storage.set(prefixedKey, serializedValue);
      } else {
        storage.setItem(prefixedKey, serializedValue);
      }

      return true;
    } catch (error) {
      if (error.name === "QuotaExceededError" || error.code === 22) {
        throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
      }
      throw error;
    }
  }

  /**
   * Removes an item from storage.
   * @param {string} key - Storage key
   * @param {boolean} withPrefix - Whether to use prefix
   * @returns {boolean} True if successful
   */
  _removeItem(key, withPrefix = true) {
    validateKey(key);

    const prefixedKey = withPrefix
      ? getPrefixedKey(key, this.config.prefix)
      : key;
    const storage = this._getStorage();

    try {
      if (storage instanceof Map) {
        storage.delete(prefixedKey);
      } else {
        storage.removeItem(prefixedKey);
      }
      return true;
    } catch (error) {
      console.error("[StorageService] Remove failed:", error.message);
      return false;
    }
  }

  /**
   * Clears all items from storage.
   * @param {boolean} withPrefix - Whether to clear only prefixed items
   * @returns {boolean} True if successful
   */
  _clearItems(withPrefix = true) {
    const storage = this._getStorage();

    try {
      if (storage instanceof Map) {
        if (withPrefix) {
          const prefix = this.config.prefix;
          const keysToDelete = [];
          for (const key of storage.keys()) {
            if (key.startsWith(prefix)) {
              keysToDelete.push(key);
            }
          }
          keysToDelete.forEach((key) => storage.delete(key));
        } else {
          storage.clear();
        }
      } else {
        if (withPrefix) {
          const prefix = this.config.prefix;
          const keysToRemove = [];
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(prefix)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => storage.removeItem(key));
        } else {
          storage.clear();
        }
      }
      return true;
    } catch (error) {
      console.error("[StorageService] Clear failed:", error.message);
      return false;
    }
  }

  // ============================================================
  // PUBLIC METHODS - Local Storage
  // ============================================================

  /**
   * Sets a value in local storage.
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {boolean} options.serialize - Whether to serialize the value
   * @returns {boolean} True if successful
   */
  set(key, value, options = {}) {
    return this._setItem(key, value, options);
  }

  /**
   * Gets a value from local storage.
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @param {Object} options - Options for retrieval
   * @param {boolean} options.raw - Whether to return raw value without deserialization
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null, options = {}) {
    return this._getItem(key, defaultValue, options);
  }

  /**
   * Removes a value from local storage.
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  remove(key) {
    return this._removeItem(key);
  }

  /**
   * Clears all values from local storage (with prefix).
   * @returns {boolean} True if successful
   */
  clear() {
    return this._clearItems(true);
  }

  /**
   * Checks if a key exists in local storage.
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  has(key) {
    validateKey(key);

    const prefixedKey = getPrefixedKey(key, this.config.prefix);
    const storage = this._getStorage();

    try {
      let exists;
      if (storage instanceof Map) {
        exists = storage.has(prefixedKey);
      } else {
        exists = storage.getItem(prefixedKey) !== null;
      }

      // Check if expired
      if (exists) {
        const value = this.get(key);
        if (value === null && this.get(key, "NOT_FOUND") === "NOT_FOUND") {
          return false;
        }
      }

      return exists;
    } catch (error) {
      console.error("[StorageService] Has failed:", error.message);
      return false;
    }
  }

  /**
   * Gets all keys from local storage (with prefix).
   * @returns {string[]} Array of keys
   */
  keys() {
    const storage = this._getStorage();
    const prefix = this.config.prefix;
    const keys = [];

    try {
      if (storage instanceof Map) {
        for (const key of storage.keys()) {
          if (key.startsWith(prefix)) {
            keys.push(key.replace(prefix, ""));
          }
        }
      } else {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(prefix)) {
            keys.push(key.replace(prefix, ""));
          }
        }
      }
      return keys;
    } catch (error) {
      console.error("[StorageService] Keys failed:", error.message);
      return [];
    }
  }

  /**
   * Gets the number of items in local storage (with prefix).
   * @returns {number} Number of items
   */
  size() {
    return this.keys().length;
  }

  // ============================================================
  // PUBLIC METHODS - Session Storage
  // ============================================================

  /**
   * Sets a value in session storage.
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {boolean} options.serialize - Whether to serialize the value
   * @returns {boolean} True if successful
   */
  setSession(key, value, options = {}) {
    const sessionService = new StorageService({
      prefix: this.config.prefix,
      storage: "session",
      serialize: this.config.serialize,
      ttl: this.config.ttl,
    });
    return sessionService.set(key, value, options);
  }

  /**
   * Gets a value from session storage.
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @param {Object} options - Options for retrieval
   * @param {boolean} options.raw - Whether to return raw value without deserialization
   * @returns {*} Stored value or default
   */
  getSession(key, defaultValue = null, options = {}) {
    const sessionService = new StorageService({
      prefix: this.config.prefix,
      storage: "session",
      serialize: this.config.serialize,
      ttl: this.config.ttl,
    });
    return sessionService.get(key, defaultValue, options);
  }

  /**
   * Removes a value from session storage.
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  removeSession(key) {
    const sessionService = new StorageService({
      prefix: this.config.prefix,
      storage: "session",
      serialize: this.config.serialize,
      ttl: this.config.ttl,
    });
    return sessionService.remove(key);
  }

  /**
   * Clears all values from session storage (with prefix).
   * @returns {boolean} True if successful
   */
  clearSession() {
    const sessionService = new StorageService({
      prefix: this.config.prefix,
      storage: "session",
      serialize: this.config.serialize,
      ttl: this.config.ttl,
    });
    return sessionService.clear();
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Checks if storage is available.
   * @returns {boolean} True if storage is available
   */
  isAvailable() {
    return this._isAvailable;
  }

  /**
   * Gets the current configuration.
   * @returns {Object} Configuration object
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Updates the configuration.
   * @param {Object} newConfig - New configuration
   */
  setConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  /**
   * Gets all items from storage (with prefix).
   * @returns {Object} Object containing all key-value pairs
   */
  getAll() {
    const keys = this.keys();
    const result = {};
    for (const key of keys) {
      result[key] = this.get(key);
    }
    return result;
  }

  /**
   * Removes all expired items from storage.
   * @returns {number} Number of items removed
   */
  cleanup() {
    const keys = this.keys();
    let count = 0;
    for (const key of keys) {
      try {
        const value = this.get(key, null, { raw: true });
        if (value && typeof value === "string" && value.includes("expiresAt")) {
          const parsed = JSON.parse(value);
          if (isExpired(parsed)) {
            this.remove(key);
            count++;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return count;
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

/**
 * Default singleton instance of StorageService.
 */
const storageService = new StorageService();

// ============================================================
// EXPORT
// ============================================================

export { StorageService };
export default storageService;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why browser storage should be abstracted behind a service:
 * 
 * - Encapsulation: The service encapsulates all storage logic,
 *   hiding implementation details from the rest of the application.
 * 
 * - Error Handling: Centralized error handling for storage operations
 *   (quota exceeded, unavailable, serialization errors).
 * 
 * - Serialization: Automatic JSON serialization/deserialization
 *   eliminates repetitive JSON.stringify/parse calls.
 * 
 * - Key Management: Automatic key prefixing prevents collisions
 *   with other applications on the same domain.
 * 
 * - TTL Support: Built-in expiration management for cached data.
 * 
 * - Fallback: Graceful fallback to memory storage when browser
 *   storage is unavailable (e.g., incognito mode).
 * 
 * - Testability: Easy to mock for unit tests.
 * 
 * - Migration: Abstracting storage makes it easy to switch to
 *   IndexedDB, Cookies, or server-side storage later.
 * 
 * 2. Where this service will be used in the Ludo application:
 * 
 * Theme & Appearance:
 * - Dark mode preference
 * - Color theme selection
 * - Board style preference
 * - Animation settings
 * 
 * User Settings:
 * - Sound volume and mute state
 * - Notification preferences
 * - Language selection
 * - Accessibility settings
 * - Control preferences (keyboard shortcuts)
 * 
 * Game Preferences:
 * - Default game mode (2-player, 4-player)
 * - Turn timer preference
 * - AI difficulty
 * - Auto-roll preference
 * 
 * Recent Rooms:
 * - Recently joined rooms
   - Room codes history
 * - Favorite rooms
 * - Invite history
 * 
 * Player Data:
 * - Player name
 * - Player avatar selection
 * - Player statistics cache
 * - Win/loss history
 * - ELO rating cache
 * 
 * Game State:
 * - Auto-save game state
 * - Resume game data
 * - Draft game states
 * 
 * Cached Data:
 * - Board configuration cache
 * - Token positions cache (offline support)
 * - Player profiles cache
 * - Tournament data cache
 * 
 * Analytics:
 * - User session tracking
 * - Feature usage tracking
 * - Last visit timestamp
 * 
 * Multiplayer:
 * - Last room ID
 * - Last player ID
 * - Session token
 * - Reconnection data
 * 
 * 3. How this abstraction simplifies future migration to IndexedDB 
 *    or another storage solution:
 * 
 * - The StorageService interface is clean and well-defined. Migration
 *   to IndexedDB would only require implementing the same interface
 *   (set, get, remove, clear, keys, size) with IndexedDB as the backend.
 * 
 * - All application code uses the service's public API, not direct
 *   localStorage calls. This means the migration would only affect
 *   the StorageService class, not the rest of the application.
 * 
 * - The service could be extended to support multiple storage backends:
 *   * LocalStorage (current)
 *   * SessionStorage (current)
 *   * IndexedDB (future)
 *   * Cookies
 *   * Server-side storage (via API)
 *   * Hybrid approach (cache in localStorage, persistent in IndexedDB)
 * 
 * - The service could automatically fallback to the best available
 *   storage method based on browser capabilities.
 * 
 * - Migration could be seamless: the service could read from the
 *   old storage while writing to the new one, then switch over
 *   completely after a grace period.
 * 
 * - Example of IndexedDB implementation:
 * 
 *   class IndexedDBStorage extends StorageService {
 *     async set(key, value, options) {
 *       const db = await openDB();
 *       const tx = db.transaction('store', 'readwrite');
 *       await tx.store.put({ key, value, ...options });
 *       await tx.done;
 *     }
 *     
 *     async get(key, defaultValue) {
 *       const db = await openDB();
 *       const result = await db.get('store', key);
 *       return result?.value || defaultValue;
 *     }
 *     // ... implement other methods
 *   }
 * 
 * - The abstraction makes it possible to have multiple storage
 *   strategies and switch between them seamlessly.
 */
