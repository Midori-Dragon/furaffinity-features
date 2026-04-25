## Keeping These Instructions Up to Date

These instructions are the single source of truth for Copilot's understanding of this project. They must stay in sync with the actual codebase.

**After making any change that affects something described in these instructions, update this file in the same step.** This includes:
- Adding, removing, or renaming files, folders, classes, interfaces, or enums
- Changing lifetimes, middleware order, or repository responsibilities
- Adding new patterns, conventions, or utility types
- Changing environment variable names or configuration keys
- Changing data model fields, primary keys, or relationships

Do not wait for a separate "update docs" task — keep the instructions accurate as part of every implementation step.

---

## MANDATORY: Use graphify Before Any Code or Architecture Work if available

> **BLOCKING REQUIREMENT**: Before answering any architecture or codebase question, or analyzing or making any code change, you MUST read the knowledge graph first if it exists. Do not skip this step. If graphify is not used skip this step.

1. Read `graphify-out/GRAPH_REPORT.md` — overview of all nodes, communities, and god nodes.
2. If a question is deep or spans multiple files, navigate `graphify-out/wiki/index.md` and follow relevant community and god-node articles.
3. To rebuild or update the graph after changes, type `/graphify --update` in Copilot Chat.

Skipping the graph means working without full project context and risks incorrect or inconsistent answers.

---

## Project Purpose

**Furaffinity Features** is a collection of quality-of-life improvements and additional features for the [FurAffinity](https://www.furaffinity.net) art platform. Each feature can be used in two ways:

- As an **individual userscript** (via Violentmonkey, Tampermonkey, etc.)
- As a combined **browser extension** (Chrome and Firefox)

All modules are also bundled into a single combined userscript — *Furaffinity Features* — available on GreasyFork.

---

## Core Principles

1. **Dual Compatibility**: Every feature module must work both as a userscript and as part of the browser extension.
2. **Module Independence**: Each top-level module is a self-contained userscript. Avoid coupling between feature modules. If a feature depends on a library module, declare that dependency in the Rollup config banner.
3. **Dependencies**: Third-party packages are welcome, but each package must satisfy two constraints:
   - **Dual context support**: The package must work in both userscript environments (no Node.js built-ins, no DOM-less assumptions) and browser extension contexts.
   - **Small footprint**: Prefer small, focused packages that do one thing over large all-in-one libraries. If only a subset of functionality is needed, check whether a smaller dedicated package exists instead. Discuss new dependencies in the issue or PR before adding them.

---

## Project Structure

```
src/
├── feature-modules/      # End-user features (each is an independent userscript)
│   ├── FA-Embedded-Image-Viewer/
│   ├── FA-Infini-Gallery/
│   ├── FA-Instant-Nuker/
│   ├── FA-Watches-Favorites-Viewer/
│   └── FA-Webcomic-Auto-Loader/
└── library-modules/      # Shared utility libraries (consumed by feature modules)
    ├── Furaffinity-Custom-Pages/
    ├── Furaffinity-Custom-Settings/
    ├── Furaffinity-Loading-Animations/
    ├── Furaffinity-Match-List/
    ├── Furaffinity-Message-Box/
    ├── Furaffinity-Prototype-Extensions/
    ├── Furaffinity-Request-Helper/
    ├── Furaffinity-Submission-Image-Viewer/
    └── GlobalUtils/
```

Each module folder typically contains:
- `rollup.config.cjs` — Rollup build config with userscript/extension headers
- `src/index.ts` — Module entry point
- `src/components/` — Reusable UI components
- `src/modules/` — Core logic modules
- `src/utils/` — Shared utility functions
- `src/styles/` — CSS/style files (if needed)

Build output goes to `dist/`. The top-level `dist/` contains the combined browser extension bundle; each module's `dist/` contains its individual userscript.

---

## Technology Stack

| Tool | Purpose |
|------|---------|
| **TypeScript** | All source code |
| **Rollup** | Bundling and build pipeline |
| **ESLint** | Code linting |
| **build-scripts/build-with-deps.cjs** | Dependency-aware incremental builds |

---

## Build Modes

| Mode | VS Code Task | npm script | Sourcemaps | Use when |
|------|-------------|------------|------------|----------|
| Release | `Build: Browser Extension` | `build:Browser-Extension` | None | PRs, CI, packaging |
| Debug | `Build: Browser Extension (Debug)` | `build:Browser-Extension-Debug` | Inline | Local DevTools debugging |

Both modes have a `Rebuild` variant that bypasses the hash cache and forces all dependencies to rebuild from source. The CI pipeline always uses the release build. **Never commit a debug build to a release branch.**

---

## Feature Modules — Quick Reference

| Module | Purpose |
|--------|---------|
| **FA-Embedded-Image-Viewer** | Embeds clicked images inline on gallery/browse/search pages (most complex feature) |
| **FA-Infini-Gallery** | Infinite scroll for gallery, favorites, scraps, search, and browse pages |
| **FA-Webcomic-Auto-Loader** | Auto-loads sequential comic pages with navigation detection |
| **FA-Instant-Nuker** | Instantly removes messages by category (simplest feature) |
| **FA-Watches-Favorites-Viewer** | Scans watched users for new favorites with custom page and ignore list |

## Library Modules — Quick Reference

| Module | Purpose |
|--------|---------|
| **Furaffinity-Custom-Settings** | Central settings management (persistence, types, per-module) — most complex library |
| **Furaffinity-Loading-Animations** | Reusable loading spinners and animations |
| **Furaffinity-Match-List** | URL pattern matching for conditional feature activation — simplest library |
| **Furaffinity-Request-Helper** | API request wrapper with rate limiting, queuing, and error handling — biggest library |
| **Furaffinity-Submission-Image-Viewer** | Image viewer component with preview, zoom/pan, and loading states |
| **Furaffinity-Custom-Pages** | Custom page creation utilities |
| **Furaffinity-Message-Box** | Message box UI component |
| **Furaffinity-Prototype-Extensions** | Prototype/polyfill extensions |
| **GlobalUtils** | Cross-module global utility functions |
