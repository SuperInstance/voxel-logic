# Examples

Practical demonstrations of voxel-logic in action.

## Files

| Example | What It Shows | Key APIs |
|---------|---------------|----------|
| [`terrain-basics.ts`](./terrain-basics.ts) | Building a world from scratch — ground, hills, caves, water pools, then pathfinding and raycasting across the result | `VoxelGrid`, `filledSphere`, `hollowSphere`, `floodFill`, `findPath`, `raycast` |
| [`pathfinding-demo.ts`](./pathfinding-demo.ts) | Generating a 3D maze, finding paths through it, measuring efficiency, and detecting isolated regions | `findPath`, `floodFill`, `connectedComponents`, `manhattan`, `voxelLine` |
| [`set-operations.ts`](./set-operations.ts) | Constructive solid geometry — union, intersection, and difference applied to overlapping spheres and room construction | `voxUnion`, `voxIntersect`, `voxDifference`, `filledBox`, `filledSphere` |

## Running

```bash
# From the voxel-logic root
npx tsx examples/terrain-basics.ts
npx tsx examples/pathfinding-demo.ts
npx tsx examples/set-operations.ts
```

## What These Teach

- **Terrain basics:** The full pipeline from empty grid to populated world to navigation. This is the pattern the `terrain` and `mud-engine` repos build on.

- **Pathfinding:** How A* works on a voxel grid, how to measure path quality, and how flood fill + connected components give you structural understanding of the space.

- **Set operations:** The CSG workflow — carve rooms from solid blocks, find overlap regions, create crescents and lenses. The mathematical foundation for constructive world-building.
