import { useState, useEffect } from 'react';
import { Menu, X, User, Calendar } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage to determine logged-in state
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Optionally, you can add a logout function to clear token and update state
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    window.location.href = '/sign-in'; // redirect to sign-in page
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <a
              href="/"
              className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              SingleHotel
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#rooms"
              className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Rooms
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              // Show Profile dropdown or button
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105">
                  <User size={18} />
                  <span>Profile</span>
                </button>
                {/* Simple dropdown example */}
                <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                  <a
                    href="/user/dashboard"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <a
                href="/sign-in"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105"
              >
                <User size={18} />
                <span>Sign In</span>
              </a>
            )}
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Calendar size={18} />
              <span>Book Now</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="pt-4 space-y-3">
            <a
              href="#home"
              className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              Home
            </a>
            <a
              href="#rooms"
              className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              Rooms
            </a>
            <a
              href="#about"
              className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              Contact
            </a>

            {/* Mobile Action Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isLoggedIn ? (
                <>
                  <a
                    href="/user/dashboard"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/sign-in"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </a>
              )}
              <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
                <Calendar size={18} />
                <span>Book Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
