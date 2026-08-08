/**
 * Voxel — the core coordinate type for 3D grid positions.
 */
export interface Voxel {
  x: number;
  y: number;
  z: number;
}

/**
 * Represents a voxel with a value payload — used in grids and volumes.
 */
export interface VoxelCell<T = unknown> extends Voxel {
  value: T;
}

/**
 * The 6 face-adjacent directions in 3D space.
 */
export const FACES: readonly Voxel[] = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
] as const;

/**
 * The 26 directions covering all neighbors in a 3×3×3 cube (excluding center).
 */
export const NEIGHBOR_OFFSETS: readonly Voxel[] = (() => {
  const offsets: Voxel[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        offsets.push({ x: dx, y: dy, z: dz });
      }
    }
  }
  return offsets;
})();

// ── Coordinate helpers ──────────────────────────────────────────────

/**
 * Create a voxel coordinate.
 */
export function voxel(x: number, y: number, z: number): Voxel {
  return { x, y, z };
}

/**
 * Check if two voxels are equal.
 */
export function voxEq(a: Voxel, b: Voxel): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

/**
 * Add two voxel offsets.
 */
export function voxAdd(a: Voxel, b: Voxel): Voxel {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/**
 * Subtract voxel b from voxel a.
 */
export function voxSub(a: Voxel, b: Voxel): Voxel {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * Scale a voxel by a scalar.
 */
export function voxScale(v: Voxel, s: number): Voxel {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

/**
 * Manhattan distance between two voxels.
 */
export function manhattan(a: Voxel, b: Voxel): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

/**
 * Chebyshev (chessboard) distance between two voxels — the max axis delta.
 */
export function chebyshev(a: Voxel, b: Voxel): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}

/**
 * Euclidean distance between two voxels.
 */
export function euclidean(a: Voxel, b: Voxel): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Encode a voxel coordinate to a unique string key.
 */
export function voxKey(v: Voxel): string {
  return `${v.x},${v.y},${v.z}`;
}

/**
 * Decode a string key back to a voxel coordinate.
 */
export function fromKey(key: string): Voxel {
  const [x, y, z] = key.split(',').map(Number);
  return { x, y, z };
}

// ── Bounding box ────────────────────────────────────────────────────

/**
 * Axis-aligned bounding box in voxel space.
 */
export interface VoxelBounds {
  min: Voxel;
  max: Voxel;
}

/**
 * Create a bounding box from two corner voxels.
 */
export function boundsFrom(a: Voxel, b: Voxel): VoxelBounds {
  return {
    min: {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      z: Math.min(a.z, b.z),
    },
    max: {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      z: Math.max(a.z, b.z),
    },
  };
}

/**
 * Check if a voxel is inside a bounding box (inclusive).
 */
export function inBounds(v: Voxel, bounds: VoxelBounds): boolean {
  return (
    v.x >= bounds.min.x && v.x <= bounds.max.x &&
    v.y >= bounds.min.y && v.y <= bounds.max.y &&
    v.z >= bounds.min.z && v.z <= bounds.max.z
  );
}

/**
 * Get all voxels within a bounding box.
 */
export function voxelsInBounds(bounds: VoxelBounds): Voxel[] {
  const result: Voxel[] = [];
  for (let x = bounds.min.x; x <= bounds.max.x; x++) {
    for (let y = bounds.min.y; y <= bounds.max.y; y++) {
      for (let z = bounds.min.z; z <= bounds.max.z; z++) {
        result.push({ x, y, z });
      }
    }
  }
  return result;
}

/**
 * Volume (number of voxels) in a bounding box.
 */
export function boundsVolume(bounds: VoxelBounds): number {
  const w = bounds.max.x - bounds.min.x + 1;
  const h = bounds.max.y - bounds.min.y + 1;
  const d = bounds.max.z - bounds.min.z + 1;
  return w * h * d;
}

// ── Neighbor queries ────────────────────────────────────────────────

/**
 * Get the 6 face-adjacent neighbors of a voxel.
 */
export function faceNeighbors(v: Voxel): Voxel[] {
  return FACES.map((f) => voxAdd(v, f));
}

/**
 * Get all 26 neighbors (Moore neighborhood) of a voxel.
 */
export function allNeighbors(v: Voxel): Voxel[] {
  return NEIGHBOR_OFFSETS.map((o) => voxAdd(v, o));
}

/**
 * Get face neighbors that are within the given bounds.
 */
export function boundedFaceNeighbors(v: Voxel, bounds: VoxelBounds): Voxel[] {
  return faceNeighbors(v).filter((n) => inBounds(n, bounds));
}

/**
 * Get all neighbors that are within the given bounds.
 */
export function boundedAllNeighbors(v: Voxel, bounds: VoxelBounds): Voxel[] {
  return allNeighbors(v).filter((n) => inBounds(n, bounds));
}

// ── VoxelGrid — sparse storage ──────────────────────────────────────

/**
 * A sparse voxel grid storing arbitrary values per coordinate.
 */
export class VoxelGrid<T = boolean> {
  private cells: Map<string, T> = new Map();

  /**
   * Number of occupied cells.
   */
  get size(): number {
    return this.cells.size;
  }

  /**
   * Set a value at a voxel coordinate.
   */
  set(v: Voxel, value: T): void {
    this.cells.set(voxKey(v), value);
  }

  /**
   * Get the value at a voxel coordinate, or undefined.
   */
  get(v: Voxel): T | undefined {
    return this.cells.get(voxKey(v));
  }

  /**
   * Check if a voxel is occupied.
   */
  has(v: Voxel): boolean {
    return this.cells.has(voxKey(v));
  }

  /**
   * Remove a voxel.
   */
  delete(v: Voxel): boolean {
    return this.cells.delete(voxKey(v));
  }

  /**
   * Clear all voxels.
   */
  clear(): void {
    this.cells.clear();
  }

  /**
   * Iterate over all occupied voxels and their values.
   */
  *entries(): IterableIterator<[Voxel, T]> {
    for (const [key, value] of this.cells) {
      yield [fromKey(key), value];
    }
  }

  /**
   * Iterate over all occupied voxel coordinates.
   */
  *voxels(): IterableIterator<Voxel> {
    for (const key of this.cells.keys()) {
      yield fromKey(key);
    }
  }

  /**
   * Iterate over all values.
   */
  *values(): IterableIterator<T> {
    yield* this.cells.values();
  }

  /**
   * Get the bounding box of all occupied voxels.
   * Returns undefined if the grid is empty.
   */
  bounds(): VoxelBounds | undefined {
    if (this.cells.size === 0) return undefined;
    let min: Voxel | undefined;
    let max: Voxel | undefined;
    for (const v of this.voxels()) {
      if (!min) {
        min = { ...v };
        max = { ...v };
      } else {
        min.x = Math.min(min.x, v.x);
        min.y = Math.min(min.y, v.y);
        min.z = Math.min(min.z, v.z);
        max!.x = Math.max(max!.x, v.x);
        max!.y = Math.max(max!.y, v.y);
        max!.z = Math.max(max!.z, v.z);
      }
    }
    return min && max ? { min, max } : undefined;
  }

  /**
   * Check if any voxel in this grid is adjacent (face) to the given voxel.
   */
  hasAdjacent(v: Voxel): boolean {
    return faceNeighbors(v).some((n) => this.has(n));
  }

  /**
   * Get all occupied voxels adjacent (face) to the given voxel.
   */
  adjacentTo(v: Voxel): Voxel[] {
    return faceNeighbors(v).filter((n) => this.has(n));
  }

  /**
   * Convert to a plain object for serialization.
   */
  toJSON(): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [key, value] of this.cells) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Reconstruct from a serialized object.
   */
  static fromJSON<T>(data: Record<string, T>): VoxelGrid<T> {
    const grid = new VoxelGrid<T>();
    for (const [key, value] of Object.entries(data)) {
      grid.cells.set(key, value);
    }
    return grid;
  }
}

// ── Shapes ──────────────────────────────────────────────────────────

/**
 * Generate all voxels in a filled rectangular box.
 */
export function filledBox(corner: Voxel, size: Voxel): Voxel[] {
  const result: Voxel[] = [];
  for (let dx = 0; dx < size.x; dx++) {
    for (let dy = 0; dy < size.y; dy++) {
      for (let dz = 0; dz < size.z; dz++) {
        result.push({ x: corner.x + dx, y: corner.y + dy, z: corner.z + dz });
      }
    }
  }
  return result;
}

/**
 * Generate only the shell (surface) voxels of a rectangular box.
 */
export function hollowBox(corner: Voxel, size: Voxel): Voxel[] {
  const result: Voxel[] = [];
  const sx = size.x - 1;
  const sy = size.y - 1;
  const sz = size.z - 1;
  for (let dx = 0; dx < size.x; dx++) {
    for (let dy = 0; dy < size.y; dy++) {
      for (let dz = 0; dz < size.z; dz++) {
        const onSurface =
          dx === 0 || dx === sx ||
          dy === 0 || dy === sy ||
          dz === 0 || dz === sz;
        if (onSurface) {
          result.push({ x: corner.x + dx, y: corner.y + dy, z: corner.z + dz });
        }
      }
    }
  }
  return result;
}

/**
 * Generate voxels forming a line from a to b (3D Bresenham).
 */
export function voxelLine(a: Voxel, b: Voxel): Voxel[] {
  const result: Voxel[] = [];
  let { x, y, z } = a;
  const dx = Math.abs(b.x - a.x);
  const dy = Math.abs(b.y - a.y);
  const dz = Math.abs(b.z - a.z);
  const xs = a.x < b.x ? 1 : -1;
  const ys = a.y < b.y ? 1 : -1;
  const zs = a.z < b.z ? 1 : -1;

  // Driving axis is the one with the largest delta
  if (dx >= dy && dx >= dz) {
    let err1 = 2 * dy - dx;
    let err2 = 2 * dz - dx;
    while (x !== b.x) {
      result.push({ x, y, z });
      if (err1 > 0) { y += ys; err1 -= 2 * dx; }
      if (err2 > 0) { z += zs; err2 -= 2 * dx; }
      x += xs;
      err1 += 2 * dy;
      err2 += 2 * dz;
    }
  } else if (dy >= dx && dy >= dz) {
    let err1 = 2 * dx - dy;
    let err2 = 2 * dz - dy;
    while (y !== b.y) {
      result.push({ x, y, z });
      if (err1 > 0) { x += xs; err1 -= 2 * dy; }
      if (err2 > 0) { z += zs; err2 -= 2 * dy; }
      y += ys;
      err1 += 2 * dx;
      err2 += 2 * dz;
    }
  } else {
    let err1 = 2 * dy - dz;
    let err2 = 2 * dx - dz;
    while (z !== b.z) {
      result.push({ x, y, z });
      if (err1 > 0) { y += ys; err1 -= 2 * dz; }
      if (err2 > 0) { x += xs; err2 -= 2 * dz; }
      z += zs;
      err1 += 2 * dy;
      err2 += 2 * dx;
    }
  }
  result.push({ x: b.x, y: b.y, z: b.z });
  return result;
}

/**
 * Generate voxels for a filled sphere of the given radius.
 */
export function filledSphere(center: Voxel, radius: number): Voxel[] {
  const result: Voxel[] = [];
  const r = Math.floor(radius);
  const r2 = radius * radius;
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dz = -r; dz <= r; dz++) {
        if (dx * dx + dy * dy + dz * dz <= r2) {
          result.push({ x: center.x + dx, y: center.y + dy, z: center.z + dz });
        }
      }
    }
  }
  return result;
}

