// src/pages/OfflineSetup.jsx

/**
 * Offline Setup Page
 * 
 * Professional game configuration page for offline Ludo matches.
 * Allows users to configure game mode, players, difficulty, and settings.
 * Fully responsive with glassmorphism design.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// CONSTANTS
// ============================================================

const GAME_MODES = {
    VS_COMPUTER: 'vs_computer',
    LOCAL_MULTIPLAYER: 'local_multiplayer',
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PLAYER_COUNTS = [2, 3, 4];
const COLORS = ['Red', 'Green', 'Yellow', 'Blue'];
const TIMER_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '30 Seconds', value: 30 },
    { label: '60 Seconds', value: 60 },
    { label: '90 Seconds', value: 90 },
];

const DEFAULT_PLAYER_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const DEFAULT_COLORS = ['Red', 'Green', 'Yellow', 'Blue'];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Gets the color class for a color name.
 * @param {string} color - Color name
 * @returns {string} Tailwind CSS classes
 */
const getColorClasses = (color) => {
    const colorMap = {
        Red: 'bg-red-500 border-red-600',
        Green: 'bg-green-500 border-green-600',
        Yellow: 'bg-yellow-400 border-yellow-500',
        Blue: 'bg-blue-500 border-blue-600',
    };
    return colorMap[color] || 'bg-gray-500 border-gray-600';
};

/**
 * Gets the color ring class for a color name.
 * @param {string} color - Color name
 * @returns {string} Tailwind CSS ring classes
 */
const getColorRingClasses = (color) => {
    const colorMap = {
        Red: 'ring-red-500',
        Green: 'ring-green-500',
        Yellow: 'ring-yellow-400',
        Blue: 'ring-blue-500',
    };
    return colorMap[color] || 'ring-gray-500';
};

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * OfflineSetup page component.
 * Configures game settings before starting an offline match.
 */
