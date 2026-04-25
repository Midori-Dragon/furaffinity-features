# Contributing to FurAffinity Features

Thank you for your interest in contributing to this project! This guide will help you understand how to contribute while maintaining the project's core principles and structure.

## Project Structure and Guidelines

### Core Principles

1. **Dual Compatibility**: All features must work both as:
   - UserScript (for script managers like Violentmonkey)
   - Browser Extension (Chrome and Firefox)

2. **Module Independence**:
   - Each top-level directory represents an independent user script
   - Scripts should be self-contained with minimal dependencies on other modules
   - If your feature needs functionality from another module, reference it in your Rollup config banner
   - Third-party packages are welcome, but each package must work in both userscript environments (no Node.js built-ins) and browser extension contexts
   - Prefer small, focused packages over large all-in-one libraries; if only a subset of functionality is needed, look for a smaller dedicated package instead
   - Discuss new dependencies in the issue or PR before adding them

3. **Technology Stack**:
   - TypeScript is used for all script development
   - ESLint for code linting
   - Rollup for building and bundling

### Project Organization

<div>
  <pre>
  project/
  ├── <span style="color: #ba5656;">assets/</span>          # Static assets
  ├── <span style="color: #c09553;">build-scripts/</span>   # Build scripts
  ├── <span style="color: #d8be7c;">dist/</span>            # Build output
  ├── <span style="color: #dc7a7a;">docs/</span>            # Documentation
  │   ├── <span style="color: #50fa7b;">&lt;existing_feature_docs&gt;/</span>
  │   ├── <span style="color: #50fa7b;">&lt;your_new_feature_docs&gt;/</span>
  │   ├── <span style="color: #c09553;">contributing.md</span>
  │   └── <span style="color: #c09553;">home.md</span>
  └── <span style="color: #06cc14;">src/</span>
      ├── <span style="color: #ff79c6;">feature-modules/</span>
      │   ├── <span style="color: #50fa7b;">&lt;existing_feature&gt;/</span>
      │   │   ├── <span style="color: #8be9fd;">components/</span>   # Reusable components
      │   │   ├── <span style="color: #8be9fd;">modules/</span>      # Feature modules
      │   │   └── <span style="color: #8be9fd;">utils/</span>        # Shared utility functions
      │   └── <span style="color: #50fa7b;">&lt;your_new_feature&gt;/</span>
      │       ├── <span style="color: #8be9fd;">components/</span>   # Reusable components
      │       ├── <span style="color: #8be9fd;">modules/</span>      # Feature modules
      │       └── <span style="color: #8be9fd;">utils/</span>        # Shared utility functions
      │
      └── <span style="color: #ffb86c;">library-modules/</span>
            ├── <span style="color: #50fa7b;">&lt;existing_library&gt;/</span>
            │   ├── <span style="color: #8be9fd;">components/</span>   # Reusable components
            │   ├── <span style="color: #8be9fd;">modules/</span>      # Feature modules
            │   └── <span style="color: #8be9fd;">utils/</span>        # Shared utility functions
            └── <span style="color: #50fa7b;">&lt;your_new_library&gt;/</span>
               ├── <span style="color: #8be9fd;">components/</span>   # Reusable components
               ├── <span style="color: #8be9fd;">modules/</span>      # Feature modules
               └── <span style="color: #8be9fd;">utils/</span>        # Shared utility functions
  </pre>
</div>

## Development Guidelines

1. **TypeScript**
   - Write all new code in TypeScript
   - Maintain type safety where possible
   - Use interfaces for better code documentation

2. **Dependencies**
   - Third-party packages are welcome, but each package must work in both userscript environments (no Node.js built-ins) and browser extension contexts
   - Prefer small, focused packages over large all-in-one libraries; if only a subset of functionality is needed, look for a smaller dedicated package instead
   - Discuss new dependencies in the issue or PR before adding them

3. **Module Structure**
   - Each new feature should be in its own directory
   - Include a rollup config with appropriate userscript/extension headers
   - Document any special setup requirements

4. **Building**
   - Create a new build command entry in `package.json`. You can look at the existing build commands for reference
   - If possible use `build-scripts/build-with-deps.cjs` for your build process as it will handle the module dependencies for you
   - Use `shift + ctrl + b` to view the available build tasks, or run the npm scripts directly

   The project has two build modes:

   | Mode        | VS Code Task                       | npm script                      | Sourcemaps | Use when                      |
   | ----------- | ---------------------------------- | ------------------------------- | ---------- | ----------------------------- |
   | **Release** | `Build: Browser Extension`         | `build:Browser-Extension`       | None       | Submitting PRs, CI, packaging |
   | **Debug**   | `Build: Browser Extension (Debug)` | `build:Browser-Extension-Debug` | Inline     | Local debugging in DevTools   |

   Both modes also have a `Rebuild` variant (e.g. `Rebuild: Browser Extension (Debug)`) that forces all dependency modules to be rebuilt from source, bypassing the hash cache.  
   The CI pipeline always uses the release build. Never commit a debug build to a release branch.

   > **Why two modes?**  
   > Debug builds embed inline sourcemaps so DevTools maps minified bundle code back to the original TypeScript sources. Release builds omit sourcemaps entirely — the combined browser extension bundle with sourcemaps is several hundred KB larger, which is unnecessary overhead for end users.

5. **Testing**
   - For UserScript: Copy the build `furaffinity-features.user.js` file from the top `dist` folder (or `bundle.user.js` from your individual module's `dist` folder) to the userscript manager or use the `npm run serve` command to host a local server (copy link to the file to use for the userscript manager) for automatic updates
   - For Browser Extension: Use the `npm run start:firefox` or `npm run start:chrome` command to start the browser extension

6. **Docs**
   - Each module has its own documentation and should be maintained in a simular way to the existing documentation
   - Use `npm run docs` to generate and host documentation

7. **Packaging**
   - Use `npm run package:Browser-Extension` to package the Project

## Getting Started

1. Fork and clone the repository
2. Navigate to the project directory
3. Set up the development environment:
   ```bash
   npm install
   ```
4. Create a new Module Folder in `src/feature-modules/` or `src/library-modules/`
5. Copy an already existing `rollup.config.cjs` to your new module folder and update the userscript banner to fit your new module (name, description, author, etc.)
6. Create a new `src` folder inside your new module folder
7. Create new `index.ts` file inside the `src` folder
8. Create new `modules`, `components`, `utils` and `styles` folders inside the `src` folder (if needed)
9. Develop your feature following the guidelines (For reference you can always look at existing modules)
10. Test both userscript and browser extension functionality
11. Submit a pull request

> [!NOTE]
> `FA-Embedded-Image-Viewer` is currently the most complex Feature
>
> `FA-Instant-Nuker` is currently the simplest Feature
>
> `Furaffinity-Request-Helper` is currently the biggest Library
>
> `Furaffinity-Custom-Settings` is currently the most complex Library
>
> `Furaffinity-Match-List` is currently the simplest Library

## Questions?

If you have questions or need clarification, feel free to:
- Open an issue for discussion
- Ask questions in your pull request
- Check existing issues and PRs for similar topics
- Contact me (Methods found on my [Homepage](https://midori-dragon.carrd.co/))

Remember, these guidelines are meant to help maintain project consistency while keeping things simple. The main focus is on ensuring dual compatibility (userscript/extension) and maintaining the modular structure.

Thank you for contributing!

---

[!["Buy me a coffee"](https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/meta/orange-button-x180.png)](https://www.buymeacoffee.com/midori_dragon)
