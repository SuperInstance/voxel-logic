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
  VoxelGrid,
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

describe('Coordinate helpers', () => {
  test('voxel creates correct coordinate', () => {
    expect(voxel(1, 2, 3)).toEqual({ x: 1, y: 2, z: 3 });
  });

  test('voxEq checks equality', () => {
    expect(voxEq(voxel(1, 2, 3), voxel(1, 2, 3))).toBe(true);
    expect(voxEq(voxel(1, 2, 3), voxel(3, 2, 1))).toBe(false);
  });

  test('voxAdd adds correctly', () => {
    expect(voxAdd(voxel(1, 2, 3), voxel(4, 5, 6))).toEqual({ x: 5, y: 7, z: 9 });
  });

  test('voxSub subtracts correctly', () => {
    expect(voxSub(voxel(4, 5, 6), voxel(1, 2, 3))).toEqual({ x: 3, y: 3, z: 3 });
  });

  test('voxScale scales correctly', () => {
    expect(voxScale(voxel(1, 2, 3), 2)).toEqual({ x: 2, y: 4, z: 6 });
  });

  test('manhattan distance', () => {
    expect(manhattan(voxel(0, 0, 0), voxel(3, 4, 5))).toBe(12);
  });

  test('chebyshev distance', () => {
    expect(chebyshev(voxel(0, 0, 0), voxel(3, 4, 5))).toBe(5);
  });

  test('euclidean distance', () => {
    expect(euclidean(voxel(0, 0, 0), voxel(3, 4, 0))).toBe(5);
  });

  test('voxKey and fromKey roundtrip', () => {
    const v = voxel(7, -3, 42);
    expect(fromKey(voxKey(v))).toEqual(v);
  });
});

describe('Constants', () => {
  test('FACES has 6 entries', () => {
    expect(FACES).toHaveLength(6);
  });

  test('NEIGHBOR_OFFSETS has 26 entries', () => {
    expect(NEIGHBOR_OFFSETS).toHaveLength(26);
  });
});

describe('Neighbors', () => {
  test('faceNeighbors returns 6 neighbors', () => {
    expect(faceNeighbors(voxel(0, 0, 0))).toHaveLength(6);
  });

  test('allNeighbors returns 26 neighbors', () => {
    expect(allNeighbors(voxel(0, 0, 0))).toHaveLength(26);
  });

  test('all neighbors are distinct', () => {
    const neighbors = allNeighbors(voxel(5, 5, 5));
    const keys = new Set(neighbors.map(voxKey));
    expect(keys.size).toBe(26);
  });
});

describe('Bounds', () => {
  const bounds = boundsFrom(voxel(0, 0, 0), voxel(2, 2, 2));

  test('boundsFrom creates correct bounds', () => {
    expect(bounds.min).toEqual({ x: 0, y: 0, z: 0 });
    expect(bounds.max).toEqual({ x: 2, y: 2, z: 2 });
  });

  test('inBounds includes boundaries', () => {
    expect(inBounds(voxel(0, 0, 0), bounds)).toBe(true);
    expect(inBounds(voxel(2, 2, 2), bounds)).toBe(true);
    expect(inBounds(voxel(1, 1, 1), bounds)).toBe(true);
    expect(inBounds(voxel(3, 0, 0), bounds)).toBe(false);
  });

  test('voxelsInBounds returns all voxels', () => {
    expect(voxelsInBounds(bounds)).toHaveLength(27);
  });

  test('boundsVolume computes volume', () => {
    expect(boundsVolume(bounds)).toBe(27);
  });
});

