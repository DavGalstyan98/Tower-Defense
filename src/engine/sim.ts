/**
 * Fixed-timestep simulation engine for Tower Defense
 * Handles all game logic in a deterministic, pure way
 */

import type { Game, Mob, Tower, Projectile, Vec2 } from './types';
import { TOWER_DEFINITIONS, MOB_DEFINITIONS, WAVE_DEFINITIONS, TICK_DURATION } from './constants';
import { findTarget, getMobsInSplashRadius, applySplashDamage } from './targeting';
import { applySlow, updateMobSpeed, cleanupExpiredEffects, applyDamage, getEffectiveDamage } from './effects';
import { Grid, createDefaultMap, isBuildable } from './grid';

/**
 * Advance the game simulation by one tick
 */
export function advanceTick(game: Game, dt: number = TICK_DURATION): Game {
  let newGame = { ...game };
  newGame.time += dt;
  newGame.tickCount++;

  // Update waves and spawn mobs
  newGame = updateWaves(newGame, dt);
  
  // Update mobs (movement, effects)
  newGame = updateMobs(newGame, dt);
  
  // Update towers (targeting, firing)
  newGame = updateTowers(newGame, dt);
  
  // Update projectiles (movement, collision)
  newGame = updateProjectiles(newGame, dt);
  
  // Clean up dead entities
  newGame = cleanupEntities(newGame);
  
  // Check win/lose conditions
  newGame = checkGameState(newGame);

  return newGame;
}

/**
 * Update wave spawning
 */
function updateWaves(game: Game, _dt: number): Game {
  const newGame = { ...game };
  
  if (newGame.currentWave >= newGame.totalWaves) {
    return newGame;
  }
  
  const currentWave = newGame.waves[newGame.currentWave];
  if (!currentWave || currentWave.isComplete) {
    return newGame;
  }
  
  if (!currentWave.isActive) {
    // Start the wave
    currentWave.isActive = true;
    currentWave.startTime = newGame.time;
    currentWave.nextSpawnTime = newGame.time;
    currentWave.currentEntryIndex = 0;
    currentWave.currentSpawnCount = 0;
  }
  
  // Spawn mobs according to wave configuration
  const entry = currentWave.entries[currentWave.currentEntryIndex];
  if (entry && newGame.time >= entry.delay) {
    if (currentWave.nextSpawnTime && newGame.time >= currentWave.nextSpawnTime) {
      if (currentWave.currentSpawnCount < entry.count) {
        // Spawn a mob
        const mob = createMob(entry.kind, newGame.map.spawnPoints[0], newGame.time);
        newGame.mobs.push(mob);
        
        currentWave.currentSpawnCount++;
        currentWave.nextSpawnTime = newGame.time + entry.spacing;
      } else {
        // Move to next entry
        currentWave.currentEntryIndex++;
        currentWave.currentSpawnCount = 0;
        
        if (currentWave.currentEntryIndex >= currentWave.entries.length) {
          // Wave is complete
          currentWave.isComplete = true;
          
          // Give money reward for completing the wave
          const waveReward = 50 + (currentWave.id * 10); // $50 + $10 per wave number
          newGame.money += waveReward;
        }
      }
    }
  }
  
  return newGame;
}

/**
 * Update mob movement and effects
 */
