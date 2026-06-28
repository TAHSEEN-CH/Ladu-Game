import { FaUsers, FaClock, FaHashtag, FaGamepad } from 'react-icons/fa';

function GameHeader({
    roomId = 'LUDO-000',
    gameMode = '4 Players',
    gameStatus = 'waiting',
    totalPlayers = 4,
    connectedPlayers = 0,
    currentTurn = null,
    elapsedTime = 0
}) {
    const getStatusConfig = () => {
        const configs = {
            waiting: {
                label: 'Waiting',
                color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                dot: 'bg-yellow-400'
            },
            ready: {
                label: 'Ready',
                color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                dot: 'bg-blue-400'
            },
            playing: {
                label: 'Playing',
                color: 'bg-green-500/20 text-green-400 border-green-500/30',
                dot: 'bg-green-400'
            },
            paused: {
                label: 'Paused',
                color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                dot: 'bg-orange-400'
            },
            finished: {
                label: 'Finished',
                color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                dot: 'bg-purple-400'
            }
        };
        return configs[gameStatus] || configs.waiting;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const statusConfig = getStatusConfig();

    return (
        <header className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left Section - Room Info */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                        <FaHashtag className="text-yellow-400 text-sm" />
                        <span className="text-white font-mono text-sm">{roomId}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                        <FaGamepad className="text-yellow-400 text-sm" />
                        <span className="text-gray-300 text-sm">{gameMode}</span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                        <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>
                </div>

                {/* Center Section - Game Stats */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                        <FaUsers className="text-blue-400 text-sm" />
                        <span className="text-gray-300 text-sm">
                            {connectedPlayers}/{totalPlayers}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                        <FaClock className="text-yellow-400 text-sm" />
                        <span className="text-white font-mono text-sm">
                            {formatTime(elapsedTime)}
                        </span>
                    </div>

                    {currentTurn && (
                        <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                            <span className="text-gray-400 text-sm">Turn:</span>
                            <span className="text-white text-sm font-medium">
                                {currentTurn.name || currentTurn}
                            </span>
                            {currentTurn.color && (
                                <span
                                    className={`w-3 h-3 rounded-full bg-${currentTurn.color}-500 border border-${currentTurn.color}-300`}
                                    style={{ backgroundColor: currentTurn.color }}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Right Section - Additional Info */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    {gameStatus === 'playing' && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>Live</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default GameHeader;