/**
 * Generate only the shell voxels of a sphere.
 */
export function hollowSphere(center: Voxel, radius: number): Voxel[] {
  const result: Voxel[] = [];
  const r = Math.floor(radius);
  const inner = (radius - 1) * (radius - 1);
  const outer = radius * radius;
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dz = -r; dz <= r; dz++) {
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= outer && d2 > inner) {
          result.push({ x: center.x + dx, y: center.y + dy, z: center.z + dz });
        }
      }
    }
  }
  return result;
}

// ── Flood fill / connected components ───────────────────────────────

/**
 * Flood fill from a starting voxel, returning all connected voxels.
 * Connectivity is 6-directional (face-adjacent only).
 */
export function floodFill(
  start: Voxel,
  isOccupied: (v: Voxel) => boolean,
  bounds?: VoxelBounds,
): Voxel[] {
  const visited = new Set<string>();
  const queue: Voxel[] = [start];
  const result: Voxel[] = [];

  while (queue.length > 0) {
    const v = queue.pop()!;
    const key = voxKey(v);
    if (visited.has(key)) continue;
    if (bounds && !inBounds(v, bounds)) continue;
    if (!isOccupied(v)) continue;

    visited.add(key);
    result.push(v);

    for (const n of faceNeighbors(v)) {
      if (!visited.has(voxKey(n))) {
        queue.push(n);
      }
    }
  }

  return result;
}

