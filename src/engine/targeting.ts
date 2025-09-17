/**
 * Tower targeting strategies and target selection
 */

import type { Tower, Mob, TargetingStrategy, Vec2 } from './types';
import { Grid } from './grid';

/**
 * Find the best target for a tower based on its targeting strategy
 */
export function findTarget(tower: Tower, mobs: Mob[], strategy: TargetingStrategy): Mob | null {
  const inRange = mobs.filter(mob => 
    !mob.isDead && 
    !mob.reachedEnd && 
    Grid.distance(tower.tile, mob.pos) <= tower.range
  );

  if (inRange.length === 0) return null;

  switch (strategy) {
    case 'first':
      return findFirstTarget(inRange);
    case 'last':
      return findLastTarget(inRange);
    case 'strongest':
      return findStrongestTarget(inRange);
    case 'weakest':
      return findWeakestTarget(inRange);
    case 'nearest':
      return findNearestTarget(inRange, tower.tile);
    default:
      return findFirstTarget(inRange);
  }
}

/**
 * Find the first mob in the path (highest path progress)
 */
function findFirstTarget(mobs: Mob[]): Mob | null {
  let best: Mob | null = null;
  let bestProgress = -1;

  for (const mob of mobs) {
    if (mob.pathProgress > bestProgress) {
      bestProgress = mob.pathProgress;
      best = mob;
    }
  }

  return best;
}

/**
 * Find the last mob in the path (lowest path progress)
 */
function findLastTarget(mobs: Mob[]): Mob | null {
  let best: Mob | null = null;
  let bestProgress = 2; // Higher than any valid progress

  for (const mob of mobs) {
    if (mob.pathProgress < bestProgress) {
      bestProgress = mob.pathProgress;
      best = mob;
    }
  }

  return best;
}

/**
 * Find the strongest mob (highest HP)
 */
function findStrongestTarget(mobs: Mob[]): Mob | null {
  let best: Mob | null = null;
  let bestHp = -1;

  for (const mob of mobs) {
    if (mob.hp > bestHp) {
      bestHp = mob.hp;
      best = mob;
    }
  }

  return best;
}

/**
 * Find the weakest mob (lowest HP)
 */
function findWeakestTarget(mobs: Mob[]): Mob | null {
  let best: Mob | null = null;
  let bestHp = Infinity;

  for (const mob of mobs) {
    if (mob.hp < bestHp) {
      bestHp = mob.hp;
      best = mob;
    }
  }

  return best;
}

/**
 * Find the nearest mob to the tower
 */
function findNearestTarget(mobs: Mob[], towerPos: Vec2): Mob | null {
  let best: Mob | null = null;
  let bestDistance = Infinity;

  for (const mob of mobs) {
    const distance = Grid.distanceSquared(towerPos, mob.pos);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = mob;
    }
  }

  return best;
}

/**
 * Get all mobs within splash radius for AoE attacks
 */
export function getMobsInSplashRadius(
  center: Vec2, 
  radius: number, 
  mobs: Mob[]
): Mob[] {
  return mobs.filter(mob => 
    !mob.isDead && 
    !mob.reachedEnd && 
    Grid.distance(center, mob.pos) <= radius
  );
}

/**
 * Calculate damage with armor reduction
 */
export function calculateDamage(baseDamage: number, armor: number): number {
  return Math.max(1, baseDamage - armor);
}

/**
 * Apply splash damage with falloff
 */
export function applySplashDamage(
  center: Vec2,
  radius: number,
  baseDamage: number,
  mobs: Mob[]
): Array<{ mob: Mob; damage: number }> {
  const results: Array<{ mob: Mob; damage: number }> = [];
  
  for (const mob of mobs) {
    if (mob.isDead || mob.reachedEnd) continue;
    
    const distance = Grid.distance(center, mob.pos);
    if (distance <= radius) {
      // Linear falloff: damage decreases from 100% at center to 50% at edge
      const falloff = 1 - (distance / radius) * 0.5;
      const damage = Math.max(1, Math.floor(baseDamage * falloff));
      results.push({ mob, damage });
    }
  }
  
  return results;
}
