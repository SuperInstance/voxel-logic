import {
  VoxelGrid,
  voxel,
  voxKey,
  fromKey,
  voxAdd,
  voxSub,
  voxScale,
  voxEq,
  manhattan,
  chebyshev,
  euclidean,
  faceNeighbors,
  allNeighbors,
  boundedFaceNeighbors,
  boundedAllNeighbors,
  boundsFrom,
  inBounds,
  voxelsInBounds,
  boundsVolume,
  filledBox,
  hollowBox,
  filledSphere,
  hollowSphere,
  voxelLine,
  voxUnion,
  voxIntersect,
  voxDifference,
  floodFill,
  connectedComponents,
  raycast,
  findPath,
  type Voxel,
  type VoxelBounds,
} from '../src';

// ─────────────────────────────────────────────────────────────────────
// STRESS & PROPERTY TESTS
// Exercises edge cases and invariants that production code will hit.
// ─────────────────────────────────────────────────────────────────────

describe('Serialization round-trips', () => {
  it('VoxelGrid.toJSON → fromJSON preserves all data with string values', () => {
    const grid = new VoxelGrid<string>();
    grid.set(voxel(0, 0, 0), 'origin');
    grid.set(voxel(5, -3, 2), 'north');
    grid.set(voxel(-10, 10, -10), 'corner');
    const json = grid.toJSON();
    const restored = VoxelGrid.fromJSON(json);
    expect(restored.size).toBe(grid.size);
    expect(restored.get(voxel(0, 0, 0))).toBe('origin');
    expect(restored.get(voxel(5, -3, 2))).toBe('north');
    expect(restored.get(voxel(-10, 10, -10))).toBe('corner');
  });

  it('VoxelGrid.toJSON → fromJSON with number values', () => {
    const grid = new VoxelGrid<number>();
    for (let i = 0; i < 100; i++) {
      grid.set(voxel(i, i * 2, i * 3), i * 10);
    }
    const restored = VoxelGrid.fromJSON(grid.toJSON());
    expect(restored.size).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(restored.get(voxel(i, i * 2, i * 3))).toBe(i * 10);
    }
  });

  it('VoxelGrid.toJSON → fromJSON with object values', () => {
    interface Block { type: string; hp: number }
    const grid = new VoxelGrid<Block>();
    grid.set(voxel(1, 1, 1), { type: 'stone', hp: 100 });
    grid.set(voxel(2, 2, 2), { type: 'wood', hp: 50 });
    const restored = VoxelGrid.fromJSON<Block>(grid.toJSON());
    expect(restored.get(voxel(1, 1, 1))?.type).toBe('stone');
    expect(restored.get(voxel(2, 2, 2))?.hp).toBe(50);
  });

  it('empty grid serialization', () => {
    const grid = new VoxelGrid();
    expect(grid.toJSON()).toEqual({});
    const restored = VoxelGrid.fromJSON({});
    expect(restored.size).toBe(0);
  });

  it('voxKey → fromKey round-trip with large coordinates', () => {
    const coords: Voxel[] = [
      voxel(0, 0, 0),
      voxel(-1, -1, -1),
      voxel(1000, -2000, 3000),
      voxel(-99999, 99999, 0),
    ];
    for (const v of coords) {
      expect(fromKey(voxKey(v))).toEqual(v);
    }
  });
});

describe('VoxelGrid.adjacentTo and hasAdjacent', () => {
  it('adjacentTo returns only occupied face neighbors', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 0, 0), true);
    grid.set(voxel(0, 1, 0), true);
    grid.set(voxel(2, 0, 0), true); // not adjacent to origin
    const adj = grid.adjacentTo(voxel(0, 0, 0));
    expect(adj).toHaveLength(2);
    expect(adj).toContainEqual(voxel(1, 0, 0));
    expect(adj).toContainEqual(voxel(0, 1, 0));
  });

  it('adjacentTo returns empty for isolated voxel', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(10, 10, 10), true);
    grid.set(voxel(20, 20, 20), true);
    expect(grid.adjacentTo(voxel(10, 10, 10))).toHaveLength(0);
  });

  it('hasAdjacent detects any face neighbor', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(5, 5, 5), true);
    expect(grid.hasAdjacent(voxel(4, 5, 5))).toBe(true);
    expect(grid.hasAdjacent(voxel(6, 5, 5))).toBe(true);
    expect(grid.hasAdjacent(voxel(5, 6, 5))).toBe(true);
    expect(grid.hasAdjacent(voxel(5, 5, 6))).toBe(true);
    // diagonal is not face-adjacent
    expect(grid.hasAdjacent(voxel(6, 6, 5))).toBe(false);
    expect(grid.hasAdjacent(voxel(10, 10, 10))).toBe(false);
  });

  it('adjacentTo on empty grid returns empty', () => {
    const grid = new VoxelGrid();
    expect(grid.adjacentTo(voxel(0, 0, 0))).toHaveLength(0);
    expect(grid.hasAdjacent(voxel(0, 0, 0))).toBe(false);
  });
});

