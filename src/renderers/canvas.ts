/**
 * Canvas renderer for Tower Defense game
 * Handles all visual rendering outside of React
 */

import type { Game, Mob, Tower, Projectile, GameMap } from '../engine/types';
import { TILE_SIZE, COLORS } from '../engine/constants';
import { MOB_DEFINITIONS, TOWER_DEFINITIONS } from '../engine/constants';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private pixelRatio: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.pixelRatio = window.devicePixelRatio || 1;
    
    this.setupCanvas();
    this.resize();
  }

  private setupCanvas() {
    // Enable high DPI rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    // Set actual canvas size
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    
    // Scale context for high DPI
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    
    // Set display size
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  render(game: Game) {
    this.clear();
    this.renderBackground();
    this.renderGrid(game.map);
    this.renderPaths(game.map);
    this.renderBuildableTiles(game.map);
    this.renderTowers(game.towers);
    this.renderMobs(game.mobs);
    this.renderProjectiles(game.projectiles);
    this.renderBuildPreview(game);
  }

  /**
   * Optimized render method for performance
   */
  renderOptimized(game: Game) {
    // Only clear if needed
    if (this.needsClear) {
      this.clear();
      this.needsClear = false;
    }
    
    // Render in layers for better performance
    this.renderBackground();
    this.renderGrid(game.map);
    this.renderPaths(game.map);
    this.renderBuildableTiles(game.map);
    
    // Batch render entities
    this.renderEntitiesBatch(game.towers, game.mobs, game.projectiles);
    
    // Render UI elements
    this.renderBuildPreview(game);
  }

  private needsClear = true;
  private lastFrameEntities = 0;

  private renderEntitiesBatch(towers: Tower[], mobs: Mob[], projectiles: Projectile[]) {
    const totalEntities = towers.length + mobs.length + projectiles.length;
    
    // Only re-render if entity count changed significantly
    if (Math.abs(totalEntities - this.lastFrameEntities) > 5) {
      this.needsClear = true;
      this.lastFrameEntities = totalEntities;
    }
    
    this.renderTowers(towers);
    this.renderMobs(mobs);
    this.renderProjectiles(projectiles);
  }

  private clear() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private renderBackground() {
    // Optional: render a subtle pattern or gradient
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private renderGrid(map: GameMap) {
    this.ctx.strokeStyle = COLORS.grid;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;

    // Vertical lines
    for (let x = 0; x <= map.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * TILE_SIZE, 0);
      this.ctx.lineTo(x * TILE_SIZE, map.height * TILE_SIZE);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= map.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * TILE_SIZE);
      this.ctx.lineTo(map.width * TILE_SIZE, y * TILE_SIZE);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
  }

  private renderPaths(map: GameMap) {
    this.ctx.fillStyle = COLORS.path;
    
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x] === 'path') {
          this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Render path arrows
    this.ctx.fillStyle = COLORS.text;
    this.ctx.globalAlpha = 0.5;
    
    for (const path of map.paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        
        const centerX = (current.x + 0.5) * TILE_SIZE;
        const centerY = (current.y + 0.5) * TILE_SIZE;
        
        // Draw arrow
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + 8, centerY - 4);
        this.ctx.lineTo(centerX + 8, centerY + 4);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
    
    this.ctx.globalAlpha = 1;
  }

  private renderTowers(towers: Tower[]) {
    for (const tower of towers) {
      this.renderTower(tower);
    }
  }

  private renderTower(tower: Tower) {
    const x = tower.tile.x * TILE_SIZE;
    const y = tower.tile.y * TILE_SIZE;
    const centerX = x + TILE_SIZE / 2;
    const centerY = y + TILE_SIZE / 2;

    // Tower base
    this.ctx.fillStyle = COLORS.tower;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, TILE_SIZE * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Tower tier indicator
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(tower.tier.toString(), centerX, centerY + 4);

    // Range circle (when selected)
    if (tower.id === 'selected') { // This would come from game state
      this.ctx.strokeStyle = COLORS.tower;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.3;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, tower.range * TILE_SIZE, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }

    // Tower type indicator
    const typeColors = {
      arrow: '#4ade80',
      cannon: '#f59e0b',
      frost: '#3b82f6',
    };
    
    this.ctx.fillStyle = typeColors[tower.kind] || COLORS.tower;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, TILE_SIZE * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderMobs(mobs: Mob[]) {
    for (const mob of mobs) {
      if (mob.isDead) continue;
      
      this.renderMob(mob);
    }
  }

  private renderMob(mob: Mob) {
    const mobDef = MOB_DEFINITIONS[mob.type];
    const x = mob.pos.x * TILE_SIZE;
    const y = mob.pos.y * TILE_SIZE;
    const size = mobDef.size * TILE_SIZE * 0.6;

    // Mob body
    this.ctx.fillStyle = mobDef.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();

    // Health bar
    const barWidth = size * 2;
    const barHeight = 4;
    const barY = y - size - 8;

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

    // Health
    const healthRatio = mob.hp / mob.maxHp;
    this.ctx.fillStyle = healthRatio > 0.5 ? '#4ade80' : healthRatio > 0.25 ? '#f59e0b' : '#ef4444';
    this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthRatio, barHeight);

    // Slow effect indicator
    if (mob.slowUntil && mob.slowUntil > 0) {
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.7;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size + 2, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }
  }

  private renderProjectiles(projectiles: Projectile[]) {
    for (const projectile of projectiles) {
      this.renderProjectile(projectile);
    }
  }

  private renderProjectile(projectile: Projectile) {
    const x = projectile.pos.x * TILE_SIZE;
    const y = projectile.pos.y * TILE_SIZE;

    this.ctx.fillStyle = COLORS.projectile;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Projectile trail
    this.ctx.strokeStyle = COLORS.projectile;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - 8, y - 8);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }

  private renderBuildableTiles(map: GameMap) {
    this.ctx.fillStyle = COLORS.buildable;
    this.ctx.globalAlpha = 0.3;
    
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.tiles[y][x] === 'buildable') {
          this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    this.ctx.globalAlpha = 1;
  }

  private renderBuildPreview(game: Game) {
    if (!game.buildMode || !game.hoveredTile) return;

    // Check if map and tiles exist
    if (!game.map || !game.map.tiles) return;

    // Check if hovered tile is within map bounds
    if (game.hoveredTile.x < 0 || game.hoveredTile.x >= game.map.width || 
        game.hoveredTile.y < 0 || game.hoveredTile.y >= game.map.height) {
      return;
    }

    // Additional safety check for array bounds
    if (!game.map.tiles[game.hoveredTile.y] || 
        game.hoveredTile.x >= game.map.tiles[game.hoveredTile.y].length) {
      return;
    }

    const x = game.hoveredTile.x * TILE_SIZE;
    const y = game.hoveredTile.y * TILE_SIZE;
    const centerX = x + TILE_SIZE / 2;
    const centerY = y + TILE_SIZE / 2;

    // Check if position is buildable
    const isBuildable = game.map.tiles[game.hoveredTile.y][game.hoveredTile.x] === 'buildable';
    const isOccupied = game.towers.some(t => 
      t.tile.x === game.hoveredTile!.x && t.tile.y === game.hoveredTile!.y
    );

    const canBuild = isBuildable && !isOccupied;
    const color = canBuild ? COLORS.success : COLORS.error;

    // Preview tower
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, TILE_SIZE * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Range preview
    const towerDef = TOWER_DEFINITIONS[game.buildMode];
    if (towerDef) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.3;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, towerDef.baseStats.range * TILE_SIZE, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX / TILE_SIZE,
      y: screenY / TILE_SIZE,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * TILE_SIZE,
      y: worldY * TILE_SIZE,
    };
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
