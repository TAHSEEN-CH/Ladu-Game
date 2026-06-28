import { Link } from 'react-router-dom';
import { FaHome, FaGamepad, FaDice } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="relative mb-8">
          <div className="text-8xl sm:text-9xl font-bold text-yellow-400/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaDice className="text-6xl sm:text-7xl text-yellow-400/30 animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Oops! Page Not Found
        </h1>

        <p className="text-lg text-gray-300 mb-2">
          It seems you've rolled off the board.
        </p>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to the game.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-yellow-400/30"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
          <Link
            to="/lobby"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            <FaGamepad className="mr-2" />
            Go to Lobby
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Check the <Link to="/rules" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200">Rules</Link> page</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;