/**
 * Core game types for Tower Defense
 * All types are designed for deterministic simulation and performance
 */

export type Vec2 = { x: number; y: number };

export type TileType = 'path' | 'buildable' | 'blocked';

export type MobType = 'normal' | 'fast' | 'tank' | 'flying';

export type TowerType = 'arrow' | 'cannon' | 'frost';

export type TargetingStrategy = 'first' | 'last' | 'strongest' | 'weakest' | 'nearest';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';

export type GameSpeed = 0.5 | 1 | 2;

/**
 * Enemy mob with deterministic movement and combat properties
 */
export type Mob = {
  id: string;
  pos: Vec2;
  hp: number;
  maxHp: number;
  speed: number; // tiles per second
  armor: number; // flat damage reduction
  bounty: number; // money awarded on death
  type: MobType;
  slowUntil?: number; // simulation time when slow expires
  slowMultiplier?: number; // current speed multiplier (0.4 = 40% speed)
  pathProgress: number; // 0-1 along the path
  isDead: boolean;
  reachedEnd: boolean;
};

/**
 * Tower with upgradeable stats and targeting
 */
export type Tower = {
  id: string;
  tile: Vec2; // grid coordinate
  range: number; // tiles
  rate: number; // shots per second
  damage: number;
  projectileSpeed?: number; // tiles per second
  lastFiredAt: number; // simulation time
  kind: TowerType;
  tier: 1 | 2 | 3;
  cost: number;
  targetId?: string; // currently targeted mob
  splashRadius?: number; // for AoE towers
  slowDuration?: number; // for frost towers
  slowAmount?: number; // speed reduction (0.5 = 50% speed)
};

/**
 * Projectile with deterministic movement and collision
 */
export type Projectile = {
  id: string;
  pos: Vec2;
  targetId: string;
  speed: number; // tiles per second
  damage: number;
  splashRadius?: number; // for AoE projectiles
  isInstant?: boolean; // for beam weapons
  towerId: string; // source tower
  createdAt: number; // simulation time
};

/**
 * Wave configuration with spawn timing
 */
export type Wave = {
  id: number;
  entries: Array<{
    delay: number; // seconds from wave start
    kind: MobType;
    count: number;
    spacing: number; // seconds between spawns
  }>;
  isActive: boolean;
  isComplete: boolean;
  startTime?: number; // simulation time when wave started
  nextSpawnTime?: number; // next spawn time
  currentEntryIndex: number;
  currentSpawnCount: number;
  bonusGiven?: boolean; // whether clear bonus has been given
};

/**
 * Game map with grid and path information
 */
export type GameMap = {
  width: number;
  height: number;
  tiles: TileType[][];
  paths: Vec2[][]; // multiple paths from spawn to base
  spawnPoints: Vec2[];
  basePosition: Vec2;
};

/**
 * Main game state - all simulation data
 */
export type Game = {
  // Core state
  time: number; // simulation time in seconds
  state: GameState;
  speed: GameSpeed;
  
  // Game entities
  mobs: Mob[];
  towers: Tower[];
  projectiles: Projectile[];
  waves: Wave[];
  
  // Game progression
  currentWave: number;
  totalWaves: number;
  money: number;
  lives: number;
  score: number;
  
  // Map
  map: GameMap;
  
  // UI state
  selectedTower?: string;
  hoveredTile?: Vec2;
  buildMode?: TowerType;
  
  // Performance tracking
  lastTickTime: number;
  frameTime: number;
  tickCount: number;
};

/**
 * Tower upgrade configuration
 */
export type TowerUpgrade = {
  cost: number;
  damage: number;
  range: number;
  rate: number;
  projectileSpeed?: number;
  splashRadius?: number;
  slowDuration?: number;
  slowAmount?: number;
};

/**
 * Tower definitions with base stats and upgrades
 */
export type TowerDefinition = {
  type: TowerType;
  name: string;
  description: string;
  baseCost: number;
  baseStats: Omit<Tower, 'id' | 'tile' | 'lastFiredAt' | 'kind' | 'tier' | 'cost' | 'targetId'>;
  upgrades: TowerUpgrade[];
  targetingStrategy: TargetingStrategy;
};

/**
 * Mob definitions with base stats
 */
export type MobDefinition = {
  type: MobType;
  name: string;
  hp: number;
  speed: number;
  armor: number;
  bounty: number;
  color: string;
  size: number;
};

/**
 * Game configuration
 */
export type GameConfig = {
  // Simulation
  tickRate: number; // Hz
  maxProjectiles: number;
  maxMobs: number;
  
  // Economy
  startingMoney: number;
  startingLives: number;
  
  // Performance
  enableInterpolation: boolean;
  enableParticles: boolean;
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
};

/**
 * Input events for the game
 */
export type GameInput = {
  type: 'click' | 'keydown' | 'keyup' | 'touchstart' | 'touchend';
  pos?: Vec2;
  key?: string;
  button?: number;
  timestamp: number;
};

/**
 * Game events for UI updates
 */
export type GameEvent = {
  type: 'mobKilled' | 'mobReachedEnd' | 'towerBuilt' | 'towerUpgraded' | 'waveStarted' | 'waveComplete' | 'gameOver' | 'victory';
  data?: any;
  timestamp: number;
};

/**
 * Performance metrics
 */
export type PerformanceMetrics = {
  fps: number;
  frameTime: number;
  tickTime: number;
  renderTime: number;
  entityCount: number;
  memoryUsage?: number;
};
