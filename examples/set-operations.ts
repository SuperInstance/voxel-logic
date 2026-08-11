/**
 * Example: Set Operations on Voxel Collections
 *
 * Demonstrate union, intersection, and difference
 * for constructive solid geometry (CSG) in voxel space.
 */

import {
  voxel,
  filledSphere,
  hollowSphere,
  filledBox,
  voxUnion,
  voxIntersect,
  voxDifference,
  type Voxel,
} from '../src/index';

// --- Build two overlapping shapes ---
const sphereA = filledSphere(voxel(0, 0, 0), 5);
const sphereB = filledSphere(voxel(4, 0, 0), 5);

console.log(`Sphere A: ${sphereA.length} voxels (radius 5)`);
console.log(`Sphere B: ${sphereB.length} voxels (radius 5)`);

// --- Union: combined shape ---
const combined = voxUnion(sphereA, sphereB);
console.log(`\nUnion: ${combined.length} voxels`);
console.log('(should be less than A + B due to overlap)`);
console.log(`Overlap: ${sphereA.length + sphereB.length - combined.length} shared voxels`);

// --- Intersection: only where both shapes exist ---
const core = voxIntersect(sphereA, sphereB);
console.log(`\nIntersection: ${core.length} voxels`);
console.log('(the lens-shaped region where both spheres overlap)');

// --- Difference: A minus B ---
const crescent = voxDifference(sphereA, sphereB);
console.log(`\nDifference (A - B): ${crescent.length} voxels`);
console.log('(sphere A with sphere B carved out — a crescent)');

// --- Practical: build a hollow room with a door ---
const room = filledBox(voxel(0, 0, 0), voxel(10, 5, 10));
const interior = filledBox(voxel(1, 1, 1), voxel(9, 4, 9));
const walls = voxDifference(room, interior);

// Carve a door
const door = filledBox(voxel(4, 0, 0), voxel(6, 2, 0));
const roomWithDoor = voxDifference(walls, door);

console.log(`\n=== Room Construction ===`);
console.log(`Solid block: ${room.length} voxels`);
console.log(`Interior carved: ${interior.length} voxels removed`);
console.log(`Walls only: ${walls.length} voxels`);
console.log(`Door carved: ${door.length} voxels removed`);
console.log(`Final room: ${roomWithDoor.length} voxels`);

// --- Verify the door is open ---
const doorOpening = voxIntersect(
  filledBox(voxel(4, 0, 0), voxel(6, 2, 0)),
  roomWithDoor,
);
console.log(`Door blocked? ${doorOpening.length > 0 ? 'No — doorway is open' : 'Yes — doorway still blocked'}`);
