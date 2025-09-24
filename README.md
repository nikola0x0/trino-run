# 🦖 Trino Run

**A retro endless runner where you morph between three forms to survive**

_Submission for Ancient8 Vibe Coding - AI Dev Playground - Game #2: Dino Swords_

---

## 🎮 Game Overview

Trino Run is a browser-based endless runner inspired by the Chrome Dino game with a unique twist: **triple form morphing**. Navigate through three distinct lanes by transforming between a Dino, Eagle, and Mole, each with unique abilities and controls.

### 🎯 Core Gameplay

- **Dino Form**: Run on the ground, jump over cacti
- **Eagle Form**: Fly through the sky, dodge jets
- **Mole Form**: Dig underground through three sub-lanes, avoid rocks

## 🕹️ Controls

### Global Controls

- **← / → Arrow Keys**: Switch between forms (Dino ↔ Eagle ↔ Mole)

### Form-Specific Controls

- **Dino**: `SPACE` to jump
- **Eagle**: `↑/↓` to move vertically within sky lane
- **Mole**: `↑/↓` to switch between underground lanes

## ✨ Key Features

- **🔄 Dynamic Form Switching**: Seamless morphing with visual effects and cooldowns
- **📊 Multiplier System**: Build score multipliers by chaining form swaps
- **⚡ Progressive Difficulty**: Speed increases every 4 seconds for escalating challenge
- **🎨 Retro Pixel Art**: Clean, colorful sprite work with smooth animations
- **🎵 Visual Feedback**: Screen shake, particle effects, and dynamic UI elements
- **💾 Smart Obstacle Patterns**: AI-generated obstacle formations that force strategic form switching

## 🛠️ Technical Implementation

- **Engine**: Phaser 3 with TypeScript
- **Physics**: Arcade Physics with optimized collision detection
- **Architecture**: Modular design with separate managers for obstacles, UI, and game state
- **Performance**: Object pooling for obstacles, efficient sprite management
- **Build System**: Webpack with hot reload for development

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:8080` to play the game.

## 📁 Project Structure

```
trino-run/
├── src/
│   └── game/
│       ├── scenes/          # Game scenes (Boot, Menu, Game, GameOver)
│       ├── entities/        # Game objects (ObstacleManager, etc.)
│       └── main.ts         # Game configuration
├── public/
│   ├── assets/             # Game sprites and assets
│   └── favicon/           # Favicon files
├── index.html             # Main HTML file
└── package.json          # Dependencies and scripts
```

## 🎪 Game Mechanics Deep Dive

### Scoring System

- **Distance Points**: Continuous scoring based on survival time
- **Multiplier Bonus**: Increases with each form swap (unlimited scaling!)
- **Gauge System**: Swap energy that depletes over time, adds strategic depth

### Obstacle Patterns

- **Single Lane**: Basic obstacles in one lane
- **Formation Patterns**: Structured obstacle rows and walls
- **Chaos Mode**: Multi-lane simultaneous spawning
- **Underground Forced**: Blocks 2 of 3 mole lanes, forcing specific positioning

### Visual Polish

- **Dynamic Colors**: Multiplier-based color schemes (Green → Yellow → Orange → Red → Purple → Rainbow)
- **Screen Effects**: Increasing screen shake intensity with higher multipliers
- **Smooth Animations**: Form-switching effects with particle systems
- **Responsive UI**: Real-time updates for score, multiplier, and form selection

## 🏆 Bounty Submission Details

**Category**: Game #2: Dino Swords  
**Competition**: Ancient8 Vibe Coding - AI Dev Playground

### 🤖 AI-Human Collaboration

This game showcases the power of **vibing with AI** - a seamless creative partnership where:

- **Human creativity** drove the vision and gameplay concepts
- **Claude's coding skills** brought ideas to life instantly
- **Iterative feedback** refined mechanics in real-time
- **Problem-solving together** overcame technical challenges

The result: A polished game created through natural conversation and collaborative iteration!

### Key Deliverables ✅

- ✅ Fully playable endless runner
- ✅ Three distinct player forms with unique mechanics
- ✅ Progressive difficulty system
- ✅ Retro-style pixel art and animations
- ✅ Score system with high score tracking
- ✅ Professional code structure and documentation
- ✅ Optimized performance and smooth gameplay

## 🎨 Art & Assets

All sprites and visual assets are carefully crafted for a cohesive retro gaming experience:

- **Character Sprites**: Animated Dino, Eagle, and Mole with proper scaling
- **Obstacle Variety**: Cacti, rocks, jets, and underground hazards
- **Environment**: Tiered lane system with distinct visual themes
- **Effects**: Form-switching animations and particle systems

## 🚧 Future Enhancements

- Sound effects and background music
- Power-ups and special abilities
- Leaderboard integration
- Mobile touch controls
- Additional forms and obstacles

---

**Made with ❤️ for the Ancient8 Vibe Coding Challenge**

_Ready to run, fly, and dig your way to victory?_ 🏃‍♂️✈️⛏️