const OfflineSetup = () => {
    const navigate = useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [gameMode, setGameMode] = useState(GAME_MODES.LOCAL_MULTIPLAYER);
    const [playerCount, setPlayerCount] = useState(2);
    const [difficulty, setDifficulty] = useState('Medium');
    const [timer, setTimer] = useState(30);
    const [playerNames, setPlayerNames] = useState([...DEFAULT_PLAYER_NAMES]);
    const [playerColors, setPlayerColors] = useState([...DEFAULT_COLORS]);
    const [options, setOptions] = useState({
        allowUndo: true,
        showPossibleMoves: true,
        enableSound: true,
        enableAnimations: true,
    });

    // ============================================================
    // COMPUTED VALUES
    // ============================================================

    /**
     * Gets the available colors for a given player index.
     * Colors already selected by other players are disabled.
     */
    const getAvailableColors = useMemo(() => {
        const selectedColors = playerColors.slice(0, playerCount);
        const availableColors = COLORS.filter(
            color => !selectedColors.includes(color)
        );
        return availableColors;
    }, [playerColors, playerCount]);

    /**
     * Checks if a color is selected by another player.
     */
    const isColorSelected = (color, currentIndex) => {
        return playerColors.some(
            (c, index) => c === color && index !== currentIndex && index < playerCount
        );
    };

    /**
     * Gets the number of players to display based on player count.
     */
    const getDisplayPlayers = useMemo(() => {
        return Array.from({ length: playerCount }, (_, index) => ({
            index,
            name: playerNames[index] || `Player ${index + 1}`,
            color: playerColors[index] || COLORS[index % COLORS.length],
        }));
    }, [playerCount, playerNames, playerColors]);

    /**
     * Checks if the form is valid for submission.
     */
    const isFormValid = useMemo(() => {
        // Check all player names are filled
        const allNamesFilled = playerNames
            .slice(0, playerCount)
            .every(name => name && name.trim().length > 0);

        // Check all colors are unique
        const uniqueColors = new Set(playerColors.slice(0, playerCount));
        const allColorsUnique = uniqueColors.size === playerCount;

        return allNamesFilled && allColorsUnique;
    }, [playerNames, playerColors, playerCount]);

    // ============================================================
    // HANDLERS
    // ============================================================

    /**
     * Handles player name change.
     */
    const handlePlayerNameChange = (index, value) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    /**
     * Handles player color change.
     */
    const handlePlayerColorChange = (index, color) => {
        const newColors = [...playerColors];
        newColors[index] = color;
        setPlayerColors(newColors);
    };

    /**
     * Handles option toggle.
     */
    const handleOptionToggle = (option) => {
        setOptions(prev => ({
            ...prev,
            [option]: !prev[option],
        }));
    };

    /**
     * Handles starting the game.
     */
    const handleStartGame = () => {
        // Build settings object
        const settings = {
            mode: gameMode,
            players: playerCount,
            difficulty: gameMode === GAME_MODES.VS_COMPUTER ? difficulty : null,
            timer: timer,
            playerNames: playerNames.slice(0, playerCount),
            playerColors: playerColors.slice(0, playerCount),
            options: options,
        };

        // Navigate to game page with settings
        navigate('/game/offline', {
            state: { settings },
        });
    };

    /**
     * Handles going back to home.
     */
    const handleBack = () => {
        navigate('/');
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                        Offline Game <span className="text-yellow-400">Setup</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Configure your game before starting.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Game Mode */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Choose Game Mode
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Vs Computer */}
                                <button
                                    onClick={() => setGameMode(GAME_MODES.VS_COMPUTER)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${gameMode === GAME_MODES.VS_COMPUTER
                                            ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/50'
                                            : 'border-gray-600 hover:border-gray-400 bg-gray-700/30'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">🤖</div>
                                    <div className="text-white font-medium">Vs Computer</div>
                                    <div className="text-gray-400 text-sm">Play against AI</div>
                                </button>

                                {/* Local Multiplayer */}
                                <button
                                    onClick={() => setGameMode(GAME_MODES.LOCAL_MULTIPLAYER)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${gameMode === GAME_MODES.LOCAL_MULTIPLAYER
                                            ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/50'
                                            : 'border-gray-600 hover:border-gray-400 bg-gray-700/30'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">👥</div>
                                    <div className="text-white font-medium">Local Multiplayer</div>
                                    <div className="text-gray-400 text-sm">Play with friends</div>
                                </button>
                            </div>
                        </div>

                        {/* Section 2: Choose Players */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Choose Players
                            </h2>
                            <div className="flex gap-4 flex-wrap">
                                {PLAYER_COUNTS.map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setPlayerCount(count)}
                                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${playerCount === count
                                                ? 'bg-yellow-400 text-gray-900'
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {count} Players
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Difficulty (Vs Computer only) */}
                        {gameMode === GAME_MODES.VS_COMPUTER && (
                            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Difficulty
                                </h2>
                                <div className="flex gap-4 flex-wrap">
                                    {DIFFICULTIES.map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setDifficulty(diff)}
                                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${difficulty === diff
                                                    ? 'bg-yellow-400 text-gray-900'
                                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                                }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 4: Player Information */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Player Information
                            </h2>
                            <div className="space-y-4">
                                {getDisplayPlayers.map((player, index) => (
                                    <div key={index} className="flex flex-wrap items-center gap-4">
                                        <div className="flex-1 min-w-35">
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Player {index + 1} Name
                                            </label>
                                            <input
                                                type="text"
                                                value={player.name}
                                                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                                placeholder={`Player ${index + 1}`}
                                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-35">
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Color
                                            </label>
                                            <div className="flex gap-2 flex-wrap">
                                                {COLORS.map((color) => {
                                                    const isSelected = player.color === color;
                                                    const isDisabled = isColorSelected(color, index);
                                                    return (
                                                        <button
                                                            key={color}
                                                            onClick={() => handlePlayerColorChange(index, color)}
                                                            disabled={isDisabled && !isSelected}
                                                            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${isSelected
                                                                    ? `ring-2 ${getColorRingClasses(color)} ring-offset-2 ring-offset-gray-800`
                                                                    : isDisabled
                                                                        ? 'opacity-30 cursor-not-allowed'
                                                                        : 'hover:scale-110'
                                                                } ${getColorClasses(color)}`}
                                                            aria-label={`Select ${color}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 5: Turn Timer */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Turn Timer
                            </h2>
                            <div className="flex gap-4 flex-wrap">
                                {TIMER_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTimer(option.value)}
                                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${timer === option.value
                                                ? 'bg-yellow-400 text-gray-900'
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 6: Game Options */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Game Options
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(options).map(([key, value]) => (
                                    <label
                                        key={key}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={() => handleOptionToggle(key)}
                                            className="w-4 h-4 accent-yellow-400 cursor-pointer"
                                        />
                                        <span className="text-gray-300 text-sm">
                                            {key
                                                .replace(/([A-Z])/g, ' $1')
                                                .replace(/^./, (str) => str.toUpperCase())}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Summary
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Game Mode</span>
                                        <span className="text-white font-medium">
                                            {gameMode === GAME_MODES.VS_COMPUTER ? 'Vs Computer' : 'Local Multiplayer'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Players</span>
                                        <span className="text-white font-medium">{playerCount}</span>
                                    </div>

                                    {gameMode === GAME_MODES.VS_COMPUTER && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Difficulty</span>
                                            <span className="text-white font-medium">{difficulty}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Timer</span>
                                        <span className="text-white font-medium">
                                            {timer === 0 ? 'Off' : `${timer}s`}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-700">
                                        <div className="text-sm text-gray-400 mb-2">Players</div>
                                        {getDisplayPlayers.map((player, index) => (
                                            <div key={index} className="flex items-center gap-2 py-1">
                                                <div className={`w-3 h-3 rounded-full ${getColorClasses(player.color)}`} />
                                                <span className="text-white text-sm">{player.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-3 border-t border-gray-700">
                                        <div className="text-sm text-gray-400 mb-2">Options</div>
                                        {Object.entries(options).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm py-1">
                                                <span className="text-gray-400">
                                                    {key
                                                        .replace(/([A-Z])/g, ' $1')
                                                        .replace(/^./, (str) => str.toUpperCase())}
                                                </span>
                                                <span className={value ? 'text-green-400' : 'text-red-400'}>
                                                    {value ? '✅' : '❌'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between max-w-4xl mx-auto">
                    <button
                        onClick={handleBack}
                        className="px-8 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold rounded-lg transition-all duration-200 border border-gray-600"
                    >
                        ← Back
                    </button>

                    <button
                        onClick={handleStartGame}
                        disabled={!isFormValid}
                        className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 ${isFormValid
                                ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        🚀 Start Game
                    </button>
                </div>

                {/* Form Validation Message */}
                {!isFormValid && (
                    <div className="text-center mt-4">
                        <p className="text-yellow-400 text-sm">
                            Please fill in all player names and ensure each player has a unique color.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// EXPORT
// ============================================================

export default OfflineSetup;