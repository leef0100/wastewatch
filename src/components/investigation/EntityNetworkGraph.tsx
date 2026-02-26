'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { Entity, EntityRelationship } from '@/types';

interface Props {
  entities: Entity[];
  relationships: EntityRelationship[];
  onEntityClick?: (entity: Entity) => void;
  onRelationshipClick?: (relationship: EntityRelationship) => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: Entity['type'];
  flagged: boolean;
  totalAmount?: number;
  entity: Entity;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  type: EntityRelationship['type'];
  label: string;
  amount?: number;
  relationship: EntityRelationship;
}

const TYPE_COLORS: Record<Entity['type'], string> = {
  provider: '#6366F1',
  shell_company: '#EF4444',
  individual: '#F59E0B',
  government_entity: '#3B82F6',
  bank_account: '#8B5CF6',
};

const TYPE_LABELS: Record<Entity['type'], string> = {
  provider: 'Provider',
  shell_company: 'Shell Company',
  individual: 'Individual',
  government_entity: 'Government',
  bank_account: 'Bank',
};

const LINK_COLORS: Record<EntityRelationship['type'], string> = {
  billing: '#3B82F6',
  payment: '#10B981',
  kickback: '#EF4444',
  referral: '#F59E0B',
  ownership: '#8B5CF6',
  employment: '#6B7280',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function EntityNetworkGraph({ entities, relationships, onEntityClick, onRelationshipClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<SimLink | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: Math.max(500, rect.height) });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create nodes and links
    const nodes: SimNode[] = entities.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      flagged: e.flagged,
      totalAmount: e.totalAmount,
      entity: e,
    }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links: SimLink[] = relationships
      .filter((r) => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
      .map((r) => ({
        source: nodeMap.get(r.sourceId)!,
        target: nodeMap.get(r.targetId)!,
        id: r.id,
        type: r.type,
        label: r.label,
        amount: r.amount,
        relationship: r,
      }));

    // Zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Arrow markers for each link type
    const defs = svg.append('defs');
    Object.entries(LINK_COLORS).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 30)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Glow filter for flagged nodes
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(180).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => LINK_COLORS[d.type])
      .attr('stroke-width', (d) => d.amount ? Math.max(1.5, Math.min(5, Math.log10(d.amount / 100000))) : 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', (d) => `url(#arrow-${d.type})`)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke-opacity', 1).attr('stroke-width', 4);
        setHoveredLink(d);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d.amount ? Math.max(1.5, Math.min(5, Math.log10(d.amount / 100000))) : 1.5);
        setHoveredLink(null);
      })
      .on('click', (_event, d) => onRelationshipClick?.(d.relationship));

    // Link labels
    const linkLabels = g.append('g').attr('class', 'link-labels');
    const linkLabelElements = linkLabels.selectAll('text')
      .data(links)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted-foreground)')
      .attr('font-size', '9px')
      .attr('pointer-events', 'none')
      .text((d) => d.amount ? formatCurrency(d.amount) : '');

    // Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<any, SimNode>()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
      )
      .on('mouseover', (_event, d) => setHoveredNode(d))
      .on('mouseout', () => setHoveredNode(null))
      .on('click', (_event, d) => onEntityClick?.(d.entity));

    // Node circles
    nodeElements.append('circle')
      .attr('r', (d) => {
        if (d.type === 'government_entity') return 28;
        if (d.totalAmount && d.totalAmount > 10000000) return 24;
        if (d.totalAmount && d.totalAmount > 1000000) return 20;
        return 16;
      })
      .attr('fill', (d) => TYPE_COLORS[d.type])
      .attr('stroke', (d) => d.flagged ? '#EF4444' : 'var(--border)')
      .attr('stroke-width', (d) => d.flagged ? 3 : 1.5)
      .attr('filter', (d) => d.flagged ? 'url(#glow)' : 'none');

    // Node icons (text symbols)
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '12px')
      .attr('pointer-events', 'none')
      .text((d) => {
        switch (d.type) {
          case 'provider': return '🏥';
          case 'shell_company': return '🏢';
          case 'individual': return '👤';
          case 'government_entity': return '🏛️';
          case 'bank_account': return '🏦';
          default: return '●';
        }
      });

    // Node labels
    nodeElements.append('text')
      .attr('y', (d) => {
        if (d.type === 'government_entity') return 40;
        if (d.totalAmount && d.totalAmount > 10000000) return 36;
        if (d.totalAmount && d.totalAmount > 1000000) return 32;
        return 28;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--foreground)')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .each(function (d) {
        const el = d3.select(this);
        const words = d.name.split(/\s+/);
        if (words.length <= 2) {
          el.text(d.name);
        } else {
          const mid = Math.ceil(words.length / 2);
          el.text(words.slice(0, mid).join(' '));
          el.append('tspan')
            .attr('x', 0)
            .attr('dy', '1.1em')
            .text(words.slice(mid).join(' '));
        }
      });

    // Simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabelElements
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 6);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Fit to view after simulation settles
    simulation.on('end', () => {
      const bounds = (g.node() as SVGGElement)?.getBBox();
      if (bounds) {
        const padding = 60;
        const fullWidth = bounds.width + padding * 2;
        const fullHeight = bounds.height + padding * 2;
        const scale = Math.min(width / fullWidth, height / fullHeight, 1.2);
        const tx = width / 2 - (bounds.x + bounds.width / 2) * scale;
        const ty = height / 2 - (bounds.y + bounds.height / 2) * scale;
        svg.transition().duration(500).call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
      }
    });

    return () => {
      simulation.stop();
    };
  }, [entities, relationships, dimensions, onEntityClick, onRelationshipClick]);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-background rounded-xl border border-border overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs space-y-2">
        <div className="font-semibold text-foreground mb-1">Entity Types</div>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{TYPE_LABELS[type as Entity['type']]}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 mt-2">
          <div className="font-semibold text-foreground mb-1">Connections</div>
          {Object.entries(LINK_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-3 right-3 bg-card border border-border rounded-lg p-3 max-w-xs shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[hoveredNode.type] }} />
            <span className="font-semibold text-sm">{hoveredNode.name}</span>
          </div>
          <div className="text-xs text-muted-foreground capitalize mb-1">{TYPE_LABELS[hoveredNode.type]}</div>
          {hoveredNode.totalAmount && (
            <div className="text-xs font-data text-primary">{formatCurrency(hoveredNode.totalAmount)}</div>
          )}
          {hoveredNode.flagged && (
            <div className="text-xs text-waste mt-1 font-medium">Flagged</div>
          )}
        </div>
      )}

      {hoveredLink && !hoveredNode && (
        <div className="absolute bottom-3 right-3 bg-card border border-border rounded-lg p-3 max-w-xs shadow-lg">
          <div className="font-semibold text-sm mb-1">{hoveredLink.label}</div>
          <div className="text-xs text-muted-foreground capitalize mb-1">{hoveredLink.type}</div>
          {hoveredLink.amount && (
            <div className="text-xs font-data text-primary">{formatCurrency(hoveredLink.amount)}</div>
          )}
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-card/70 backdrop-blur-sm rounded px-2 py-1">
        Scroll to zoom &middot; Drag nodes to rearrange &middot; Click for details
      </div>
    </div>
  );
}
