import { useState } from 'react';
import {
    FaHashtag,
    FaUsers,
    FaUser,
    FaGamepad,
    FaGlobe,
    FaLock,
    FaClock,
    FaCopy,
    FaCheck
} from 'react-icons/fa';

function RoomInfo({
    roomId = 'LUDO-000',
    roomName = 'Ludo Room',
    hostName = 'Host',
    gameMode = '4 Players',
    roomVisibility = 'public',
    maxPlayers = 4,
    connectedPlayers = 0,
    createdAt = null
}) {
    const [copied, setCopied] = useState(false);

    const handleCopyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            console.error('Failed to copy room ID:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Just now';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return 'Just now';
        return dateObj.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVisibilityIcon = () => {
        if (roomVisibility === 'private') {
            return <FaLock className="text-yellow-400" />;
        }
        return <FaGlobe className="text-green-400" />;
    };

    const getVisibilityLabel = () => {
        return roomVisibility === 'private' ? 'Private' : 'Public';
    };

    const getVisibilityColor = () => {
        return roomVisibility === 'private' ? 'text-yellow-400' : 'text-green-400';
    };

    const getPlayerProgress = () => {
        return Math.round((connectedPlayers / maxPlayers) * 100);
    };

    const getPlayerStatusColor = () => {
        if (connectedPlayers === 0) return 'text-gray-400';
        if (connectedPlayers >= maxPlayers) return 'text-green-400';
        return 'text-yellow-400';
    };

    return (
        <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left Section - Room Info */}
                <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                                {roomName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 bg-gray-700/30 px-2 py-0.5 rounded-lg border border-gray-600/30">
                                    <FaHashtag className="text-yellow-400 text-xs" />
                                    <span className="text-xs text-gray-300 font-mono">{roomId}</span>
                                </div>
                                <button
                                    onClick={handleCopyRoomId}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600/30 hover:border-yellow-400/50 group"
                                    aria-label="Copy room ID to clipboard"
                                    title="Copy room ID"
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck className="text-green-400 text-xs" />
                                            <span className="text-xs text-green-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCopy className="text-gray-400 group-hover:text-yellow-400 text-xs transition-colors" />
                                            <span className="text-xs text-gray-400 group-hover:text-yellow-400 transition-colors">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FaUser className="text-blue-400" />
                            <span>Host: <span className="text-white font-medium">{hostName}</span></span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FaGamepad className="text-yellow-400" />
                            <span>Mode: <span className="text-white font-medium">{gameMode}</span></span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                            {getVisibilityIcon()}
                            <span className={`font-medium ${getVisibilityColor()}`}>
                                {getVisibilityLabel()}
                            </span>
                        </div>

                        {createdAt && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <FaClock className="text-gray-500" />
                                <span>Created: <span className="text-gray-300">{formatDate(createdAt)}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section - Player Stats */}
                <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <div className="flex items-center gap-1.5">
                            <FaUsers className={`text-sm ${getPlayerStatusColor()}`} />
                            <span className={`text-sm font-medium ${getPlayerStatusColor()}`}>
                                {connectedPlayers}/{maxPlayers}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400">
                            {connectedPlayers >= maxPlayers ? 'Full' : 'Open'}
                        </div>
                    </div>

                    <div className="w-full lg:w-48">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${getPlayerProgress()}%`,
                                        backgroundColor: connectedPlayers >= maxPlayers
                                            ? '#4ade80'
                                            : connectedPlayers > 0
                                                ? '#facc15'
                                                : '#6b7280'
                                    }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 font-mono">
                                {getPlayerProgress()}%
                            </span>
                        </div>
                    </div>

                    {connectedPlayers >= maxPlayers && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Room is full
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoomInfo;