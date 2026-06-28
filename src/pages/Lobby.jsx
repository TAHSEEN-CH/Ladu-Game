import { useState } from 'react';
import { Link } from 'react-router-dom';

function Lobby() {
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

    const handleCreateRoom = (e) => {
        e.preventDefault();
        const errors = validateCreateRoom();
        if (Object.keys(errors).length > 0) {
            setCreateErrors(errors);
            return;
        }
        setCreateErrors({});
        setIsCreating(true);
        console.log('Create Room Data:', createRoomData);
        setTimeout(() => {
            setIsCreating(false);
        }, 1000);
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        const errors = validateJoinRoom();
        if (Object.keys(errors).length > 0) {
            setJoinErrors(errors);
            return;
        }
        setJoinErrors({});
        setIsJoining(true);
        console.log('Join Room Data:', joinRoomData);
        setTimeout(() => {
            setIsJoining(false);
        }, 1000);
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateRoomData((prev) => ({ ...prev, [name]: value }));
        if (createErrors[name]) {
            setCreateErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleJoinChange = (e) => {
        const { name, value } = e.target;
        setJoinRoomData((prev) => ({ ...prev, [name]: value }));
        if (joinErrors[name]) {
            setJoinErrors((prev) => ({ ...prev, [name]: '' }));
        }
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
                                <span className="text-green-400 font-semibold">0</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                                <span className="text-gray-300 text-sm">Active Games</span>
                                <span className="text-yellow-400 font-semibold">0</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                                <span className="text-gray-300 text-sm">Your Status</span>
                                <span className="text-blue-400 font-semibold">Offline</span>
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