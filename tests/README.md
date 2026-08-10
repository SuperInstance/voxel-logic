# Voxel Logic — Tests

> *99.7% coverage. Every critical path probed until only the reliable remains.*

## Suites

| File | Lines | Focus |
|------|-------|-------|
| [`voxel-logic.test.ts`](./voxel-logic.test.ts) | 356 | Core: coordinates, equality, arithmetic, distances, bounds, neighbors, VoxelGrid CRUD, basic shapes |
| [`voxel-logic-extended.test.ts`](./voxel-logic-extended.test.ts) | 825 | Extended: complex multi-step shapes, flood fill on real topologies, A* through mazes, raycast accuracy, set operation chains, performance edge cases |
| [`voxel-logic-coverage.test.ts`](./voxel-logic-coverage.test.ts) | 238 | Coverage gap-filling: empty grids, single-voxel grids, degenerate bounds, negative coordinates, boundary conditions on all algorithms |

```bash
npm test              # All tests
npm run test:coverage # Coverage report
npm run test:watch    # Watch mode
```

**Stack:** Jest + ts-jest · Node ≥ 14

## What's Verified

- **Coordinate math:** Addition, subtraction, scaling, equality, key encoding/decoding
- **Distance functions:** Manhattan, Chebyshev, Euclidean all match mathematical definitions
- **Bounds:** Containment, enumeration, volume calculation — including edge cases
- **Neighbors:** 6-face and 26-all variants, bounded versions respect limits
- **VoxelGrid:** CRUD operations, bounds computation, adjacency queries, iteration
- **Shapes:** Box (filled/hollow), sphere (filled/hollow), line (Bresenham) — all geometrically correct
- **Flood fill:** Correctly identifies connected regions, respects bounds, handles single-cell regions
- **Connected components:** Groups isolated voxels correctly, handles empty input
- **A* pathfinding:** Finds optimal paths, handles blocked goals, respects passability function
- **Raycasting:** Amanatides-Woo traversal matches expected voxel sequence, respects max distance
- **Set operations:** Union, intersection, difference produce correct results on all combinations

## Related

- [Voxel Logic README](../README.md)
- [Source](../src/)