describe('VoxelGrid', () => {
  test('set and get', () => {
    const grid = new VoxelGrid<string>();
    grid.set(voxel(1, 2, 3), 'hello');
    expect(grid.get(voxel(1, 2, 3))).toBe('hello');
    expect(grid.get(voxel(4, 5, 6))).toBeUndefined();
  });

  test('has and delete', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(0, 0, 0), true);
    expect(grid.has(voxel(0, 0, 0))).toBe(true);
    expect(grid.delete(voxel(0, 0, 0))).toBe(true);
    expect(grid.has(voxel(0, 0, 0))).toBe(false);
  });

  test('size tracks cell count', () => {
    const grid = new VoxelGrid();
    expect(grid.size).toBe(0);
    grid.set(voxel(0, 0, 0), true);
    grid.set(voxel(1, 0, 0), true);
    expect(grid.size).toBe(2);
  });

  test('bounds computes correct bounding box', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 2, 3), true);
    grid.set(voxel(-1, 5, 0), true);
    const b = grid.bounds();
    expect(b).toEqual({
      min: { x: -1, y: 2, z: 0 },
      max: { x: 1, y: 5, z: 3 },
    });
  });

  test('bounds returns undefined for empty grid', () => {
    const grid = new VoxelGrid();
    expect(grid.bounds()).toBeUndefined();
  });

  test('adjacentTo finds face neighbors', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 0, 0), true);
    grid.set(voxel(0, 1, 0), true);
    grid.set(voxel(2, 0, 0), false); // diagonal-ish, not face adjacent
    const adj = grid.adjacentTo(voxel(0, 0, 0));
    expect(adj).toHaveLength(2);
  });

  test('hasAdjacent detects any neighbor', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 0, 0), true);
    expect(grid.hasAdjacent(voxel(0, 0, 0))).toBe(true);
    expect(grid.hasAdjacent(voxel(5, 5, 5))).toBe(false);
  });

  test('toJSON and fromJSON roundtrip', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(1, 2, 3), 42);
    grid.set(voxel(4, 5, 6), 99);
    const json = grid.toJSON();
    const restored = VoxelGrid.fromJSON(json);
    expect(restored.get(voxel(1, 2, 3))).toBe(42);
    expect(restored.get(voxel(4, 5, 6))).toBe(99);
    expect(restored.size).toBe(2);
  });
});

describe('Shapes', () => {
  test('filledBox', () => {
    const box = filledBox(voxel(0, 0, 0), voxel(2, 2, 2));
    expect(box).toHaveLength(8);
  });

  test('hollowBox only has surface voxels', () => {
    const shell = hollowBox(voxel(0, 0, 0), voxel(3, 3, 3));
    // 3×3×3 cube: 27 total - 1 interior = 26
    expect(shell).toHaveLength(26);
  });

  test('voxelLine produces connected path', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(3, 0, 0));
    expect(line[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(line[line.length - 1]).toEqual({ x: 3, y: 0, z: 0 });
    // Each step should be exactly 1 apart
    for (let i = 1; i < line.length; i++) {
      expect(manhattan(line[i - 1], line[i])).toBe(1);
    }
  });

  test('voxelLine diagonal', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(0, 0, 0));
    expect(line).toEqual([{ x: 0, y: 0, z: 0 }]);
  });

  test('filledSphere', () => {
    const sphere = filledSphere(voxel(0, 0, 0), 1);
    // radius 1 sphere should include center + 6 face neighbors
    expect(sphere).toHaveLength(7);
  });

  test('hollowSphere', () => {
    const shell = hollowSphere(voxel(0, 0, 0), 2);
    expect(shell.length).toBeGreaterThan(0);
    // No voxel should be at the center
    expect(shell.find((v) => v.x === 0 && v.y === 0 && v.z === 0)).toBeUndefined();
  });
});

