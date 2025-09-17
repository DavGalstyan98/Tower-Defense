/**
 * Basic unit tests for game mechanics
 */

import { describe, it, expect } from 'vitest';
import { createInitialGame, advanceTick, placeTower } from '../engine/sim';
import { Grid } from '../engine/grid';
import { findTarget } from '../engine/targeting';
import { applyDamage, getEffectiveDamage } from '../engine/effects';

describe('Game Engine', () => {
  it('should create initial game state', () => {
    const game = createInitialGame();
    
    expect(game.state).toBe('menu');
    expect(game.money).toBe(100);
    expect(game.lives).toBe(20);
    expect(game.currentWave).toBe(0);
    expect(game.mobs).toHaveLength(0);
    expect(game.towers).toHaveLength(0);
    expect(game.projectiles).toHaveLength(0);
  });

  it('should advance game time', () => {
    const game = createInitialGame();
    const initialTime = game.time;
    
    const newGame = advanceTick(game, 16.666);
    
    expect(newGame.time).toBeGreaterThan(initialTime);
    expect(newGame.tickCount).toBe(1);
  });

  it('should place towers correctly', () => {
    const game = createInitialGame();
    // Use a position that should be buildable (not on the path)
    const pos = { x: 1, y: 1 };
    
    const newGame = placeTower(game, pos, 'arrow');
    
    expect(newGame.towers).toHaveLength(1);
    expect(newGame.towers[0].tile).toEqual(pos);
    expect(newGame.towers[0].kind).toBe('arrow');
    expect(newGame.money).toBeLessThan(game.money);
  });

  it('should not place towers on invalid positions', () => {
    const game = createInitialGame();
    const invalidPos = { x: -1, y: -1 };
    
    const newGame = placeTower(game, invalidPos, 'arrow');
    
    expect(newGame.towers).toHaveLength(0);
    expect(newGame.money).toBe(game.money);
  });
});

describe('Grid System', () => {
  it('should validate grid positions', () => {
    expect(Grid.isValid(0, 0)).toBe(true);
    expect(Grid.isValid(19, 14)).toBe(true);
    expect(Grid.isValid(-1, 0)).toBe(false);
    expect(Grid.isValid(0, -1)).toBe(false);
    expect(Grid.isValid(20, 0)).toBe(false);
    expect(Grid.isValid(0, 15)).toBe(false);
  });

  it('should calculate distances correctly', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    
    expect(Grid.distance(a, b)).toBe(5);
    expect(Grid.distanceSquared(a, b)).toBe(25);
  });
});

describe('Targeting System', () => {
  it('should find targets in range', () => {
    const tower = {
      id: 'tower1',
      tile: { x: 5, y: 5 },
      range: 3,
      rate: 1,
      damage: 25,
      lastFiredAt: 0,
      kind: 'arrow' as const,
      tier: 1 as const,
      cost: 50,
    };

    const mobs = [
      {
        id: 'mob1',
        pos: { x: 6, y: 6 },
        hp: 50,
        maxHp: 50,
        speed: 1,
        armor: 0,
        bounty: 10,
        type: 'normal' as const,
        pathProgress: 0.5,
        isDead: false,
        reachedEnd: false,
      },
      {
        id: 'mob2',
        pos: { x: 10, y: 10 },
        hp: 50,
        maxHp: 50,
        speed: 1,
        armor: 0,
        bounty: 10,
        type: 'normal' as const,
        pathProgress: 0.3,
        isDead: false,
        reachedEnd: false,
      },
    ];

    const target = findTarget(tower, mobs, 'first');
    
    expect(target).toBeTruthy();
    expect(target?.id).toBe('mob1');
  });
});

describe('Combat Effects', () => {
  it('should calculate effective damage with armor', () => {
    expect(getEffectiveDamage(25, 0)).toBe(25);
    expect(getEffectiveDamage(25, 5)).toBe(20);
    expect(getEffectiveDamage(25, 30)).toBe(1);
  });

  it('should apply damage to mobs', () => {
    const mob = {
      id: 'mob1',
      pos: { x: 0, y: 0 },
      hp: 50,
      maxHp: 50,
      speed: 1,
      armor: 0,
      bounty: 10,
      type: 'normal' as const,
      pathProgress: 0,
      isDead: false,
      reachedEnd: false,
    };

    const damagedMob = applyDamage(mob, 25);
    
    expect(damagedMob.hp).toBe(25);
    expect(damagedMob.isDead).toBe(false);

    const deadMob = applyDamage(mob, 50);
    
    expect(deadMob.hp).toBe(0);
    expect(deadMob.isDead).toBe(true);
  });
});
