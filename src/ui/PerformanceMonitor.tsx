/**
 * Performance monitoring component for development
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/store';

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [entityCount, setEntityCount] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<number | undefined>();

  const entityCountValue = useGameStore(state => state.game.mobs.length + state.game.towers.length + state.game.projectiles.length);
  const tickCount = useGameStore(state => state.game.tickCount);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let lastFpsUpdate = lastTime;

    const updateMetrics = () => {
      const currentTime = performance.now();
      frameCount++;

      // Update FPS every second
      if (currentTime - lastFpsUpdate >= 1000) {
        const newFps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        setFps(newFps);
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }

      // Update frame time
      const deltaTime = currentTime - lastTime;
      setFrameTime(deltaTime);
      lastTime = currentTime;

      // Update entity count
      setEntityCount(entityCountValue);

      // Update memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024); // MB
      }

      requestAnimationFrame(updateMetrics);
    };

    requestAnimationFrame(updateMetrics);
  }, [entityCountValue]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return '#4ade80'; // green
    if (fps >= 45) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  const getFrameTimeColor = (frameTime: number) => {
    if (frameTime <= 16.67) return '#4ade80'; // green
    if (frameTime <= 20) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px',
          cursor: 'pointer',
          marginBottom: '4px'
        }}
      >
        {isVisible ? 'Hide' : 'Show'} Perf
      </button>

      {/* Performance metrics */}
      {isVisible && (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          minWidth: '150px'
        }}>
          <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Performance</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FPS:</span>
            <span style={{ color: getFpsColor(fps) }}>{fps}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Frame:</span>
            <span style={{ color: getFrameTimeColor(frameTime) }}>
              {frameTime.toFixed(1)}ms
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Entities:</span>
            <span>{entityCount}</span>
          </div>
          
          {memoryUsage && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Memory:</span>
              <span>{memoryUsage.toFixed(1)}MB</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Ticks:</span>
            <span>{tickCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};
