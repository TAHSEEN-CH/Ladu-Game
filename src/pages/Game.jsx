import { Link } from 'react-router-dom';
import { FaUsers, FaDice, FaClock, FaGamepad } from 'react-icons/fa';

function Game() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaGamepad className="text-yellow-400 mr-2" />
                Ludo Game
              </h1>
              <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                Room: #LUDO-001
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="bg-gray-700/50 px-3 py-1 rounded-full flex items-center text-gray-300">
                <FaUsers className="text-yellow-400 mr-2" />
                <span>Players: 0/4</span>
              </div>
              <div className="bg-gray-700/50 px-3 py-1 rounded-full flex items-center text-gray-300">
                <FaDice className="text-yellow-400 mr-2" />
                <span>Mode: Classic</span>
              </div>
              <div className="bg-gray-700/50 px-3 py-1 rounded-full flex items-center text-gray-300">
                <FaClock className="text-yellow-400 mr-2" />
                <span>Turn: Waiting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Player List */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaUsers className="text-yellow-400 mr-2" />
                Players
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                  <p className="text-gray-400 text-sm text-center">Waiting for players to join...</p>
                  <p className="text-gray-500 text-xs text-center mt-1">Player list will appear here</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30 opacity-50">
                    <span className="text-gray-400 text-sm">Player 1</span>
                    <span className="text-gray-500 text-xs">(Waiting)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30 opacity-50">
                    <span className="text-gray-400 text-sm">Player 2</span>
                    <span className="text-gray-500 text-xs">(Waiting)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30 opacity-50">
                    <span className="text-gray-400 text-sm">Player 3</span>
                    <span className="text-gray-500 text-xs">(Waiting)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30 opacity-50">
                    <span className="text-gray-400 text-sm">Player 4</span>
                    <span className="text-gray-500 text-xs">(Waiting)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">Game Board</h2>
              <div className="bg-gray-900/50 rounded-lg border-2 border-gray-600/50 aspect-square flex items-center justify-center min-h-100">
                <div className="text-center">
                  <FaGamepad className="text-6xl text-yellow-400/30 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Ludo Board</p>
                  <p className="text-gray-500 text-sm">Board will be rendered here</p>
                  <p className="text-gray-600 text-xs mt-2">Supports 2-4 players</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Game Status */}
          <div className="lg:col-span-3 order-3">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaClock className="text-yellow-400 mr-2" />
                Game Status
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                  <p className="text-gray-400 text-sm text-center">Game not started</p>
                  <p className="text-gray-500 text-xs text-center mt-1">Status updates will appear here</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Current Turn</span>
                    <span className="text-gray-500 text-xs">--</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Dice Roll</span>
                    <span className="text-gray-500 text-xs">--</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Time Remaining</span>
                    <span className="text-gray-500 text-xs">--</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400 text-sm">Game State</span>
                    <span className="text-yellow-400 text-xs">Waiting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Controls */}
        <div className="mt-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">Game Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center">
                <FaDice className="text-3xl text-yellow-400/50 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Roll Dice</p>
                <p className="text-gray-500 text-xs">(Coming soon)</p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center">
                <FaClock className="text-3xl text-yellow-400/50 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Timer</p>
                <p className="text-gray-500 text-xs">(Coming soon)</p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center">
                <FaUsers className="text-3xl text-yellow-400/50 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Ready</p>
                <p className="text-gray-500 text-xs">(Coming soon)</p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 text-center">
                <FaGamepad className="text-3xl text-yellow-400/50 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Forfeit</p>
                <p className="text-gray-500 text-xs">(Coming soon)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Lobby */}
        <div className="mt-6 text-center">
          <Link
            to="/lobby"
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
          >
            ← Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Game;