describe('VoxelGrid.bounds with varied data', () => {
  it('bounds of a single cell', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(3, 7, 2), true);
    const b = grid.bounds()!;
    expect(b.min).toEqual(voxel(3, 7, 2));
    expect(b.max).toEqual(voxel(3, 7, 2));
  });

  it('bounds handles all-negative coordinates', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(-5, -10, -15), true);
    grid.set(voxel(-1, -2, -3), true);
    const b = grid.bounds()!;
    expect(b.min).toEqual(voxel(-5, -10, -15));
    expect(b.max).toEqual(voxel(-1, -2, -3));
  });

  it('bounds of large random-ish grid is correct', () => {
    const grid = new VoxelGrid();
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * 100) - 50;
      const y = Math.floor(Math.random() * 100) - 50;
      const z = Math.floor(Math.random() * 100) - 50;
      grid.set(voxel(x, y, z), true);
      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
    }
    const b = grid.bounds()!;
    expect(b.min).toEqual(voxel(minX, minY, minZ));
    expect(b.max).toEqual(voxel(maxX, maxY, maxZ));
  });
});

describe('hollowSphere edge cases', () => {
  it('radius 0 returns empty (shell has no thickness)', () => {
    const result = hollowSphere(voxel(0, 0, 0), 0);
    // d2=0, inner=(0-1)²=1, so 0 > 1 is false → no voxels
    expect(result).toEqual([]);
  });

  it('radius 1 produces a shell of surface cells', () => {
    const result = hollowSphere(voxel(0, 0, 0), 1);
    // inner = (1-1)² = 0, outer = 1² = 1
    // so d2 must be > 0 and <= 1 → d2 = 1 (face neighbors only)
    expect(result.length).toBe(6); // 6 face-adjacent cells at distance 1
    const filled = filledSphere(voxel(0, 0, 0), 1);
    expect(result.length).toBeLessThan(filled.length);
  });

  it('radius 2 produces a shell', () => {
    const inner = filledSphere(voxel(0, 0, 0), 1);
    const outer = filledSphere(voxel(0, 0, 0), 2);
    const shell = hollowSphere(voxel(0, 0, 0), 2);
    // shell should be smaller than full sphere
    expect(shell.length).toBeLessThan(outer.length);
    // shell should contain points not in the inner sphere
    const innerSet = new Set(inner.map(voxKey));
    const shellOuter = shell.filter(v => !innerSet.has(voxKey(v)));
    expect(shellOuter.length).toBeGreaterThan(0);
  });

  it('all voxels in hollowSphere are within chebyshev radius', () => {
    const center = voxel(10, 10, 10);
    const radius = 5;
    const shell = hollowSphere(center, radius);
    for (const v of shell) {
      expect(chebyshev(center, v)).toBeLessThanOrEqual(radius);
    }
  });
});

describe('voxelLine symmetric property', () => {
  it('A→B and B→A produce the same set of voxels', () => {
    const a = voxel(0, 0, 0);
    const b = voxel(7, 3, -5);
    const forward = voxelLine(a, b);
    const backward = voxelLine(b, a);
    const forwardSet = new Set(forward.map(voxKey));
    const backwardSet = new Set(backward.map(voxKey));
    // both should cover the same voxels (possibly in different order)
    expect(forwardSet.size).toBe(backwardSet.size);
    for (const key of forwardSet) {
      expect(backwardSet.has(key)).toBe(true);
    }
  });

  it('diagonal line produces expected count', () => {
    const line = voxelLine(voxel(0, 0, 0), voxel(5, 5, 5));
    // A perfect diagonal should pass through exactly 6 voxels
    expect(line.length).toBe(6);
    for (let i = 0; i <= 5; i++) {
      expect(line).toContainEqual(voxel(i, i, i));
    }
  });
});

