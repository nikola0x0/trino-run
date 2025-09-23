# Trino Run - Project Overview

## Purpose
Trino Run is a retro endless runner game inspired by the Chrome Dino game. Players can morph between three forms (Dino, Mole, Eagle) to navigate different obstacle layers and survive as long as possible.

## Tech Stack
- **Engine**: Phaser 3 (v3.90.0) with Arcade Physics
- **Language**: TypeScript (v5.4.5)
- **Build Tool**: Webpack (v5.99.6) with webpack-dev-server
- **Bundling**: Babel for transpilation
- **Development**: Hot-reloading with webpack-dev-server

## Project Structure
- `src/main.ts` - Application bootstrap
- `src/game/main.ts` - Game entry point with Phaser configuration
- `src/game/scenes/` - Phaser game scenes (Boot, Preloader, MainMenu, Game, GameOver)
- `public/assets/` - Static assets (images, audio, etc.)
- `public/index.html` - HTML container for the game
- `webpack/` - Webpack configuration files

## Game Configuration
- Canvas size: 1024x768
- Background color: #028af8
- Scene flow: Boot → Preloader → MainMenu → Game → GameOver
- Parent container: 'game-container'