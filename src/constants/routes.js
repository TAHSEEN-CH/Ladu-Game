// src/constants/routes.js

/**
 * Route Constants
 *
 * Centralized route definitions for the entire application.
 * Provides consistent, type-safe route references.
 * Framework-independent and easily extensible.
 */

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Public Routes - Accessible without authentication
 */
export const PUBLIC_ROUTES = Object.freeze({
  HOME: "/",
  LANDING: "/landing",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
});

/**
 * Authentication Routes
 */
export const AUTH_ROUTES = Object.freeze({
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
});

/**
 * Game Routes - Game-related pages
 */
export const GAME_ROUTES = Object.freeze({
  LOBBY: "/lobby",
  GAME: "/game",
  GAME_DETAIL: "/game/:roomId",
  CREATE_GAME: "/game/create",
  JOIN_GAME: "/game/join",
  ROOM: "/room",
  ROOM_DETAIL: "/room/:roomId",
  TOURNAMENT: "/tournament",
  TOURNAMENT_DETAIL: "/tournament/:tournamentId",
  LEADERBOARD: "/leaderboard",
  HISTORY: "/history",
});

/**
 * User Routes - Profile and user-related pages
 */
export const USER_ROUTES = Object.freeze({
  PROFILE: "/profile",
  SETTINGS: "/settings",
  STATISTICS: "/statistics",
  ACHIEVEMENTS: "/achievements",
  FRIENDS: "/friends",
  NOTIFICATIONS: "/notifications",
});

/**
 * Error Routes
 */
export const ERROR_ROUTES = Object.freeze({
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  FORBIDDEN: "/403",
  SERVER_ERROR: "/500",
  MAINTENANCE: "/maintenance",
});

/**
 * API Routes (for internal use)
 */
export const API_ROUTES = Object.freeze({
  API: "/api",
  AUTH: "/api/auth",
  GAME: "/api/game",
  ROOM: "/api/room",
  USER: "/api/user",
  TOURNAMENT: "/api/tournament",
  STATISTICS: "/api/statistics",
});

// ============================================================
// ROUTE PARAMS & HELPERS
// ============================================================

/**
 * Route parameter patterns for validation.
 */
const ROUTE_PATTERNS = {
  ROOM_ID: /^[a-zA-Z0-9_-]{6,20}$/,
  TOURNAMENT_ID: /^[a-zA-Z0-9_-]{6,20}$/,
  USER_ID: /^[a-zA-Z0-9_-]{6,20}$/,
};

/**
 * Validates a room ID.
 * @param {string} roomId - Room ID to validate
 * @returns {boolean} True if valid
 */
const isValidRoomId = (roomId) => {
  if (!roomId || typeof roomId !== "string") return false;
  return ROUTE_PATTERNS.ROOM_ID.test(roomId);
};

/**
 * Validates a tournament ID.
 * @param {string} tournamentId - Tournament ID to validate
 * @returns {boolean} True if valid
 */
const isValidTournamentId = (tournamentId) => {
  if (!tournamentId || typeof tournamentId !== "string") return false;
  return ROUTE_PATTERNS.TOURNAMENT_ID.test(tournamentId);
};

// ============================================================
// COMPLETE ROUTES OBJECT
// ============================================================

/**
 * Complete routes object combining all route categories.
 * Use Object.freeze() to prevent modifications.
 */
export const ROUTES = Object.freeze({
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...GAME_ROUTES,
  ...USER_ROUTES,
  ...ERROR_ROUTES,
  ...API_ROUTES,
});

// ============================================================
// ROUTE HELPER FUNCTIONS
// ============================================================

/**
 * Gets the game route with a room ID.
 * @param {string} roomId - Room ID
 * @param {Object} options - Additional options
 * @param {Object} options.query - Query parameters
 * @param {string} options.hash - Hash fragment
 * @returns {string} Game route with room ID
 * @throws {Error} If room ID is invalid
 */
