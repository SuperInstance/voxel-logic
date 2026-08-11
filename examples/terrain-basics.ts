/**
 * Example: Terrain Generation Basics
 *
 * Build a simple terrain scene using voxel-logic primitives.
 * Creates a ground plane, raises a hill, carves a cave, and finds a path through it.
 */

import {
  voxel,
  VoxelGrid,
  filledBox,
  filledSphere,
  hollowSphere,
  floodFill,
  findPath,
  raycast,
  voxEq,
  type Voxel,
} from '../src/index';

// --- 1. Create the world ---
const world = new VoxelGrid<'stone' | 'dirt' | 'grass' | 'air' | 'water'>();

// Ground plane: 32×32 at y=0, grass on top, dirt below
for (let x = 0; x < 32; x++) {
  for (let z = 0; z < 32; z++) {
    world.set(voxel(x, 0, z), 'grass');
    world.set(voxel(x, -1, z), 'dirt');
    world.set(voxel(x, -2, z), 'stone');
  }
}

console.log(`World created: ${world.size()} voxels`);

// --- 2. Raise a hill ---
const hillCenter = voxel(16, 0, 16);
const hillBase = filledSphere(hillCenter, 4);
for (const v of hillBase) {
  if (v.y >= 0) {
    world.set(v, 'dirt');
    // Grass cap on top of hill
    world.set(voxel(v.x, v.y + 1, v.z), 'grass');
  }
}
console.log(`Hill raised at ${hillCenter.x},${hillCenter.y},${hillCenter.z}`);

// --- 3. Carve a cave ---
const caveStart = voxel(8, -1, 8);
const caveShape = hollowSphere(caveStart, 3);
for (const v of caveShape) {
  if (world.get(v) === 'stone' || world.get(v) === 'dirt') {
    world.set(v, 'air');
  }
}
console.log(`Cave carved at ${caveStart.x},${caveStart.y},${caveStart.z}`);

// --- 4. Add water pool ---
const poolCenter = voxel(4, 0, 20);
const poolBase = filledBox(voxel(2, 0, 18), voxel(6, 0, 22));
for (const v of poolBase) {
  if (world.get(v) === 'grass' || !world.has(v)) {
    world.set(v, 'water');
  }
}
console.log(`Pool placed at ${poolCenter.x},${poolCenter.y},${poolCenter.z}`);

// --- 5. Flood fill: find all connected air/water ---
const surfaceRegion = floodFill(voxel(0, 1, 0), (v) => {
  const val = world.get(v);
  return val === 'air' || val === 'water' || val === undefined;
});
console.log(`Surface air region: ${surfaceRegion.length} connected voxels`);

// --- 6. Pathfinding: walk from corner to hill ---
const path = findPath(
  voxel(1, 1, 1),
  voxel(16, 5, 16),
  (v) => {
    const val = world.get(v);
    return val === 'air' || val === undefined || val === 'grass';
  },
);

if (path) {
  console.log(`Path found: ${path.length} steps from corner to hilltop`);
} else {
  console.log('No path found — terrain is blocked');
}

// --- 7. Raycasting: line of sight from hill to corner ---
const sightLine = raycast(voxel(16, 6, 16), voxel(1, 1, 1), 100);
console.log(`Line of sight: ${sightLine.length} voxels in beam`);

// --- Summary ---
console.log('\n=== World Summary ===');
console.log(`Total voxels: ${world.size()}`);
console.log(`Bounds: ${JSON.stringify(world.bounds())}`);

// Count by type
const counts: Record<string, number> = {};
for (const [, val] of world.entries()) {
  counts[val] = (counts[val] || 0) + 1;
}
for (const [type, count] of Object.entries(counts)) {
  console.log(`  ${type}: ${count}`);
}
