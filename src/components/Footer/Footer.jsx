import { Link } from 'react-router-dom';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-yellow-400">Ludo Game</h2>
                        <p className="text-sm leading-relaxed text-gray-400">
                            A classic multiplayer board game where strategy meets luck. Roll the dice and race your tokens to the finish line.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/lobby"
                                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
                                >
                                    Lobby
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/rules"
                                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
                                >
                                    Rules
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Contact</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-400">
                                <span className="block">Email:</span>
                                <a
                                    href="mailto:support@ludogame.com"
                                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                                >
                                    support@ludogame.com
                                </a>
                            </li>
                            <li className="text-sm text-gray-400">
                                <span className="block">Response Time:</span>
                                <span>24-48 hours</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Game Info</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-400">
                                <span className="block">Players:</span>
                                <span>2-4 players</span>
                            </li>
                            <li className="text-sm text-gray-400">
                                <span className="block">Platform:</span>
                                <span>Web, Mobile</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <p className="text-sm text-gray-400">
                        &copy; {currentYear} Ludo Game. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500">
                        Made with ❤️ for board game lovers
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;