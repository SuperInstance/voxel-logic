import {
  Voxel,
  voxel,
  voxEq,
  voxAdd,
  voxSub,
  voxScale,
  manhattan,
  chebyshev,
  euclidean,
  voxKey,
  fromKey,
  FACES,
  NEIGHBOR_OFFSETS,
  faceNeighbors,
  allNeighbors,
  boundedFaceNeighbors,
  boundedAllNeighbors,
  VoxelGrid,
  VoxelBounds,
  boundsFrom,
  inBounds,
  voxelsInBounds,
  boundsVolume,
  filledBox,
  hollowBox,
  voxelLine,
  filledSphere,
  hollowSphere,
  floodFill,
  connectedComponents,
  voxUnion,
  voxIntersect,
  voxDifference,
  raycast,
  findPath,
} from '../src';

// ─────────────────────────────────────────────────────────────────────
// 1. Bounded neighbor functions
// ─────────────────────────────────────────────────────────────────────
describe('Bounded neighbor functions', () => {
  const bounds: VoxelBounds = boundsFrom(voxel(0, 0, 0), voxel(4, 4, 4));

  test('boundedFaceNeighbors returns only in-bounds face neighbors', () => {
    // Center of the grid — all 6 face neighbors are in bounds
    const center = boundedFaceNeighbors(voxel(2, 2, 2), bounds);
    expect(center).toHaveLength(6);

    // Corner — only 3 face neighbors are in bounds
    const corner = boundedFaceNeighbors(voxel(0, 0, 0), bounds);
    expect(corner).toHaveLength(3);
    const cornerKeys = corner.map(voxKey).sort();
    expect(cornerKeys).toEqual(['0,0,1', '0,1,0', '1,0,0']);
  });

  test('boundedFaceNeighbors at max corner', () => {
    const neighbors = boundedFaceNeighbors(voxel(4, 4, 4), bounds);
    expect(neighbors).toHaveLength(3);
    const keys = neighbors.map(voxKey).sort();
    expect(keys).toEqual(['3,4,4', '4,3,4', '4,4,3']);
  });

  test('boundedAllNeighbors returns only in-bounds neighbors', () => {
    // Center — all 26 neighbors in bounds
    const center = boundedAllNeighbors(voxel(2, 2, 2), bounds);
    expect(center).toHaveLength(26);

    // Corner — only 7 neighbors in bounds (3×3×3 - center - 19 out-of-bounds faces)
    const corner = boundedAllNeighbors(voxel(0, 0, 0), bounds);
    expect(corner).toHaveLength(7);
  });

  test('boundedFaceNeighbors on single-cell bounds', () => {
    const singleBounds = boundsFrom(voxel(5, 5, 5), voxel(5, 5, 5));
    expect(boundedFaceNeighbors(voxel(5, 5, 5), singleBounds)).toHaveLength(0);
  });

  test('boundedAllNeighbors on single-cell bounds', () => {
    const singleBounds = boundsFrom(voxel(5, 5, 5), voxel(5, 5, 5));
    expect(boundedAllNeighbors(voxel(5, 5, 5), singleBounds)).toHaveLength(0);
  });

  test('bounded neighbors with negative-coordinate bounds', () => {
    const negBounds = boundsFrom(voxel(-3, -3, -3), voxel(-1, -1, -1));
    // Center of negative bounds
    const neighbors = boundedFaceNeighbors(voxel(-2, -2, -2), negBounds);
    expect(neighbors).toHaveLength(6);
    // Corner
    const cornerNeighbors = boundedFaceNeighbors(voxel(-3, -3, -3), negBounds);
    expect(cornerNeighbors).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. VoxelGrid: clear(), entries(), voxels(), values() iterators
// ─────────────────────────────────────────────────────────────────────
describe('VoxelGrid iterators and clear', () => {
  test('clear removes all cells', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(1, 1, 1), 10);
    grid.set(voxel(2, 2, 2), 20);
    expect(grid.size).toBe(2);
    grid.clear();
    expect(grid.size).toBe(0);
    expect(grid.has(voxel(1, 1, 1))).toBe(false);
  });

  test('entries yields [Voxel, value] pairs', () => {
    const grid = new VoxelGrid<string>();
    grid.set(voxel(1, 2, 3), 'a');
    grid.set(voxel(4, 5, 6), 'b');
    const entries = Array.from(grid.entries());
    expect(entries).toHaveLength(2);
    // Each entry is [Voxel, value]
    const sorted = entries.sort((a, b) => a[1].localeCompare(b[1]));
    expect(sorted[0][0]).toEqual({ x: 1, y: 2, z: 3 });
    expect(sorted[0][1]).toBe('a');
    expect(sorted[1][0]).toEqual({ x: 4, y: 5, z: 6 });
    expect(sorted[1][1]).toBe('b');
  });

  test('voxels yields Voxel coordinates', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(7, 8, 9), true);
    grid.set(voxel(-1, -2, -3), true);
    const coords = Array.from(grid.voxels());
    expect(coords).toHaveLength(2);
    const keys = coords.map(voxKey).sort();
    expect(keys).toEqual(['-1,-2,-3', '7,8,9']);
  });

  test('values yields stored values', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(0, 0, 0), 100);
    grid.set(voxel(1, 1, 1), 200);
    const vals = Array.from(grid.values()).sort();
    expect(vals).toEqual([100, 200]);
  });

  test('iterators on empty grid produce nothing', () => {
    const grid = new VoxelGrid();
    expect(Array.from(grid.entries())).toHaveLength(0);
    expect(Array.from(grid.voxels())).toHaveLength(0);
    expect(Array.from(grid.values())).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 3. VoxelGrid: edge cases — negative coords, single cell, overwriting
// ─────────────────────────────────────────────────────────────────────
describe('VoxelGrid edge cases', () => {
  test('negative coordinates work correctly', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(-5, -10, -15), 42);
    expect(grid.get(voxel(-5, -10, -15))).toBe(42);
    expect(grid.has(voxel(-5, -10, -15))).toBe(true);
    expect(grid.has(voxel(5, 10, 15))).toBe(false);
  });

  test('single cell grid', () => {
    const grid = new VoxelGrid<string>();
    grid.set(voxel(0, 0, 0), 'only');
    expect(grid.size).toBe(1);
    expect(grid.get(voxel(0, 0, 0))).toBe('only');
    const b = grid.bounds();
    expect(b).toEqual({
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    });
  });

  test('overwriting a value at same coordinate', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(1, 1, 1), 10);
    expect(grid.size).toBe(1);
    grid.set(voxel(1, 1, 1), 99);
    expect(grid.size).toBe(1); // size should not increase
    expect(grid.get(voxel(1, 1, 1))).toBe(99);
  });

  test('delete returns false for non-existent key', () => {
    const grid = new VoxelGrid();
    expect(grid.delete(voxel(9, 9, 9))).toBe(false);
  });

  test('bounds with negative coordinates', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(-5, 3, -7), true);
    grid.set(voxel(2, -1, 4), true);
    const b = grid.bounds();
    expect(b!.min).toEqual({ x: -5, y: -1, z: -7 });
    expect(b!.max).toEqual({ x: 2, y: 3, z: 4 });
  });

  test('adjacentTo and hasAdjacent after delete', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 0, 0), true);
    expect(grid.hasAdjacent(voxel(0, 0, 0))).toBe(true);
    grid.delete(voxel(1, 0, 0));
    expect(grid.hasAdjacent(voxel(0, 0, 0))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 4. Negative coordinates in distance functions
// ─────────────────────────────────────────────────────────────────────
describe('Distance functions with negative coordinates', () => {
  test('manhattan with negatives', () => {
    expect(manhattan(voxel(-3, -4, -5), voxel(0, 0, 0))).toBe(12);
    expect(manhattan(voxel(-1, 2, -3), voxel(3, -2, 1))).toBe(12);
  });

  test('chebyshev with negatives', () => {
    expect(chebyshev(voxel(-3, -4, -5), voxel(0, 0, 0))).toBe(5);
    expect(chebyshev(voxel(-1, 2, -3), voxel(1, -2, 3))).toBe(6);
  });

  test('euclidean with negatives', () => {
    expect(euclidean(voxel(-3, -4, 0), voxel(0, 0, 0))).toBe(5);
    expect(euclidean(voxel(-1, -1, -1), voxel(1, 1, 1))).toBeCloseTo(
      Math.sqrt(12),
      10,
    );
  });

  test('distance between identical points is 0', () => {
    const v = voxel(-5, 7, -3);
    expect(manhattan(v, v)).toBe(0);
    expect(chebyshev(v, v)).toBe(0);
    expect(euclidean(v, v)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 5. filledBox and filledSphere edge cases
// ─────────────────────────────────────────────────────────────────────
describe('filledBox edge cases', () => {
  test('size 0 produces empty array', () => {
    expect(filledBox(voxel(0, 0, 0), voxel(0, 0, 0))).toHaveLength(0);
  });

  test('size 1 produces single voxel', () => {
    const result = filledBox(voxel(3, 3, 3), voxel(1, 1, 1));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 3, y: 3, z: 3 });
  });

  test('negative origin', () => {
    const result = filledBox(voxel(-2, -2, -2), voxel(1, 1, 1));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: -2, y: -2, z: -2 });
  });

  test('negative origin with larger size', () => {
    const result = filledBox(voxel(-1, -1, -1), voxel(2, 2, 2));
    expect(result).toHaveLength(8);
    // Check corners
    const keys = new Set(result.map(voxKey));
    expect(keys.has('-1,-1,-1')).toBe(true);
    expect(keys.has('0,0,0')).toBe(true);
    expect(keys.has('-1,0,-1')).toBe(true);
    expect(keys.has('0,-1,0')).toBe(true);
  });

  test('asymmetric sizes', () => {
    const result = filledBox(voxel(0, 0, 0), voxel(3, 1, 2));
    expect(result).toHaveLength(6);
  });
});

describe('filledSphere edge cases', () => {
  test('radius 0 produces single voxel', () => {
    const result = filledSphere(voxel(0, 0, 0), 0);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('radius 0 with negative center', () => {
    const result = filledSphere(voxel(-3, -3, -3), 0);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: -3, y: -3, z: -3 });
  });

  test('radius 1 has exactly 7 voxels', () => {
    const result = filledSphere(voxel(0, 0, 0), 1);
    expect(result).toHaveLength(7);
  });

  test('sphere at negative center', () => {
    const center = voxel(-5, 0, 5);
    const result = filledSphere(center, 1);
    expect(result).toHaveLength(7);
    // All voxels should be within manhattan distance 1 of center
    for (const v of result) {
      expect(manhattan(v, center)).toBeLessThanOrEqual(1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// 6. hollowBox with size 1
// ─────────────────────────────────────────────────────────────────────
describe('hollowBox edge cases', () => {
  test('size 1x1x1 produces single voxel (all faces are surface)', () => {
    const result = hollowBox(voxel(0, 0, 0), voxel(1, 1, 1));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('size 1x1x1 with negative origin', () => {
    const result = hollowBox(voxel(-5, -5, -5), voxel(1, 1, 1));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: -5, y: -5, z: -5 });
  });

  test('2x2x2 box — all voxels are surface', () => {
    const result = hollowBox(voxel(0, 0, 0), voxel(2, 2, 2));
    expect(result).toHaveLength(8); // No interior in a 2×2×2
  });

  test('4x4x4 box has correct surface count', () => {
    // 4×4×4 = 64 total, interior is 2×2×2 = 8, surface = 56
    const result = hollowBox(voxel(0, 0, 0), voxel(4, 4, 4));
    expect(result).toHaveLength(56);
  });

  test('size 0 produces empty array', () => {
    const result = hollowBox(voxel(0, 0, 0), voxel(0, 0, 0));
    expect(result).toHaveLength(0);
  });

  test('asymmetric 1×3×1 box', () => {
    const result = hollowBox(voxel(0, 0, 0), voxel(1, 3, 1));
    // 1×3×1 = 3 voxels, all on surface (no interior)
    expect(result).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 7. voxelLine in all three driving axes
// ─────────────────────────────────────────────────────────────────────
describe('voxelLine driving axes', () => {
  test('X-driven line (dx largest)', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(5, 1, 0));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 5, y: 1, z: 0 });
    // 3D Bresenham can step diagonally in non-driving axes (manhattan 1 or 2)
    for (let i = 1; i < line.length; i++) {
      const d = manhattan(line[i - 1], line[i]);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(2);
    }
  });

  test('Y-driven line (dy largest)', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(1, 5, 0));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 1, y: 5, z: 0 });
    for (let i = 1; i < line.length; i++) {
      const d = manhattan(line[i - 1], line[i]);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(2);
    }
  });

  test('Z-driven line (dz largest)', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(0, 1, 5));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 1, z: 5 });
    for (let i = 1; i < line.length; i++) {
      const d = manhattan(line[i - 1], line[i]);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(2);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// 8. voxelLine with negative directions
// ─────────────────────────────────────────────────────────────────────
describe('voxelLine negative directions', () => {
  test('line going negative X', () => {
    const line = voxelLine(voxel(5, 0, 0), voxel(0, 0, 0));
    expect(line[0]).toEqual({ x: 5, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line).toHaveLength(6);
  });

  test('line going negative Y', () => {
    const line = voxelLine(voxel(0, 5, 0), voxel(0, 0, 0));
    expect(line[0]).toEqual({ x: 0, y: 5, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line).toHaveLength(6);
  });

  test('line going negative Z', () => {
    const line = voxelLine(voxel(0, 0, 5), voxel(0, 0, 0));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 5 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line).toHaveLength(6);
  });

  test('3D diagonal negative line', () => {
    const line = voxelLine(voxel(3, 3, 3), voxel(0, 0, 0));
    expect(line[0]).toEqual({ x: 3, y: 3, z: 3 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 0, z: 0 });
    // Each step should be adjacent
    for (let i = 1; i < line.length; i++) {
      const d = manhattan(line[i - 1], line[i]);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(3);
    }
  });

  test('line from negative to positive', () => {
    const line = voxelLine(voxel(-3, -3, -3), voxel(3, 3, 3));
    expect(line[0]).toEqual({ x: -3, y: -3, z: -3 });
    expect(line[line.length - 1]).toEqual({ x: 3, y: 3, z: 3 });
  });
});

// ─────────────────────────────────────────────────────────────────────
// 9. raycast with zero-direction component
// ─────────────────────────────────────────────────────────────────────
describe('raycast with axis-aligned direction', () => {
  test('straight along +X (Y=0, Z=0)', () => {
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 0, 0), 5);
    expect(ray.length).toBeGreaterThanOrEqual(5);
    // All voxels should have same Y and Z
    for (const v of ray) {
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    }
    // X should be increasing
    for (let i = 1; i < ray.length; i++) {
      expect(ray[i].x).toBe(ray[i - 1].x + 1);
    }
  });

  test('straight along +Y (X=0, Z=0)', () => {
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(0, 1, 0), 5);
    expect(ray.length).toBeGreaterThanOrEqual(5);
    for (const v of ray) {
      expect(v.x).toBe(0);
      expect(v.z).toBe(0);
    }
    for (let i = 1; i < ray.length; i++) {
      expect(ray[i].y).toBe(ray[i - 1].y + 1);
    }
  });

  test('straight along +Z (X=0, Y=0)', () => {
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(0, 0, 1), 5);
    expect(ray.length).toBeGreaterThanOrEqual(5);
    for (const v of ray) {
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    }
    for (let i = 1; i < ray.length; i++) {
      expect(ray[i].z).toBe(ray[i - 1].z + 1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// 10. raycast with negative direction
// ─────────────────────────────────────────────────────────────────────
describe('raycast with negative direction', () => {
  test('straight along -X', () => {
    const ray = raycast(voxel(5.5, 0.5, 0.5), voxel(-1, 0, 0), 5);
    expect(ray.length).toBeGreaterThanOrEqual(5);
    expect(ray[0]).toEqual({ x: 5, y: 0, z: 0 });
    // X should be decreasing
    for (let i = 1; i < ray.length; i++) {
      expect(ray[i].x).toBe(ray[i - 1].x - 1);
    }
  });

  test('straight along -Y', () => {
    const ray = raycast(voxel(0.5, 5.5, 0.5), voxel(0, -1, 0), 5);
    expect(ray.length).toBeGreaterThanOrEqual(5);
    expect(ray[0]).toEqual({ x: 0, y: 5, z: 0 });
    for (let i = 1; i < ray.length; i++) {
      expect(ray[i].y).toBe(ray[i - 1].y - 1);
    }
  });

  test('straight along -Z', () => {
    const ray = raycast(voxel(0.5, 0.5, 5.5), voxel(0, 0, -1), 5);
    expect(ray.length).toBeGreaterThanOrEqual(5);
    expect(ray[0]).toEqual({ x: 0, y: 0, z: 5 });
    for (let i = 1; i < ray.length; i++) {
      expect(ray[i].z).toBe(ray[i - 1].z - 1);
    }
  });

  test('negative diagonal direction', () => {
    const ray = raycast(voxel(5.5, 5.5, 5.5), voxel(-1, -1, -1), 10);
    expect(ray.length).toBeGreaterThan(0);
    expect(ray[0]).toEqual({ x: 5, y: 5, z: 5 });
    // General direction should be negative
    expect(ray[ray.length - 1].x).toBeLessThan(5);
    expect(ray[ray.length - 1].y).toBeLessThan(5);
    expect(ray[ray.length - 1].z).toBeLessThan(5);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 11. findPath with bounds constraint
// ─────────────────────────────────────────────────────────────────────
describe('findPath with bounds', () => {
  test('respects bounds constraint', () => {
    // Build a passable area, but constrain bounds so the direct path is blocked
    const cells = new Set<string>();
    for (let x = 0; x <= 10; x++) {
      for (let z = 0; z <= 10; z++) {
        cells.add(`${x},0,${z}`);
      }
    }
    const isPassable = (v: Voxel) => cells.has(voxKey(v));

    // Tight bounds around start — goal is outside bounds
    const tightBounds = boundsFrom(voxel(0, 0, 0), voxel(3, 0, 3));
    const path = findPath(
      voxel(0, 0, 0),
      voxel(8, 0, 8),
      isPassable,
      tightBounds,
    );
    expect(path).toBeNull();
  });

  test('finds path within bounds', () => {
    const cells = new Set<string>();
    for (let x = 0; x <= 5; x++) {
      cells.add(`${x},0,0`);
    }
    const isPassable = (v: Voxel) => cells.has(voxKey(v));
    const bounds = boundsFrom(voxel(0, 0, 0), voxel(10, 0, 0));
    const path = findPath(voxel(0, 0, 0), voxel(4, 0, 0), isPassable, bounds);
    expect(path).not.toBeNull();
    expect(path).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 12. findPath where start equals goal
// ─────────────────────────────────────────────────────────────────────
describe('findPath start equals goal', () => {
  test('returns single-element path', () => {
    const isPassable = (_v: Voxel) => true;
    const path = findPath(voxel(3, 3, 3), voxel(3, 3, 3), isPassable);
    expect(path).not.toBeNull();
    expect(path).toHaveLength(1);
    expect(path![0]).toEqual({ x: 3, y: 3, z: 3 });
  });
});

// ─────────────────────────────────────────────────────────────────────
// 13. findPath where start or goal is not passable
// ─────────────────────────────────────────────────────────────────────
describe('findPath with impassable start/goal', () => {
  test('returns null when start is not passable', () => {
    const isPassable = (v: Voxel) => voxKey(v) !== '0,0,0';
    const path = findPath(voxel(0, 0, 0), voxel(3, 0, 0), isPassable);
    expect(path).toBeNull();
  });

  test('returns null when goal is not passable', () => {
    const isPassable = (v: Voxel) => voxKey(v) !== '3,0,0';
    const path = findPath(voxel(0, 0, 0), voxel(3, 0, 0), isPassable);
    expect(path).toBeNull();
  });

  test('returns null when both start and goal are not passable', () => {
    const isPassable = (v: Voxel) => {
      const k = voxKey(v);
      return k !== '0,0,0' && k !== '5,0,0';
    };
    const path = findPath(voxel(0, 0, 0), voxel(5, 0, 0), isPassable);
    expect(path).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// 14. connectedComponents with single voxel and empty array
// ─────────────────────────────────────────────────────────────────────
describe('connectedComponents edge cases', () => {
  test('single voxel produces one component', () => {
    const comps = connectedComponents([voxel(5, 5, 5)]);
    expect(comps).toHaveLength(1);
    expect(comps[0]).toHaveLength(1);
    expect(comps[0][0]).toEqual({ x: 5, y: 5, z: 5 });
  });

  test('empty array produces no components', () => {
    const comps = connectedComponents([]);
    expect(comps).toHaveLength(0);
  });

  test('all voxels isolated — each is its own component', () => {
    const voxels = [
      voxel(0, 0, 0),
      voxel(10, 0, 0),
      voxel(20, 0, 0),
    ];
    const comps = connectedComponents(voxels);
    expect(comps).toHaveLength(3);
    for (const comp of comps) {
      expect(comp).toHaveLength(1);
    }
  });

  test('large connected group is one component', () => {
    // 3×3×3 solid cube = 27 voxels, all connected
    const voxels = filledBox(voxel(0, 0, 0), voxel(3, 3, 3));
    const comps = connectedComponents(voxels);
    expect(comps).toHaveLength(1);
    expect(comps[0]).toHaveLength(27);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 15. Set operations with empty arrays
// ─────────────────────────────────────────────────────────────────────
describe('Set operations with empty arrays', () => {
  test('voxUnion with both empty', () => {
    expect(voxUnion([], [])).toHaveLength(0);
  });

  test('voxUnion with one empty', () => {
    const a = [voxel(0, 0, 0), voxel(1, 0, 0)];
    expect(voxUnion(a, [])).toHaveLength(2);
    expect(voxUnion([], a)).toHaveLength(2);
  });

  test('voxIntersect with both empty', () => {
    expect(voxIntersect([], [])).toHaveLength(0);
  });

  test('voxIntersect with one empty', () => {
    const a = [voxel(0, 0, 0), voxel(1, 0, 0)];
    expect(voxIntersect(a, [])).toHaveLength(0);
    expect(voxIntersect([], a)).toHaveLength(0);
  });

  test('voxDifference with both empty', () => {
    expect(voxDifference([], [])).toHaveLength(0);
  });

  test('voxDifference with empty second array', () => {
    const a = [voxel(0, 0, 0), voxel(1, 0, 0)];
    expect(voxDifference(a, [])).toHaveLength(2);
  });

  test('voxDifference with empty first array', () => {
    const b = [voxel(0, 0, 0), voxel(1, 0, 0)];
    expect(voxDifference([], b)).toHaveLength(0);
  });

  test('voxUnion deduplicates overlapping voxels', () => {
    const a = [voxel(0, 0, 0), voxel(1, 0, 0)];
    const b = [voxel(0, 0, 0), voxel(1, 0, 0)];
    expect(voxUnion(a, b)).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 16. voxKey with negative numbers
// ─────────────────────────────────────────────────────────────────────
describe('voxKey with negative numbers', () => {
  test('single negative coordinate', () => {
    expect(voxKey(voxel(-1, 0, 0))).toBe('-1,0,0');
  });

  test('all negative coordinates', () => {
    expect(voxKey(voxel(-1, -2, -3))).toBe('-1,-2,-3');
  });

  test('mixed positive and negative', () => {
    expect(voxKey(voxel(-1, 2, -3))).toBe('-1,2,-3');
  });

  test('roundtrip with large negatives', () => {
    const v = voxel(-1000000, -2000000, -3000000);
    expect(fromKey(voxKey(v))).toEqual(v);
  });

  test('roundtrip with mixed signs', () => {
    const v = voxel(-999, 888, -777);
    expect(fromKey(voxKey(v))).toEqual(v);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 17. VoxelGrid.fromJSON with empty object
// ─────────────────────────────────────────────────────────────────────
describe('VoxelGrid.fromJSON edge cases', () => {
  test('empty object produces empty grid', () => {
    const grid = VoxelGrid.fromJSON({});
    expect(grid.size).toBe(0);
    expect(Array.from(grid.voxels())).toHaveLength(0);
  });

  test('fromJSON with single entry', () => {
    const grid = VoxelGrid.fromJSON<number>({ '1,2,3': 42 });
    expect(grid.size).toBe(1);
    expect(grid.get(voxel(1, 2, 3))).toBe(42);
  });

  test('fromJSON roundtrip with empty grid', () => {
    const grid = new VoxelGrid<number>();
    const json = grid.toJSON();
    expect(Object.keys(json)).toHaveLength(0);
    const restored = VoxelGrid.fromJSON(json);
    expect(restored.size).toBe(0);
  });

  test('fromJSON preserves negative coordinate keys', () => {
    const grid = VoxelGrid.fromJSON<string>({
      '-1,-2,-3': 'neg',
      '4,5,6': 'pos',
    });
    expect(grid.size).toBe(2);
    expect(grid.get(voxel(-1, -2, -3))).toBe('neg');
    expect(grid.get(voxel(4, 5, 6))).toBe('pos');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Additional edge cases
// ─────────────────────────────────────────────────────────────────────
describe('Miscellaneous edge cases', () => {
  test('boundsFrom normalizes corners (min always < max)', () => {
    // Pass in "reversed" corners
    const b = boundsFrom(voxel(5, 5, 5), voxel(0, 0, 0));
    expect(b.min).toEqual({ x: 0, y: 0, z: 0 });
    expect(b.max).toEqual({ x: 5, y: 5, z: 5 });
  });

  test('boundsFrom with negative corners', () => {
    const b = boundsFrom(voxel(-5, 3, -7), voxel(2, -1, 4));
    expect(b.min).toEqual({ x: -5, y: -1, z: -7 });
    expect(b.max).toEqual({ x: 2, y: 3, z: 4 });
  });

  test('voxelsInBounds with single voxel bounds', () => {
    const b = boundsFrom(voxel(7, 7, 7), voxel(7, 7, 7));
    const voxels = voxelsInBounds(b);
    expect(voxels).toHaveLength(1);
    expect(voxels[0]).toEqual({ x: 7, y: 7, z: 7 });
  });

  test('boundsVolume of single voxel', () => {
    const b = boundsFrom(voxel(0, 0, 0), voxel(0, 0, 0));
    expect(boundsVolume(b)).toBe(1);
  });

  test('inBounds with negative-coordinate bounds', () => {
    const b = boundsFrom(voxel(-5, -5, -5), voxel(-1, -1, -1));
    expect(inBounds(voxel(-3, -3, -3), b)).toBe(true);
    expect(inBounds(voxel(0, 0, 0), b)).toBe(false);
    expect(inBounds(voxel(-5, -5, -5), b)).toBe(true);
    expect(inBounds(voxel(-1, -1, -1), b)).toBe(true);
  });

  test('floodFill with bounds constraint', () => {
    // Build a line of voxels
    const cells = new Set(['0,0,0', '1,0,0', '2,0,0', '3,0,0', '4,0,0']);
    const isOccupied = (v: Voxel) => cells.has(voxKey(v));
    const bounds = boundsFrom(voxel(0, 0, 0), voxel(2, 0, 0));
    const filled = floodFill(voxel(0, 0, 0), isOccupied, bounds);
    // Should only fill voxels within bounds (0,0,0 to 2,0,0)
    expect(filled).toHaveLength(3);
  });

  test('hollowSphere radius 1 includes center shell only', () => {
    const shell = hollowSphere(voxel(0, 0, 0), 1);
    // Inner radius squared = 0, outer = 1
    // Should include center (d2=0 is NOT > 0) — actually center d2=0 is not > inner=0
    // Let's check: d2 <= outer (1) && d2 > inner (0)
    // Center: d2=0, 0 > 0 is false → center excluded
    expect(shell.find((v) => v.x === 0 && v.y === 0 && v.z === 0)).toBeUndefined();
    // Should have the 6 face neighbors (d2=1)
    expect(shell).toHaveLength(6);
  });

  test('voxEq with negative coordinates', () => {
    expect(voxEq(voxel(-1, -2, -3), voxel(-1, -2, -3))).toBe(true);
    expect(voxEq(voxel(-1, 2, 3), voxel(1, 2, 3))).toBe(false);
  });

  test('voxAdd with negative operands', () => {
    expect(voxAdd(voxel(-3, 5, -7), voxel(2, -4, 10))).toEqual({
      x: -1,
      y: 1,
      z: 3,
    });
  });

  test('voxSub resulting in negatives', () => {
    expect(voxSub(voxel(0, 0, 0), voxel(3, 4, 5))).toEqual({
      x: -3,
      y: -4,
      z: -5,
    });
  });

  test('voxScale with negative scalar', () => {
    expect(voxScale(voxel(1, -2, 3), -2)).toEqual({
      x: -2,
      y: 4,
      z: -6,
    });
  });

  test('voxScale with zero scalar', () => {
    expect(voxScale(voxel(5, 7, 9), 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
  });
});
