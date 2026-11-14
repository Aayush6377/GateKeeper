import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { ArrowRight, LayoutDashboard, User, Menu, X } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, role, username } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDashboardClick = () => {
    const target = role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : '/tenant/dashboard';
    setMobileMenuOpen(false);
    navigate(target);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="[&_span.text-gray-900]:text-white [&_span.text-gray-400]:text-slate-400">
          <Logo size="md" showText={true} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/architecture"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
              }`
            }
          >
            Architecture
          </NavLink>

          <NavLink
            to="/docs"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
              }`
            }
          >
            API Docs
          </NavLink>

          <NavLink
            to="/status"
            className={({ isActive }) =>
              `transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
              }`
            }
          >
            Status
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
              }`
            }
          >
            About
          </NavLink>
        </nav>

        {/* Right Actions & Mobile Hamburger Button */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <User size={14} className="text-emerald-400" />
                <span className="font-medium">{username || 'Admin'}</span>
              </div>
              <button
                onClick={handleDashboardClick}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>Console</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight size={14} />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl">
          <nav className="flex flex-col space-y-2 text-xs font-semibold uppercase tracking-wider">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/architecture"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50'
                }`
              }
            >
              Architecture
            </NavLink>
            <NavLink
              to="/docs"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50'
                }`
              }
            >
              API Docs
            </NavLink>
            <NavLink
              to="/status"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50'
                }`
              }
            >
              Status
            </NavLink>
            <NavLink
              to="/about"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-900 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50'
                }`
              }
            >
              About
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleDashboardClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg"
              >
                <LayoutDashboard size={14} />
                <span>Console Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => { closeMenu(); navigate('/login'); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg"
              >
                <span>Sign In</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};