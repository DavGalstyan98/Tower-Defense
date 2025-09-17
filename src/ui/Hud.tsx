/**
 * Heads-up display component for game information
 */

import React from 'react';
import { useGameState, useMoney, useLives, useCurrentWave, useTotalWaves, useGameStore } from '../state/store';

export const Hud: React.FC = () => {
  const gameState = useGameState();
  const money = useMoney();
  const lives = useLives();
  const currentWave = useCurrentWave();
  const totalWaves = useTotalWaves();
  const gameSpeed = useGameStore(state => state.game.speed);
  const startGame = useGameStore(state => state.startGame);
  const pauseGame = useGameStore(state => state.pauseGame);
  const resumeGame = useGameStore(state => state.resumeGame);
  const restartGame = useGameStore(state => state.restartGame);
  const setSpeed = useGameStore(state => state.setSpeed);
  const startNextWave = useGameStore(state => state.startNextWave);

  const isPlaying = gameState === 'playing';
  const isPaused = gameState === 'paused';
  const isGameOver = gameState === 'gameOver';
  const isVictory = gameState === 'victory';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left side - Game info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderRadius: '8px', padding: '8px 16px' }}>
            <div style={{ fontSize: '14px', color: '#d1d5db' }}>Money</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>${money}</div>
          </div>
          
          <div style={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderRadius: '8px', padding: '8px 16px' }}>
            <div style={{ fontSize: '14px', color: '#d1d5db' }}>Lives</div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: lives > 10 ? '#4ade80' : lives > 5 ? '#fbbf24' : '#ef4444' 
            }}>
              {lives}
            </div>
          </div>
          
          <div style={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderRadius: '8px', padding: '8px 16px' }}>
            <div style={{ fontSize: '14px', color: '#d1d5db' }}>Wave</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
              {currentWave + 1} / {totalWaves}
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Game state buttons */}
          {gameState === 'menu' && (
            <button
              onClick={startGame}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Start game"
            >
              Start Game
            </button>
          )}
          
          {isPlaying && (
            <button
              onClick={pauseGame}
              style={{
                backgroundColor: '#d97706',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Pause game"
            >
              Pause
            </button>
          )}
          
          {isPaused && (
            <button
              onClick={resumeGame}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Resume game"
            >
              Resume
            </button>
          )}
          
          {(isGameOver || isVictory) && (
            <button
              onClick={restartGame}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Restart game"
            >
              Restart
            </button>
          )}

          {/* Speed controls */}
          {isPlaying && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'white', fontSize: '14px', marginRight: '8px' }}>Speed:</span>
              <button
                onClick={() => setSpeed(0.5)}
                style={{
                  backgroundColor: gameSpeed === 0.5 ? '#059669' : '#4b5563',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Set speed to 0.5x"
              >
                0.5x
              </button>
              <button
                onClick={() => setSpeed(1)}
                style={{
                  backgroundColor: gameSpeed === 1 ? '#059669' : '#4b5563',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Set speed to 1x"
              >
                1x
              </button>
              <button
                onClick={() => setSpeed(2)}
                style={{
                  backgroundColor: gameSpeed === 2 ? '#059669' : '#4b5563',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Set speed to 2x"
              >
                2x
              </button>
            </div>
          )}

          {/* Next wave button */}
          {isPlaying && currentWave < totalWaves && (
            <button
              onClick={startNextWave}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Start next wave"
            >
              Next Wave
            </button>
          )}
        </div>
      </div>

      {/* Game state messages */}
      {isGameOver && (
        <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ 
            backgroundColor: 'rgba(220, 38, 38, 0.9)', 
            color: 'white', 
            padding: '16px 32px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Game Over</h2>
            <p style={{ fontSize: '18px' }}>Your base has been overrun!</p>
          </div>
        </div>
      )}
      
      {isVictory && (
        <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.9)', 
            color: 'white', 
            padding: '16px 32px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Victory!</h2>
            <p style={{ fontSize: '18px' }}>You have defended your base!</p>
          </div>
        </div>
      )}
    </div>
  );
};
