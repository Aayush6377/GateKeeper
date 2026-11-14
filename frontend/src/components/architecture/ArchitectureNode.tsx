import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  SiReact,
  SiSpringboot,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiApachekafka,
} from 'react-icons/si';
import { Server, ExternalLink } from 'lucide-react';
import { type NodeMetadata } from './architectureData';

export interface CustomNodeData extends NodeMetadata {
  isActive?: boolean;
  isError?: boolean;
  onSelectNode?: (node: NodeMetadata) => void;
  [key: string]: unknown;
}

export const ArchitectureNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as CustomNodeData;
  const { label, sublabel, brand, envVar, docUrl, isActive, isError, onSelectNode } = nodeData;

  const renderBrandLogo = () => {
    switch (brand) {
      case 'react':
        return <SiReact className="w-6 h-6 text-[#61DAFB] animate-[spin_12s_linear_infinite]" />;
      case 'gateway':
        return <SiSpringboot className="w-6 h-6 text-[#6DB33F]" />;
      case 'management':
        return <SiSpringboot className="w-6 h-6 text-[#38bdf8]" />;
      case 'analytics':
        return <SiSpringboot className="w-6 h-6 text-[#c084fc]" />;
      case 'postgres':
        return <SiPostgresql className="w-6 h-6 text-[#4169E1]" />;
      case 'mongo':
        return <SiMongodb className="w-6 h-6 text-[#47A248]" />;
      case 'redis':
        return <SiRedis className="w-6 h-6 text-[#DC382D]" />;
      case 'kafka':
        return <SiApachekafka className="w-6 h-6 text-white" />;
      case 'upstream':
        return <Server className="w-6 h-6 text-emerald-400" />;
    }
  };

  const borderStyle = isActive
    ? isError
      ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.45)] scale-[1.03]'
      : 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-[1.03]'
    : 'border-slate-800 hover:border-sky-500/50';

  return (
    <div
      onClick={() => onSelectNode?.(nodeData)}
      className={`w-60 rounded-2xl bg-[#0b1222]/95 backdrop-blur-md border-2 p-3.5 transition-all duration-300 cursor-pointer select-none ${borderStyle}`}
    >
      {/* Multi-directional handles for clean diagram routing */}
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-sky-400 !border-slate-950" />
      <Handle type="source" position={Position.Left} id="left-src" className="!w-2.5 !h-2.5 !bg-emerald-400 !border-slate-950" />

      <Handle type="target" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-sky-400 !border-slate-950" />
      <Handle type="source" position={Position.Right} id="right-src" className="!w-2.5 !h-2.5 !bg-emerald-400 !border-slate-950" />

      <Handle type="target" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-sky-400 !border-slate-950" />
      <Handle type="source" position={Position.Top} id="top-src" className="!w-2.5 !h-2.5 !bg-emerald-400 !border-slate-950" />

      <Handle type="target" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-sky-400 !border-slate-950" />
      <Handle type="source" position={Position.Bottom} id="bottom-src" className="!w-2.5 !h-2.5 !bg-emerald-400 !border-slate-950" />

      {/* Top Row: Official Logo + External Docs Link */}
      <div className="flex items-start justify-between gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
          {renderBrandLogo()}
        </div>

        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open Official Documentation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Node Title & Subtitle */}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-1">
          <h4 className="font-bold text-sm text-white leading-tight">{label}</h4>
          {isActive && (
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isError ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
            />
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>
      </div>

      {/* Env / Tech Pill */}
      {envVar && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
            {envVar}
          </span>
          <span className="text-[10px] text-slate-500">Click to inspect</span>
        </div>
      )}
    </div>
  );
};