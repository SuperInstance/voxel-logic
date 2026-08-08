# @superinstance/voxel-logic

> Voxel-based spatial reasoning for multi-agent systems — discrete 3D grid logic.

## Overview

`voxel-logic` provides a complete toolkit for working with 3D voxel grids: coordinate math, sparse storage, shape generation, neighbor queries, flood fill, connected components, set operations, raycasting, and A* pathfinding.

Designed for agents and simulations that need to reason about discrete 3D space efficiently.

## Installation

```bash
npm install @superinstance/voxel-logic
```

## Quick start

```typescript
import {
  voxel, VoxelGrid, filledSphere, floodFill, findPath, raycast,
} from '@superinstance/voxel-logic';

// Create a sparse grid
const grid = new VoxelGrid<string>();
grid.set(voxel(0, 0, 0), 'spawn');
grid.set(voxel(1, 0, 0), 'corridor');

// Generate a sphere shape
const sphere = filledSphere(voxel(5, 5, 5), 3);

// Raycast through space
const hits = raycast(voxel(0.5, 0.5, 0.5), voxel(1, 0, 0), 50);

// Pathfinding
const path = findPath(
  voxel(0, 0, 0),
  voxel(10, 0, 0),
  (v) => grid.has(v),  // passable check
);
```

## API

### Coordinates

| Function | Description |
|----------|-------------|
| `voxel(x, y, z)` | Create a voxel coordinate |
| `voxEq(a, b)` | Check equality |
| `voxAdd(a, b)` / `voxSub(a, b)` | Add / subtract offsets |
| `voxScale(v, s)` | Scale by a scalar |
| `manhattan(a, b)` | Manhattan (L1) distance |
| `chebyshev(a, b)` | Chebyshev (L∞) distance |
| `euclidean(a, b)` | Euclidean distance |
| `voxKey(v)` / `fromKey(key)` | Encode / decode to string key |

### Bounds

| Function | Description |
|----------|-------------|
| `boundsFrom(a, b)` | Create a bounding box from two corners |
| `inBounds(v, bounds)` | Check containment |
| `voxelsInBounds(bounds)` | Enumerate all voxels in bounds |
| `boundsVolume(bounds)` | Count voxels in bounds |

### Neighbors

| Function | Description |
|----------|-------------|
| `faceNeighbors(v)` | 6 face-adjacent neighbors (von Neumann) |
| `allNeighbors(v)` | All 26 neighbors (Moore neighborhood) |
| `boundedFaceNeighbors(v, b)` | Face neighbors within bounds |
| `boundedAllNeighbors(v, b)` | All neighbors within bounds |

### VoxelGrid

Sparse hash-map backed storage for arbitrary values at voxel coordinates.

```typescript
const grid = new VoxelGrid<number>();
grid.set(voxel(1, 2, 3), 42);
grid.get(voxel(1, 2, 3));  // 42
grid.has(voxel(1, 2, 3));  // true
grid.size;                   // 1
grid.bounds();               // { min: {1,2,3}, max: {1,2,3} }
grid.adjacentTo(voxel(0,2,3)); // [{ x:1, y:2, z:3 }]
```

### Shapes

| Function | Description |
|----------|-------------|
| `filledBox(corner, size)` | All voxels in a solid box |
| `hollowBox(corner, size)` | Only surface voxels of a box |
| `voxelLine(a, b)` | 3D Bresenham line |
| `filledSphere(center, radius)` | Solid sphere |
| `hollowSphere(center, radius)` | Sphere shell |

### Algorithms

| Function | Description |
|----------|-------------|
| `floodFill(start, isOccupied, bounds?)` | Connected region from a seed |
| `connectedComponents(voxels, bounds?)` | All disconnected groups |
| `findPath(start, goal, isPassable, bounds?)` | A* shortest path |
| `raycast(origin, direction, maxDist)` | Amanatides & Woo voxel traversal |

### Set operations

| Function | Description |
|----------|-------------|
| `voxUnion(a, b)` | Union of two voxel sets |
| `voxIntersect(a, b)` | Intersection |
| `voxDifference(a, b)` | Set difference |

## License

MIT © SuperInstance
