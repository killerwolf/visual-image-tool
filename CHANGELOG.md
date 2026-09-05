# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

Releases are cut by pushing an unprefixed tag (`0.2.6`, not `v0.2.6`); see the
release steps in [CONTRIBUTING.md](CONTRIBUTING.md).

## [Unreleased]

### Changed

- Widened the supported Node range to `>=18.0.0`. The previous `<23.0.0` ceiling
  made npm warn `EBADENGINE` on Node 23 and 24 for no reason — the package has
  no runtime dependencies and nothing in it is version-bound.
- The demo landing page links to the README for the full API reference instead
  of repeating it. The duplicate had already drifted out of step with the code.
- `npm run publish:demo` writes a `.nojekyll` file, so GitHub Pages serves the
  demo site as static files rather than passing it through Jekyll.

## [0.2.5] - 2026-09-05

### Fixed

- Namespaced the loading spinner's keyframes so they cannot collide with
  animations on the host page.

### Documentation

- Corrected the usage examples: `new VisualImageTool()` after an `import` or
  `require`, and `new VisualImageTool.VisualImageTool()` only for the UMD
  global. Modernised the Vue example, documented the default focus point
  behaviour, and fixed the formatting script name.

## [0.2.4] - 2026-09-05

### Fixed

- Release workflow: allow the published version to match `package.json`, which
  previously failed the release with `Version not changed`.

## [0.2.3] - 2026-09-05

### Added

- Loading spinner shown while the image initialises.

### Fixed

- Repaired the package entry points so the package is importable. The CommonJS
  bundle now uses a `.cjs` extension, and the `exports` map routes `import` to
  the ESM build and `require` to the CommonJS one.
- `destroy()` now actually removes its event listeners; previously each
  `.bind(this)` produced a new function reference that `removeEventListener`
  could not match, leaking listeners.

### Changed

- Publishing moved to npm trusted publishing over OIDC, removing the long-lived
  npm token from the repository.
- Updated to Rollup 4 and harmonised the build outputs.
- Added the Vitest and JSDOM test suite, wired into CI.
- Translated the JSDoc comments and inline documentation to English.

## [0.2.2] - 2025-05-22

### Fixed

- Demo pages (#4).

### Changed

- Added `.npmrc` pinning the npm registry.

## [0.2.1] - 2025-04-15

### Changed

- Adopted Biome for linting and formatting, and Prettier for everything Biome
  does not cover, both enforced in CI.

[unreleased]: https://github.com/killerwolf/visual-image-tool/compare/0.2.5...HEAD
[0.2.5]: https://github.com/killerwolf/visual-image-tool/compare/0.2.4...0.2.5
[0.2.4]: https://github.com/killerwolf/visual-image-tool/compare/0.2.3...0.2.4
[0.2.3]: https://github.com/killerwolf/visual-image-tool/compare/0.2.2...0.2.3
[0.2.2]: https://github.com/killerwolf/visual-image-tool/compare/0.2.1...0.2.2
[0.2.1]: https://github.com/killerwolf/visual-image-tool/releases/tag/0.2.1
