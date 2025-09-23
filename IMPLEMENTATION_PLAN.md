# Trino Run - Implementation Plan

## 📋 Development Phases

### Phase 1: Core Setup & Placeholder Assets

- [ ] Create placeholder sprites for three forms (simple colored rectangles)
  - Dino: Ground level sprite (green)
  - Eagle: Sky level sprite (blue)
  - Mole: Underground sprite (brown)
- [ ] Create placeholder obstacles
  - Ground: Cacti/rocks (red rectangles)
  - Sky: Clouds/pterodactyls (gray rectangles)
  - Underground: Roots/lava (orange rectangles)
- [ ] Set up three visual lanes
  - Sky band (top 33% of screen)
  - Ground band (middle 33%)
  - Underground band (bottom 33%)

### Phase 2: Player Entity Implementation

- [ ] Create Player class with form state management
  ```typescript
  interface PlayerState {
    form: "dino" | "eagle" | "mole";
    position: { x: number; y: number };
    isJumping: boolean;
    isCrouching: boolean;
  }
  ```
- [ ] Implement form switching mechanics
  - Smooth transition animations between forms
  - Update collision masks per form
  - Adjust Y position based on current form
- [ ] Add physics body with Arcade Physics

### Phase 3: Input System

- [ ] Global controls
  - Left/Right arrows for form cycling
  - Form order: Dino ↔ Eagle ↔ Mole
- [ ] Dino-specific controls
  - Space/Up for jump
  - Down for crouch (350ms duration)
- [ ] Eagle-specific controls
  - Up/Down for vertical movement within sky band
- [ ] Mole-specific controls
  - Up/Down for lane switching (3 underground lanes)

### Phase 4: Obstacle System

- [ ] Create obstacle pools
  ```typescript
  class ObstacleManager {
    groundObstacles: Phaser.GameObjects.Group;
    skyObstacles: Phaser.GameObjects.Group;
    undergroundObstacles: Phaser.GameObjects.Group;
  }
  ```
- [ ] Implement procedural spawning
  - Base spawn interval
  - Randomized obstacle types per lane
  - Pattern generation for forcing form switches
- [ ] Object recycling with pools

### Phase 5: Collision & Physics

- [ ] Set up collision groups
  - Only check collisions for active form's lane
  - Ignore obstacles in other lanes
- [ ] Implement game over on collision
- [ ] Add collision feedback (flash, sound)

### Phase 6: Scoring System

- [ ] Distance-based scoring (+1 per unit)
- [ ] High score persistence (localStorage)

### Phase 7: UI Implementation

- [ ] Score display (top right)
- [ ] High score display
- [ ] Current form indicator
- [ ] Game over screen
- [ ] Main menu with start button

### Phase 8: Difficulty Progression

- [ ] Speed increase every 5 seconds

### Phase 9: Polish & Effects

- [ ] Visual polish
  - Retro monochrome palette
  - Pixel art style
  - Screen shake on collision
- [ ] Audio (placeholder beeps)
  - Jump sound
  - Form switch sound
  - Collision sound
  - Background music (optional)
- [ ] Particle effects for form switching

## 📁 File Structure

```
src/
├── game/
│   ├── scenes/
│   │   ├── Boot.ts          (existing)
│   │   ├── Preloader.ts     (existing)
│   │   ├── MainMenu.ts      (modify)
│   │   ├── Game.ts          (main game logic)
│   │   └── GameOver.ts      (modify)
│   ├── entities/
│   │   ├── Player.ts        (new)
│   │   ├── Obstacle.ts      (new)
│   │   └── ObstacleManager.ts (new)
│   ├── systems/
│   │   ├── InputHandler.ts  (new)
│   │   ├── ScoreManager.ts  (new)
│   │   └── DifficultyManager.ts (new)
│   ├── utils/
│   │   └── Constants.ts     (new)
│   └── main.ts              (modify config)
```

## 🎮 Game Configuration Updates

```typescript
// src/game/main.ts
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#f0f0f0", // Light gray for retro look
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: true, // Remove in production
    },
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};
```

## 🎯 Implementation Order

1. **Day 1**: Core setup, placeholder assets, basic player entity
2. **Day 2**: Input system, form switching mechanics
3. **Day 3**: Obstacle spawning, collision detection
4. **Day 4**: Scoring system, UI elements
5. **Day 5**: Difficulty progression, testing, polish

## 🔧 Development Commands

```bash
# Start development
npm run dev

# Test build
npm run build

# Open in browser
http://localhost:8080
```

## ✅ Testing Checklist

- [ ] All three forms are playable
- [ ] Form switching is smooth and responsive
- [ ] Obstacles spawn correctly in all lanes
- [ ] Collisions only occur in active lane
- [ ] Score increases properly
- [ ] Difficulty ramps up over time
- [ ] Game over and restart work
- [ ] No memory leaks (check object pooling)
- [ ] Performance is stable (60 FPS)

## 📝 Notes

- Start with rectangles/simple shapes for all sprites
- Focus on gameplay mechanics first, polish later
- Keep the retro aesthetic simple and clean
- Test frequently with `npm run dev`
- Use browser console for debugging
