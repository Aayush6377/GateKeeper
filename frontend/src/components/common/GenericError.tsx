import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, ArrowLeft, RefreshCw, Server, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export interface GenericErrorProps {
  statusCode?: string | number;
  title?: string;
  description?: string;
  icon?: 'shield' | 'warning' | 'server';
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
  technicalDetails?: string;
}

export const GenericError: React.FC<GenericErrorProps> = ({
  statusCode = '404',
  title = 'Route / Resource Not Found',
  description = 'The API route or control plane resource you requested does not exist or has been migrated.',
  icon = 'shield',
  showHomeButton = true,
  showBackButton = true,
  showRetryButton = false,
  onRetry,
  technicalDetails,
}) => {
  const { isAuthenticated, role } = useAuth();

  let portalUrl = isAuthenticated ? '/tenant/dashboard' : '/login';
  if (isAuthenticated && role === 'PLATFORM_ADMIN') {
    portalUrl = '/platform/dashboard';
  }

  const navigate = useNavigate();

  const renderIcon = () => {
    switch (icon) {
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case 'server':
        return <Server className="w-8 h-8 text-rose-500" />;
      case 'shield':
      default:
        return <ShieldAlert className="w-8 h-8 text-emerald-500" />;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Top Brand Logo Header */}
      <div className="flex justify-center mb-6">
        <Logo size="md" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Top Decorative Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Animated Radar Pulse Container */}
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-5">
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          />
          <div className="relative z-10 p-3.5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            {renderIcon()}
          </div>
        </div>

        {/* Status Code & Title */}
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold tracking-widest uppercase mb-3 border border-emerald-200/60">
          HTTP STATUS {statusCode}
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>

        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          {description}
        </p>

        {/* Optional Technical Details Telemetry Box */}
        {technicalDetails && (
          <div className="mt-5 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
            <span className="text-slate-500 block mb-1">$ GATEWAY_TRACE_LOG:</span>
            {technicalDetails}
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          )}

          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Action
            </button>
          )}

          {showHomeButton && (
            <button
              onClick={() => navigate(portalUrl)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:bg-slate-950 shadow-sm transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" /> Portal Overview
            </button>
          )}
        </div>

        {/* Sub-footer Security Stamp */}
        <div className="mt-8 pt-5 border-t border-gray-100 text-[11px] font-mono text-gray-400">
          GateKeeper Control Plane • Error Handler
        </div>
      </motion.div>
    </div>
  );
};