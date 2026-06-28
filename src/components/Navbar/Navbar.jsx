import { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="shrink-0">
                        <NavLink to="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200">
                            Ludo Game
                        </NavLink>
                    </div>

                    <div className="hidden md:flex space-x-8">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                    ? 'bg-yellow-500 text-gray-900'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/lobby"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                    ? 'bg-yellow-500 text-gray-900'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            Lobby
                        </NavLink>
                        <NavLink
                            to="/rules"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                    ? 'bg-yellow-500 text-gray-900'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            Rules
                        </NavLink>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
                    <NavLink
                        to="/"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive
                                ? 'bg-yellow-500 text-gray-900'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/lobby"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive
                                ? 'bg-yellow-500 text-gray-900'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Lobby
                    </NavLink>
                    <NavLink
                        to="/rules"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive
                                ? 'bg-yellow-500 text-gray-900'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Rules
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;