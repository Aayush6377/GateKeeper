import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

export interface AnimatedEdgeData {
  isActive?: boolean;
  packetColor?: string;
  badgeText?: string;
  staticLabel?: string;
  [key: string]: unknown;
}

export const AnimatedPacketEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const edgeData = (data || {}) as AnimatedEdgeData;
  const { isActive, packetColor = '#10b981', badgeText, staticLabel } = edgeData;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isActive ? 3 : 1.75,
          stroke: isActive ? packetColor : '#1e293b',
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
      />

      {/* Moving Glowing Data Packet along the SVG Path */}
      {isActive && (
        <circle r="6" fill={packetColor} filter="drop-shadow(0 0 8px rgba(16,185,129,0.9))">
          <animateMotion dur="1.1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Edge Label / Live Step Pill */}
      {(isActive && badgeText) || staticLabel ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan z-20"
          >
            {isActive && badgeText ? (
              <div
                style={{ borderColor: packetColor, color: '#fff' }}
                className="px-2.5 py-1 rounded-full bg-slate-950/95 border text-[11px] font-mono font-bold shadow-xl whitespace-nowrap animate-bounce"
              >
                {badgeText}
              </div>
            ) : (
              staticLabel && (
                <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {staticLabel}
                </div>
              )
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};