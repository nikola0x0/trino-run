import { Scene, GameObjects } from "phaser";
import { GAME_WIDTH, GROUND_Y, MOLE_LANES, LANE_HEIGHT } from "../utils/Constants";

export class ObstacleManager {
  private scene: Scene;
  private groundObstacles: GameObjects.Group;
  private skyObstacles: GameObjects.Group;
  private undergroundObstacles: GameObjects.Group;

  private spawnTimer: number = 0;
  private spawnInterval: number = 2000; // Start with 2 seconds
  private minSpawnInterval: number = 800; // Minimum spawn interval
  private scrollSpeed: number = 200; // Pixels per second

  constructor(scene: Scene) {
    this.scene = scene;

    // Create physics groups for obstacles
    this.groundObstacles = this.scene.physics.add.group({
      defaultKey: "cacti",
      maxSize: 10,
      runChildUpdate: true,
    });

    this.skyObstacles = this.scene.physics.add.group({
      defaultKey: "jet",
      maxSize: 10,
      runChildUpdate: true,
    });

    this.undergroundObstacles = this.scene.physics.add.group({
      defaultKey: "rocks",
      maxSize: 10,
      runChildUpdate: true,
    });
  }

  update(_time: number, delta: number) {
    // Update spawn timer
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }

    // Move all obstacles
    this.moveObstacles(delta);

