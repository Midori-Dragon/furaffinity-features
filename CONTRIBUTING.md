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
   - If your feature needs functionality from another module, reference it in your webpack config banner
   - Dependencies to Third-Party Modules are allowed, but should be kept minimal, in thought of the userscript size

3. **Technology Stack**:
   - TypeScript is used for all script development
   - ESLint for code linting
   - Webpack for building and bundling

### Project Organization

```
project/
├── feature-modules/
│   ├── <existing_feature>/
│   │   ├── components/   # Reusable components
│   │   ├── modules/      # Feature modules
│   │   └── utils/        # Shared utility functions
│   └── <your_new_feature>/
│       ├── components/   # Reusable components
│       ├── modules/      # Feature modules
│       └── utils/        # Shared utility functions
|
└── library-modules/
    ├── <existing_library>/
    │   ├── components/   # Reusable components
    │   ├── modules/      # Feature modules
    │   └── utils/        # Shared utility functions
    └── <your_new_library>/
        ├── components/   # Reusable components
        ├── modules/      # Feature modules
        └── utils/        # Shared utility functions
```

## Development Guidelines

1. **TypeScript**
   - Write all new code in TypeScript
   - Maintain type safety where possible
   - Use interfaces for better code documentation

2. **Dependencies**
   - Keep external dependencies to a minimum
   - Prefer vanilla JavaScript / TypeScript solutions when possible
   - If you need a third-party library, discuss it in the issue/pullrequest first

3. **Module Structure**
   - Each new feature should be in its own directory
   - Include a webpack config with appropriate userscript/extension headers
   - Document any special setup requirements

4. **Building**
   - Create a new build command entry in `package.json`. You can look at the existing build commands for reference
   - If possible use `build-scripts/build-with-deps.cjs` for your build process as it will handle the module dependencies for you
   - Add the build command to `.vscode/tasks.json`. You can look at the existing task configs for reference
   - Use `npm run build:<your_module_name>` to build a specific module

## Getting Started

1. Fork the repository
2. Create a new branch for your feature
3. Set up the development environment:
   ```bash
   npm install
   ```
4. Make your changes following the guidelines above
5. Test both userscript and browser extension functionality
6. Submit a pull request

## Questions?

If you have questions or need clarification, feel free to:
- Open an issue for discussion
- Ask questions in your pull request
- Check existing issues and PRs for similar topics

Remember, these guidelines are meant to help maintain project consistency while keeping things simple. The main focus is on ensuring dual compatibility (userscript/extension) and maintaining the modular structure.

Thank you for contributing!
