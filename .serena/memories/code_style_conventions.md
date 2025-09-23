# Code Style & Conventions

## TypeScript Configuration
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- No unused locals/parameters allowed
- No fallthrough cases in switch statements
- `strictPropertyInitialization` disabled (for Phaser compatibility)

## Babel Configuration
- Transpilation target: Browsers with >0.25% usage
- Excludes IE11 and Opera Mini
- ES6+ syntax supported

## File Naming & Structure
- TypeScript files use `.ts` extension
- Scene files in `src/game/scenes/` follow PascalCase (e.g., `Boot.ts`, `MainMenu.ts`)
- Main game logic in `src/game/main.ts`
- Application entry point in `src/main.ts`

## Import Conventions
- Phaser imports: `import { Scene, Game } from 'phaser'`
- Local scene imports: `import { Boot } from './scenes/Boot'`
- Default export for main functions

## Asset Handling
- Static assets in `public/assets/`
- Can import assets via JavaScript modules or load from static folder
- Webpack handles bundling and copying to `dist/` on build