export const getGameRoute = (roomId, options = {}) => {
  if (!isValidRoomId(roomId)) {
    throw new Error(
      `Invalid room ID: ${roomId}. Must be 6-20 alphanumeric characters.`,
    );
  }

  let route = GAME_ROUTES.GAME_DETAIL.replace(":roomId", roomId);

  // Add query parameters if provided
  if (options.query && typeof options.query === "object") {
    const queryString = new URLSearchParams(options.query).toString();
    if (queryString) {
      route += `?${queryString}`;
    }
  }

  // Add hash fragment if provided
  if (options.hash && typeof options.hash === "string") {
    route += `#${options.hash}`;
  }

  return route;
};

/**
 * Gets the room route with a room ID.
 * @param {string} roomId - Room ID
 * @param {Object} options - Additional options
 * @param {Object} options.query - Query parameters
 * @param {string} options.hash - Hash fragment
 * @returns {string} Room route with room ID
 * @throws {Error} If room ID is invalid
 */
export const getRoomRoute = (roomId, options = {}) => {
  if (!isValidRoomId(roomId)) {
    throw new Error(
      `Invalid room ID: ${roomId}. Must be 6-20 alphanumeric characters.`,
    );
  }

  let route = GAME_ROUTES.ROOM_DETAIL.replace(":roomId", roomId);

  if (options.query && typeof options.query === "object") {
    const queryString = new URLSearchParams(options.query).toString();
    if (queryString) {
      route += `?${queryString}`;
    }
  }

  if (options.hash && typeof options.hash === "string") {
    route += `#${options.hash}`;
  }

  return route;
};

/**
 * Gets the tournament route with a tournament ID.
 * @param {string} tournamentId - Tournament ID
 * @param {Object} options - Additional options
 * @param {Object} options.query - Query parameters
 * @param {string} options.hash - Hash fragment
 * @returns {string} Tournament route with tournament ID
 * @throws {Error} If tournament ID is invalid
 */
export const getTournamentRoute = (tournamentId, options = {}) => {
  if (!isValidTournamentId(tournamentId)) {
    throw new Error(
      `Invalid tournament ID: ${tournamentId}. Must be 6-20 alphanumeric characters.`,
    );
  }

  let route = GAME_ROUTES.TOURNAMENT_DETAIL.replace(
    ":tournamentId",
    tournamentId,
  );

  if (options.query && typeof options.query === "object") {
    const queryString = new URLSearchParams(options.query).toString();
    if (queryString) {
      route += `?${queryString}`;
    }
  }

  if (options.hash && typeof options.hash === "string") {
    route += `#${options.hash}`;
  }

  return route;
};

/**
 * Gets the user profile route.
 * @param {string} userId - User ID (optional)
 * @param {Object} options - Additional options
 * @param {Object} options.query - Query parameters
 * @param {string} options.hash - Hash fragment
 * @returns {string} User profile route
 */
export const getUserProfileRoute = (userId = null, options = {}) => {
  let route = USER_ROUTES.PROFILE;

  if (userId) {
    route += `/${userId}`;
  }

  if (options.query && typeof options.query === "object") {
    const queryString = new URLSearchParams(options.query).toString();
    if (queryString) {
      route += `?${queryString}`;
    }
  }

  if (options.hash && typeof options.hash === "string") {
    route += `#${options.hash}`;
  }

  return route;
};

/**
 * Gets the settings route with optional section.
 * @param {string} section - Settings section (e.g., 'profile', 'game', 'audio')
 * @param {Object} options - Additional options
 * @param {Object} options.query - Query parameters
 * @param {string} options.hash - Hash fragment
 * @returns {string} Settings route
 */
export const getSettingsRoute = (section = null, options = {}) => {
  let route = USER_ROUTES.SETTINGS;

  if (section && typeof section === "string") {
    route += `/${section}`;
  }

  if (options.query && typeof options.query === "object") {
    const queryString = new URLSearchParams(options.query).toString();
    if (queryString) {
      route += `?${queryString}`;
    }
  }

  if (options.hash && typeof options.hash === "string") {
    route += `#${options.hash}`;
  }

  return route;
};