function updateMobs(game: Game, dt: number): Game {
  const newGame = { ...game };
  
  for (let i = 0; i < newGame.mobs.length; i++) {
    let mob = newGame.mobs[i];
    
    if (mob.isDead || mob.reachedEnd) continue;
    
    // Clean up expired effects
    mob = cleanupExpiredEffects(mob, newGame.time);
    
    // Update speed based on slow effects
    const currentSpeed = updateMobSpeed(mob, newGame.time);
    
    // Move along path
    const path = newGame.map.paths[0]; // Use first path for now
    if (path && path.length > 1) {
      const pathProgress = mob.pathProgress;
      const pathIndex = Math.floor(pathProgress * (path.length - 1));
      const nextPathIndex = Math.min(pathIndex + 1, path.length - 1);
      
      const currentPathPos = path[pathIndex];
      const nextPathPos = path[nextPathIndex];
      
      // Calculate movement
      const moveDistance = currentSpeed * dt;
      const pathSegmentLength = Grid.distance(currentPathPos, nextPathPos);
      
      if (pathSegmentLength > 0) {
        const progressInSegment = (pathProgress * (path.length - 1)) - pathIndex;
        const newProgressInSegment = progressInSegment + (moveDistance / pathSegmentLength);
        
        if (newProgressInSegment >= 1) {
          // Move to next segment
          const newPathIndex = Math.min(nextPathIndex + 1, path.length - 1);
          mob.pathProgress = newPathIndex / (path.length - 1);
          
          if (newPathIndex >= path.length - 1) {
            // Reached the end
            mob.reachedEnd = true;
            mob.pos = newGame.map.basePosition;
          } else {
            mob.pos = Grid.gridToWorld(path[newPathIndex].x, path[newPathIndex].y);
          }
        } else {
          // Interpolate position within current segment
          const t = newProgressInSegment;
          mob.pos = {
            x: currentPathPos.x + (nextPathPos.x - currentPathPos.x) * t + 0.5,
            y: currentPathPos.y + (nextPathPos.y - currentPathPos.y) * t + 0.5,
          };
          mob.pathProgress = (pathIndex + newProgressInSegment) / (path.length - 1);
        }
      }
    }
    
    newGame.mobs[i] = mob;
  }
  
  return newGame;
}

/**
 * Update tower targeting and firing
 */
function updateTowers(game: Game, _dt: number): Game {
  const newGame = { ...game };
  
  if (newGame.towers.length > 0 && newGame.mobs.length > 0) {
    console.log(`UpdateTowers: ${newGame.towers.length} towers, ${newGame.mobs.length} mobs`);
  }
  
  for (let i = 0; i < newGame.towers.length; i++) {
    const tower = newGame.towers[i];
    const towerDef = TOWER_DEFINITIONS[tower.kind];
    
    // Find target
    const target = findTarget(tower, newGame.mobs, towerDef.targetingStrategy);
    
    if (target) {
      console.log(`Tower ${tower.kind} at (${tower.tile.x}, ${tower.tile.y}) targeting mob at (${Math.floor(target.pos.x)}, ${Math.floor(target.pos.y)})`);
      
      // Check if we can fire
      const timeSinceLastFire = newGame.time - tower.lastFiredAt;
      const fireInterval = 1 / tower.rate;
      
      if (timeSinceLastFire >= fireInterval) {
        console.log(`Tower firing! Time since last fire: ${timeSinceLastFire}, Fire interval: ${fireInterval}`);
        
        // Fire projectile
        const projectile = createProjectile(tower, target, newGame.time);
        newGame.projectiles.push(projectile);
        
        // Update tower
        newGame.towers[i] = {
          ...tower,
          lastFiredAt: newGame.time,
          targetId: target.id,
        };
      }
    } else if (newGame.mobs.length > 0) {
      console.log(`Tower ${tower.kind} at (${tower.tile.x}, ${tower.tile.y}) found no targets. Range: ${tower.range}, Mobs: ${newGame.mobs.length}`);
    }
  }
  
  return newGame;
}

/**
 * Update projectile movement and collision
 */
function updateProjectiles(game: Game, dt: number): Game {
  let newGame = { ...game };
  
  for (let i = newGame.projectiles.length - 1; i >= 0; i--) {
    const projectile = newGame.projectiles[i];
    const target = newGame.mobs.find(m => m.id === projectile.targetId);
    
    if (!target || target.isDead) {
      // Remove projectile if target is dead
      newGame.projectiles.splice(i, 1);
      continue;
    }
    
    // Move projectile towards target
    const direction = {
      x: target.pos.x - projectile.pos.x,
      y: target.pos.y - projectile.pos.y,
    };
    
    const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    
    if (distance <= 0.1) {
      // Hit target
      const tower = newGame.towers.find(t => t.id === projectile.towerId);
      if (tower) {
        newGame = applyProjectileHit(newGame, projectile, target, tower);
      }
      newGame.projectiles.splice(i, 1);
    } else {
      // Move projectile
      const moveDistance = projectile.speed * dt;
      const moveRatio = moveDistance / distance;
      
      newGame.projectiles[i] = {
        ...projectile,
        pos: {
          x: projectile.pos.x + direction.x * moveRatio,
          y: projectile.pos.y + direction.y * moveRatio,
        },
      };
    }
  }
  
  return newGame;
}

