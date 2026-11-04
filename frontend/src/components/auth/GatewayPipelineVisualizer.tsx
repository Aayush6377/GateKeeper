import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, HardDrive, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

interface NodeDetails {
  id: string;
  name: string;
  sub: string;
  status: string;
  metric1: string;
  metric2: string;
  icon: React.ElementType;
}

export const GatewayPipelineVisualizer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('gateway');

  const nodes: Record<string, NodeDetails> = {
    ingress: {
      id: 'ingress',
      name: 'Public Ingress',
      sub: 'HTTP / REST Client',
      status: 'Active Traffic',
      metric1: '14,280 Req/s',
      metric2: '0.00% Dropped',
      icon: Zap,
    },
    gateway: {
      id: 'gateway',
      name: 'Smart Gateway',
      sub: 'Proxy & Auth Filter',
      status: 'Routing Healthy',
      metric1: '4ms Forwarding',
      metric2: 'JWT Token Validated',
      icon: Cpu,
    },
    redis: {
      id: 'redis',
      name: 'Redis Cache',
      sub: 'Rate Limit & Tokens',
      status: 'In-Memory Sync',
      metric1: '99.4% Cache Hit',
      metric2: '< 1ms Latency',
      icon: HardDrive,
    },
    kafka: {
      id: 'kafka',
      name: 'Kafka Event Bus',
      sub: 'Audit Stream Logs',
      status: 'Queue Processing',
      metric1: '3 Topics Active',
      metric2: '0 Lag Messages',
      icon: RefreshCw,
    },
    postgres: {
      id: 'postgres',
      name: 'PostgreSQL DB',
      sub: 'API Routes & Orgs',
      status: 'Primary Database',
      metric1: 'Connected Pool',
      metric2: 'ACID Compliant',
      icon: Database,
    },
  };

  const active = nodes[selectedNode];

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Animated Pipeline SVG Box */}
      <div className="relative w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Top bar header */}
        <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-slate-300">Live Gateway Architecture</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
            Interactive Node Visualizer
          </span>
        </div>

        {/* Node Pipeline SVG Diagram (Interactive Curved Lines matching image reference) */}
        <div className="relative z-10 my-4 flex items-center justify-between min-h-[140px]">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            
            {/* Curved Path 1: Upper Green Line (Ingress -> Gateway -> Redis) */}
            <path
              d="M 50 60 Q 150 10, 250 60 T 450 60"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-40"
            />
            {/* Curved Path 2: Lower Blue Line (Gateway -> Kafka -> Postgres) */}
            <path
              d="M 50 60 Q 150 110, 250 60 T 450 60"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-40"
            />

            {/* Animated Packet Pulse 1 (Green Packet moving left to right) */}
            <motion.circle
              r="5"
              fill="#10b981"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              style={{
                offsetPath: 'path("M 50 60 Q 150 10, 250 60 T 450 60")',
                boxShadow: '0 0 10px #10b981',
              }}
            />

            {/* Animated Packet Pulse 2 (Blue Packet moving left to right) */}
            <motion.circle
              r="5"
              fill="#38bdf8"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1 }}
              style={{
                offsetPath: 'path("M 50 60 Q 150 110, 250 60 T 450 60")',
                boxShadow: '0 0 10px #38bdf8',
              }}
            />
          </svg>

          {/* Interactive Node Buttons */}
          <div className="relative z-20 w-full flex items-center justify-between gap-2 px-2">
            {Object.values(nodes).map((node) => {
              const isSelected = selectedNode === node.id;
              const IconComponent = node.icon;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border transition-all duration-300 text-left ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/80 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-105'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold whitespace-nowrap">{node.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Real-time Telemetry Panel */}
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 mt-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <active.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{active.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {active.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{active.sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">PERFORMANCE</span>
              <span className="text-emerald-400 font-bold">{active.metric1}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">HEALTH STATUS</span>
              <span className="text-slate-200 font-bold">{active.metric2}</span>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};