/**
 * Checks if a path is a game route.
 * @param {string} pathname - Path to check
 * @returns {boolean} True if path is a game route
 */
export const isGameRoute = (pathname) => {
  if (!pathname || typeof pathname !== "string") return false;

  return (
    pathname.startsWith(GAME_ROUTES.GAME) ||
    pathname.startsWith(GAME_ROUTES.ROOM) ||
    pathname.startsWith(GAME_ROUTES.LOBBY) ||
    pathname.startsWith(GAME_ROUTES.TOURNAMENT)
  );
};

/**
 * Checks if a path is a public route.
 * @param {string} pathname - Path to check
 * @returns {boolean} True if path is a public route
 */
export const isPublicRoute = (pathname) => {
  if (!pathname || typeof pathname !== "string") return false;

  const publicPaths = Object.values(PUBLIC_ROUTES);
  return publicPaths.some((route) => pathname.startsWith(route));
};

/**
 * Checks if a path is an auth route.
 * @param {string} pathname - Path to check
 * @returns {boolean} True if path is an auth route
 */
export const isAuthRoute = (pathname) => {
  if (!pathname || typeof pathname !== "string") return false;

  const authPaths = Object.values(AUTH_ROUTES);
  return authPaths.some((route) => pathname.startsWith(route));
};

/**
 * Checks if a path is an error route.
 * @param {string} pathname - Path to check
 * @returns {boolean} True if path is an error route
 */
export const isErrorRoute = (pathname) => {
  if (!pathname || typeof pathname !== "string") return false;

  const errorPaths = Object.values(ERROR_ROUTES);
  return errorPaths.some((route) => pathname.startsWith(route));
};

/**
 * Extracts the room ID from a game route.
 * @param {string} pathname - Path to extract from
 * @returns {string|null} Room ID or null if not found
 */
export const extractRoomId = (pathname) => {
  if (!pathname || typeof pathname !== "string") return null;

  // Match /game/:roomId or /room/:roomId
  const gameMatch = pathname.match(/\/game\/([a-zA-Z0-9_-]{6,20})/);
  if (gameMatch) return gameMatch[1];

  const roomMatch = pathname.match(/\/room\/([a-zA-Z0-9_-]{6,20})/);
  if (roomMatch) return roomMatch[1];

  return null;
};

/**
 * Extracts the tournament ID from a tournament route.
 * @param {string} pathname - Path to extract from
 * @returns {string|null} Tournament ID or null if not found
 */
export const extractTournamentId = (pathname) => {
  if (!pathname || typeof pathname !== "string") return null;

  const match = pathname.match(/\/tournament\/([a-zA-Z0-9_-]{6,20})/);
  return match ? match[1] : null;
};

/**
 * Builds a URL with query parameters.
 * @param {string} path - Base path
 * @param {Object} query - Query parameters
 * @returns {string} URL with query string
 */