/**
 * Apply projectile hit effects
 */
function applyProjectileHit(game: Game, projectile: Projectile, target: Mob, tower: Tower): Game {
  const newGame = { ...game };
  
  if (projectile.splashRadius) {
    // AoE damage
    const splashTargets = getMobsInSplashRadius(projectile.pos, projectile.splashRadius, newGame.mobs);
    const damageResults = applySplashDamage(projectile.pos, projectile.splashRadius, projectile.damage, splashTargets);
    
    for (const result of damageResults) {
      const mobIndex = newGame.mobs.findIndex(m => m.id === result.mob.id);
      if (mobIndex >= 0) {
        newGame.mobs[mobIndex] = applyDamage(result.mob, result.damage);
        
        if (newGame.mobs[mobIndex].isDead) {
          newGame.money += result.mob.bounty;
        }
      }
    }
  } else {
    // Single target damage
    const effectiveDamage = getEffectiveDamage(projectile.damage, target.armor);
    const mobIndex = newGame.mobs.findIndex(m => m.id === target.id);
    
    if (mobIndex >= 0) {
      newGame.mobs[mobIndex] = applyDamage(target, effectiveDamage);
      
      // Apply slow effect for frost towers
      if (tower.kind === 'frost' && tower.slowDuration && tower.slowAmount) {
        newGame.mobs[mobIndex] = applySlow(
          newGame.mobs[mobIndex], 
          tower.slowDuration, 
          tower.slowAmount, 
          newGame.time
        );
      }
      
      if (newGame.mobs[mobIndex].isDead) {
        newGame.money += target.bounty;
      }
    }
  }
  
  return newGame;
}

/**
 * Clean up dead entities
 */
function cleanupEntities(game: Game): Game {
  const newGame = { ...game };
  
  // Remove dead mobs
  newGame.mobs = newGame.mobs.filter(mob => !mob.isDead);
  
  // Remove old projectiles (timeout after 5 seconds)
  const maxProjectileAge = 5;
  newGame.projectiles = newGame.projectiles.filter(
    projectile => newGame.time - projectile.createdAt < maxProjectileAge
  );
  
  return newGame;
}

/**
 * Check win/lose conditions
 */
function checkGameState(game: Game): Game {
  const newGame = { ...game };
  
  // Check if mobs reached the end
  const mobsReachedEnd = newGame.mobs.filter(mob => mob.reachedEnd);
  for (const _mob of mobsReachedEnd) {
    newGame.lives -= 1;
  }
  
  // Remove mobs that reached the end
  newGame.mobs = newGame.mobs.filter(mob => !mob.reachedEnd);
  
  // Check lose condition
  if (newGame.lives <= 0) {
    newGame.state = 'gameOver';
  }
  
  // Give bonus money for clearing all enemies from a wave
  const currentWave = newGame.waves[newGame.currentWave];
  if (currentWave && currentWave.isComplete && 
      newGame.mobs.length === 0 && 
      newGame.projectiles.length === 0 &&
      !currentWave.bonusGiven) {
    // Give bonus for clearing the wave
    const clearBonus = 25 + (currentWave.id * 5); // $25 + $5 per wave number
    newGame.money += clearBonus;
    currentWave.bonusGiven = true;
  }

  // Check win condition
  if (newGame.currentWave >= newGame.totalWaves && 
      newGame.mobs.length === 0 && 
      newGame.projectiles.length === 0) {
    newGame.state = 'victory';
  }
  
  return newGame;
}

/**
 * Create a new mob
 */
