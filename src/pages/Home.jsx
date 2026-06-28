import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Roll the Dice,
                <span className="text-yellow-400 block">Win the Game</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-lg">
                Experience the classic board game like never before. Play with friends or challenge players worldwide in real-time multiplayer matches.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/lobby"
                  className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-yellow-400/30"
                >
                  Play Now
                </Link>
                <Link
                  to="/rules"
                  className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
                >
                  Learn Rules
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md aspect-square bg-linear-to-br from-yellow-400/20 to-purple-500/20 rounded-2xl border-2 border-yellow-400/30 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Ludo Board Illustration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            Why Play <span className="text-yellow-400">Ludo Game</span>
          </h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
            Everything you need for an exciting board game experience
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multiplayer Gameplay</h3>
              <p className="text-gray-400 text-sm">Play with 2-4 players in exciting competitive matches</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Matches</h3>
              <p className="text-gray-400 text-sm">Instant moves and updates with seamless synchronization</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smooth Experience</h3>
              <p className="text-gray-400 text-sm">Optimized for fast loading and responsive gameplay</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cross-Platform</h3>
              <p className="text-gray-400 text-sm">Play on any device - desktop, tablet, or mobile</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            How to <span className="text-yellow-400">Play</span>
          </h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
            Get started in 4 simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Join a Game</h3>
              <p className="text-gray-400 text-sm">Enter the lobby and find or create a game room</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Roll the Dice</h3>
              <p className="text-gray-400 text-sm">Take turns rolling the dice to move your tokens</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Strategy & Luck</h3>
              <p className="text-gray-400 text-sm">Plan your moves and hope for lucky rolls</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-900">
                4
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Win the Game</h3>
              <p className="text-gray-400 text-sm">Be the first to get all your tokens home</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">
            Game <span className="text-yellow-400">Modes</span>
          </h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
            Choose your preferred way to play
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Local Multiplayer</h3>
              <p className="text-gray-400 text-sm">Play with friends on the same device. Pass and play!</p>
            </div>

            <div className="bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Online Multiplayer</h3>
              <p className="text-gray-400 text-sm">Challenge players from around the world in real-time</p>
            </div>

            <div className="bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Play with Friends</h3>
              <p className="text-gray-400 text-sm">Create private rooms and invite friends to join</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-linear-to-r from-yellow-400/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Roll the Dice?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players in the most exciting Ludo game online. Start your journey now!
          </p>
          <Link
            to="/lobby"
            className="inline-block px-10 py-4 bg-yellow-400 text-gray-900 font-bold text-lg rounded-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-yellow-400/30"
          >
            Start Playing Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;