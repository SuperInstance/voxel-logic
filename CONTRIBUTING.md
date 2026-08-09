# Contributing to voxel-logic

## What This Is

`voxel-logic` is a TypeScript library providing a complete toolkit for working with 3D voxel grids: coordinate math, sparse storage, shape generation, neighbor queries, flood fill, connected components, set operations, raycasting, and A* pathfinding. Designed for agents and simulations that need to reason about discrete 3D space efficiently.

## Development Setup

```bash
git clone https://github.com/SuperInstance/voxel-logic.git
cd voxel-logic
npm install
```

### Prerequisites

- Node.js 14+
- TypeScript 5.0+ (installed via `npm install`)

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Organization

| File | What It Tests |
|------|--------------|
| `tests/voxel-logic.test.ts` | Core functionality: coordinates, grid operations, shapes, neighbors |
| `tests/voxel-logic-extended.test.ts` | Extended coverage: flood fill, connected components, pathfinding, raycasting |

Tests use Jest with `ts-jest`. Configuration is in `package.json`.

## Building

```bash
# Compile TypeScript to dist/
npm run build
```

Output goes to `dist/` with `.js`, `.d.ts`, `.js.map`, and `.d.ts.map` files.

## Project Structure

```
voxel-logic/
├── src/
│   └── index.ts           # All exports — voxel coordinates, VoxelGrid, algorithms
├── tests/
│   ├── voxel-logic.test.ts
│   └── voxel-logic-extended.test.ts
├── dist/                   # Compiled output (gitignored in practice)
├── tsconfig.json
├── package.json
└── README.md
```

## Code Style

- **TypeScript:** strict mode enabled (`"strict": true` in `tsconfig.json`)
- **Types:** all public APIs must have explicit type annotations and interface definitions
- **Zero runtime dependencies:** the library is dependency-free at runtime
- **Doc comments:** use JSDoc comments for public APIs — they become `.d.ts` declarations
- **Tests:** every new algorithm or grid operation needs test coverage in both test files
- **Commits:** conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`)

## Key Design Decisions

1. **Single-file architecture.** Everything lives in `src/index.ts`. This is intentional — the library is a cohesive toolkit, not a framework.
2. **Sparse storage.** `VoxelGrid` uses `Map`-based sparse storage, not dense arrays. Empty space is free.
3. **Functional API.** Voxel coordinates are plain `{x, y, z}` objects. Algorithms are pure functions where possible.
4. **No dependencies.** Zero runtime dependencies. Dev dependencies are Jest and TypeScript only.

## Pull Request Checklist

- [ ] `npm test` passes
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] New code has test coverage
- [ ] No new runtime dependencies added
- [ ] No secrets or credentials committed
- [ ] Documentation updated if behavior changed
- [ ] Commit messages follow conventional commits

## Fleet Context

This library is part of the SuperInstance fleet. It provides the spatial reasoning layer for agents that need to understand and navigate 3D discrete spaces — used in game builds, simulation environments, and multi-agent coordination.

Related fleet components:
- `stigmergy` — bio-inspired coordination that operates in continuous space
- `eisenstein` — hexagonal lattice math (complementary spatial primitive)
- `lucineer` — the build agent that uses voxel reasoning for Roblox builds
