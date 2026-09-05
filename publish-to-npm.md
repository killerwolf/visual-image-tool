# How to Publish This Project to npm

This guide explains the process used in this repository to publish to the npm registry, based on the current GitHub Actions workflow.

---

## 1. Project Preparation

- Ensure your project has a valid `package.json` at the root with all required fields (`name`, `version`, `main`, etc.).
- Place distributable files (the ones you want to publish) in a directory like `dist/`.
- Make sure the entry point fields resolve against the filenames your bundler actually emits. If the package is `"type": "module"`, a CommonJS bundle must use a `.cjs` extension, otherwise Node parses it as ESM and it exposes no exports.

## 2. Authentication: trusted publishing over OIDC

This repository does **not** store an npm token. It uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers): GitHub mints a short-lived OIDC token for each workflow run, and npm exchanges it for publish rights. There is no static credential to expire, leak or rotate.

### One-time setup on npmjs.com

On the package's **Settings → Trusted Publisher** page, add a publisher:

| Field                | Value                             |
| -------------------- | --------------------------------- |
| Publisher            | GitHub Actions                    |
| Organization or user | your GitHub org or username       |
| Repository           | the repository name               |
| Workflow filename    | `npm-publish.yml` (filename only) |
| Environment          | leave empty unless you use one    |

The workflow filename must match exactly and is case-sensitive. Configure this on the package you are publishing — a trusted publisher added to the wrong package leaves the intended one unauthenticated.

### Requirements on the workflow side

- `permissions: id-token: write`, so GitHub can issue the OIDC token.
- npm CLI `>= 11.5.1`. Node 22 bundles npm 10.x, so the workflow upgrades npm explicitly.
- **No `registry-url` on `actions/setup-node`.** It writes an `_authToken` line into `.npmrc`; npm reads that as "auth is already configured", skips the OIDC exchange and fails with `E404`. Set the registry in a checked-in `.npmrc` instead.
- Self-hosted runners are not supported; use GitHub-hosted runners.

A `404 Not Found` on `PUT` for a scoped package means authentication failed. npm returns 404 rather than 401/403 so callers cannot probe which packages exist — it does not mean the package is missing.

## 3. Automated Publishing with GitHub Actions

The workflow file is at `.github/workflows/npm-publish.yml`.

### How It Works

- **Trigger:** runs when a git tag is pushed (`push.tags: ["*"]`). `workflow_dispatch` is available too, but it must be dispatched against a tag ref — the workflow stops early otherwise, since the version comes from the tag name.
- **Node.js setup:** `actions/setup-node` installs Node 22.
- **npm upgrade:** installs a current npm, for the trusted-publishing support.
- **Install:** `npm ci` for a clean install.
- **Build:** `npm run build` generates the distributable files.
- **Versioning:** `npm version --no-git-tag-version ${{github.ref_name}}` sets the package version to the tag name without creating another tag.
- **Publish:** `npm publish --access public` publishes as a public package, authenticated via OIDC.
- **Provenance:** attested automatically for a public package in a public repository. No `--provenance` flag needed.

### Full Workflow Example

```yaml
name: Publish to npm on tag

on:
  push:
    tags:
      - "*"
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Require a tag
        if: github.ref_type != 'tag'
        run: |
          echo "::error::This workflow must run from a tag; got ${{ github.ref_type }} '${{ github.ref_name }}'."
          exit 1

      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: "22"

      - name: Upgrade npm for trusted publishing
        run: |
          npm install -g npm@latest
          npm --version

      - run: npm ci

      - run: npm run build

      - run: npm version --no-git-tag-version ${{github.ref_name}}

      - run: npm publish --access public
```

## 4. How to Publish a New Version

1. **Create a git tag** with the version you want to publish. This repository uses unprefixed annotated tags:

   ```sh
   git tag -a 0.2.4 -m "" --cleanup=verbatim
   git push origin 0.2.4
   ```

2. **GitHub Actions runs automatically**, setting the package version to the tag name, building, and publishing.

   Note that for a tag push, GitHub runs the workflow file **as it exists at the tagged commit**. If you change the workflow, the tag has to point at a commit that contains the change.

3. **Verify** the release landed:

   ```sh
   npm view <package-name> version
   ```

## 5. Security & Best Practices

- Prefer trusted publishing over long-lived tokens. If you must use a token, store it as a CI secret and never commit it.
- Ensure your `package.json` fields are accurate before publishing — verify the entry points resolve by installing a packed tarball into a scratch project.
- The published version will match the git tag name.

## 6. References

- [npm trusted publishers](https://docs.npmjs.com/trusted-publishers)
- [npm documentation](https://docs.npmjs.com/)
- [GitHub Actions: Publishing Node.js Packages](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)

---

You can copy and adapt this file for any similar npm package project that uses tag-based publishing automation.
