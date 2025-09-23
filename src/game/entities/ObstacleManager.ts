import { Scene, GameObjects } from "phaser";
import { GAME_WIDTH, GROUND_Y, SKY_Y, MOLE_LANES } from "../utils/Constants";

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
    // Randomly decide which lane(s) to spawn obstacles in
    const lanes = ["ground", "sky", "underground"];
    const selectedLanes: string[] = [];

    // 50% chance for single lane, 40% for two lanes, 10% for all three
    const random = Math.random();
    if (random < 0.5) {
      selectedLanes.push(lanes[Math.floor(Math.random() * lanes.length)]);
    } else if (random < 0.9) {
      // Pick two different lanes
      const lane1 = lanes[Math.floor(Math.random() * lanes.length)];
      let lane2 = lanes[Math.floor(Math.random() * lanes.length)];
      while (lane2 === lane1) {
        lane2 = lanes[Math.floor(Math.random() * lanes.length)];
      }
      selectedLanes.push(lane1, lane2);
    } else {
      // Spawn in all three lanes (forces player to switch)
      selectedLanes.push(...lanes);
    }

    // Spawn obstacles in selected lanes
    selectedLanes.forEach((lane) => {
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
    });
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
    const obstacle = this.skyObstacles.get(GAME_WIDTH + 50, SKY_Y);
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.clearTint(); // Remove any tint
      
      // Set origin to center for flying objects
      const sprite = obstacle as Phaser.GameObjects.Sprite;
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(0.15); // Scale down jet to appropriate size

      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.scrollSpeed);
      body.setAllowGravity(false); // Disable gravity for obstacles
      body.setSize(200, 100); // Adjust collision box for jet
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
