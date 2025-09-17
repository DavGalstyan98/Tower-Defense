/**
 * Game constants and configuration
 */

import type { GameConfig, TowerDefinition, MobDefinition } from './types';

export const GAME_CONFIG: GameConfig = {
  tickRate: 60, // 60 Hz simulation
  maxProjectiles: 200,
  maxMobs: 100,
  startingMoney: 200,
  startingLives: 100,
  enableInterpolation: true,
  enableParticles: true,
  reducedMotion: false,
  highContrast: false,
};

export const TICK_DURATION = 1000 / GAME_CONFIG.tickRate; // 16.666ms

export const TOWER_DEFINITIONS: Record<string, TowerDefinition> = {
  arrow: {
    type: 'arrow',
    name: 'Arrow Tower',
    description: 'Fast single-target damage',
    baseCost: 20,
    baseStats: {
      range: 3,
      rate: 2, // 2 shots per second
      damage: 25,
      projectileSpeed: 8,
    },
    upgrades: [
      {
        cost: 30,
        damage: 40,
        range: 3.5,
        rate: 2.5,
        projectileSpeed: 10,
      },
      {
        cost: 50,
        damage: 65,
        range: 4,
        rate: 3,
        projectileSpeed: 12,
      },
    ],
    targetingStrategy: 'first',
  },
  cannon: {
    type: 'cannon',
    name: 'Cannon Tower',
    description: 'Slow AoE splash damage',
    baseCost: 40,
    baseStats: {
      range: 2.5,
      rate: 0.8, // 0.8 shots per second
      damage: 80,
      projectileSpeed: 4,
      splashRadius: 1.5,
    },
    upgrades: [
      {
        cost: 60,
        damage: 120,
        range: 3,
        rate: 1,
        projectileSpeed: 5,
        splashRadius: 2,
      },
      {
        cost: 100,
        damage: 180,
        range: 3.5,
        rate: 1.2,
        projectileSpeed: 6,
        splashRadius: 2.5,
      },
    ],
    targetingStrategy: 'strongest',
  },
  frost: {
    type: 'frost',
    name: 'Frost Tower',
    description: 'Slows enemies and deals damage',
    baseCost: 30,
    baseStats: {
      range: 2.5,
      rate: 1.5,
      damage: 15,
      projectileSpeed: 6,
      slowDuration: 3,
      slowAmount: 0.5, // 50% speed reduction
    },
    upgrades: [
      {
        cost: 45,
        damage: 25,
        range: 3,
        rate: 2,
        projectileSpeed: 8,
        slowDuration: 4,
        slowAmount: 0.4, // 60% speed reduction
      },
      {
        cost: 75,
        damage: 40,
        range: 3.5,
        rate: 2.5,
        projectileSpeed: 10,
        slowDuration: 5,
        slowAmount: 0.3, // 70% speed reduction
      },
    ],
    targetingStrategy: 'first',
  },
};

export const MOB_DEFINITIONS: Record<string, MobDefinition> = {
  normal: {
    type: 'normal',
    name: 'Goblin',
    hp: 50,
    speed: 1,
    armor: 0,
    bounty: 10,
    color: '#4ade80',
    size: 0.8,
  },
  fast: {
    type: 'fast',
    name: 'Wolf',
    hp: 30,
    speed: 2,
    armor: 0,
    bounty: 15,
    color: '#f59e0b',
    size: 0.7,
  },
  tank: {
    type: 'tank',
    name: 'Ogre',
    hp: 150,
    speed: 0.5,
    armor: 5,
    bounty: 25,
    color: '#dc2626',
    size: 1.2,
  },
  flying: {
    type: 'flying',
    name: 'Dragon',
    hp: 80,
    speed: 1.5,
    armor: 2,
    bounty: 30,
    color: '#7c3aed',
    size: 1.0,
  },
};

export const WAVE_DEFINITIONS = [
  // Wave 1: Easy start
  {
    id: 1,
    entries: [
      { delay: 0, kind: 'normal' as const, count: 10, spacing: 1 },
    ],
  },
  // Wave 2: Mix of normal and fast
  {
    id: 2,
    entries: [
      { delay: 0, kind: 'normal' as const, count: 8, spacing: 0.8 },
      { delay: 5, kind: 'fast' as const, count: 5, spacing: 0.6 },
    ],
  },
  // Wave 3: First tank
  {
    id: 3,
    entries: [
      { delay: 0, kind: 'normal' as const, count: 12, spacing: 0.7 },
      { delay: 8, kind: 'tank' as const, count: 2, spacing: 2 },
    ],
  },
  // Wave 4: More variety
  {
    id: 4,
    entries: [
      { delay: 0, kind: 'fast' as const, count: 8, spacing: 0.5 },
      { delay: 4, kind: 'normal' as const, count: 10, spacing: 0.6 },
      { delay: 10, kind: 'tank' as const, count: 3, spacing: 1.5 },
    ],
  },
  // Wave 5: First flying
  {
    id: 5,
    entries: [
      { delay: 0, kind: 'flying' as const, count: 3, spacing: 1 },
      { delay: 5, kind: 'normal' as const, count: 15, spacing: 0.5 },
    ],
  },
  // Wave 6-10: Increasing difficulty
  {
    id: 6,
    entries: [
      { delay: 0, kind: 'fast' as const, count: 12, spacing: 0.4 },
      { delay: 5, kind: 'tank' as const, count: 4, spacing: 1.2 },
      { delay: 10, kind: 'flying' as const, count: 5, spacing: 0.8 },
    ],
  },
  {
    id: 7,
    entries: [
      { delay: 0, kind: 'normal' as const, count: 20, spacing: 0.4 },
      { delay: 8, kind: 'fast' as const, count: 10, spacing: 0.3 },
      { delay: 12, kind: 'tank' as const, count: 5, spacing: 1 },
    ],
  },
  {
    id: 8,
    entries: [
      { delay: 0, kind: 'flying' as const, count: 8, spacing: 0.6 },
      { delay: 5, kind: 'tank' as const, count: 6, spacing: 1 },
      { delay: 12, kind: 'fast' as const, count: 15, spacing: 0.3 },
    ],
  },
  {
    id: 9,
    entries: [
      { delay: 0, kind: 'normal' as const, count: 25, spacing: 0.3 },
      { delay: 8, kind: 'tank' as const, count: 8, spacing: 0.8 },
      { delay: 15, kind: 'flying' as const, count: 10, spacing: 0.5 },
    ],
  },
  {
    id: 10,
    entries: [
      { delay: 0, kind: 'fast' as const, count: 20, spacing: 0.2 },
      { delay: 4, kind: 'tank' as const, count: 10, spacing: 0.6 },
      { delay: 10, kind: 'flying' as const, count: 15, spacing: 0.4 },
      { delay: 16, kind: 'normal' as const, count: 30, spacing: 0.2 },
    ],
  },
];

export const MAP_SIZE = {
  width: 20,
  height: 15,
};

export const TILE_SIZE = 32; // pixels

export const COLORS = {
  background: '#1a1a2e',
  grid: '#16213e',
  path: '#0f3460',
  buildable: '#0d7377',
  blocked: '#533a71',
  tower: '#e94560',
  projectile: '#f5f5f5',
  enemy: '#ff6b6b',
  ui: '#2d3748',
  text: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;
