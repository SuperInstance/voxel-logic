/**
 * Targeted tests for uncovered lines in voxel-logic:
 * - bounds() on empty grid (line 311)
 * - Y-driven and Z-driven voxelLine branches (lines 423, 434)
 * - raycast with default maxDistance (line 594)
 * - findPath A* inner branches (lines 691, 699, 719)
 */
import {
  voxel,
  voxEq,
  voxKey,
  manhattan,
  VoxelGrid,
  boundsFrom,
  voxelLine,
  raycast,
  findPath,
  filledBox,
} from '../src';

// ─────────────────────────────────────────────────────────────────────
// bounds() on empty grid — line 311
// ─────────────────────────────────────────────────────────────────────
describe('bounds() edge cases', () => {
  test('bounds() on empty grid returns undefined', () => {
    const grid = new VoxelGrid<number>();
    expect(grid.bounds()).toBeUndefined();
  });

  test('bounds() after clearing all cells returns undefined', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(1, 1, 1), 10);
    grid.set(voxel(2, 2, 2), 20);
    grid.clear();
    expect(grid.bounds()).toBeUndefined();
  });

  test('bounds() after deleting all cells returns undefined', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(1, 1, 1), 10);
    grid.delete(voxel(1, 1, 1));
    expect(grid.bounds()).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Y-driven and Z-driven voxelLine — lines 423, 434
// ─────────────────────────────────────────────────────────────────────
describe('voxelLine Y-driven and Z-driven branches', () => {
  test('Y-driven line with z component (dy > dx and dy > dz)', () => {
    // dy=10 is largest, dx=3, dz=2
    const line = voxelLine(voxel(0, 0, 0), voxel(3, 10, 2));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 3, y: 10, z: 2 });
    // Should have 11 points (0 to 10 in Y)
    expect(line.length).toBeGreaterThanOrEqual(11);
  });

  test('Z-driven line with x and y components (dz > dy and dz > dx)', () => {
    // dz=10 is largest, dx=2, dy=3
    const line = voxelLine(voxel(0, 0, 0), voxel(2, 3, 10));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 2, y: 3, z: 10 });
    expect(line.length).toBeGreaterThanOrEqual(11);
  });

  test('Y-driven line with negative directions', () => {
    // Going from (3, 10, 2) to (0, 0, 0), dy=10 is largest
    const line = voxelLine(voxel(3, 10, 2), voxel(0, 0, 0));
    expect(line[0]).toEqual({ x: 3, y: 10, z: 2 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('Z-driven line with negative directions', () => {
    // Going from (2, 3, 10) to (0, 0, 0), dz=10 is largest
    const line = voxelLine(voxel(2, 3, 10), voxel(0, 0, 0));
    expect(line[0]).toEqual({ x: 2, y: 3, z: 10 });
    expect(line[line.length - 1]).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('Y-driven line with only y changing (pure Y axis)', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(0, 5, 0));
    expect(line).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(line[i]).toEqual({ x: 0, y: i, z: 0 });
    }
  });

  test('Z-driven line with only z changing (pure Z axis)', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(0, 0, 5));
    expect(line).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(line[i]).toEqual({ x: 0, y: 0, z: i });
    }
  });

  test('Y-driven line where x and z both change', () => {
    // dy=8, dx=4, dz=3 — Y drives
    const line = voxelLine(voxel(0, 0, 0), voxel(4, 8, 3));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 4, y: 8, z: 3 });
    // Steps should be adjacent
    for (let i = 1; i < line.length; i++) {
      const d = manhattan(line[i - 1], line[i]);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(3);
    }
  });

  test('Z-driven line where x and y both change', () => {
    // dz=8, dx=4, dy=3 — Z drives
    const line = voxelLine(voxel(0, 0, 0), voxel(4, 3, 8));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 4, y: 3, z: 8 });
    for (let i = 1; i < line.length; i++) {
      const d = manhattan(line[i - 1], line[i]);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(3);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// raycast with default maxDistance — line 594
// ─────────────────────────────────────────────────────────────────────
describe('raycast with default maxDistance', () => {
  test('uses default maxDistance when omitted', () => {
    // Should default to 100 and cast 101 voxels (0 through 100 inclusive)
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 0, 0));
    expect(ray).toHaveLength(101);
    expect(ray[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(ray[100]).toEqual({ x: 100, y: 0, z: 0 });
  });

  test('default maxDistance with diagonal direction', () => {
    // Diagonal ray — should travel 100 steps
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 1, 0));
    // Each step moves 1 in x and possibly 1 in y
    expect(ray.length).toBeGreaterThan(0);
    expect(ray[0]).toEqual({ x: 0, y: 0, z: 0 });
    // After 100 steps should be roughly at (70, 70, 0) or similar
    expect(ray[ray.length - 1].x).toBeGreaterThan(50);
  });
});

