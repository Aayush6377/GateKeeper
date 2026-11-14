import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ArchitectureNode } from '../../components/architecture/ArchitectureNode';
import { AnimatedPacketEdge } from '../../components/architecture/AnimatedPacketEdge';
import {
  ARCHITECTURE_NODES_META,
  SIMULATION_SCENARIOS,
  type SimulationScenarioId,
  type NodeMetadata,
} from '../../components/architecture/architectureData';
import { Play, Pause, RotateCcw, ExternalLink, Info, Sparkles, ChevronDown } from 'lucide-react';

const nodeTypes = { architectureNode: ArchitectureNode };
const edgeTypes = { animatedPacket: AnimatedPacketEdge };

export default function SystemArchitecturePage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<SimulationScenarioId>('proxy_success');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [inspectedNode, setInspectedNode] = useState<NodeMetadata | null>(null);

  const currentScenario = useMemo(
    () => SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0],
    [selectedScenarioId]
  );

  const currentStep = currentScenario.steps[stepIdx] || currentScenario.steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % currentScenario.steps.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [isPlaying, currentScenario]);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value as SimulationScenarioId;
    setSelectedScenarioId(id);
    setStepIdx(0);
    setIsPlaying(true);
  };

  const handleNodeClick = useCallback((nodeMeta: NodeMetadata) => {
    setInspectedNode(nodeMeta);
  }, []);

  const nodes: Node[] = useMemo(() => {
    const activeSet = new Set(currentStep.activeNodes);

    const makeNode = (id: string, x: number, y: number): Node => ({
      id,
      type: 'architectureNode',
      position: { x, y },
      data: {
        ...ARCHITECTURE_NODES_META[id],
        isActive: activeSet.has(id),
        isError: activeSet.has(id) && currentStep.isError,
        onSelectNode: handleNodeClick,
      },
    });

    return [
      makeNode('frontend', 40, 260),
      makeNode('management', 380, 30),
      makeNode('gateway', 380, 260),
      makeNode('analytics', 380, 490),
      makeNode('redis', 740, 160),
      makeNode('kafka', 740, 380),
      makeNode('postgres', 1080, 30),
      makeNode('upstream', 1080, 260),
      makeNode('mongo', 1080, 490),
    ];
  }, [currentStep, handleNodeClick]);

  const edges: Edge[] = useMemo(() => {
    const buildEdge = (
      id: string,
      source: string,
      target: string,
      sourceHandle: string,
      targetHandle: string,
      staticLabel?: string
    ): Edge => {
      const isCurrentEdge = currentStep.edgeId === id;
      const color = isCurrentEdge ? currentStep.packetColor : '#1e293b';

      return {
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
        type: 'animatedPacket',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 18,
          height: 18,
        },
        data: {
          isActive: isCurrentEdge,
          packetColor: currentStep.packetColor,
          badgeText: isCurrentEdge ? currentStep.badgeText : undefined,
          staticLabel,
        },
      };
    };

    return [
      buildEdge('e-frontend-management', 'frontend', 'management', 'top-src', 'left', 'REST / JWT'),
      buildEdge('e-frontend-gateway', 'frontend', 'gateway', 'right-src', 'left', 'API Traffic'),
      buildEdge('e-gateway-frontend', 'gateway', 'frontend', 'bottom-src', 'bottom'),
      buildEdge('e-frontend-analytics', 'analytics', 'frontend', 'left-src', 'bottom', 'Charts API'),
      buildEdge('e-gateway-redis', 'gateway', 'redis', 'top-src', 'left', 'RateLimit / Idempotency'),
      buildEdge('e-gateway-upstream', 'gateway', 'upstream', 'right-src', 'left', 'HTTP Proxy'),
      buildEdge('e-upstream-gateway', 'upstream', 'gateway', 'bottom-src', 'bottom'),
      buildEdge('e-management-postgres', 'management', 'postgres', 'right-src', 'left', 'JPA / SQL'),
      buildEdge('e-management-kafka', 'management', 'kafka', 'bottom-src', 'top', 'Config Events'),
      buildEdge('e-kafka-gateway', 'kafka', 'gateway', 'left-src', 'right', 'Hot Reload'),
      buildEdge('e-gateway-kafka', 'gateway', 'kafka', 'bottom-src', 'left', 'Telemetry'),
      buildEdge('e-kafka-analytics', 'kafka', 'analytics', 'bottom-src', 'right', 'Consume'),
      buildEdge('e-analytics-mongo', 'analytics', 'mongo', 'right-src', 'left', 'Time-Series'),
    ];
  }, [currentStep]);

  return (
    <div className="flex-1 flex flex-col bg-[#030712] text-slate-100">
      {/* Top Header & Simulation Controls */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#080f1e] to-[#030712] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-3">
                <Sparkles size={13} /> Interactive High-Level Architecture (HLD)
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Gate<span className="text-emerald-500">Keeper</span> <span>System Blueprint</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
                Choose a simulation cycle from the selector below to watch live packets traverse the microservices mesh. Click any node to inspect specs or open official documentation.
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 self-start lg:self-end">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Cycle' : 'Resume Cycle'}</span>
              </button>
              <button
                onClick={() => { setStepIdx(0); setIsPlaying(true); }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Restart Simulation"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Simulation Cycle Dropdown Selector */}
          <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Select Request Simulation Cycle:
              </label>
              <div className="relative">
                <select
                  value={selectedScenarioId}
                  onChange={handleScenarioChange}
                  className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors pr-10 cursor-pointer"
                >
                  {SIMULATION_SCENARIOS.map((scenario) => (
                    <option key={scenario.id} value={scenario.id} className="bg-slate-900 text-white">
                      {scenario.tabLabel} — [{scenario.badge}]
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="text-xs text-slate-400 sm:self-end pb-1">
              <strong className="text-emerald-400 font-mono">{currentScenario.badge}</strong>: {currentScenario.summary}
            </div>
          </div>

          {/* Live Step Narrator Banner */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold shrink-0">
                STEP {stepIdx + 1} / {currentScenario.steps.length}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {currentStep.logMessage}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {currentScenario.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIdx(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === stepIdx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        <div className="relative w-full h-[640px] rounded-3xl border border-slate-800 bg-[#040710] overflow-hidden shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.4}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e293b" gap={24} size={1.5} />
            <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300 [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button:hover]:!bg-slate-800" />
          </ReactFlow>

          {/* Clickable Node Details Overlay Drawer */}
          {inspectedNode && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-slate-950/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 shadow-2xl z-30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                    Component Inspector
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{inspectedNode.label}</h4>
                  <p className="text-xs text-emerald-400 font-mono">{inspectedNode.sublabel}</p>
                </div>
                <button
                  onClick={() => setInspectedNode(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {inspectedNode.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {inspectedNode.envVar}
                </span>
                <a
                  href={inspectedNode.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Official Docs</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {/* Bottom-Left Hint */}
          <div className="hidden sm:flex items-center gap-2 absolute bottom-4 left-16 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 pointer-events-none">
            <Info size={13} className="text-emerald-400" />
            <span>Drag to pan • Scroll to zoom • Click any node for specs & docs</span>
          </div>
        </div>
      </div>
    </div>
  );
}