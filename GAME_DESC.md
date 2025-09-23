# 🦖🕳️🦅 Trino Run

_A retro endless runner where you morph between three forms to survive._

## 🎮 Game Overview

Trino Run is a **browser-based endless runner** inspired by the Chrome Dino game.

The twist: the player can **morph into three forms** to adapt to different obstacle layers:

- **Dino** – runs on the ground (cacti, rocks).
- **Mole** – digs underground (roots, lava pockets).
- **Eagle** – flies in the sky (storm clouds, pterodactyls).

The goal is to **survive as long as possible** while chaining smart morphs for higher scores.

---

## 🕹️ Controls

**Global**

- **Left / Right Arrow** → **Cycle form** (Dino ↔ Eagle ↔ Mole).
  - Left = previous form, Right = next form.
- No pause!

**Dino (ground)**

- **Space / Up** → Jump

**Eagle (sky)**

- **Up / Down** → Move vertically (continuous, clamped to sky band)
- (No jump; horizontal speed is auto-run)

**Mole (underground)**

- **Up / Down** → Snap between **3 underground lanes** (Top/Mid/Bottom)
- (No jump; horizontal speed is auto-run)

---

## ⚡ Core Mechanics

- **Procedural Generation:** Obstacles spawn infinitely with increasing speed/density. Sometimes the obstacles is a lot in one or 2 specific lane, ensure player have to switch to a specific form.
- **Form Switching:** Only one form is valid in its lane:
  - Ground obstacles only hit Dino.
  - Underground obstacles only hit Mole.
  - Sky obstacles only hit Eagle.
- **Scoring:**
  - +1 per unit distance traveled.
  - +Bonus multiplier for successful **form-swap chains** (e.g., Dino→Eagle→Mole).
- **Game Over:** Collision with obstacle in active lane.

---

## 🏞️ Design Specs

- **Level:** Single infinite level, difficulty ramps up.
- **Visual:** Pixel, monochrome style (retro like Chrome Dino).
- **Audio:** 8-bit jump, crash, and swap sounds.
- **UI:** Minimal → score counter + high score + form icons.

---

## 🛠️ Tech Stack

- **Engine:** Phaser 3 (Arcade Physics).
- **Language:** JavaScript / TypeScript.
- **Renderer:** WebGL with Canvas fallback.
- **Build Tool:** Vite or Webpack for quick dev.

---

## 🧩 Implementation Plan

### Entities

- **Player:**
  - State: `{ form: "dino" | "mole" | "eagle" }`
  - Shared physics body, swaps change `y-position` & active collision mask.
- **Obstacles:**
  - Three pools: `groundObstacles`, `undergroundObstacles`, `skyObstacles`.
  - Procedurally spawned with seeded PRNG for reproducibility.
- **Spawner:**
  - Interval spawner increasing with time.
  - Pools recycle inactive obstacles (`setActive(false)`).

### Systems

1. **Input Handler**: Maps keys → form switches & jumps.
2. **Physics**: Arcade collisions → only active lane colliders checked.
3. **Score Manager**: Tracks distance + combo multipliers.
4. **Difficulty Curve**: Speed ramps every 30 seconds.
5. **UI**: Score + high score.

---

## 🚀 Dev Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

```

Run locally and open `http://localhost:3000/` to play.

---

## 🎯 Bounty Deliverable

- Playable endless runner with **3 forms**.
- 1–2 obstacles per lane.
- Procedural generation + increasing difficulty.
- Basic scoring & high score.
- Retro pixel & 8-bit audio aesthetic.
