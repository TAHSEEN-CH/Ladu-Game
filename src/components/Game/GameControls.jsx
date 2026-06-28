import { useState } from 'react';
import { FaDice, FaStop, FaSignOutAlt, FaPause, FaPlay } from 'react-icons/fa';

function GameControls({
    gameStatus = 'waiting',
    currentPlayer = null,
    canRollDice = false,
    canEndTurn = false,
    canLeaveGame = true,
    isRolling = false,
    onRollDice = () => { },
    onEndTurn = () => { },
    onLeaveGame = () => { }
}) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const getStatusText = () => {
        const statusMap = {
            waiting: 'Waiting for players...',
            ready: 'Game starting...',
            playing: 'Game in progress',
            finished: 'Game Over',
            paused: 'Game paused'
        };
        return statusMap[gameStatus] || 'Loading...';
    };

    const getStatusColor = () => {
        const colorMap = {
            waiting: 'text-yellow-400',
            ready: 'text-blue-400',
            playing: 'text-green-400',
            finished: 'text-purple-400',
            paused: 'text-orange-400'
        };
        return colorMap[gameStatus] || 'text-gray-400';
    };

    const handleLeaveConfirm = () => {
        setShowLeaveConfirm(true);
    };

    const handleLeaveCancel = () => {
        setShowLeaveConfirm(false);
    };

    const handleLeaveConfirmAction = () => {
        setShowLeaveConfirm(false);
        onLeaveGame();
    };

    const renderStatus = () => (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor().replace('text-', 'bg-')}`} />
            <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
            </span>
            {currentPlayer && (
                <span className="text-sm text-gray-400">
                    · <span className="text-white">{currentPlayer.name}</span>'s turn
                </span>
            )}
        </div>
    );

    return (
        <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {renderStatus()}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Roll Dice Button */}
                    <button
                        onClick={onRollDice}
                        disabled={!canRollDice || isRolling || gameStatus !== 'playing'}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
              transition-all duration-200 text-sm
              ${canRollDice && !isRolling && gameStatus === 'playing'
                                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-400/30'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                            }
            `}
                        aria-label="Roll Dice"
                        aria-disabled={!canRollDice || isRolling || gameStatus !== 'playing'}
                    >
                        {isRolling ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Rolling...
                            </>
                        ) : (
                            <>
                                <FaDice />
                                Roll Dice
                            </>
                        )}
                    </button>

                    {/* End Turn Button */}
                    <button
                        onClick={onEndTurn}
                        disabled={!canEndTurn || gameStatus !== 'playing'}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
              transition-all duration-200 text-sm
              ${canEndTurn && gameStatus === 'playing'
                                ? 'bg-blue-500 text-white hover:bg-blue-400 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/30'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                            }
            `}
                        aria-label="End Turn"
                        aria-disabled={!canEndTurn || gameStatus !== 'playing'}
                    >
                        <FaStop />
                        End Turn
                    </button>

                    {/* Leave Game Button */}
                    {!showLeaveConfirm ? (
                        <button
                            onClick={handleLeaveConfirm}
                            disabled={!canLeaveGame}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
                transition-all duration-200 text-sm
                ${canLeaveGame
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/30 hover:border-red-500/50'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                                }
              `}
                            aria-label="Leave Game"
                            aria-disabled={!canLeaveGame}
                        >
                            <FaSignOutAlt />
                            Leave Game
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Leave game?</span>
                            <button
                                onClick={handleLeaveConfirmAction}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-400 transition-colors"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleLeaveCancel}
                                className="px-3 py-1 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-500 transition-colors"
                            >
                                No
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GameControls;