/**
 * Example: A* Pathfinding Through a Maze
 *
 * Generate a simple 3D maze, then find paths through it.
 * Demonstrates findPath, floodFill, and connectedComponents.
 */

import {
  voxel,
  VoxelGrid,
  filledBox,
  voxelLine,
  findPath,
  connectedComponents,
  floodFill,
  manhattan,
  type Voxel,
} from '../src/index';

// --- Build a maze: 20×20 grid with walls ---
const maze = new VoxelGrid<'wall' | 'floor' | 'start' | 'goal'>();

// Floor
const floor = filledBox(voxel(0, 0, 0), voxel(19, 0, 19));
for (const v of floor) maze.set(v, 'floor');

// Perimeter walls
for (let x = 0; x < 20; x++) {
  maze.set(voxel(x, 1, 0), 'wall');
  maze.set(voxel(x, 1, 19), 'wall');
}
for (let z = 0; z < 20; z++) {
  maze.set(voxel(0, 1, z), 'wall');
  maze.set(voxel(19, 1, z), 'wall');
}

// Internal walls (simple labyrinth)
const wallSegments = [
  [voxel(3, 1, 1), voxel(3, 1, 15)],
  [voxel(3, 1, 15), voxel(8, 1, 15)],
  [voxel(8, 1, 3), voxel(8, 1, 12)],
  [voxel(8, 1, 3), voxel(15, 1, 3)],
  [voxel(12, 1, 5), voxel(12, 1, 18)],
  [voxel(12, 1, 10), voxel(17, 1, 10)],
];

for (const [a, b] of wallSegments) {
  const wall = voxelLine(a, b);
  for (const v of wall) maze.set(v, 'wall');
}

// Markers
maze.set(voxel(1, 1, 1), 'start');
maze.set(voxel(18, 1, 18), 'goal');

console.log('Maze built: 20×20 with internal walls');
console.log(`Walls: ${[...maze.entries()].filter(([, v]) => v === 'wall').length}`);

// --- Find path from start to goal ---
const isPassable = (v: Voxel) => {
  const val = maze.get(v);
  return val === 'floor' || val === 'start' || val === 'goal';
};

const path = findPath(
  voxel(1, 1, 1),
  voxel(18, 1, 18),
  isPassable,
);

if (path) {
  console.log(`\nPath found: ${path.length} steps`);
  console.log(`Manhattan distance: ${manhattan(voxel(1, 1, 1), voxel(18, 1, 18))}`);
  console.log(`Path efficiency: ${(manhattan(voxel(1, 1, 1), voxel(18, 1, 18)) / path.length * 100).toFixed(1)}%`);
} else {
  console.log('\nNo path found!');
}

// --- Flood fill from start: how much is reachable? ---
const reachable = floodFill(voxel(1, 1, 1), isPassable);
console.log(`\nReachable from start: ${reachable.length} cells`);

// --- Connected components: are there isolated regions? ---
const allFloor: Voxel[] = [];
for (const [v, val] of maze.entries()) {
  if (val === 'floor' || val === 'start' || val === 'goal') {
    allFloor.push(v);
  }
}
const components = connectedComponents(allFloor);
console.log(`Connected regions: ${components.length}`);
for (let i = 0; i < components.length; i++) {
  console.log(`  Region ${i + 1}: ${components[i].length} cells`);
}