    // Recycle off-screen obstacles
    this.recycleObstacles();
  }

  private spawnObstacle() {
    const random = Math.random();
    
    // 30% - Single obstacles
    if (random < 0.3) {
      this.spawnSingleObstacles();
    }
    // 40% - Formation patterns (rows, forced positioning)
    else if (random < 0.7) {
      this.spawnFormationPattern();
    }
    // 30% - Multi-lane chaos
    else {
      this.spawnChaosPattern();
    }
  }

  private spawnSingleObstacles() {
    const lanes = ["ground", "sky", "underground"];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    
    switch (lane) {
      case "ground":
        this.spawnGroundObstacle();
        break;
      case "sky":
        this.spawnSkyObstacle();
        break;
      case "underground":
        this.spawnUndergroundObstacle();
        break;
    }
  }

  private spawnFormationPattern() {
    const patterns = [
      "ground_row",
      "underground_forced",
      "sky_formation",
      "vertical_wall"
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    switch (pattern) {
      case "ground_row":
        // Row of 2-3 cacti
        this.spawnGroundRow();
        break;
      case "underground_forced":
        // Block 2 of 3 underground lanes, forcing player to specific lane
        this.spawnUndergroundForced();
        break;
      case "sky_formation":
        // Multiple sky obstacles at different heights
        this.spawnSkyFormation();
        break;
      case "vertical_wall":
        // Obstacles in 2-3 lanes at same time
        this.spawnVerticalWall();
        break;
    }
  }

  private spawnChaosPattern() {
    // Spawn in multiple lanes with slight delays for challenge
    const lanes = ["ground", "sky", "underground"];
    const numLanes = 2 + Math.floor(Math.random() * 2); // 2 or 3 lanes
    
    for (let i = 0; i < numLanes; i++) {
      const lane = lanes[i];
      setTimeout(() => {
        switch (lane) {
          case "ground":
            this.spawnGroundObstacle();
            break;
          case "sky":
            this.spawnSkyObstacle();
            break;
          case "underground":
            this.spawnUndergroundObstacle();
            break;
        }
      }, i * 200); // Slight delay between spawns
    }
  }

  private spawnGroundObstacle() {
    const obstacle = this.groundObstacles.get(GAME_WIDTH + 50, GROUND_Y + 8); // Lower position to match ground better
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);

      // Set origin to bottom center to align with ground
      const sprite = obstacle as Phaser.GameObjects.Sprite;
      sprite.setOrigin(0.5, 1);

      // Use big cacti frames (0, 1, 7, 8 for row 0, or 9, 10, 16, 17 for row 1)
      const bigCactiFrames = [0, 1, 7, 8, 9, 10, 16, 17];
      obstacle.setFrame(
        bigCactiFrames[Math.floor(Math.random() * bigCactiFrames.length)]
      );

      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.scrollSpeed);
      body.setAllowGravity(false); // Disable gravity for obstacles
      body.setSize(40, 50); // Adjust collision box size
    }
  }

  private spawnSkyObstacle() {
    // Random Y position within the sky lane (with some padding from edges)
    const skyLaneTop = 20; // Top padding
    const skyLaneBottom = LANE_HEIGHT - 20; // Bottom of sky lane with padding
    const randomY = skyLaneTop + Math.random() * (skyLaneBottom - skyLaneTop);
    
    const obstacle = this.skyObstacles.get(GAME_WIDTH + 50, randomY);
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.clearTint(); // Remove any tint
      
      // Set origin to center for flying objects
      const sprite = obstacle as Phaser.GameObjects.Sprite;
      sprite.setOrigin(0.5, 0.5);
      
      // Random size scaling for variety (between 0.15 and 0.4 for better visibility)
      const randomScale = 0.15 + Math.random() * 0.25;
      sprite.setScale(randomScale);

      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.scrollSpeed);
      body.setAllowGravity(false); // Disable gravity for obstacles
      
      // Much larger base collision box that scales properly with visual size
      const baseWidth = 800; // Much larger base size
      const baseHeight = 400; // Much larger base size
      body.setSize(baseWidth * randomScale, baseHeight * randomScale);
    }
  }

  private spawnUndergroundObstacle() {
    // Randomly pick one of the three underground lanes
    const lanes = ["TOP", "MIDDLE", "BOTTOM"];
    const lane = lanes[
      Math.floor(Math.random() * lanes.length)
    ] as keyof typeof MOLE_LANES;
    const yPos = MOLE_LANES[lane];

    const obstacle = this.undergroundObstacles.get(GAME_WIDTH + 50, yPos);
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.clearTint(); // Remove any tint
      
      // Set origin to center for rocks
      const sprite = obstacle as Phaser.GameObjects.Sprite;
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(2); // Scale up rocks to be visible

      // Random rock frame (0-5, as it's 3 columns x 2 rows)
      obstacle.setFrame(Math.floor(Math.random() * 6));

      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.scrollSpeed);
      body.setAllowGravity(false); // Disable gravity for obstacles
      body.setSize(20, 20); // Adjust collision box for rocks
    }
  }

  // Formation patterns
  private spawnGroundRow() {
    // Spawn 2-3 cacti in a row with spacing
    const numCacti = 2 + Math.floor(Math.random() * 2); // 2 or 3
    for (let i = 0; i < numCacti; i++) {
      const obstacle = this.groundObstacles.get(GAME_WIDTH + 50 + (i * 80), GROUND_Y + 8);
      if (obstacle) {
        obstacle.setActive(true);
        obstacle.setVisible(true);
        
        const sprite = obstacle as Phaser.GameObjects.Sprite;
        sprite.setOrigin(0.5, 1);
        
        const bigCactiFrames = [0, 1, 7, 8, 9, 10, 16, 17];
        obstacle.setFrame(bigCactiFrames[Math.floor(Math.random() * bigCactiFrames.length)]);

        const body = obstacle.body as Phaser.Physics.Arcade.Body;
        body.setVelocityX(-this.scrollSpeed);
        body.setAllowGravity(false);
        body.setSize(40, 50);
      }
    }
  }

  private spawnUndergroundForced() {
    // Block 2 of 3 lanes, forcing player to the remaining one
    const lanes = ["TOP", "MIDDLE", "BOTTOM"];
    const safeLane = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < 3; i++) {
      if (i !== safeLane) {
        const lane = lanes[i] as keyof typeof MOLE_LANES;
        const yPos = MOLE_LANES[lane];

        const obstacle = this.undergroundObstacles.get(GAME_WIDTH + 50, yPos);
        if (obstacle) {
          obstacle.setActive(true);
          obstacle.setVisible(true);
          obstacle.clearTint();
          
          const sprite = obstacle as Phaser.GameObjects.Sprite;
          sprite.setOrigin(0.5, 0.5);
          sprite.setScale(2.5); // Bigger rocks for forced positioning
          obstacle.setFrame(Math.floor(Math.random() * 6));

          const body = obstacle.body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(-this.scrollSpeed);
          body.setAllowGravity(false);
          body.setSize(25, 25);
        }
      }
    }
  }

  private spawnSkyFormation() {
    // Spawn 2-4 jets at different heights within sky lane
    const numJets = 2 + Math.floor(Math.random() * 3); // 2-4
    for (let i = 0; i < numJets; i++) {
      const skyLaneTop = 20;
      const skyLaneBottom = LANE_HEIGHT - 20;
      const randomY = skyLaneTop + Math.random() * (skyLaneBottom - skyLaneTop);
      
      const obstacle = this.skyObstacles.get(GAME_WIDTH + 50 + (i * 100), randomY);
      if (obstacle) {
        obstacle.setActive(true);
        obstacle.setVisible(true);
        obstacle.clearTint();
        
        const sprite = obstacle as Phaser.GameObjects.Sprite;
        sprite.setOrigin(0.5, 0.5);
        
        const randomScale = 0.15 + Math.random() * 0.25;
        sprite.setScale(randomScale);

        const body = obstacle.body as Phaser.Physics.Arcade.Body;
        body.setVelocityX(-this.scrollSpeed);
        body.setAllowGravity(false);
        
        const baseWidth = 800;
        const baseHeight = 400;
        body.setSize(baseWidth * randomScale, baseHeight * randomScale);
      }
    }
  }

  private spawnVerticalWall() {
    // Spawn obstacles in 2-3 different lanes at the same X position
    const numLanes = 2 + Math.floor(Math.random() * 2); // 2 or 3
    
    if (numLanes >= 1) this.spawnGroundObstacle();
    if (numLanes >= 2) this.spawnSkyObstacle();
    if (numLanes >= 3) this.spawnUndergroundObstacle();
  }

  private moveObstacles(_delta: number) {
    // Obstacles movement is handled by physics velocity
    // This method could be used for additional movement logic if needed
  }

  private recycleObstacles() {
    // Recycle ground obstacles
    this.groundObstacles.children.entries.forEach((obstacle) => {
      const sprite = obstacle as GameObjects.Sprite;
      if (sprite.x < -100) {
        this.groundObstacles.killAndHide(sprite);
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.reset(0, 0);
        }
      }
    });

    // Recycle sky obstacles
    this.skyObstacles.children.entries.forEach((obstacle) => {
      const sprite = obstacle as GameObjects.Sprite;
      if (sprite.x < -100) {
        this.skyObstacles.killAndHide(sprite);
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.reset(0, 0);
        }
      }
    });

    // Recycle underground obstacles
    this.undergroundObstacles.children.entries.forEach((obstacle) => {
      const sprite = obstacle as GameObjects.Sprite;
      if (sprite.x < -100) {
        this.undergroundObstacles.killAndHide(sprite);
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.reset(0, 0);
        }
      }
    });
  }

  increaseSpeed(factor: number = 1.1) {
    this.scrollSpeed *= factor;
    this.spawnInterval = Math.max(
      this.minSpawnInterval,
      this.spawnInterval * 0.95
    );
  }

  getGroundObstacles(): GameObjects.Group {
    return this.groundObstacles;
  }

  getSkyObstacles(): GameObjects.Group {
    return this.skyObstacles;
  }

  getUndergroundObstacles(): GameObjects.Group {
    return this.undergroundObstacles;
  }

  getCurrentScrollSpeed(): number {
    return this.scrollSpeed;
  }

  reset() {
    // Clear all obstacles
    this.groundObstacles.clear(true, true);
    this.skyObstacles.clear(true, true);
    this.undergroundObstacles.clear(true, true);

    // Reset speed and spawn interval
    this.scrollSpeed = 200;
    this.spawnInterval = 2000;
    this.spawnTimer = 0;
  }
}
