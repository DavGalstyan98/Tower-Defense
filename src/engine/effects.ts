/**
 * Combat effects system for slows, DoT, and other status effects
 */

import type { Mob, Tower } from './types';

/**
 * Apply slow effect to a mob
 */
export function applySlow(mob: Mob, duration: number, amount: number, currentTime: number): Mob {
  // Slow stacking rule: use the strongest slow effect
  const newSlowUntil = currentTime + duration;
  const newSlowMultiplier = Math.max(0.1, amount); // Minimum 10% speed
  
  // If there's already a slow effect, use the stronger one
  if (mob.slowUntil && mob.slowUntil > currentTime) {
    // Keep existing slow if it's stronger or longer
    if (mob.slowMultiplier && mob.slowMultiplier < newSlowMultiplier) {
      return mob; // Existing slow is stronger
    }
    if (mob.slowUntil > newSlowUntil) {
      return mob; // Existing slow lasts longer
    }
  }
  
  return {
    ...mob,
    slowUntil: newSlowUntil,
    slowMultiplier: newSlowMultiplier,
  };
}

/**
 * Update mob speed based on current slow effects
 */
export function updateMobSpeed(mob: Mob, currentTime: number): number {
  // Check if slow effect has expired
  if (mob.slowUntil && mob.slowUntil <= currentTime) {
    return mob.speed; // Return to normal speed
  }
  
  // Apply slow multiplier if active
  if (mob.slowMultiplier) {
    return mob.speed * mob.slowMultiplier;
  }
  
  return mob.speed;
}

/**
 * Clean up expired effects on a mob
 */
export function cleanupExpiredEffects(mob: Mob, currentTime: number): Mob {
  if (mob.slowUntil && mob.slowUntil <= currentTime) {
    return {
      ...mob,
      slowUntil: undefined,
      slowMultiplier: undefined,
    };
  }
  
  return mob;
}

/**
 * Get effective damage after armor reduction
 */
export function getEffectiveDamage(baseDamage: number, armor: number): number {
  // Armor provides flat damage reduction, minimum 1 damage
  return Math.max(1, baseDamage - armor);
}

/**
 * Apply damage to a mob and return updated mob
 */
export function applyDamage(mob: Mob, damage: number): Mob {
  const newHp = Math.max(0, mob.hp - damage);
  return {
    ...mob,
    hp: newHp,
    isDead: newHp <= 0,
  };
}

/**
 * Check if a mob is currently slowed
 */
export function isSlowed(mob: Mob, currentTime: number): boolean {
  return !!(mob.slowUntil && mob.slowUntil > currentTime && mob.slowMultiplier);
}

/**
 * Get slow duration remaining
 */
export function getSlowDurationRemaining(mob: Mob, currentTime: number): number {
  if (!mob.slowUntil || mob.slowUntil <= currentTime) {
    return 0;
  }
  return mob.slowUntil - currentTime;
}

/**
 * Calculate DPS (Damage Per Second) for a tower
 */
export function calculateTowerDPS(tower: Tower): number {
  return tower.damage * tower.rate;
}

/**
 * Calculate effective DPS considering armor
 */
export function calculateEffectiveDPS(tower: Tower, averageArmor: number = 0): number {
  const effectiveDamage = getEffectiveDamage(tower.damage, averageArmor);
  return effectiveDamage * tower.rate;
}

/**
 * Get tower upgrade cost
 */
export function getTowerUpgradeCost(tower: Tower): number {
  // Simple cost scaling: base cost * tier^2
  const baseCost = 50; // This should come from tower definitions
  return Math.floor(baseCost * Math.pow(tower.tier + 1, 2));
}

/**
 * Check if tower can be upgraded
 */
export function canUpgradeTower(tower: Tower, maxTier: number = 3): boolean {
  return tower.tier < maxTier;
}

/**
 * Apply tower upgrade
 */
export function upgradeTower(tower: Tower): Tower {
  if (!canUpgradeTower(tower)) {
    return tower;
  }
  
  const newTier = (tower.tier + 1) as 1 | 2 | 3;
  const upgradeMultiplier = 1.5; // 50% stat increase per tier
  
  return {
    ...tower,
    tier: newTier,
    damage: Math.floor(tower.damage * upgradeMultiplier),
    range: tower.range * 1.2, // 20% range increase
    rate: tower.rate * 1.1, // 10% rate increase
    cost: getTowerUpgradeCost(tower),
  };
}
