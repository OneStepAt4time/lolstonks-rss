import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface GraphNode {
  id: string;
  type: 'category' | 'source';
  name: string;
  icon?: string;
  articleCount: number;
  localeCount: number;
  category?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface CategoryColors {
  [key: string]: string;
}

const CATEGORY_COLORS: CategoryColors = {
  official_riot: '#0AC8B9',      // blue
  analytics: '#A855F7',          // purple
  esports: '#EF4444',            // red
  community_hub: '#22C55E',      // green
  regional: '#EAB308',           // yellow
  social: '#EC4899',             // pink
  aggregator: '#6366F1',         // indigo
  pbe: '#F97316',                // orange
  tft: '#06B6D4',                // cyan
};

const CATEGORY_ICONS: { [key: string]: string } = {
  official_riot: '🎮',
  analytics: '📊',
  esports: '🏆',
  community_hub: '👥',
  regional: '🌍',
  social: '💬',
  aggregator: '📰',
  pbe: '🧪',
  tft: '♟️',
};

// Mock data - will be replaced with real API data
const MOCK_NODES: GraphNode[] = [
  // Category nodes
  { id: 'official_riot', type: 'category', name: 'Official Riot', icon: CATEGORY_ICONS.official_riot, articleCount: 45, localeCount: 20 },
  { id: 'analytics', type: 'category', name: 'Analytics', icon: CATEGORY_ICONS.analytics, articleCount: 120, localeCount: 15 },
  { id: 'esports', type: 'category', name: 'Esports', icon: CATEGORY_ICONS.esports, articleCount: 200, localeCount: 18 },
  { id: 'community_hub', type: 'category', name: 'Community', icon: CATEGORY_ICONS.community_hub, articleCount: 85, localeCount: 12 },
  { id: 'regional', type: 'category', name: 'Regional', icon: CATEGORY_ICONS.regional, articleCount: 150, localeCount: 16 },
  { id: 'social', type: 'category', name: 'Social', icon: CATEGORY_ICONS.social, articleCount: 90, localeCount: 14 },
  { id: 'aggregator', type: 'category', name: 'Aggregator', icon: CATEGORY_ICONS.aggregator, articleCount: 110, localeCount: 17 },
  { id: 'pbe', type: 'category', name: 'PBE', icon: CATEGORY_ICONS.pbe, articleCount: 35, localeCount: 8 },
  { id: 'tft', type: 'category', name: 'TFT', icon: CATEGORY_ICONS.tft, articleCount: 60, localeCount: 12 },

  // Source nodes - Official Riot
  { id: 'riot-games', type: 'source', name: 'Riot Games', articleCount: 25, localeCount: 20, category: 'official_riot' },
  { id: 'league-dev', type: 'source', name: 'League Dev', articleCount: 12, localeCount: 15, category: 'official_riot' },
  { id: 'riot-support', type: 'source', name: 'Riot Support', articleCount: 8, localeCount: 18, category: 'official_riot' },

  // Source nodes - Analytics
  { id: 'u-gg', type: 'source', name: 'u.gg', articleCount: 45, localeCount: 12, category: 'analytics' },
  { id: 'op-gg', type: 'source', name: 'op.gg', articleCount: 38, localeCount: 14, category: 'analytics' },
  { id: 'lolalytics', type: 'source', name: 'LoLalytics', articleCount: 22, localeCount: 10, category: 'analytics' },
  { id: 'mobalytics', type: 'source', name: 'Mobalytics', articleCount: 15, localeCount: 11, category: 'analytics' },

  // Source nodes - Esports
  { id: 'dexerto', type: 'source', name: 'Dexerto', articleCount: 65, localeCount: 15, category: 'esports' },
  { id: 'liquipedia', type: 'source', name: 'Liquipedia', articleCount: 80, localeCount: 16, category: 'esports' },
  { id: 'esports-wiki', type: 'source', name: 'Esports Wiki', articleCount: 55, localeCount: 14, category: 'esports' },

  // Source nodes - Community Hub
  { id: 'surnder-at-20', type: 'source', name: "Surrender at 20", articleCount: 42, localeCount: 10, category: 'community_hub' },
  { id: 'moobeat', type: 'source', name: 'Moobeat', articleCount: 28, localeCount: 8, category: 'community_hub' },
  { id: 'reddit-r-lol', type: 'source', name: 'r/leagueoflegends', articleCount: 15, localeCount: 12, category: 'community_hub' },

  // Source nodes - Regional
  { id: 'lolesports', type: 'source', name: 'LoL Esports', articleCount: 70, localeCount: 16, category: 'regional' },
  { id: 'weibo', type: 'source', name: 'Weibo LoL', articleCount: 45, localeCount: 3, category: 'regional' },
  { id: 'op-gg-kr', type: 'source', name: 'OP.GG Korea', articleCount: 35, localeCount: 2, category: 'regional' },

  // Source nodes - Social
  { id: 'twitter-lol', type: 'source', name: 'Twitter LoL', articleCount: 50, localeCount: 14, category: 'social' },
  { id: 'youtube-lol', type: 'source', name: 'YouTube LoL', articleCount: 40, localeCount: 12, category: 'social' },

  // Source nodes - Aggregator
  { id: 'rss-loleventvods', type: 'source', name: 'LoL Event VODs', articleCount: 60, localeCount: 17, category: 'aggregator' },
  { id: 'patch-notes', type: 'source', name: 'Patch Notes', articleCount: 50, localeCount: 15, category: 'aggregator' },

  // Source nodes - PBE
  { id: 'pbe-patch', type: 'source', name: 'PBE Patches', articleCount: 20, localeCount: 8, category: 'pbe' },
  { id: 'pbe-reddit', type: 'source', name: 'PBE Reddit', articleCount: 15, localeCount: 6, category: 'pbe' },

  // Source nodes - TFT
  { id: 'tft-gg', type: 'source', name: 'TFT.GG', articleCount: 30, localeCount: 12, category: 'tft' },
  { id: 'tftactics', type: 'source', name: 'TFTactics', articleCount: 30, localeCount: 10, category: 'tft' },
];

// Create links connecting sources to their categories
const MOCK_LINKS: GraphLink[] = MOCK_NODES
  .filter(node => node.type === 'source')
  .map(node => ({
    source: node.id,
    target: node.category || '',
  }));

interface SourceGalaxyProps {
  onSourceClick?: (source: string) => void;
}

export const SourceGalaxy = ({ onSourceClick }: SourceGalaxyProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    if (!svgRef.current) return;

    setIsLoading(true);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup dimensions
    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 600;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'transparent');

    // Create group for zoom/pan
    const g = svg.append('g');

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(MOCK_NODES)
      .force('link', d3.forceLink<GraphNode, GraphLink>(MOCK_LINKS)
        .id((d: any) => d.id)
        .distance(120)
        .strength(0.3))
      .force('charge', d3.forceManyBody()
        .strength((d: any) => d.type === 'category' ? -500 : -200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius((d: any) => d.type === 'category' ? 50 : 35))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(MOCK_LINKS)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        const sourceNode = MOCK_NODES.find(n => n.id === (d.source as any).id);
        return sourceNode?.category ? CATEGORY_COLORS[sourceNode.category] : '#333';
      })
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 2);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(MOCK_NODES)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', (d: GraphNode) => d.type === 'source' ? 'pointer' : 'default')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    // Add circles for nodes
    node.append('circle')
      .attr('r', (d: GraphNode) => d.type === 'category' ? 40 : 25)
      .attr('fill', (d: GraphNode) => {
        if (d.type === 'category') {
          return CATEGORY_COLORS[d.id] || '#C89B3C';
        }
        return CATEGORY_COLORS[d.category || ''] || '#C89B3C';
      })
      .attr('stroke', (d: GraphNode) => d.type === 'category' ? '#fff' : '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)
      .style('filter', (d: GraphNode) => {
        const color = d.type === 'category'
          ? CATEGORY_COLORS[d.id]
          : CATEGORY_COLORS[d.category || ''];
        return `drop-shadow(0 0 8px ${color})`;
      });

    // Add icons for category nodes
    node.filter((d: GraphNode) => Boolean(d.type === 'category' && d.icon))
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '24px')
      .text((d: GraphNode) => d.icon || '');

    // Add labels
    node.append('text')
      .attr('x', 0)
      .attr('y', (d: GraphNode) => d.type === 'category' ? 55 : 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', (d: GraphNode) => d.type === 'category' ? '14px' : '12px')
      .attr('font-weight', '500')
      .attr('class', 'node-label')
      .style('display', showLabels ? 'block' : 'none')
      .text((d: GraphNode) => d.name);

    // Add stats text for nodes
    node.append('text')
      .attr('x', 0)
      .attr('y', (d: GraphNode) => d.type === 'category' ? 72 : 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')
      .text((d: GraphNode) => `${d.articleCount} articles • ${d.localeCount} locales`);

    // Hover interactions
    node.on('mouseenter', (_event, d) => {
      setHoveredNode(d);

      // Highlight connected nodes and links
      node.style('opacity', (n: GraphNode) => {
        if (d.type === 'category') {
          return n.type === 'category' && n.id === d.id ? 1 : 0.3;
        } else {
          return (n.id === d.id || n.id === d.category) ? 1 : 0.3;
        }
      });

      link.style('opacity', (l: any) => {
        if (d.type === 'category') {
          return (l.source as any).id === d.id || (l.target as any).id === d.id ? 1 : 0.1;
        } else {
          return (l.source as any).id === d.id || (l.target as any).id === d.id ? 1 : 0.1;
        }
      });
    })
    .on('mouseleave', () => {
      setHoveredNode(null);
      node.style('opacity', 1);
      link.style('opacity', 0.3);
    });

    // Click on source nodes
    node.filter((d: GraphNode) => d.type === 'source')
      .on('click', (_event, d) => {
        onSourceClick?.(d.id);
      });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: GraphNode) => `translate(${d.x},${d.y})`);
    });

    // Hide loading state
    setTimeout(() => setIsLoading(false), 500);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [onSourceClick, showLabels]);

  const toggleLabels = () => {
    setShowLabels(!showLabels);
    d3.select(svgRef.current)
      .selectAll('.node-label')
      .style('display', showLabels ? 'none' : 'block');
  };

  const resetZoom = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.transition()
      .duration(750)
      .call(
        (d3.zoom<SVGSVGElement, unknown>() as any)
          .transform,
        d3.zoomIdentity
      );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLabels}
            className="px-4 py-2 bg-lol-card text-white rounded-lg hover:bg-lol-hover transition-colors border border-lol-gold/20"
          >
            {showLabels ? '🏷️ Hide Labels' : '🏷️ Show Labels'}
          </button>
          <button
            onClick={resetZoom}
            className="px-4 py-2 bg-lol-card text-white rounded-lg hover:bg-lol-hover transition-colors border border-lol-gold/20"
          >
            🔄 Reset View
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {hoveredNode ? (
            <span className="text-lol-gold">
              {hoveredNode.type === 'category' ? 'Category' : 'Source'}: {hoveredNode.name}
            </span>
          ) : (
            <span>Hover over nodes for details • Drag to reorganize • Click sources to filter</span>
          )}
        </div>
      </div>

      {/* Graph */}
      {isLoading ? (
        <div className="card p-12 flex items-center justify-center" style={{ height: '600px' }}>
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🌌</div>
            <p className="text-lol-gold text-lg">Initializing Source Galaxy...</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card relative"
          style={{ height: '600px' }}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        </motion.div>
      )}

      {/* Legend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-lol-gold mb-4">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_ICONS).map(([key, icon]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 bg-lol-dark rounded-lg"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLORS[key],
                  boxShadow: `0 0 8px ${CATEGORY_COLORS[key]}`,
                }}
              />
              <span className="text-sm">{icon}</span>
              <span className="text-xs text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-lol-gold mb-3">How to Use</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-lol-gold">•</span>
            <span><strong className="text-white">Hover</strong> over nodes to see details and highlight connections</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lol-gold">•</span>
            <span><strong className="text-white">Drag</strong> nodes to reorganize the graph layout</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lol-gold">•</span>
            <span><strong className="text-white">Click</strong> on source nodes to filter feeds by that source</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lol-gold">•</span>
            <span><strong className="text-white">Scroll</strong> to zoom in/out of the graph</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lol-gold">•</span>
            <span><strong className="text-white">Pan</strong> by clicking and dragging on empty space</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
