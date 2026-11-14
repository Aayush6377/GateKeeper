import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { ArrowRight, LayoutDashboard, User } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, role, username } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    const target = role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : '/tenant/dashboard';
    navigate(target);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="[&_span.text-gray-900]:text-white [&_span.text-gray-400]:text-slate-400">
          <Logo size="md" showText={true} />
        </div>

        {/* Center Navigation Links */}
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

        {/* Auth Action Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <User size={14} className="text-emerald-400" />
                <span className="font-medium">{username || 'Admin'}</span>
              </div>
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>Console</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};