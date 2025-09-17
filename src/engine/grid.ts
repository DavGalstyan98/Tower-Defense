/**
 * Grid system and pathfinding for Tower Defense
 * Implements A* pathfinding and grid utilities
 */

import type { Vec2, GameMap, TileType } from './types';
import { MAP_SIZE } from './constants';

/**
 * Grid utilities for coordinate conversion and validation
 */
export class Grid {
  static isValid(x: number, y: number): boolean {
    return x >= 0 && x < MAP_SIZE.width && y >= 0 && y < MAP_SIZE.height;
  }

  static isValidVec(pos: Vec2): boolean {
    return this.isValid(pos.x, pos.y);
  }

  static worldToGrid(worldX: number, worldY: number): Vec2 {
    return {
      x: Math.floor(worldX),
      y: Math.floor(worldY),
    };
  }

  static gridToWorld(gridX: number, gridY: number): Vec2 {
    return {
      x: gridX + 0.5,
      y: gridY + 0.5,
    };
  }

  static distance(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static distanceSquared(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  static getNeighbors(pos: Vec2): Vec2[] {
    const neighbors: Vec2[] = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
    ];

    for (const dir of directions) {
      const neighbor = { x: pos.x + dir.x, y: pos.y + dir.y };
      if (this.isValidVec(neighbor)) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  static getNeighbors8(pos: Vec2): Vec2[] {
    const neighbors: Vec2[] = [];
    const directions = [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 },                   { x: 1, y: 0 },
      { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 },
    ];

    for (const dir of directions) {
      const neighbor = { x: pos.x + dir.x, y: pos.y + dir.y };
      if (this.isValidVec(neighbor)) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }
}

/**
 * A* pathfinding implementation
 */
export class Pathfinder {
  private map: GameMap;

  constructor(map: GameMap) {
    this.map = map;
  }

  /**
   * Find path from start to end using A* algorithm
   */
  findPath(start: Vec2, end: Vec2): Vec2[] {
    if (!Grid.isValidVec(start) || !Grid.isValidVec(end)) {
      return [];
    }

    const openSet: AStarNode[] = [];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, AStarNode>();

    const startNode = new AStarNode(start, 0, this.heuristic(start, end), null);
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f cost
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = this.nodeKey(current.pos);

      if (this.isGoal(current.pos, end)) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      const neighbors = Grid.getNeighbors(current.pos);
      for (const neighborPos of neighbors) {
        const neighborKey = this.nodeKey(neighborPos);

        if (closedSet.has(neighborKey) || !this.isWalkable(neighborPos)) {
          continue;
        }

        const tentativeG = current.g + 1;
        const existingNode = openSet.find(n => this.nodeKey(n.pos) === neighborKey);

        if (!existingNode) {
          const h = this.heuristic(neighborPos, end);
          const neighborNode = new AStarNode(neighborPos, tentativeG, h, current);
          openSet.push(neighborNode);
          cameFrom.set(neighborKey, neighborNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.parent = current;
        }
      }
    }

    return []; // No path found
  }

  /**
   * Find multiple paths from spawn points to base
   */
  findMultiplePaths(): Vec2[][] {
    const paths: Vec2[][] = [];

    for (const spawnPoint of this.map.spawnPoints) {
      const path = this.findPath(spawnPoint, this.map.basePosition);
      if (path.length > 0) {
        paths.push(path);
      }
    }

    return paths;
  }

  private isWalkable(pos: Vec2): boolean {
    if (!Grid.isValidVec(pos)) return false;
    const tile = this.map.tiles[pos.y][pos.x];
    return tile === 'path' || tile === 'buildable';
  }

  private isGoal(pos: Vec2, end: Vec2): boolean {
    return pos.x === end.x && pos.y === end.y;
  }

  private heuristic(a: Vec2, b: Vec2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
  }

  private nodeKey(pos: Vec2): string {
    return `${pos.x},${pos.y}`;
  }

  private reconstructPath(node: AStarNode): Vec2[] {
    const path: Vec2[] = [];
    let current: AStarNode | null = node;

    while (current) {
      path.unshift(current.pos);
      current = current.parent;
    }

    return path;
  }
}

/**
 * A* pathfinding node
 */
class AStarNode {
  pos: Vec2;
  g: number; // cost from start
  h: number; // heuristic cost to goal
  parent: AStarNode | null;

  constructor(pos: Vec2, g: number, h: number, parent: AStarNode | null) {
    this.pos = pos;
    this.g = g;
    this.h = h;
    this.parent = parent;
  }

  get f(): number {
    return this.g + this.h;
  }
}

/**
 * Create a default game map with a simple path
 */
export function createDefaultMap(): GameMap {
  const tiles: TileType[][] = [];
  
  // Initialize all tiles as buildable
  for (let y = 0; y < MAP_SIZE.height; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_SIZE.width; x++) {
      tiles[y][x] = 'buildable';
    }
  }

  // Create a simple path from left to right
  const pathY = Math.floor(MAP_SIZE.height / 2);
  for (let x = 0; x < MAP_SIZE.width; x++) {
    tiles[pathY][x] = 'path';
  }

  // Add some blocked tiles for variety
  tiles[pathY - 2][5] = 'blocked';
  tiles[pathY - 2][6] = 'blocked';
  tiles[pathY + 2][8] = 'blocked';
  tiles[pathY + 2][9] = 'blocked';

  const spawnPoints: Vec2[] = [{ x: 0, y: pathY }];
  const basePosition: Vec2 = { x: MAP_SIZE.width - 1, y: pathY };

  const map: GameMap = {
    width: MAP_SIZE.width,
    height: MAP_SIZE.height,
    tiles,
    paths: [],
    spawnPoints,
    basePosition,
  };

  // Generate paths
  const pathfinder = new Pathfinder(map);
  map.paths = pathfinder.findMultiplePaths();

  return map;
}

/**
 * Check if a position is buildable
 */
export function isBuildable(map: GameMap, pos: Vec2): boolean {
  if (!Grid.isValidVec(pos)) return false;
  return map.tiles[pos.y][pos.x] === 'buildable';
}

/**
 * Get tile type at position
 */
export function getTileType(map: GameMap, pos: Vec2): TileType {
  if (!Grid.isValidVec(pos)) return 'blocked';
  return map.tiles[pos.y][pos.x];
}
