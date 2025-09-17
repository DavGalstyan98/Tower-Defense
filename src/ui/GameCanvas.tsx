/**
 * Game canvas component that handles rendering and input
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { CanvasRenderer } from '../renderers/canvas';
import { useGameStore } from '../state/store';
import { Grid } from '../engine/grid';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const game = useGameStore(state => state.game);
  const placeTower = useGameStore(state => state.placeTower);
  const selectTower = useGameStore(state => state.selectTower);
  const deselectTower = useGameStore(state => state.deselectTower);
  const setHoveredTile = useGameStore(state => state.setHoveredTile);

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render game
  useEffect(() => {
    if (rendererRef?.current) {
      rendererRef?.current?.render(game);
    }
  }, [game]);

  // Handle mouse/touch input
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (!rendererRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const worldPos = rendererRef.current.screenToWorld(x, y);
    const gridPos = Grid.worldToGrid(worldPos.x, worldPos.y);

    // Check if clicking on a tower
    const clickedTower = game.towers.find(tower => 
      tower.tile.x === gridPos.x && tower.tile.y === gridPos.y
    );

    if (clickedTower) {
      selectTower(clickedTower.id);
    } else {
      deselectTower();
      
      // Place tower if in build mode
      if (game.buildMode) {
        placeTower(gridPos);
      }
    }
  }, [game.towers, game.buildMode]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!rendererRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const worldPos = rendererRef.current.screenToWorld(x, y);
    const gridPos = Grid.worldToGrid(worldPos.x, worldPos.y);

    // Only set hovered tile if it's within map bounds
    if (gridPos.x >= 0 && gridPos.x < game.map.width && 
        gridPos.y >= 0 && gridPos.y < game.map.height) {
      setHoveredTile(gridPos);
    } else {
      setHoveredTile(undefined);
    }
  }, [game.map.width, game.map.height]);

  const handlePointerLeave = useCallback(() => {
    setHoveredTile(undefined);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          deselectTower();
          break;
        case '1':
          // Select arrow tower
          break;
        case '2':
          // Select cannon tower
          break;
        case '3':
          // Select frost tower
          break;
        case ' ':
          // Pause/resume
          event.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        cursor: 'crosshair',
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Game field"
      role="img"
    />
  );
};