export const buildUrl = (path, query = null) => {
  if (!path || typeof path !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  let url = path;

  if (query && typeof query === "object") {
    const queryString = new URLSearchParams(query).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
};

/**
 * Adds a hash fragment to a URL.
 * @param {string} path - Base path
 * @param {string} hash - Hash fragment
 * @returns {string} URL with hash
 */
export const addHash = (path, hash) => {
  if (!path || typeof path !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  if (!hash || typeof hash !== "string") {
    return path;
  }

  return `${path}#${hash}`;
};

/**
 * Creates a redirect URL with return path.
 * @param {string} redirectPath - Path to redirect to
 * @param {string} returnPath - Return path
 * @param {Object} options - Additional options
 * @returns {string} Redirect URL
 */
export const getRedirectUrl = (
  redirectPath,
  returnPath = null,
  options = {},
) => {
  if (!redirectPath || typeof redirectPath !== "string") {
    throw new Error("Redirect path must be a non-empty string");
  }

  let url = redirectPath;

  if (returnPath && typeof returnPath === "string") {
    const params = { redirect: returnPath, ...options.query };
    url = buildUrl(url, params);
  }

  return url;
};

// ============================================================
// EXPORT
// ============================================================

// All exports are already defined above as named exports

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why route constants are better than hardcoded strings:
 *
 * - Type Safety: Using constants prevents typos and invalid routes.
 *   If you mistype a constant, you'll get a runtime error or
 *   TypeScript error, rather than silently breaking navigation.
 *
 * - Centralized Updates: Changing a route path only requires
 *   updating it in one place. All references automatically update.
 *
 * - Discoverability: IDEs can autocomplete route constants, making
 *   it easier to find and use the correct route.
 *
 * - Documentation: Route constants serve as self-documenting code.
 *   The names clearly indicate what the route is for.
 *
 * - Maintainability: When refactoring, you can safely change route
 *   paths without hunting through the entire codebase for hardcoded
 *   strings.
 *
 * - Consistency: All developers use the same route references,
 *   ensuring consistent navigation across the application.
 *
 * - Reduced Bugs: Eliminates bugs caused by mismatched or
 *   incorrectly typed route strings.
 *
 * 2. How this file improves maintainability and reduces bugs:
 *
 * - Single Source of Truth: All routes are defined in one place,
 *   making it easy to audit and update.
 *
 * - Route Validation: Helper functions validate route parameters,
 *   preventing malformed URLs from being generated.
 *
 * - Organized Structure: Routes are grouped logically (Public,
 *   Auth, Game, User, Error), making it easy to find routes by
 *   category.
 *
 * - Immutable: The ROUTES object is frozen, preventing accidental
 *   modifications at runtime.
 *
 * - Helper Functions: Functions like getGameRoute() and isGameRoute()
 *   encapsulate route logic, making the code more readable and
 *   less error-prone.
 *
 * - Framework Independence: The file uses vanilla JavaScript, so it
 *   works with any routing library (React Router, Vue Router, etc.)
 *
 * - Documentation: Each constant and function is documented, making
 *   it easy for new developers to understand the routing system.
 *
 * 3. How it will be reused throughout the application:
 *
 * Navigation Components:
 * - Navigation menus use route constants for links
 * - Breadcrumb components use routes for path generation
 * - Sidebar navigation uses routes for active state detection
 *
 * Route Guards:
 * - Authentication guards check if routes require authentication
 * - Role-based guards check if routes are accessible
 * - Redirect guards use routes for redirect destinations
 *
 * Redirects:
 * - After login, redirect to ROUTES.LOBBY or ROUTES.HOME
 * - After logout, redirect to ROUTES.LANDING
 * - Error boundaries redirect to ROUTES.NOT_FOUND
 *
 * Links & Buttons:
 * - "Play Now" button navigates to ROUTES.LOBBY
 * - "Create Game" button navigates to ROUTES.CREATE_GAME
 * - "Join Game" button navigates to ROUTES.JOIN_GAME
 * - "View Profile" link navigates to USER_ROUTES.PROFILE
 *
 * API Calls:
 * - API routes used for building API endpoints
 * - Consistent with client-side routes
 *
 * Testing:
 * - Test navigation uses route constants for consistency
 * - E2E tests reference routes for reliable test execution
 *
 * Example usage:
 *
 * import { ROUTES, getGameRoute, isGameRoute } from '@/constants/routes';
 *
 * // Navigation link
 * <Link to={ROUTES.LOBBY}>Lobby</Link>
 *
 * // Dynamic route
 * const gameUrl = getGameRoute(roomId);
 * <Link to={gameUrl}>Join Game</Link>
 *
 * // Route guard
 * if (!isGameRoute(currentPath)) {
 *   redirect(ROUTES.HOME);
 * }
 *
 * // Redirect after action
 * navigate(ROUTES.LOBBY);
 *
 * // API call
 * const response = await fetch(`${API_ROUTES.GAME}/${roomId}`);
 *
 * // Build URL with query params
 * const searchUrl = buildUrl(ROUTES.SEARCH, { q: 'game', page: 1 });
 *
 * // Settings with section
 * const audioSettings = getSettingsRoute('audio');
 */