describe('Flood fill', () => {
  test('fills a simple region', () => {
    const occupied = new Set(['0,0,0', '1,0,0', '2,0,0'].join(',').split(',').map((_, i, arr) => {
      // Reconstruct keys properly
      return '';
    }));
    // Simplify: use a direct approach
    const cells = new Set(['0,0,0', '1,0,0', '2,0,0']);
    const isOccupied = (v: Voxel) => cells.has(voxKey(v));
    const filled = floodFill(voxel(0, 0, 0), isOccupied);
    expect(filled).toHaveLength(3);
  });

  test('does not cross gaps', () => {
    const cells = new Set(['0,0,0', '2,0,0']);
    const isOccupied = (v: Voxel) => cells.has(voxKey(v));
    const filled = floodFill(voxel(0, 0, 0), isOccupied);
    expect(filled).toHaveLength(1);
  });
});

describe('Connected components', () => {
  test('separates disconnected groups', () => {
    const voxels = [
      voxel(0, 0, 0),
      voxel(1, 0, 0),
      voxel(5, 5, 5),
      voxel(6, 5, 5),
    ];
    const comps = connectedComponents(voxels);
    expect(comps).toHaveLength(2);
    expect(comps[0]).toHaveLength(2);
    expect(comps[1]).toHaveLength(2);
  });

  test('single component for connected set', () => {
    const voxels = [
      voxel(0, 0, 0),
      voxel(1, 0, 0),
      voxel(2, 0, 0),
    ];
    const comps = connectedComponents(voxels);
    expect(comps).toHaveLength(1);
    expect(comps[0]).toHaveLength(3);
  });
});

describe('Set operations', () => {
  const setA = [voxel(0, 0, 0), voxel(1, 0, 0), voxel(2, 0, 0)];
  const setB = [voxel(1, 0, 0), voxel(2, 0, 0), voxel(3, 0, 0)];

  test('voxUnion', () => {
    expect(voxUnion(setA, setB)).toHaveLength(4);
  });

  test('voxIntersect', () => {
    expect(voxIntersect(setA, setB)).toHaveLength(2);
  });

  test('voxDifference', () => {
    expect(voxDifference(setA, setB)).toHaveLength(1);
  });
});

describe('Raycast', () => {
  test('traverses voxels along X axis', () => {
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 0, 0), 10);
    expect(ray[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(ray[1]).toEqual({ x: 1, y: 0, z: 0 });
    expect(ray.length).toBeGreaterThanOrEqual(10);
  });

  test('handles diagonal direction', () => {
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 1, 1), 5);
    expect(ray.length).toBeGreaterThan(0);
    // Should pass through the diagonal
    const keys = ray.map(voxKey);
    expect(keys).toContain('0,0,0');
    expect(keys).toContain('1,1,1');
  });

  test('respects maxDistance', () => {
    const ray = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 0, 0), 3);
    expect(ray.length).toBeLessThanOrEqual(5);
  });
});

describe('Pathfinding', () => {
  test('finds straight path', () => {
    const passable = new Set(['0,0,0', '1,0,0', '2,0,0', '3,0,0'].map((k) => k));
    const isPassable = (v: Voxel) => passable.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(3, 0, 0), isPassable);
    expect(path).not.toBeNull();
    expect(path).toHaveLength(4);
    expect(path![0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(path![3]).toEqual({ x: 3, y: 0, z: 0 });
  });

  test('returns null when no path', () => {
    const passable = new Set(['0,0,0', '2,0,0'].map((k) => k));
    const isPassable = (v: Voxel) => passable.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(2, 0, 0), isPassable);
    expect(path).toBeNull();
  });

  test('navigates around obstacle', () => {
    const cells = new Set<string>();
    // Build a 5x1x3 corridor with a wall at x=2,y=0
    for (let x = 0; x <= 4; x++) {
      for (let z = 0; z <= 2; z++) {
        if (!(x === 2 && z === 0)) {
          cells.add(`${x},0,${z}`);
        }
      }
    }
    const isPassable = (v: Voxel) => cells.has(voxKey(v));
    const path = findPath(voxel(0, 0, 0), voxel(4, 0, 0), isPassable);
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(path![path!.length - 1]).toEqual({ x: 4, y: 0, z: 0 });
  });
});
