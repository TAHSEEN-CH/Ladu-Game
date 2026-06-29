import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';

function Lobby() {
    const navigate = useNavigate();
    const { createRoom, joinRoom, state } = useGame();

    const [createRoomData, setCreateRoomData] = useState({
        roomName: '',
        playerName: ''
    });
    const [joinRoomData, setJoinRoomData] = useState({
        roomId: '',
        playerName: ''
    });
    const [createErrors, setCreateErrors] = useState({});
    const [joinErrors, setJoinErrors] = useState({});
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [joinError, setJoinError] = useState(null);

    const validateCreateRoom = () => {
        const errors = {};
        if (!createRoomData.roomName.trim()) {
            errors.roomName = 'Room name is required';
        }
        if (!createRoomData.playerName.trim()) {
            errors.playerName = 'Player name is required';
        }
        return errors;
    };

    const validateJoinRoom = () => {
        const errors = {};
        if (!joinRoomData.roomId.trim()) {
            errors.roomId = 'Room ID is required';
        }
        if (!joinRoomData.playerName.trim()) {
            errors.playerName = 'Player name is required';
        }
        return errors;
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setCreateError(null);

        const errors = validateCreateRoom();
        if (Object.keys(errors).length > 0) {
            setCreateErrors(errors);
            return;
        }
        setCreateErrors({});
        setIsCreating(true);

        try {
            // Generate a unique player ID
            const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Call createRoom from GameContext
            const roomId = createRoom({
                name: createRoomData.roomName,
                hostId: playerId,
                hostName: createRoomData.playerName,
                hostColor: getAvailableColor(),
                gameMode: '4 Players',
                visibility: 'public',
                maxPlayers: 4,
                isPrivate: false
            });

            // Navigate to the game room
            navigate(`/game/${roomId}`);
        } catch (error) {
            setCreateError(error.message || 'Failed to create room. Please try again.');
            setIsCreating(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setJoinError(null);

        const errors = validateJoinRoom();
        if (Object.keys(errors).length > 0) {
            setJoinErrors(errors);
            return;
        }
        setJoinErrors({});
        setIsJoining(true);

        try {
            // Generate a unique player ID
            const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Call joinRoom from GameContext
            joinRoom({
                id: playerId,
                name: joinRoomData.playerName,
                color: getAvailableColor()
            });

            // Navigate to the game room
            navigate(`/game/${joinRoomData.roomId.trim()}`);
        } catch (error) {
            setJoinError(error.message || 'Failed to join room. Please check the Room ID and try again.');
            setIsJoining(false);
        }
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateRoomData((prev) => ({ ...prev, [name]: value }));
        if (createErrors[name]) {
            setCreateErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (createError) {
            setCreateError(null);
        }
    };

    const handleJoinChange = (e) => {
        const { name, value } = e.target;
        setJoinRoomData((prev) => ({ ...prev, [name]: value }));
        if (joinErrors[name]) {
            setJoinErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (joinError) {
            setJoinError(null);
        }
    };

    // Helper function to get available color (simplified)
    const getAvailableColor = () => {
        const colors = ['red', 'green', 'yellow', 'blue'];
        const usedColors = state.players.map(p => p.color);
        const available = colors.find(c => !usedColors.includes(c));
        return available || colors[0];
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Game <span className="text-yellow-400">Lobby</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Create a new game room or join an existing one to start playing
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <span className="text-yellow-400 mr-2">🎮</span>
                            Create Room
                        </h2>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            {createError && (
                                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                                    {createError}
                                </div>
                            )}

                            <div>
                                <label htmlFor="createRoomName" className="block text-sm font-medium text-gray-300 mb-1">
                                    Room Name
                                </label>
                                <input
                                    id="createRoomName"
                                    type="text"
                                    name="roomName"
                                    value={createRoomData.roomName}
                                    onChange={handleCreateChange}
                                    placeholder="Enter room name"
                                    className={`w-full px-4 py-2 bg-gray-700/50 border ${createErrors.roomName ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-colors duration-200`}
                                />
                                {createErrors.roomName && (
                                    <p className="mt-1 text-sm text-red-400">{createErrors.roomName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="createPlayerName" className="block text-sm font-medium text-gray-300 mb-1">
                                    Your Name
                                </label>
                                <input
                                    id="createPlayerName"
                                    type="text"
                                    name="playerName"
                                    value={createRoomData.playerName}
                                    onChange={handleCreateChange}
                                    placeholder="Enter your name"
                                    className={`w-full px-4 py-2 bg-gray-700/50 border ${createErrors.playerName ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-colors duration-200`}
                                />
                                {createErrors.playerName && (
                                    <p className="mt-1 text-sm text-red-400">{createErrors.playerName}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className={`w-full py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-all duration-200 ${isCreating
                                    ? 'opacity-70 cursor-not-allowed'
                                    : 'hover:bg-yellow-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/30'
                                    }`}
                            >
                                {isCreating ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Room'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <span className="text-yellow-400 mr-2">🔗</span>
                            Join Room
                        </h2>
                        <form onSubmit={handleJoinRoom} className="space-y-4">
                            {joinError && (
                                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                                    {joinError}
                                </div>
                            )}

                            <div>
                                <label htmlFor="joinRoomId" className="block text-sm font-medium text-gray-300 mb-1">
                                    Room ID
                                </label>
                                <input
                                    id="joinRoomId"
                                    type="text"
                                    name="roomId"
                                    value={joinRoomData.roomId}
                                    onChange={handleJoinChange}
                                    placeholder="Enter room ID"
                                    className={`w-full px-4 py-2 bg-gray-700/50 border ${joinErrors.roomId ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-colors duration-200`}
                                />
                                {joinErrors.roomId && (
                                    <p className="mt-1 text-sm text-red-400">{joinErrors.roomId}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="joinPlayerName" className="block text-sm font-medium text-gray-300 mb-1">
                                    Your Name
                                </label>
                                <input
                                    id="joinPlayerName"
                                    type="text"
                                    name="playerName"
                                    value={joinRoomData.playerName}
                                    onChange={handleJoinChange}
                                    placeholder="Enter your name"
                                    className={`w-full px-4 py-2 bg-gray-700/50 border ${joinErrors.playerName ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-colors duration-200`}
                                />
                                {joinErrors.playerName && (
                                    <p className="mt-1 text-sm text-red-400">{joinErrors.playerName}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isJoining}
                                className={`w-full py-3 bg-purple-500 text-white font-semibold rounded-lg transition-all duration-200 ${isJoining
                                    ? 'opacity-70 cursor-not-allowed'
                                    : 'hover:bg-purple-400 transform hover:scale-105 shadow-lg hover:shadow-purple-500/30'
                                    }`}
                            >
                                {isJoining ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Joining...
                                    </span>
                                ) : (
                                    'Join Room'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <span className="text-yellow-400 mr-2">📊</span>
                            Recent Games
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm">No recent games available</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Start playing to see your history here</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <span className="text-green-400 mr-2">🟢</span>
                            Online Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                                <span className="text-gray-300 text-sm">Players Online</span>
                                <span className="text-green-400 font-semibold">{state.players?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                                <span className="text-gray-300 text-sm">Active Games</span>
                                <span className="text-yellow-400 font-semibold">
                                    {state.gameStatus === 'playing' ? 1 : 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                                <span className="text-gray-300 text-sm">Your Status</span>
                                <span className="text-blue-400 font-semibold">
                                    {state.players?.length > 0 ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Lobby;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. What changed:
 * 
 * - Added imports for useNavigate and useGame
 * - Replaced console.log with actual game context actions
 * - Added error handling with friendly error messages
 * - Added player ID generation for unique identification
 * - Added navigation to game room after successful creation/joining
 * - Added loading states and disabled button while processing
 * - Added error state management for create and join operations
 * - Updated online status to reflect actual game state
 * 
 * 2. How Create Room now works:
 * 
 * - Validates form inputs (room name and player name)
 * - Generates a unique player ID using timestamp and random string
 * - Calls createRoom() from GameContext with:
 *   * Room name
 *   * Host player ID
 *   * Host player name
 *   * Available color (auto-assigned)
 *   * Default game settings
 * - Gets the generated room ID from the context
 * - Navigates to `/game/:roomId` using useNavigate
 * - Shows loading spinner during the process
 * - Displays error message if creation fails
 * - Prevents duplicate submissions while loading
 * 
 * 3. How Join Room now works:
 * 
 * - Validates form inputs (room ID and player name)
 * - Generates a unique player ID using timestamp and random string
 * - Calls joinRoom() from GameContext with:
 *   * Player ID
 *   * Player name
 *   * Available color (auto-assigned)
 * - Navigates to `/game/:roomId` using useNavigate
 * - Shows loading spinner during the process
 * - Displays error message if joining fails
 * - Prevents duplicate submissions while loading
 * 
 * 4. Why this implementation is ready for future Socket.IO integration:
 * 
 * - Separation of Concerns: The component only handles UI logic
 *   (forms, validation, navigation). All game state management
 *   is handled by GameContext.
 * 
 * - Action-Based Architecture: The component calls context actions
 *   (createRoom, joinRoom) which are pure reducer actions. This
 *   makes it easy to wrap these actions with Socket.IO events.
 * 
 * - Player ID Generation: Each player gets a unique ID locally.
 *   In a Socket.IO implementation, this would be generated by
 *   the server or synced across clients.
 * 
 * - Error Handling: The component already handles errors gracefully.
 *   Socket.IO errors can be displayed using the same error UI.
 * 
 * - Navigation: Navigation happens after successful room
 *   creation/joining. With Socket.IO, we would wait for server
 *   confirmation before navigating.
 * 
 * - Future integration example:
 * 
 *   const handleCreateRoom = async (e) => {
 *     // ... validation ...
 *     
 *     // Emit to server via Socket.IO
 *     socket.emit('createRoom', {
 *       roomName: createRoomData.roomName,
 *       playerName: createRoomData.playerName
 *     });
 *     
 *     // Listen for server confirmation
 *     socket.on('roomCreated', (data) => {
 *       // Update context with server data
 *       createRoom(data);
 *       navigate(`/game/${data.roomId}`);
 *     });
 *   };
 * 
 * - The current implementation acts as a local fallback. When
 *   Socket.IO is added, the component can be updated to use
 *   both local and remote operations with minimal changes.
 */