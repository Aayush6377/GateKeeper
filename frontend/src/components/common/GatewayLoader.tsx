import React from 'react';
import { Shield, Network, Activity } from 'lucide-react';

interface GatewayLoaderProps {
  text?: string;
  subtext?: string;
}

export const GatewayLoader: React.FC<GatewayLoaderProps> = ({ 
  text = "Routing API Traffic...", 
  subtext = "Smart Gateway is syncing proxy nodes" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-transparent">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-500 animate-[spin_6s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
          <Shield className="w-8 h-8 text-emerald-600 animate-pulse" />
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full" />
      </div>

      <h3 className="text-base font-semibold text-gray-900 tracking-tight flex items-center gap-2">
        <Network className="w-4 h-4 text-emerald-600" />
        {text}
      </h3>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 font-mono">
        <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        {subtext}
      </p>
    </div>
  );
};