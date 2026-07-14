import React, { useState, useRef, useMemo } from 'react';
import type { GraphNode } from '../core/environment/graph/Node';
import type { GraphEdge } from '../core/environment/graph/Edge';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  HelpCircle 
} from 'lucide-react';

interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  replayWave?: number | null;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  hoveredNodeId,
  setHoveredNodeId,
  replayWave = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pan and Zoom viewport states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 1. Spatially calculate node coordinates based on type layers
  const positions = useMemo(() => {
    const coords = new Map<string, { x: number; y: number }>();
    const layers = ['MEAL', 'INGREDIENT', 'CROP', 'REGION', 'WATERSHED', 'HABITAT', 'SPECIES', 'EVIDENCE'];
    
    const svgWidth = 800;
    const svgHeight = 700;
    const paddingY = 80;
    const layerHeight = (svgHeight - paddingY * 2) / (layers.length - 1);

    layers.forEach((type, layerIdx) => {
      const layerNodes = nodes.filter(n => n.type === type);
      const y = paddingY + layerIdx * layerHeight;
      const count = layerNodes.length;

      layerNodes.forEach((node, nodeIdx) => {
        // Distribute nodes evenly across the width of the viewport
        const xStep = svgWidth / (count + 1);
        const x = xStep * (nodeIdx + 1);
        coords.set(node.id, { x, y });
      });
    });

    return coords;
  }, [nodes]);

  // 2. Identify neighbors and active connections for highlighting
  const activeRelationships = useMemo(() => {
    if (!hoveredNodeId) return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };

    const nodeIds = new Set<string>([hoveredNodeId]);
    const edgeIds = new Set<string>();

    edges.forEach(e => {
      if (e.from === hoveredNodeId) {
        nodeIds.add(e.to);
        edgeIds.add(e.id);
      } else if (e.to === hoveredNodeId) {
        nodeIds.add(e.from);
        edgeIds.add(e.id);
      }
    });

    return { nodeIds, edgeIds };
  }, [hoveredNodeId, edges]);

  const isNodeVisibleInReplay = (nodeType: string): boolean => {
    if (replayWave === null || replayWave === undefined || replayWave >= 8) return true;
    switch (nodeType) {
      case 'MEAL':
        return replayWave >= 1;
      case 'INGREDIENT':
        return replayWave >= 2;
      case 'CROP':
        return replayWave >= 3;
      case 'REGION':
        return replayWave >= 4;
      case 'WATERSHED':
        return replayWave >= 5;
      case 'HABITAT':
        return replayWave >= 6;
      case 'SPECIES':
        return replayWave >= 7;
      case 'EVIDENCE':
        return replayWave >= 7;
      default:
        return false;
    }
  };

  // --- PAN / ZOOM MOUSE HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click triggers dragging
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const nextZoom = e.deltaY < 0 ? zoom + zoomFactor : zoom - zoomFactor;
    setZoom(Math.max(0.4, Math.min(3.0, nextZoom)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node Color Mapper
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'MEAL':
        return '#3b82f6'; // Bright Blue
      case 'INGREDIENT':
        return '#06b6d4'; // Cyan
      case 'CROP':
        return '#10b981'; // Emerald Green
      case 'REGION':
        return '#a855f7'; // Purple
      case 'WATERSHED':
        return '#6366f1'; // Indigo
      case 'HABITAT':
        return '#eab308'; // Amber
      case 'SPECIES':
        return '#f43f5e'; // Rose
      default:
        return '#94a3b8'; // Slate
    }
  };

  return (
    <div className="relative w-full h-[650px] bg-bg-darkest/60 border border-border-subtle rounded-xl overflow-hidden select-none">
      {/* Pan & Zoom Controls floating widget */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-bg-panel/90 border border-border-subtle p-1.5 rounded-lg shadow-xl backdrop-blur-md">
        <button 
          onClick={() => setZoom(z => Math.min(3, z + 0.15))}
          className="p-1.5 text-text-secondary hover:text-accent-cyan rounded hover:bg-bg-dark transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-1.5 text-text-secondary hover:text-accent-cyan rounded hover:bg-bg-dark transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={resetView}
          className="p-1.5 text-text-secondary hover:text-accent-cyan rounded hover:bg-bg-dark transition-colors cursor-pointer border-t border-border-subtle mt-1"
          title="Reset Fit"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layer legend labels floating on the right */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 text-[8px] font-mono text-text-muted bg-bg-panel/40 border border-border-subtle/40 p-2.5 rounded-lg pointer-events-none">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> MEAL</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> INGREDIENT</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> CROP</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> REGION</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> WATERSHED</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> HABITAT</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> SPECIES</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> EVIDENCE</span>
      </div>

      {/* SVG Canvas Board */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full cursor-grab active:cursor-grabbing`}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 700" 
          className="w-full h-full"
        >
          {/* Main transforming canvas group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* 1. RENDER EDGES FIRST (Behind Nodes) */}
            <g className="edges-group">
              {edges.map((edge) => {
                const fromNodeObj = nodes.find(n => n.id === edge.from);
                const toNodeObj = nodes.find(n => n.id === edge.to);
                const fromType = fromNodeObj?.type || 'UNKNOWN';
                const toType = toNodeObj?.type || 'UNKNOWN';
                if (!isNodeVisibleInReplay(fromType) || !isNodeVisibleInReplay(toType)) return null;

                const from = positions.get(edge.from);
                const to = positions.get(edge.to);
                if (!from || !to) return null;

                const isHovered = hoveredNodeId !== null;
                const isPart = activeRelationships.edgeIds.has(edge.id);
                const isDimmed = isHovered && !isPart;

                // Render beautiful bezier path curves instead of simple lines
                const dx = to.x - from.x;
                const midX = from.x + dx / 2;
                const pathString = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;

                return (
                  <path
                    key={edge.id}
                    d={pathString}
                    fill="none"
                    stroke={isPart ? '#22d3ee' : '#27272a'}
                    strokeWidth={isPart ? 2.0 : 1.0}
                    strokeDasharray={edge.relationship === 'THREATENED_BY' ? '4,4' : undefined}
                    opacity={isDimmed ? 0.05 : isPart ? 1.0 : 0.4}
                    className="transition-all duration-300"
                  />
                );
              })}
            </g>

            {/* 2. RENDER NODES SECOND */}
            <g className="nodes-group">
              {nodes.map((node) => {
                if (!isNodeVisibleInReplay(node.type)) return null;

                const pos = positions.get(node.id);
                if (!pos) return null;

                const isSelected = node.id === selectedNodeId;
                const isHovered = node.id === hoveredNodeId;
                const isGloballyHovered = hoveredNodeId !== null;
                const isPart = activeRelationships.nodeIds.has(node.id);
                const isDimmed = isGloballyHovered && !isPart;

                const nodeColor = getNodeColor(node.type);

                // Nodes display pressure values if simulated
                const currentPres = node.properties.currentPressure ?? 1.0;
                const basePres = node.properties.basePressure ?? 1.0;
                const pressureDelta = currentPres - basePres;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer group"
                    opacity={isDimmed ? 0.15 : 1.0}
                  >
                    {/* Selected Glow Ring */}
                    {isSelected && (
                      <circle
                        r={22}
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth={1.5}
                        className="animate-ping opacity-60"
                        style={{ animationDuration: '3s' }}
                      />
                    )}

                    {/* Outer border ring */}
                    <circle
                      r={14}
                      fill="#09090b"
                      stroke={isSelected ? '#22d3ee' : isHovered ? '#f4f4f5' : '#27272a'}
                      strokeWidth={isSelected || isHovered ? 2 : 1}
                      className="transition-all duration-200"
                    />

                    {/* Core Solid Dot */}
                    <circle
                      r={8}
                      fill={nodeColor}
                      className="transition-all duration-200"
                    />

                    {/* Node Text Label */}
                    <text
                      y={26}
                      textAnchor="middle"
                      fill={isSelected ? '#22d3ee' : isHovered ? '#ffffff' : '#a1a1aa'}
                      fontSize="9px"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="transition-colors duration-200 pointer-events-none select-none bg-black"
                    >
                      {node.label}
                    </text>

                    {/* Small Pressure delta indicator flag */}
                    {Math.abs(pressureDelta) > 0.0001 && (
                      <g transform="translate(14, -14)">
                        <rect
                          width={24}
                          height={12}
                          x={-12}
                          y={-6}
                          rx={2}
                          fill={pressureDelta < 0 ? '#10b981' : '#ef4444'}
                          opacity={0.9}
                        />
                        <text
                          textAnchor="middle"
                          y={3}
                          fill="#09090b"
                          fontSize="7px"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {pressureDelta < 0 ? '-' : '+'}{Math.abs(pressureDelta).toFixed(1)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

          </g>
        </svg>
      </div>

      {/* Floating help details banner */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex gap-2 items-center bg-bg-darkest/75 border border-border-subtle px-3 py-1.5 rounded-lg text-[9px] font-mono text-text-muted">
        <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
        <span>Drag to PAN. Scroll to ZOOM. Click nodes to trace.</span>
      </div>
    </div>
  );
};
export default GraphViewer;
