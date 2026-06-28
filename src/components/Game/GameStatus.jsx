import {
    FaClock,
    FaDice,
    FaPlay,
    FaPause,
    FaCheckCircle,
    FaTrophy,
    FaHourglassHalf,
    FaUsers,
    FaUserClock
} from 'react-icons/fa';

function GameStatus({
    gameStatus = 'waiting',
    currentPlayer = null,
    lastDiceValue = null,
    currentTurn = null,
    remainingMoves = null,
    message = null
}) {
    const getStatusConfig = () => {
        const configs = {
            waiting: {
                label: 'Waiting for Players',
                icon: FaUsers,
                color: 'text-yellow-400',
                bg: 'bg-yellow-400/10',
                border: 'border-yellow-400/30',
                dot: 'bg-yellow-400'
            },
            ready: {
                label: 'Ready to Start',
                icon: FaCheckCircle,
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
                border: 'border-blue-400/30',
                dot: 'bg-blue-400'
            },
            playing: {
                label: 'Game in Progress',
                icon: FaPlay,
                color: 'text-green-400',
                bg: 'bg-green-400/10',
                border: 'border-green-400/30',
                dot: 'bg-green-400 animate-pulse'
            },
            paused: {
                label: 'Game Paused',
                icon: FaPause,
                color: 'text-orange-400',
                bg: 'bg-orange-400/10',
                border: 'border-orange-400/30',
                dot: 'bg-orange-400'
            },
            finished: {
                label: 'Game Over',
                icon: FaTrophy,
                color: 'text-purple-400',
                bg: 'bg-purple-400/10',
                border: 'border-purple-400/30',
                dot: 'bg-purple-400'
            }
        };
        return configs[gameStatus] || configs.waiting;
    };

    const getStatusMessage = () => {
        if (message) return message;

        const messages = {
            waiting: 'Waiting for players to join the room...',
            ready: 'All players are ready! Starting soon...',
            playing: currentPlayer
                ? `${currentPlayer.name || currentPlayer}'s turn to roll the dice`
                : 'Game in progress...',
            paused: 'Game has been paused. Resume when ready.',
            finished: 'Congratulations! The game is complete.'
        };
        return messages[gameStatus] || 'Loading game status...';
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    const renderDiceValue = () => {
        if (lastDiceValue === null || lastDiceValue === undefined) return null;

        return (
            <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                <FaDice className="text-yellow-400 text-sm" />
                <span className="text-white font-mono font-bold text-lg">
                    {lastDiceValue}
                </span>
            </div>
        );
    };

    const renderRemainingMoves = () => {
        if (remainingMoves === null || remainingMoves === undefined) return null;

        return (
            <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                <FaHourglassHalf className="text-yellow-400 text-sm" />
                <span className="text-gray-300 text-sm">
                    <span className="text-white font-medium">{remainingMoves}</span> moves remaining
                </span>
            </div>
        );
    };

    const renderCurrentTurn = () => {
        if (!currentTurn) return null;

        const turnName = typeof currentTurn === 'object'
            ? currentTurn.name || currentTurn
            : currentTurn;

        const turnColor = typeof currentTurn === 'object' && currentTurn.color
            ? currentTurn.color
            : null;

        return (
            <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-lg border border-gray-600/30">
                <FaUserClock className="text-blue-400 text-sm" />
                <span className="text-gray-300 text-sm">
                    Turn: <span className="text-white font-medium">{turnName}</span>
                </span>
                {turnColor && (
                    <span
                        className={`w-3 h-3 rounded-full bg-${turnColor}-500 border border-${turnColor}-300`}
                        style={{ backgroundColor: turnColor }}
                    />
                )}
            </div>
        );
    };

    return (
        <div className={`w-full bg-gray-800/30 backdrop-blur-sm rounded-xl border ${statusConfig.border} p-4 transition-all duration-300`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-start gap-3 w-full md:w-auto">
                    <div className={`p-2 rounded-lg ${statusConfig.bg} ${statusConfig.color} shrink-0`}>
                        <StatusIcon className="text-lg sm:text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm sm:text-base ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                            {getStatusMessage()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {renderCurrentTurn()}
                    {renderDiceValue()}
                    {renderRemainingMoves()}
                </div>
            </div>

            {gameStatus === 'finished' && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm text-purple-400">
                        <FaTrophy />
                        <span>Game completed! Check the results above.</span>
                    </div>
                </div>
            )}

            {gameStatus === 'waiting' && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                        <FaUsers />
                        <span>Share the room ID with friends to join!</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameStatus;