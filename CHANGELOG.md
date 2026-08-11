# Changelog

All notable changes to voxel-logic will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-04

### Added
- Initial release: sparse voxel storage via `VoxelGrid<T>`
- Coordinate math: `voxel`, `voxAdd`, `voxSub`, `voxScale`, `manhattan`, `chebyshev`, `euclidean`
- Neighbor queries: `faceNeighbors` (6-face von Neumann), `allNeighbors` (26-cell Moore)
- Shape generation: `filledBox`, `hollowBox`, `voxelLine` (3D Bresenham), `filledSphere`, `hollowSphere`
- Algorithms: `floodFill` (BFS), `connectedComponents`, `findPath` (A* with Manhattan heuristic), `raycast` (Amanatides & Woo)
- Set operations: `voxUnion`, `voxIntersect`, `voxDifference`
- Bounds utilities: `boundsFrom`, `inBounds`, `voxelsInBounds`, `boundsVolume`
- Full test suite: 1,419 lines of tests, 99.7% coverage
- Fleet certification: CHARTER.md, DOCKSIDE-EXAM.md, CONTRIBUTING.md

### Design Decisions
- **Sparse by default:** Empty voxels cost zero memory. Hash-map storage only.
- **Pure functions:** All shape generators and algorithms are side-effect free.
- **Generic values:** `VoxelGrid<T>` stores any value type — strings, numbers, objects.
- **No dependencies:** Pure TypeScript, zero runtime dependencies.

## [Unreleased]

### Added
- Examples directory with three demonstrations:
  - `terrain-basics.ts`: Build a simple world (ground, hill, cave, water, pathfinding, raycasting)
  - `pathfinding-demo.ts`: 3D maze generation with A* pathfinding and connected component analysis
  - `set-operations.ts`: Constructive solid geometry using union, intersection, and difference
- CHANGELOG.md (this file)