/**
 * Find connected components in a voxel set.
 * Returns an array of components, each being an array of voxels.
 */
export function connectedComponents(
  voxels: Voxel[],
  bounds?: VoxelBounds,
): Voxel[][] {
  const occupied = new Set(voxels.map(voxKey));
  const visited = new Set<string>();
  const components: Voxel[][] = [];

  const isOccupied = (v: Voxel) => occupied.has(voxKey(v));

  for (const v of voxels) {
    const key = voxKey(v);
    if (visited.has(key)) continue;
    const component = floodFill(v, isOccupied, bounds);
    for (const cv of component) {
      visited.add(voxKey(cv));
    }
    components.push(component);
  }

  return components;
}

// ── Set operations ──────────────────────────────────────────────────

/**
 * Union of two voxel sets.
 */
export function voxUnion(a: Voxel[], b: Voxel[]): Voxel[] {
  const set = new Set(a.map(voxKey));
  const result = [...a];
  for (const v of b) {
    const key = voxKey(v);
    if (!set.has(key)) {
      set.add(key);
      result.push(v);
    }
  }
  return result;
}

/**
 * Intersection of two voxel sets.
 */
export function voxIntersect(a: Voxel[], b: Voxel[]): Voxel[] {
  const setB = new Set(b.map(voxKey));
  return a.filter((v) => setB.has(voxKey(v)));
}