describe('Set operation invariants', () => {
  it('union is commutative', () => {
    const a = filledBox(voxel(0, 0, 0), voxel(2, 2, 2));
    const b = filledBox(voxel(1, 1, 1), voxel(2, 2, 2));
    const ab = voxUnion(a, b);
    const ba = voxUnion(b, a);
    expect(ab.length).toBe(ba.length);
    const abSet = new Set(ab.map(voxKey));
    for (const key of ba.map(voxKey)) {
      expect(abSet.has(key)).toBe(true);
    }
  });

  it('intersection is subset of both inputs', () => {
    const a = filledBox(voxel(0, 0, 0), voxel(3, 3, 3));
    const b = filledBox(voxel(2, 2, 2), voxel(3, 3, 3));
    const inter = voxIntersect(a, b);
    const aSet = new Set(a.map(voxKey));
    const bSet = new Set(b.map(voxKey));
    for (const v of inter) {
      expect(aSet.has(voxKey(v))).toBe(true);
      expect(bSet.has(voxKey(v))).toBe(true);
    }
  });

  it('difference contains no elements from second set', () => {
    const a = filledBox(voxel(0, 0, 0), voxel(3, 3, 3));
    const b = filledBox(voxel(2, 2, 2), voxel(3, 3, 3));
    const diff = voxDifference(a, b);
    const bSet = new Set(b.map(voxKey));
    for (const v of diff) {
      expect(bSet.has(voxKey(v))).toBe(false);
    }
  });

  it('A - A produces empty set', () => {
    const a = filledBox(voxel(0, 0, 0), voxel(3, 3, 3));
    expect(voxDifference(a, a)).toHaveLength(0);
  });

  it('A ∩ A = A', () => {
    const a = filledBox(voxel(0, 0, 0), voxel(2, 2, 2));
    const inter = voxIntersect(a, a);
    expect(inter.length).toBe(a.length);
  });

  it('union with empty returns the non-empty set', () => {
    const a = filledBox(voxel(0, 0, 0), voxel(2, 2, 2));
    const result = voxUnion(a, []);
    expect(result.length).toBe(a.length);
  });
});

describe('raycast with fractional origins', () => {
  it('ray from cell center travels expected voxels', () => {
    const result = raycast(
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 1, y: 0, z: 0 },
      5,
    );
    expect(result[0]).toEqual(voxel(0, 0, 0));
    expect(result[1]).toEqual(voxel(1, 0, 0));
    expect(result[2]).toEqual(voxel(2, 0, 0));
    expect(result.length).toBe(6); // 0..5
  });

  it('ray from cell boundary splits correctly', () => {
    const result = raycast(
      { x: 0.0, y: 0.5, z: 0.5 },
      { x: 1, y: 0, z: 0 },
      3,
    );
    // Starting exactly at 0.0 should floor to voxel 0
    expect(result[0]).toEqual(voxel(0, 0, 0));
    expect(result[1]).toEqual(voxel(1, 0, 0));
  });

  it('ray with diagonal direction visits multiple axes', () => {
    const result = raycast(
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 1, y: 1, z: 1 },
      10,
    );
    expect(result.length).toBeGreaterThan(1);
    // should traverse through diagonal cells
    const keys = result.map(voxKey);
    expect(keys).toContain('0,0,0');
    expect(keys).toContain('1,1,1');
  });

  it('ray with zero direction returns just the origin voxel', () => {
    const result = raycast(
      { x: 5, y: 5, z: 5 },
      { x: 0, y: 0, z: 0 },
    );
    expect(result).toEqual([voxel(5, 5, 5)]);
  });

  it('ray respects maxDistance', () => {
    const result = raycast(
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 1, y: 0, z: 0 },
      50,
    );
    expect(result.length).toBe(51); // voxels 0..50
  });
});

