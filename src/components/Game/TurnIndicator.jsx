import { FaUserClock, FaClock, FaHourglassHalf } from 'react-icons/fa';

function TurnIndicator({
    currentPlayer = null,
    playerColor = null,
    turnNumber = 1,
    turnTimeRemaining = 30,
    isMyTurn = false
}) {
    const getColorStyles = () => {
        if (!playerColor) return 'border-gray-500 bg-gray-500/10';

        const colors = {
            red: 'border-red-500 bg-red-500/10',
            green: 'border-green-500 bg-green-500/10',
            yellow: 'border-yellow-400 bg-yellow-400/10',
            blue: 'border-blue-500 bg-blue-500/10'
        };
        return colors[playerColor] || 'border-gray-500 bg-gray-500/10';
    };

    const getTextColor = () => {
        if (!playerColor) return 'text-gray-400';

        const colors = {
            red: 'text-red-400',
            green: 'text-green-400',
            yellow: 'text-yellow-400',
            blue: 'text-blue-400'
        };
        return colors[playerColor] || 'text-gray-400';
    };

    const getPlayerName = () => {
        if (!currentPlayer) return 'Waiting for player...';
        if (typeof currentPlayer === 'object') {
            return currentPlayer.name || currentPlayer;
        }
        return currentPlayer;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (turnTimeRemaining <= 5) return 'text-red-400';
        if (turnTimeRemaining <= 10) return 'text-orange-400';
        return 'text-gray-300';
    };

    const getTimeAnimation = () => {
        if (turnTimeRemaining <= 5) return 'animate-pulse';
        return '';
    };

    return (
        <div
            className={`
        relative w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border-2 
        transition-all duration-300 p-4
        ${getColorStyles()}
        ${isMyTurn ? 'scale-105 shadow-lg shadow-yellow-400/20 ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''}
      `}
            role="status"
            aria-label={`Turn indicator - ${getPlayerName()}'s turn`}
            aria-live="polite"
        >
            {/* Current Turn Badge */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                        <div className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full 
              flex items-center justify-center
              ${getTextColor()} bg-gray-700/50
              border-2 ${getColorStyles().split(' ')[0]}
              transition-all duration-300
              ${isMyTurn ? 'scale-110' : ''}
            `}>
                            <FaUserClock className="text-lg sm:text-xl" />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className={`
                text-sm sm:text-base font-semibold truncate
                ${isMyTurn ? 'text-yellow-400' : getTextColor()}
              `}>
                                {getPlayerName()}
                            </h4>
                            {playerColor && (
                                <span
                                    className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                    style={{ backgroundColor: playerColor }}
                                    aria-label={`Player color: ${playerColor}`}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                                <FaClock className="text-[10px]" />
                                Turn #{turnNumber}
                            </span>
                            {isMyTurn && (
                                <span className="flex items-center gap-1 text-green-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Your Turn
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Time Remaining */}
                <div className="shrink-0 flex items-center gap-2">
                    <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-gray-700/30 border border-gray-600/30
            transition-all duration-300
            ${isMyTurn ? 'border-yellow-400/50 bg-yellow-400/5' : ''}
          `}>
                        <FaHourglassHalf className={`text-sm ${getTimeColor()}`} />
                        <span className={`
              font-mono font-bold text-sm sm:text-base
              ${getTimeColor()} ${getTimeAnimation()}
            `}>
                            {formatTime(turnTimeRemaining)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                        {isMyTurn
                            ? '⌛ Your turn - roll the dice!'
                            : `⏳ Waiting for ${getPlayerName()} to move...`}
                    </span>
                    <span className="text-gray-500">
                        {isMyTurn && turnTimeRemaining <= 5 && (
                            <span className="text-red-400 animate-pulse font-medium">
                                ⚠️ Time running out!
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                    className={`
            h-full rounded-full transition-all duration-1000 ease-linear
            ${turnTimeRemaining <= 5 ? 'bg-red-500' : ''}
            ${turnTimeRemaining <= 10 && turnTimeRemaining > 5 ? 'bg-orange-500' : ''}
            ${turnTimeRemaining > 10 && isMyTurn ? 'bg-yellow-400' : ''}
            ${!isMyTurn ? 'bg-gray-600' : ''}
          `}
                    style={{
                        width: isMyTurn ? `${(turnTimeRemaining / 30) * 100}%` : '100%',
                        opacity: isMyTurn ? 1 : 0.3
                    }}
                />
            </div>

            {/* Turn Indicator Arrow */}
            {isMyTurn && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            )}
        </div>
    );
}

export default TurnIndicator;