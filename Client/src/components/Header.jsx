import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";
import { roleLinks } from "../Constent/Data";

const Header = () => {
  const { isAuthenticated, user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = isAuthenticated ? user?.role || "guest" : "guest";
  const navLinks = roleLinks[userRole] || [];

  const handleSignOut = () => {
    handleLogout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md py-4 relative transition-all duration-700 ease-in-out">
      <div className="container mx-auto px-4 flex items-center justify-between relative">
        {/* Left: Logo (Clickable for Mobile Menu) */}
        <div
          className="text-2xl font-bold text-gray-800 transition-all duration-700 ease-in-out cursor-pointer md:cursor-default"
          onClick={toggleMobileMenu}
        >
          Stitch Design
        </div>

        {/* Center: Nav Links (Desktop) */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-in-out">
          <nav className="flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-black font-semibold hover:text-gray-600 transition-all duration-700 ease-in-out"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md z-20 transition-all duration-700 ease-in-out">
            <nav className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-black font-semibold hover:text-gray-600 transition-all duration-700 ease-in-out"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Right: Sign In/Out and Profile */}
        <div className="flex items-center gap-4 transition-all duration-700 ease-in-out">
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="cursor-pointer items-center justify-center overflow-hidden rounded bg-red-500 text-white px-4 py-2 transition-all duration-700 ease-in-out"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login">
              <button className="cursor-pointer items-center justify-center overflow-hidden rounded bg-[#3d98f4] text-white px-4 py-2 transition-all duration-700 ease-in-out">
                Sign In
              </button>
            </Link>
          )}

          {isAuthenticated && (
            <div className="dropdown dropdown-end transition-all duration-700 ease-in-out">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar transition-all duration-700 ease-in-out"
              >
                <div className="w-10 rounded-full overflow-hidden transition-all duration-700 ease-in-out">
                  <img
                    alt="User Avatar"
                    src={
                      user?.image ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-gray-100 text-black font-semibold rounded-box z-10 mt-3 w-52 p-2 shadow transition-all duration-700 ease-in-out"
              >
                <li>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;