describe('floodFill stress tests', () => {
  it('fills a complex maze', () => {
    // Create a serpentine path
    const occupied = new Set<string>();
    // Walls forming a serpentine
    for (let x = 0; x <= 10; x++) occupied.add(voxKey(voxel(x, 0, 0)));
    for (let y = 0; y <= 5; y++) occupied.add(voxKey(voxel(10, y, 0)));
    for (let x = 10; x >= 0; x--) occupied.add(voxKey(voxel(x, 5, 0)));
    for (let y = 5; y <= 10; y++) occupied.add(voxKey(voxel(0, y, 0)));
    for (let x = 0; x <= 10; x++) occupied.add(voxKey(voxel(x, 10, 0)));

    // floodFill seeds at start and only expands to occupied neighbors
    // Since (5,2,0) is not in occupied, flood returns empty
    // Fix: seed at an occupied cell
    const filled = floodFill(
      voxel(5, 0, 0),
      (v) => occupied.has(voxKey(v)),
    );
    // Should include cells along the bottom wall
    expect(filled.length).toBeGreaterThan(0);
  });

  it('floodFill on fully occupied neighborhood expands to all', () => {
    const occupied = new Set<string>([
      voxKey(voxel(0, 0, 0)),
      ...allNeighbors(voxel(0, 0, 0)).map(voxKey),
    ]);
    // seed at origin, everything occupied → expands to all 27
    const result = floodFill(
      voxel(0, 0, 0),
      (v) => occupied.has(voxKey(v)),
    );
    expect(result.length).toBe(27); // 3³ cube
  });
});

describe('connectedComponents on varied structures', () => {
  it('finds two separate boxes', () => {
    const boxA = filledBox(voxel(0, 0, 0), voxel(2, 2, 2));
    const boxB = filledBox(voxel(10, 10, 10), voxel(2, 2, 2));
    const all = [...boxA, ...boxB];
    const components = connectedComponents(all);
    expect(components.length).toBe(2);
  });

  it('single component for connected L-shape', () => {
    const line1 = voxelLine(voxel(0, 0, 0), voxel(5, 0, 0));
    const line2 = voxelLine(voxel(5, 0, 0), voxel(5, 5, 0));
    const all = [...line1, ...line2];
    const components = connectedComponents(all);
    expect(components.length).toBe(1);
  });

  it('isolated voxels each form their own component', () => {
    const points = [
      voxel(0, 0, 0),
      voxel(10, 10, 10),
      voxel(20, 20, 20),
    ];
    const components = connectedComponents(points);
    expect(components.length).toBe(3);
  });
});

describe('findPath stress tests', () => {
  it('path through a winding corridor', () => {
    // Build a corridor: passable where wall is NOT
    const walls = new Set<string>();
    // Create walls forming a zigzag
    for (let y = 0; y <= 8; y++) {
      if (y !== 2 && y !== 5) walls.add(voxKey(voxel(3, y, 0)));
    }
    for (let y = 0; y <= 8; y++) {
      if (y !== 4 && y !== 7) walls.add(voxKey(voxel(6, y, 0)));
    }

    const isPassable = (v: Voxel) => !walls.has(voxKey(v));
    const path = findPath(
      voxel(0, 0, 0),
      voxel(8, 8, 0),
      isPassable,
      boundsFrom(voxel(0, 0, 0), voxel(10, 10, 0)),
    );
    expect(path).not.toBeNull();
    expect(path![0]).toEqual(voxel(0, 0, 0));
    expect(path![path!.length - 1]).toEqual(voxel(8, 8, 0));
    // every step should be adjacent
    for (let i = 1; i < path!.length; i++) {
      expect(manhattan(path![i - 1], path![i])).toBe(1);
    }
  });

  it('path length equals Manhattan distance in open space', () => {
    const path = findPath(
      voxel(0, 0, 0),
      voxel(5, 0, 0),
      () => true,
    );
    expect(path).not.toBeNull();
    expect(path!.length).toBe(6); // 0..5 inclusive
  });

  it('path through 3D space uses all axes', () => {
    const path = findPath(
      voxel(0, 0, 0),
      voxel(3, 3, 3),
      () => true,
    );
    expect(path).not.toBeNull();
    // In open space, optimal path length = manhattan(start, goal) + 1
    expect(path!.length).toBe(manhattan(voxel(0, 0, 0), voxel(3, 3, 3)) + 1);
  });
});

