# How to Publish This Project to npm

This guide explains the exact process used in this repository to publish to the npm registry, based on the current GitHub Actions workflow.

---

## 1. Project Preparation

- Ensure your project has a valid `package.json` at the root with all required fields (`name`, `version`, `main`, etc.).
- Place distributable files (the ones you want to publish) in a directory like `dist/`.
- Optionally, add a `.npmrc` file for custom npm configurations (e.g., registry, auth).

## 2. Automated Publishing with GitHub Actions

This project uses GitHub Actions for automated npm publishing. The workflow file is at `.github/workflows/npm-publish.yml`.

### How It Works:

- **Trigger:** The workflow runs automatically when a new git tag is pushed to the repository (`push.tags: ["*"]`). You can also trigger it manually via the GitHub Actions UI (`workflow_dispatch`).
- **Node.js Setup:** Uses `actions/setup-node@v4` to install Node.js version 22 and set the npm registry.
- **Install Dependencies:** Runs `npm ci` for a clean install.
- **Build:** Runs `npm run build` to generate distributable files.
- **Versioning:** Runs `npm version --no-git-tag-version ${{github.ref_name}}` to set the package version to match the tag name (without creating a new git tag).
- **Publish:** Runs `npm publish --access public` to publish the package to npm as a public package.
- **Authentication:** Uses an npm token stored as a GitHub Secret (`NPM_TOKEN`).

### Full Workflow Example

```yaml
name: Publish to npm on tag

on:
  push:
    tags:
      - "*"
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          registry-url: "https://registry.npmjs.org"

      - run: npm ci

      - run: npm run build

      - run: npm version --no-git-tag-version ${{github.ref_name}}

      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 3. How to Publish a New Version

1. **Create a new git tag** with the version you want to publish (e.g., `v1.2.3`). You can do this with:
   ```sh
   git tag v1.2.3
   git push origin v1.2.3
   ```
2. **GitHub Actions will automatically run** the workflow, set the package version to match the tag, build the project, and publish to npm.

## 4. Security & Best Practices

- **Never commit your npm token to the repository.** Always use CI/CD secrets.
- The npm token must have publish rights for your package.
- Ensure your `package.json` fields are accurate before publishing.
- The published version will match the git tag name.

## 5. References

- [npm documentation](https://docs.npmjs.com/)
- [GitHub Actions: Publishing Node.js Packages](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)

---

You can copy and adapt this file for any similar npm package project that uses tag-based publishing automation.
