/**
 * Main App component for Tower Defense game
 */

import { useEffect, useRef } from 'react';
import { GameCanvas } from './ui/GameCanvas';
import { Hud } from './ui/Hud';
import { BuildBar } from './ui/BuildBar';
import { TowerInfo } from './ui/TowerInfo';
import { PerformanceMonitor } from './ui/PerformanceMonitor';
import { useGameStore } from './state/store';

function App() {
  const game = useGameStore(state => state.game);
  const update = useGameStore(state => state.update);
  const isRunning = useGameStore(state => state.isRunning);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Game loop
  useEffect(() => {
    let lastTime = 0;
    let accumulatedTime = 0;

    const gameLoop = (currentTime: number) => {
      if (isRunning && game.state === 'playing') {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Apply speed multiplier
        accumulatedTime += deltaTime * game.speed;
        
        // Only update game when enough time has passed
        if (accumulatedTime >= 16.67) { // 60fps
          update(accumulatedTime);
          accumulatedTime = 0;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, game.state, game.speed]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for game keys
      if ([' ', 'Escape', '1', '2', '3'].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#1a1a2e' }}>
      <GameCanvas />
      <Hud />
      <BuildBar />
      <TowerInfo />
      <PerformanceMonitor />
    </div>
  );
}

export default App;