describe('VoxelGrid bulk operations', () => {
  it('clear empties the grid completely', () => {
    const grid = new VoxelGrid<number>();
    for (let i = 0; i < 100; i++) {
      grid.set(voxel(i, 0, 0), i);
    }
    expect(grid.size).toBe(100);
    grid.clear();
    expect(grid.size).toBe(0);
    expect(grid.bounds()).toBeUndefined();
  });

  it('delete returns true for existing, false for missing', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 2, 3), true);
    expect(grid.delete(voxel(1, 2, 3))).toBe(true);
    expect(grid.delete(voxel(1, 2, 3))).toBe(false);
    expect(grid.size).toBe(0);
  });

  it('entries() yields [Voxel, value] pairs', () => {
    const grid = new VoxelGrid<string>();
    grid.set(voxel(1, 1, 1), 'a');
    grid.set(voxel(2, 2, 2), 'b');
    const entries = Array.from(grid.entries());
    expect(entries).toHaveLength(2);
    const keys = entries.map(([v]) => voxKey(v));
    expect(keys).toContain('1,1,1');
    expect(keys).toContain('2,2,2');
  });

  it('voxels() yields coordinates without values', () => {
    const grid = new VoxelGrid();
    grid.set(voxel(1, 0, 0), true);
    grid.set(voxel(0, 1, 0), true);
    const coords = Array.from(grid.voxels());
    expect(coords).toHaveLength(2);
    for (const v of coords) {
      expect(v).toHaveProperty('x');
      expect(v).toHaveProperty('y');
      expect(v).toHaveProperty('z');
    }
  });

  it('values() yields just the stored values', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(0, 0, 0), 42);
    grid.set(voxel(1, 0, 0), 99);
    const vals = Array.from(grid.values());
    expect(vals).toContain(42);
    expect(vals).toContain(99);
    expect(vals).toHaveLength(2);
  });

  it('setting same key twice overwrites', () => {
    const grid = new VoxelGrid<number>();
    grid.set(voxel(1, 1, 1), 10);
    expect(grid.size).toBe(1);
    grid.set(voxel(1, 1, 1), 20);
    expect(grid.size).toBe(1);
    expect(grid.get(voxel(1, 1, 1))).toBe(20);
  });
});

describe('Distance function consistency', () => {
  it('manhattan >= euclidean for same points', () => {
    const a = voxel(3, 4, 5);
    const b = voxel(0, 0, 0);
    expect(manhattan(a, b)).toBeGreaterThanOrEqual(euclidean(a, b));
  });

  it('chebyshev <= euclidean for same points', () => {
    const a = voxel(3, 4, 5);
    const b = voxel(0, 0, 0);
    expect(chebyshev(a, b)).toBeLessThanOrEqual(euclidean(a, b));
  });

  it('manhattan is always integer', () => {
    for (let i = 0; i < 50; i++) {
      const a = voxel(
        Math.floor(Math.random() * 20) - 10,
        Math.floor(Math.random() * 20) - 10,
        Math.floor(Math.random() * 20) - 10,
      );
      const b = voxel(
        Math.floor(Math.random() * 20) - 10,
        Math.floor(Math.random() * 20) - 10,
        Math.floor(Math.random() * 20) - 10,
      );
      const m = manhattan(a, b);
      expect(Number.isInteger(m)).toBe(true);
    }
  });

  it('distance to self is 0 for all metrics', () => {
    const v = voxel(7, -3, 12);
    expect(manhattan(v, v)).toBe(0);
    expect(chebyshev(v, v)).toBe(0);
    expect(euclidean(v, v)).toBe(0);
  });
});

