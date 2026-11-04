import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-base' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xl' },
    lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-2xl' },
  };

  const dim = dimensions[size];

  return (
    <NavLink to="/" className="flex items-center gap-3">
      <div className="flex items-center gap-3 group cursor-pointer select-none">
        <div className={`relative flex items-center justify-center ${dim.box} rounded-xl bg-slate-900 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300`}>
          
          {/* Animated Outer Gateway Orbit Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[2px] rounded-lg border border-dashed border-emerald-500/40"
          />

          {/* Central Gateway Core Node */}
          <div className="relative z-10 flex items-center justify-center">
            <svg className={`${dim.icon} text-emerald-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          {/* Live Traffic Glow Indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
          </span>
        </div>

        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight text-gray-900 ${dim.text} leading-none`}>
              Gate<span className="text-emerald-600">Keeper</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase mt-1">
              API Control Plane
            </span>
          </div>
        )}
      </div>
    </NavLink>
  );
};