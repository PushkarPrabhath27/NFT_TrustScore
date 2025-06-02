import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import * as d3 from 'd3';

const RelationshipGraph = ({ data }) => {
  const { darkMode, animationsEnabled, visualizationType } = useStore();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Create and update the force-directed graph
  useEffect(() => {
    if (!data || !data.nodes || !data.links || !svgRef.current || dimensions.width === 0) return;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Define node colors based on type
    const nodeColors = {
      nft: '#00FFFF', // electric-blue
      owner: '#3C00FF', // neon-purple
      creator: '#39FF14', // neon-green
      marketplace: '#FF9500', // orange
      default: '#FFFFFF' // white
    };
    
    // Define link colors based on relationship
    const linkColors = {
      owns: '#3C00FF', // neon-purple
      created: '#39FF14', // neon-green
      listed: '#FF9500', // orange
      related: '#FFFFFF', // white
      default: 'rgba(255, 255, 255, 0.2)' // transparent white
    };
    
    // Create a force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size || 20));
    
    // Create a gradient for links
    const defs = svg.append('defs');
    
    // Create gradients for each link
    data.links.forEach((link, i) => {
      const gradientId = `link-gradient-${i}`;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse');
      
      const sourceColor = nodeColors[link.source.type || 'default'] || nodeColors.default;
      const targetColor = nodeColors[link.target.type || 'default'] || nodeColors.default;
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', sourceColor);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', targetColor);
      
      link.gradientId = gradientId;
    });
    
    // Add links
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', d => visualizationType === 'Default' ? `url(#${d.gradientId})` : (linkColors[d.relationship] || linkColors.default))
      .attr('stroke-width', d => d.weight || 1)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', visualizationType === 'Minimal' ? '5,5' : '0');
    
    // Add nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Node circles
    node.append('circle')
      .attr('r', d => d.size || 20)
      .attr('fill', d => nodeColors[d.type] || nodeColors.default)
      .attr('stroke', darkMode ? '#000' : '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);
    
    // Add glow effect for nodes
    if (animationsEnabled) {
      node.append('circle')
        .attr('r', d => (d.size || 20) + 5)
        .attr('fill', 'none')
        .attr('stroke', d => nodeColors[d.type] || nodeColors.default)
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)
        .attr('class', 'node-glow')
        .style('filter', 'blur(4px)');
      
      // Animate the glow
      svg.selectAll('.node-glow')
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', d => `${(d.size || 20) + 5};${(d.size || 20) + 15};${(d.size || 20) + 5}`)
        .attr('dur', '3s')
        .attr('repeatCount', 'indefinite');
    }
    
    // Node labels
    node.append('text')
      .attr('dx', d => (d.size || 20) + 5)
      .attr('dy', '.35em')
      .attr('font-family', 'Rajdhani, sans-serif')
      .attr('font-size', '12px')
      .attr('fill', darkMode ? '#fff' : '#000')
      .text(d => d.name || d.id);
    
    // Add tooltips
    node.append('title')
      .text(d => {
        let tooltip = `ID: ${d.id}\nType: ${d.type}`;
        if (d.attributes) {
          Object.entries(d.attributes).forEach(([key, value]) => {
            tooltip += `\n${key}: ${value}`;
          });
        }
        return tooltip;
      });
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Set loaded state after a delay for animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, darkMode, animationsEnabled, visualizationType]);
  
  // If no data, show placeholder
  if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No relationship data available</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Legend */}
      <div className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-gray-900/80 backdrop-blur-sm text-xs">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00FFFF' }}></div>
            <span className="text-white">NFT</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3C00FF' }}></div>
            <span className="text-white">Owner</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#39FF14' }}></div>
            <span className="text-white">Creator</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF9500' }}></div>
            <span className="text-white">Marketplace</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-2 left-2 z-10 p-2 rounded-lg bg-gray-900/80 backdrop-blur-sm text-xs text-white">
        <p>Drag nodes to reposition | Scroll to zoom | Click for details</p>
      </div>
      
      {/* SVG Container */}
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="w-full h-full"
      ></svg>
      
      {/* Animated background elements */}
      {animationsEnabled && (
        <>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-neon-purple/5 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        </>
      )}
    </motion.div>
  );
};

export default RelationshipGraph;