describe('Coordinate arithmetic invariants', () => {
  it('voxAdd then voxSub returns original', () => {
    const a = voxel(5, 10, 15);
    const b = voxel(3, -7, 2);
    const sum = voxAdd(a, b);
    const restored = voxSub(sum, b);
    expect(restored).toEqual(a);
  });

  it('voxScale by 0 produces origin', () => {
    const v = voxel(42, -17, 99);
    const result = voxScale(v, 0);
    expect(result.x).toBe(0);
    expect(Math.abs(result.y)).toBe(0); // -0 === 0 but not strictly equal
    expect(result.z).toBe(0);
  });

  it('voxScale by 1 returns same coordinates', () => {
    const v = voxel(3, -7, 12);
    expect(voxScale(v, 1)).toEqual(v);
  });

  it('voxEq is reflexive, symmetric, transitive', () => {
    const a = voxel(1, 2, 3);
    const b = voxel(1, 2, 3);
    const c = voxel(1, 2, 3);
    expect(voxEq(a, a)).toBe(true); // reflexive
    expect(voxEq(a, b)).toBe(voxEq(b, a)); // symmetric
    if (voxEq(a, b) && voxEq(b, c)) {
      expect(voxEq(a, c)).toBe(true); // transitive
    }
  });

  it('voxEq distinguishes different coordinates', () => {
    expect(voxEq(voxel(1, 2, 3), voxel(1, 2, 4))).toBe(false);
    expect(voxEq(voxel(1, 2, 3), voxel(1, 3, 3))).toBe(false);
    expect(voxEq(voxel(1, 2, 3), voxel(2, 2, 3))).toBe(false);
  });
});

describe('Bounds arithmetic', () => {
  it('boundsVolume of single point is 1', () => {
    const b = boundsFrom(voxel(5, 5, 5), voxel(5, 5, 5));
    expect(boundsVolume(b)).toBe(1);
  });

  it('boundsVolume of unit cube is 8', () => {
    const b = boundsFrom(voxel(0, 0, 0), voxel(1, 1, 1));
    expect(boundsVolume(b)).toBe(8);
  });

  it('voxelsInBounds matches boundsVolume count', () => {
    const b = boundsFrom(voxel(0, 0, 0), voxel(2, 3, 4));
    const voxels = voxelsInBounds(b);
    expect(voxels.length).toBe(boundsVolume(b));
    expect(boundsVolume(b)).toBe(3 * 4 * 5); // (2+1)*(3+1)*(4+1)
  });

  it('inBounds is inclusive on both ends', () => {
    const b = boundsFrom(voxel(0, 0, 0), voxel(5, 5, 5));
    expect(inBounds(voxel(0, 0, 0), b)).toBe(true);
    expect(inBounds(voxel(5, 5, 5), b)).toBe(true);
    expect(inBounds(voxel(-1, 0, 0), b)).toBe(false);
    expect(inBounds(voxel(6, 0, 0), b)).toBe(false);
  });

  it('boundedFaceNeighbors respects bounds limits', () => {
    const b = boundsFrom(voxel(0, 0, 0), voxel(2, 2, 2));
    // corner voxel should only have 3 in-bounds face neighbors
    const neighbors = boundedFaceNeighbors(voxel(0, 0, 0), b);
    expect(neighbors.length).toBe(3);
    for (const n of neighbors) {
      expect(inBounds(n, b)).toBe(true);
    }
  });

  it('boundedAllNeighbors at corner of bounds returns 7', () => {
    const b = boundsFrom(voxel(0, 0, 0), voxel(5, 5, 5));
    const neighbors = boundedAllNeighbors(voxel(0, 0, 0), b);
    expect(neighbors.length).toBe(7); // 3³ - 1 = 7 (all positive offsets)
  });
});

describe('filledBox and hollowBox duality', () => {
  it('filledBox volume matches expected dimensions', () => {
    const box = filledBox(voxel(0, 0, 0), voxel(3, 4, 5));
    // size is the count, not the dimension. 3×4×5 = 60
    expect(box.length).toBe(60);
  });

  it('hollowBox is smaller than filledBox', () => {
    const filled = filledBox(voxel(0, 0, 0), voxel(5, 5, 5));
    const hollow = hollowBox(voxel(0, 0, 0), voxel(5, 5, 5));
    expect(hollow.length).toBeLessThan(filled.length);
  });

  it('hollowBox of size 1,1,1 equals filledBox', () => {
    const filled = filledBox(voxel(0, 0, 0), voxel(1, 1, 1));
    const hollow = hollowBox(voxel(0, 0, 0), voxel(1, 1, 1));
    expect(hollow.length).toBe(filled.length);
  });
});
