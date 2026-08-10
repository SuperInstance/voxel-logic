# Voxel Logic — Source

733 lines of TypeScript. One file. Complete 3D voxel toolkit.

## Structure

```
src/
└── index.ts   — All exports (coordinates, grid, shapes, algorithms, set ops)
```

## Sections in `index.ts`

| Lines | Section | What It Contains |
|-------|---------|-----------------|
| 1–50 | Types & Constants | `Voxel`, `VoxelCell<T>`, `FACES` (6 directions), `NEIGHBOR_OFFSETS` (26 directions) |
| 51–100 | Coordinate Helpers | `voxel`, `voxEq`, `voxAdd`, `voxSub`, `voxScale`, `voxKey`, `fromKey` |
| 101–130 | Distances | `manhattan`, `chebyshev`, `euclidean` |
| 131–170 | Bounds | `VoxelBounds`, `boundsFrom`, `inBounds`, `voxelsInBounds`, `boundsVolume` |
| 171–210 | Neighbors | `faceNeighbors`, `allNeighbors`, bounded variants |
| 211–280 | VoxelGrid | Sparse hash-map storage with `get/set/has/delete/entries/adjacentTo` |
| 281–400 | Shapes | `filledBox`, `hollowBox`, `voxelLine` (Bresenham), `filledSphere`, `hollowSphere` |
| 401–500 | Algorithms | `floodFill`, `connectedComponents`, `findPath` (A*), `raycast` (Amanatides-Woo) |
| 501–550 | Set Operations | `voxUnion`, `voxIntersect`, `voxDifference` |
| 551–733 | Utilities | Helper functions, exports |

## Key Abstractions

- `Voxel` — `{x, y, z}` coordinate. The atom.
- `VoxelGrid<T>` — Sparse storage. The molecule.
- `VoxelBounds` — Bounding box. The container.

## Related

- [Voxel Logic README](../README.md)
- [Tests](../tests/)