/**
 * Difference: voxels in a but not in b.
 */
export function voxDifference(a: Voxel[], b: Voxel[]): Voxel[] {
  const setB = new Set(b.map(voxKey));
  return a.filter((v) => !setB.has(voxKey(v)));
}

// ── Raycasting ──────────────────────────────────────────────────────

/**
 * Cast a ray through voxel space using Amanatides & Woo's algorithm.
 * Returns all voxels the ray passes through, up to maxDistance.
 *
 * @param origin Starting point in voxel space (can be fractional)
 * @param direction Normalized direction vector
 * @param maxDistance Maximum ray distance
 * @returns Array of voxels the ray traverses
 */
export function raycast(
  origin: Voxel,
  direction: Voxel,
  maxDistance: number = 100,
): Voxel[] {
  const result: Voxel[] = [];
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);

  const stepX = direction.x > 0 ? 1 : direction.x < 0 ? -1 : 0;
  const stepY = direction.y > 0 ? 1 : direction.y < 0 ? -1 : 0;
  const stepZ = direction.z > 0 ? 1 : direction.z < 0 ? -1 : 0;

  const tDeltaX = direction.x !== 0 ? Math.abs(1 / direction.x) : Infinity;
  const tDeltaY = direction.y !== 0 ? Math.abs(1 / direction.y) : Infinity;
  const tDeltaZ = direction.z !== 0 ? Math.abs(1 / direction.z) : Infinity;

  const fracX = origin.x - Math.floor(origin.x);
  const fracY = origin.y - Math.floor(origin.y);
  const fracZ = origin.z - Math.floor(origin.z);

  let tMaxX = direction.x > 0
    ? (1 - fracX) * tDeltaX
    : direction.x < 0
      ? fracX * tDeltaX
      : Infinity;
  let tMaxY = direction.y > 0
    ? (1 - fracY) * tDeltaY
    : direction.y < 0
      ? fracY * tDeltaY
      : Infinity;
  let tMaxZ = direction.z > 0
    ? (1 - fracZ) * tDeltaZ
    : direction.z < 0
      ? fracZ * tDeltaZ
      : Infinity;

  result.push({ x, y, z });

  let traveled = 0;
  while (traveled < maxDistance) {
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      traveled = tMaxX;
      tMaxX += tDeltaX;
    } else if (tMaxY < tMaxZ) {
      y += stepY;
      traveled = tMaxY;
      tMaxY += tDeltaY;
    } else {
      z += stepZ;
      traveled = tMaxZ;
      tMaxZ += tDeltaZ;
    }
    if (traveled > maxDistance) break;
    result.push({ x, y, z });
  }

  return result;
}

// ── Pathfinding (A*) ────────────────────────────────────────────────

/**
 * Find the shortest path between two voxels using A*.
 *
 * @param start Starting voxel
 * @param goal Target voxel
 * @param isPassable Function returning true if a voxel can be traversed
 * @param bounds Optional bounds to limit the search area
 * @returns Array of voxels forming the path, or null if no path found
 */
export function findPath(
  start: Voxel,
  goal: Voxel,
  isPassable: (v: Voxel) => boolean,
  bounds?: VoxelBounds,
): Voxel[] | null {
  const startKey = voxKey(start);
  const goalKey = voxKey(goal);

  if (!isPassable(start) || !isPassable(goal)) return null;

  const openSet = new Map<string, Voxel>();
  openSet.set(startKey, start);

  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  gScore.set(startKey, 0);

  const fScore = new Map<string, number>();
  fScore.set(startKey, manhattan(start, goal));

  while (openSet.size > 0) {
    // Find the node with the lowest f-score
    let currentKey = '';
    let currentF = Infinity;
    let current: Voxel | undefined;
    for (const [key, v] of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < currentF) {
        currentF = f;
        currentKey = key;
        current = v;
      }
    }

    if (!current) break;

    if (currentKey === goalKey) {
      // Reconstruct path
      const path: Voxel[] = [current];
      let ck = currentKey;
      while (cameFrom.has(ck)) {
        ck = cameFrom.get(ck)!;
        path.unshift(fromKey(ck));
      }
      return path;
    }

    openSet.delete(currentKey);

    for (const neighbor of faceNeighbors(current)) {
      if (bounds && !inBounds(neighbor, bounds)) continue;
      if (!isPassable(neighbor)) continue;

      const nKey = voxKey(neighbor);
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + manhattan(neighbor, goal));
        if (!openSet.has(nKey)) {
          openSet.set(nKey, neighbor);
        }
      }
    }
  }

  return null;
}
