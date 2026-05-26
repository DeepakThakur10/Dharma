import { useState } from 'react';
import { Link } from 'react-router-dom';
import DharmaLogo from './DharmaLogo';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <DharmaLogo size="md" variant="light" showWordmark={false} />
            <span className="text-2xl font-bold text-gray-900">Dharma</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-[#ff6b35] transition-colors font-medium">
              Home
            </Link>
            <a href="#features" className="text-gray-700 hover:text-[#ff6b35] transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-[#ff6b35] transition-colors font-medium">
              Pricing
            </a>
            <Link
              to="/login"
              className="px-6 py-2.5 gradient-primary text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-[#ff6b35] transition-colors font-medium text-left">
                Home
              </Link>
              <a href="#features" className="text-gray-700 hover:text-[#ff6b35] transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-[#ff6b35] transition-colors font-medium">
                Pricing
              </a>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-2.5 gradient-primary text-white rounded-lg font-semibold text-center hover:shadow-lg transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;