// ─────────────────────────────────────────────────────────────────────
// findPath A* inner branches — lines 691, 699, 719
// ─────────────────────────────────────────────────────────────────────
describe('findPath A* inner loop branches', () => {
  test('path requiring detour exercises openSet updates', () => {
    // Create a wall with a gap, forcing A* to update scores
    const cells = new Set<string>();
    // Full 5x5 floor
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        cells.add(`${x},0,${z}`);
      }
    }
    // Wall at x=2 except for z=4
    for (let z = 0; z < 4; z++) {
      cells.delete(`2,0,${z}`);
    }
    const isPassable = (v: any) => cells.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(4, 0, 0), isPassable);
    expect(path).not.toBeNull();
    // Path should detour through z=4
    expect(path!.length).toBeGreaterThan(5);
    // Verify all path steps are passable
    for (const v of path!) {
      expect(isPassable(v)).toBe(true);
    }
  });

  test('path where a shorter route to a node is found mid-search', () => {
    // Two possible routes — A* should find shorter one
    // Route 1: direct (4 steps)
    // Route 2: around (8 steps)
    // Direct route should win
    const cells = new Set<string>();
    for (let x = 0; x <= 4; x++) {
      cells.add(`${x},0,0`); // direct path
    }
    for (let z = 0; z <= 3; z++) {
      cells.add(`0,0,${z}`); // detour start
      cells.add(`4,0,${z}`); // detour end
    }
    const isPassable = (v: any) => cells.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(4, 0, 0), isPassable);
    expect(path).not.toBeNull();
    expect(path!).toHaveLength(5); // direct is 5 nodes (0,0,0 to 4,0,0)
  });

  test('path updates gScore when better route found', () => {
    // Create a scenario where A* first reaches a node via a longer path,
    // then finds a shorter one
    // Grid where going diagonally is shorter than going around
    const cells = new Set<string>();
    for (let x = 0; x <= 6; x++) {
      for (let z = 0; z <= 2; z++) {
        cells.add(`${x},0,${z}`);
      }
    }
    const isPassable = (v: any) => cells.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(6, 0, 0), isPassable);
    expect(path).not.toBeNull();
    // Optimal path is 7 nodes along any row
    expect(path!).toHaveLength(7);
  });

  test('no path exists — openSet exhausts', () => {
    // Two disconnected islands
    const cells = new Set(['0,0,0', '1,0,0', '10,0,0', '11,0,0']);
    const isPassable = (v: any) => cells.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(11, 0, 0), isPassable);
    expect(path).toBeNull();
  });

  test('complex maze path', () => {
    // Simple maze
    const cells = new Set<string>();
    // Create corridors
    for (let x = 0; x < 8; x++) cells.add(`${x},0,0`); // main corridor
    cells.add('7,0,1');
    cells.add('7,0,2');
    for (let x = 7; x >= 0; x--) cells.add(`${x},0,2`); // return corridor
    cells.add('0,0,3');
    cells.add('0,0,4');
    for (let x = 0; x < 8; x++) cells.add(`${x},0,4`); // final corridor
    
    const isPassable = (v: any) => cells.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(7, 0, 4), isPassable);
    expect(path).not.toBeNull();
    // Verify path is continuous (each step adjacent)
    for (let i = 1; i < path!.length; i++) {
      expect(manhattan(path![i - 1], path![i])).toBe(1);
    }
  });
});
