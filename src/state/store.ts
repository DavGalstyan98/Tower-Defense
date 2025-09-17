/**
 * Game state management with Zustand
 * Provides React bindings for the game engine
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Game, GameSpeed, TowerType, Vec2 } from '../engine/types';
import { 
  createInitialGame, 
  advanceTick, 
  startNextWave, 
  togglePause, 
  setGameSpeed, 
  placeTower 
} from '../engine/sim';

interface GameStore {
  // Game state
  game: Game;
  isRunning: boolean;
  lastFrameTime: number;
  accumulator: number;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  setSpeed: (speed: GameSpeed) => void;
  startNextWave: () => void;
  
  // Tower actions
  enterBuildMode: (towerType: TowerType) => void;
  exitBuildMode: () => void;
  placeTower: (pos: Vec2) => void;
  selectTower: (towerId: string) => void;
  deselectTower: () => void;
  
  // UI actions
  setHoveredTile: (pos: Vec2 | undefined) => void;
  
  // Game loop
  update: (deltaTime: number) => void;
  render: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    game: createInitialGame(),
    isRunning: false,
    lastFrameTime: 0,
    accumulator: 0,

    startGame: () => {
      set(state => ({
        game: { ...state.game, state: 'playing' },
        isRunning: true,
        lastFrameTime: performance.now(),
      }));
    },

    pauseGame: () => {
      set(state => ({
        game: togglePause(state.game),
        isRunning: false,
      }));
    },

    resumeGame: () => {
      set(state => ({
        game: togglePause(state.game),
        isRunning: true,
        lastFrameTime: performance.now(),
      }));
    },

    restartGame: () => {
      set({
        game: createInitialGame(),
        isRunning: false,
        lastFrameTime: 0,
        accumulator: 0,
      });
    },

    setSpeed: (speed: GameSpeed) => {
      set(state => ({
        game: setGameSpeed(state.game, speed),
      }));
    },

    startNextWave: () => {
      set(state => ({
        game: startNextWave(state.game),
        isRunning: true,
        lastFrameTime: performance.now(),
      }));
    },

    enterBuildMode: (towerType: TowerType) => {
      set(state => ({
        game: { ...state.game, buildMode: towerType },
      }));
    },

    exitBuildMode: () => {
      set(state => ({
        game: { ...state.game, buildMode: undefined },
      }));
    },

    placeTower: (pos: Vec2) => {
      const state = get();
      if (state.game.buildMode) {
        set({
          game: placeTower(state.game, pos, state.game.buildMode),
        });
      }
    },

    selectTower: (towerId: string) => {
      set(state => ({
        game: { ...state.game, selectedTower: towerId },
      }));
    },

    deselectTower: () => {
      set(state => ({
        game: { ...state.game, selectedTower: undefined },
      }));
    },

    setHoveredTile: (pos: Vec2 | undefined) => {
      set(state => ({
        game: { ...state.game, hoveredTile: pos },
      }));
    },

    update: (deltaTime: number) => {
      const state = get();
      if (!state.isRunning || state.game.state !== 'playing') return;

      // Fixed timestep simulation
      const TICK_DURATION = 1000 / 60; // 60 Hz
      const newAccumulator = state.accumulator + deltaTime;

      let newGame = state.game;
      let remainingTime = newAccumulator;
      while (remainingTime >= TICK_DURATION) {
        newGame = advanceTick(newGame, TICK_DURATION);
        remainingTime -= TICK_DURATION;
      }

      set({ 
        game: newGame,
        accumulator: remainingTime
      });
    },

    render: () => {
      // This will be called by the renderer
      // The actual rendering is handled by the CanvasRenderer
    },
  }))
);

// Selectors for common game state
export const useGameState = () => useGameStore(state => state.game.state);
export const useGameSpeed = () => useGameStore(state => state.game.speed);
export const useMoney = () => useGameStore(state => state.game.money);
export const useLives = () => useGameStore(state => state.game.lives);
export const useCurrentWave = () => useGameStore(state => state.game.currentWave);
export const useTotalWaves = () => useGameStore(state => state.game.totalWaves);
export const useTowers = () => useGameStore(state => state.game.towers);
export const useMobs = () => useGameStore(state => state.game.mobs);
export const useProjectiles = () => useGameStore(state => state.game.projectiles);
export const useSelectedTower = () => useGameStore(state => state.game.selectedTower);
export const useBuildMode = () => useGameStore(state => state.game.buildMode);
export const useHoveredTile = () => useGameStore(state => state.game.hoveredTile);

// Action selectors - use individual selectors instead of object to avoid infinite loops
// Individual action selectors are used directly in components

// Performance monitoring - use individual selectors instead of object to avoid infinite loops
