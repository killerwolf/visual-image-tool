# Maintainer guide

This document is for developers who maintain, modify or contribute to the `@h4md1/visual-image-tool` package.

## Development environment

### Requirements

- Node.js `>=18.0.0 <23.0.0` (see `engines` in `package.json`)
- npm

### Local setup

1. Clone the repository:

```bash
git clone https://github.com/killerwolf/visual-image-tool.git
cd visual-image-tool
```

2. Install dependencies:

```bash
npm install
```

## Project structure

```
visual-image-tool/
├── .github/workflows/              # CI and release automation
├── src/
│   ├── index.js                    # Package entry point
│   ├── visual-image-tool.js        # Main class
│   └── visual-image-tool.test.js   # Unit tests
├── demo/                           # Demo pages, published to GitHub Pages
├── dist/                           # Build output (generated, git-ignored)
├── biome.json                      # Lint and format config for JS/JSON
├── vitest.config.js                # Test config
├── rollup.config.js                # Build config
├── package.json
├── CHANGELOG.md                    # Release history
├── CONTRIBUTING.md                 # This guide
└── README.md                       # User documentation
```

## Available scripts

| Script                 | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `npm run build`        | Generate the distribution files in `dist/`                   |
| `npm run dev`          | Run the build in watch mode                                  |
| `npm test`             | Run the unit tests once                                      |
| `npm run test:watch`   | Run the tests in watch mode                                  |
| `npm run lint:check`   | Check linting and formatting of JS/JSON with Biome           |
| `npm run lint:fix`     | Apply Biome fixes                                            |
| `npm run format:check` | Check formatting of other file types with Prettier           |
| `npm run format:fix`   | Apply Prettier formatting                                    |
| `npm run demo`         | Serve `demo/` locally                                        |
| `npm run publish:demo` | Publish `demo/` to GitHub Pages (all but `index-local.html`) |

Linting and formatting are enforced in CI, so run `npm run lint:check` and `npm run format:check` before pushing.

### Publishing the demos

`npm run publish:demo` pushes `demo/` to the `gh-pages` branch, which is served
at <https://h4md1.fr/visual-image-tool/>.

The `--src "**/!(index-local).*"` pattern excludes `index-local.html`. That page
loads `../dist/visual-image-tool.umd.js`, which resolves above the site root
once published and 404s, so the page is only meaningful when served locally.
Everything else in `demo/` loads the published package from the CDN.

Note that `gh-pages` removes the branch's existing files before copying, but the
pattern it uses for that never matches dotfiles — anything like `.github/` that
lands on `gh-pages` stays there until it is removed by hand.

## Build process

Rollup generates three distribution formats:

1. **ESM** (`dist/visual-image-tool.esm.js`) — ES modules for modern bundlers
2. **UMD** (`dist/visual-image-tool.umd.js`) — minified universal format for direct use in browsers
3. **CommonJS** (`dist/visual-image-tool.cjs`) — for Node.js

The CommonJS bundle uses a `.cjs` extension on purpose: the package is `"type": "module"`, so a `.js` file would be parsed as ESM and expose no exports. The `exports` map in `package.json` routes `import` to the ESM build and `require` to the CommonJS one.

To build:

```bash
npm run build
```

## Testing changes

The test suite uses [Vitest](https://vitest.dev/) with [JSDOM](https://github.com/jsdom/jsdom):

```bash
npm test
```

Beyond the unit tests, you can:

1. Run the build: `npm run build`
2. Open the demos in a browser to check behaviour: `npm run demo`
3. Use `npm link` to test against a local project

```bash
# In the package directory
npm link

# In your test project
npm link @h4md1/visual-image-tool
```

## Publishing to npm

Publishing is automated. Pushing a tag triggers `.github/workflows/npm-publish.yml`, which builds the package, sets the version from the tag name and publishes it.

Authentication uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) over OIDC — there is no npm token in the repository. The trust relationship is configured on the package's npmjs.com settings page and points at this repository and the `npm-publish.yml` workflow filename. Provenance is attested automatically.

### Releasing

1. Make sure `main` is green and holds everything you want to ship.
1. Move the `## [Unreleased]` entries in `CHANGELOG.md` under the new version
   heading, and update the comparison links at the bottom of the file.
1. Tag the release commit. Tags are unprefixed and annotated, matching the existing history (`0.2.3`, not `v0.2.3`):

```bash
git tag -a 0.2.4 -m "" --cleanup=verbatim
git push origin 0.2.4
```

3. Watch the run, then confirm the release landed:

```bash
npm view @h4md1/visual-image-tool version
```

After publishing, the workflow creates a GitHub Release for the tag with
generated notes, so a tag never lands without a record of what changed.

The workflow runs `npm version --no-git-tag-version --allow-same-version <tag>`, so the tag name is what determines the published version. The `version` field in `package.json` is informational; keep it in step with the latest release to avoid confusion. `--allow-same-version` is what makes that safe — without it npm fails with `Version not changed` when the field already matches the tag.

Follow [SemVer](https://semver.org/) when choosing a tag:

- Patch (`0.2.x`) — bug fixes
- Minor (`0.x.0`) — backwards-compatible features
- Major (`x.0.0`) — breaking changes

## Development practices

### Code changes

- Preserve compatibility with the existing API
- Document all public methods with JSDoc
- Follow the project's style conventions (Biome and Prettier enforce them)
- Add tests for behaviour you fix or introduce
- Test across browsers

### Version control

- Create a branch for each change; do not commit to `main` directly
- Write descriptive commit messages
- Open a pull request and let CI run

### Documentation

- Update the documentation when you change the API
- Keep the examples current

## Troubleshooting

### Build errors

- Check that dependencies are installed: `npm install`
- Clean `dist/` and rebuild: `rm -rf dist && npm run build`

Clearing `dist/` matters before a manual pack or publish: a stale bundle from an older filename scheme would otherwise be included alongside the current output.

### Compatibility issues

- Test across browsers
- Use polyfills where modern features are needed

## Contributing

1. Create a branch for your change
2. Make your changes
3. Make sure `npm test`, `npm run lint:check` and `npm run format:check` pass
4. Open a pull request with a detailed description
