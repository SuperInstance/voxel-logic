# 🧊 Voxel Logic — Discrete 3D Spatial Reasoning

> *This is terrain made computable: the wild, unstructured bulk of ground and sky reduced to consistent, predictable rules upon which you may build anything.*

A complete voxel toolkit in 733 lines of TypeScript: sparse storage, shape generation, neighbor queries, flood fill, connected components, A* pathfinding, raycasting, and set operations. **99.7% test coverage** across 1,419 lines of tests.

**npm:** `@superinstance/voxel-logic`
**Repo:** [SuperInstance/voxel-logic](https://github.com/SuperInstance/voxel-logic)

---

## What This Does

| Capability | Function | Algorithm |
|-----------|----------|-----------|
| **Sparse storage** | `VoxelGrid<T>` | Hash-map backed — empty air costs nothing |
| **Coordinate math** | `voxel`, `voxAdd`, `manhattan`, `chebyshev`, `euclidean` | L1, L∞, L2 distances |
| **Neighbor queries** | `faceNeighbors` (6), `allNeighbors` (26) | von Neumann + Moore neighborhoods |
| **Shapes** | `filledBox`, `hollowBox`, `voxelLine`, `filledSphere`, `hollowSphere` | 3D Bresenham line, true sphere |
| **Flood fill** | `floodFill(start, isOccupied)` | BFS connected region |
| **Components** | `connectedComponents(voxels)` | All disconnected groups |
| **Pathfinding** | `findPath(start, goal, isPassable)` | A* with Manhattan heuristic |
| **Raycasting** | `raycast(origin, direction, maxDist)` | Amanatides & Woo voxel traversal |
| **Set operations** | `voxUnion`, `voxIntersect`, `voxDifference` | Set algebra on voxel collections |

---

## Quick Start

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

// Raycast through space (Amanatides-Woo)
const hits = raycast(voxel(0, 0, 0), voxel(1, 0, 0), 50);

// A* pathfinding
const path = findPath(
  voxel(0, 0, 0),
  voxel(10, 0, 0),
  (v) => grid.has(v),  // passable check
);
```

---

## API Overview

### Coordinates & Distances
`voxel(x,y,z)` · `voxEq` · `voxAdd` · `voxSub` · `voxScale` · `manhattan` · `chebyshev` · `euclidean` · `voxKey` · `fromKey`

### Bounds
`boundsFrom` · `inBounds` · `voxelsInBounds` · `boundsVolume`

### Neighbors
`faceNeighbors` (6 faces) · `allNeighbors` (26 Moore) · bounded variants

### VoxelGrid
`set` · `get` · `has` · `delete` · `size` · `bounds` · `adjacentTo` · `entries`

### Shapes
`filledBox` · `hollowBox` · `voxelLine` (3D Bresenham) · `filledSphere` · `hollowSphere`

### Algorithms
`floodFill` · `connectedComponents` · `findPath` (A*) · `raycast` (Amanatides-Woo)

### Set Operations
`voxUnion` · `voxIntersect` · `voxDifference`

---

## Terrain Connection

Voxels ARE terrain. This library is the computational substrate for:

- **→ [terrain](https://github.com/SuperInstance/terrain)** — MUD-to-visual bridge using voxel grids
- **→ [mud-engine](https://github.com/SuperInstance/mud-engine)** — world topology as voxel adjacency
- **→ [spatial-registry](https://github.com/SuperInstance/spatial-registry)** — room placement on 3D grid
- **→ [room-render](https://github.com/SuperInstance/room-render)** — voxel-based room rendering
- **→ [base60-lattice](https://github.com/SuperInstance/base60-lattice)** — hexagonal tiling ↔ voxel grid
- **→ [officers-quarters](https://github.com/SuperInstance/officers-quarters)** — Phaser game client with tile-based rooms
- **→ [scummvm-prototype](https://github.com/SuperInstance/scummvm-prototype)** — room-based adventure game
- **→ [Lucineer Roblox](https://github.com/SuperInstance/AI-Writings)** — 3D build placement

---

## Reef Connection

The fleet's spatial topology is The Reef: [mud-engine](https://github.com/SuperInstance/mud-engine) → [spatial-registry](https://github.com/SuperInstance/spatial-registry) → [room-render](https://github.com/SuperInstance/room-render) → [terrain](https://github.com/SuperInstance/terrain) → [scummvm-prototype](https://github.com/SuperInstance/scummvm-prototype). Voxel-logic provides the discrete 3D math underneath all of them — the grid the reef grows on.

---

## Testing

```bash
npm test              # Run all tests
npm run test:coverage # Generate coverage report
npm run test:watch    # Watch mode
```

| Suite | Lines | Focus |
|-------|-------|-------|
| [`voxel-logic.test.ts`](./tests/voxel-logic.test.ts) | 356 | Core functionality — coordinates, bounds, neighbors, grid, shapes |
| [`voxel-logic-extended.test.ts`](./tests/voxel-logic-extended.test.ts) | 825 | Extended scenarios — complex shapes, multi-step algorithms, edge cases |
| [`voxel-logic-coverage.test.ts`](./tests/voxel-logic-coverage.test.ts) | 238 | Coverage gap-filling — boundary conditions, empty inputs, degenerate geometry |

**Coverage: 99.7%** — every critical path, every edge case, every fallible assumption probed.

---

## Design Notes

- **Sparse by default:** Empty voxels consume zero memory. The hash-map only stores occupied cells.
- **Pure functions:** Shape generators and algorithms are pure — they return voxel arrays without side effects.
- **Bounds optional:** Most algorithms accept optional bounds for performance (avoids exploring infinite space).
- **Generic values:** `VoxelGrid<T>` stores any value type at each voxel — strings, numbers, objects.

---

## Fleet Certification

- ✅ [CHARTER.md](./CHARTER.md) — Mission and fleet integration
- ✅ [DOCKSIDE-EXAM.md](./DOCKSIDE-EXAM.md) — Coast Guard fleet certification checklist
- ✅ [CONTRIBUTING.md](./CONTRIBUTING.md) — Development practices

---

## License

MIT © SuperInstance