function createMob(type: string, spawnPos: Vec2, currentTime: number): Mob {
  const mobDef = MOB_DEFINITIONS[type];
  return {
    id: `mob_${currentTime}_${Math.random()}`,
    pos: Grid.gridToWorld(spawnPos.x, spawnPos.y),
    hp: mobDef.hp,
    maxHp: mobDef.hp,
    speed: mobDef.speed,
    armor: mobDef.armor,
    bounty: mobDef.bounty,
    type: mobDef.type,
    pathProgress: 0,
    isDead: false,
    reachedEnd: false,
  };
}

/**
 * Create a new projectile
 */
function createProjectile(tower: Tower, target: Mob, currentTime: number): Projectile {
  return {
    id: `projectile_${currentTime}_${Math.random()}`,
    pos: { ...tower.tile },
    targetId: target.id,
    speed: tower.projectileSpeed || 5,
    damage: tower.damage,
    splashRadius: tower.splashRadius,
    towerId: tower.id,
    createdAt: currentTime,
  };
}

/**
 * Create initial game state
 */
export function createInitialGame(): Game {
  const map = createDefaultMap();
  
  return {
    time: 0,
    state: 'menu',
    speed: 0.5,
    mobs: [],
    towers: [],
    projectiles: [],
    waves: WAVE_DEFINITIONS.map(wave => ({
      ...wave,
      isActive: false,
      isComplete: false,
      currentEntryIndex: 0,
      currentSpawnCount: 0,
    })),
    currentWave: 0,
    totalWaves: WAVE_DEFINITIONS.length,
    money: 200,
    lives: 100,
    score: 0,
    map,
    lastTickTime: 0,
    frameTime: 0,
    tickCount: 0,
  };
}

/**
 * Start the next wave
 */
export function startNextWave(game: Game): Game {
  const newGame = { ...game };
  
  if (newGame.currentWave < newGame.totalWaves) {
    newGame.currentWave++;
    newGame.state = 'playing';
    
    // Actually start the wave
    const wave = newGame.waves[newGame.currentWave - 1];
    if (wave) {
      wave.isActive = true;
      wave.startTime = newGame.time;
      wave.nextSpawnTime = newGame.time;
    }
  }
  
  return newGame;
}

/**
 * Pause/resume the game
 */
export function togglePause(game: Game): Game {
  const newGame = { ...game };
  
  if (newGame.state === 'playing') {
    newGame.state = 'paused';
  } else if (newGame.state === 'paused') {
    newGame.state = 'playing';
  }
  
  return newGame;
}

/**
 * Set game speed
 */
export function setGameSpeed(game: Game, speed: 0.5 | 1 | 2): Game {
  return { ...game, speed };
}

/**
 * Place a tower
 */
export function placeTower(game: Game, pos: Vec2, towerType: string): Game {
  const newGame = { ...game };
  const towerDef = TOWER_DEFINITIONS[towerType];
  
  if (!towerDef || newGame.money < towerDef.baseCost) {
    return newGame;
  }
  
  // Check if position is buildable
  if (!isBuildable(newGame.map, pos)) {
    return newGame;
  }
  
  // Check if position is already occupied
  const existingTower = newGame.towers.find(t => 
    t.tile.x === pos.x && t.tile.y === pos.y
  );
  
  if (existingTower) {
    return newGame;
  }
  
  // Create tower
  const tower: Tower = {
    id: `tower_${newGame.time}_${Math.random()}`,
    tile: pos,
    range: towerDef.baseStats.range,
    rate: towerDef.baseStats.rate,
    damage: towerDef.baseStats.damage,
    projectileSpeed: towerDef.baseStats.projectileSpeed,
    lastFiredAt: 0,
    kind: towerDef.type,
    tier: 1,
    cost: towerDef.baseCost,
    splashRadius: towerDef.baseStats.splashRadius,
    slowDuration: towerDef.baseStats.slowDuration,
    slowAmount: towerDef.baseStats.slowAmount,
  };
  
  newGame.towers.push(tower);
  newGame.money -= towerDef.baseCost;
  
  return newGame;
}


