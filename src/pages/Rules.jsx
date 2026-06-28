import { Link } from 'react-router-dom';
import {
    FaDice,
    FaHome,
    FaFlag,
    FaUsers,
    FaShieldAlt,
    FaSkull,
    FaTrophy,
    FaLightbulb,
    FaQuestionCircle
} from 'react-icons/fa';

function Rules() {
    const faqs = [
        {
            question: 'How many players can play Ludo?',
            answer: 'Ludo can be played with 2 to 4 players. Each player gets 4 tokens of their color.'
        },
        {
            question: 'What happens if I roll a 6?',
            answer: 'Rolling a 6 gives you an extra turn. You also need a 6 to bring a new token out of your home base.'
        },
        {
            question: 'Can I capture opponents\' tokens?',
            answer: 'Yes, landing on an opponent\'s token sends it back to their home base. However, tokens in safe zones cannot be captured.'
        },
        {
            question: 'What is a safe zone?',
            answer: 'Safe zones are special squares on the board where tokens cannot be captured. These are usually marked with a star or special symbol.'
        },
        {
            question: 'How do I win the game?',
            answer: 'Be the first player to move all 4 of your tokens from your home base to the center of the board.'
        }
    ];

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Hero/Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Game <span className="text-yellow-400">Rules</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Learn how to play Ludo and master the classic board game
                    </p>
                    <div className="mt-4">
                        <Link
                            to="/lobby"
                            className="inline-block px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-200"
                        >
                            Start Playing →
                        </Link>
                    </div>
                </div>

                {/* Introduction */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaHome className="text-yellow-400 mr-3" />
                        Introduction
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        Ludo is a classic board game derived from the ancient Indian game of Pachisi.
                        It is a strategic yet luck-based game where 2-4 players race their tokens from
                        their home base to the center of the board. The game is perfect for family
                        gatherings, friendly competitions, and online multiplayer matches.
                    </p>
                </section>

                {/* Objective of the Game */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaFlag className="text-yellow-400 mr-3" />
                        Objective of the Game
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        The objective of Ludo is to be the first player to move all four of your
                        tokens from your home base to the center of the board (the home area).
                        Players take turns rolling a die and moving their tokens along the cross-shaped
                        path on the board.
                    </p>
                </section>

                {/* Game Setup */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaUsers className="text-yellow-400 mr-3" />
                        Game Setup
                    </h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Each player chooses a color: Red, Green, Yellow, or Blue</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Each player places their 4 tokens in their home base</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Players decide who goes first (usually by rolling the highest number)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>The game proceeds in a clockwise direction</span>
                        </li>
                    </ul>
                </section>

                {/* Basic Rules */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaDice className="text-yellow-400 mr-3" />
                        Basic Rules
                    </h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Roll the die to determine how many spaces your token moves</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>You must roll a 6 to bring a new token out of your home base</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Each player can move only one token per turn</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>If you roll a 6, you get an extra turn</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>If you roll three consecutive 6s, you lose your turn</span>
                        </li>
                    </ul>
                </section>

                {/* Dice Rules */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaDice className="text-yellow-400 mr-3" />
                        Dice Rules
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                            <h4 className="text-yellow-400 font-semibold mb-2">Rolling a 6</h4>
                            <p className="text-gray-400 text-sm">Grants an extra turn and allows you to bring a new token out</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                            <h4 className="text-yellow-400 font-semibold mb-2">Rolling 1-5</h4>
                            <p className="text-gray-400 text-sm">Moves a token forward by the rolled number</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                            <h4 className="text-yellow-400 font-semibold mb-2">Three 6s in a row</h4>
                            <p className="text-gray-400 text-sm">Consecutive 6s result in losing your turn</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                            <h4 className="text-yellow-400 font-semibold mb-2">No dice roll</h4>
                            <p className="text-gray-400 text-sm">If no valid moves are available, your turn passes</p>
                        </div>
                    </div>
                </section>

                {/* Safe Zones */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaShieldAlt className="text-yellow-400 mr-3" />
                        Safe Zones
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Safe zones are special squares on the board where tokens cannot be captured.
                        These are usually marked with a star or special symbol. When your token lands
                        on a safe zone, it is protected from opponents' tokens.
                    </p>
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                        <p className="text-yellow-400 text-sm font-semibold">💡 Tip:</p>
                        <p className="text-gray-400 text-sm">Strategically position your tokens on safe zones to avoid capture</p>
                    </div>
                </section>

                {/* Capturing Opponents */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaSkull className="text-yellow-400 mr-3" />
                        Capturing Opponents
                    </h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Landing on an opponent's token captures it and sends it back to their home base</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>You cannot capture tokens that are in safe zones or in their home base</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Captured tokens must start again from their home base</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>You can have multiple tokens on the same square (except in home base)</span>
                        </li>
                    </ul>
                </section>

                {/* Winning Conditions */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaTrophy className="text-yellow-400 mr-3" />
                        Winning Conditions
                    </h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>You win by moving all 4 of your tokens to the home area</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Tokens must enter the home area with the exact dice roll</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>The game ends immediately when a player reaches the home area</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 font-bold mr-3">•</span>
                            <span>Other players can continue playing for second and third place</span>
                        </li>
                    </ul>
                </section>

                {/* Tips & Strategies */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <FaLightbulb className="text-yellow-400 mr-3" />
                        Tips & Strategies
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 hover:border-yellow-400/50 transition-colors duration-200">
                            <h4 className="text-white font-semibold mb-2">Spread Your Tokens</h4>
                            <p className="text-gray-400 text-sm">Don't keep all tokens in one place. Spread them to increase your chances</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 hover:border-yellow-400/50 transition-colors duration-200">
                            <h4 className="text-white font-semibold mb-2">Use Safe Zones</h4>
                            <p className="text-gray-400 text-sm">Position tokens on safe zones to protect them from capture</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 hover:border-yellow-400/50 transition-colors duration-200">
                            <h4 className="text-white font-semibold mb-2">Strategic Capturing</h4>
                            <p className="text-gray-400 text-sm">Capture opponents' tokens to slow them down and gain advantage</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 hover:border-yellow-400/50 transition-colors duration-200">
                            <h4 className="text-white font-semibold mb-2">Roll Management</h4>
                            <p className="text-gray-400 text-sm">Use your rolls wisely and plan your moves ahead of time</p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <FaQuestionCircle className="text-yellow-400 mr-3" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                                <h4 className="text-yellow-400 font-semibold mb-2">{faq.question}</h4>
                                <p className="text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Back to Home */}
                <div className="text-center mt-8">
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

export default Rules;