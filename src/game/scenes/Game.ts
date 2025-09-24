import { Scene, GameObjects } from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  LANE_HEIGHT,
  SKY_Y,
  GROUND_Y,
  UNDERGROUND_Y,
  PLAYER_X,
  PlayerForm,
  MOLE_LANES,
  DINO_JUMP_VELOCITY,
  DINO_GRAVITY,
} from "../utils/Constants";
import { ObstacleManager } from "../entities/ObstacleManager";

export class Game extends Scene {
  private player!: GameObjects.Sprite;
  private currentForm: PlayerForm = "dino";
  private obstacleManager!: ObstacleManager;

  private isJumping = false;
  private eagleY = SKY_Y;
  private currentMoleLane: "TOP" | "MIDDLE" | "BOTTOM" = "MIDDLE";
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private dinoGroundY!: number;

  // Game state
  private isGameOver = false;
  private score = 0;
  private scoreText!: GameObjects.Text;
  private controlsText!: GameObjects.Text;

  // Speed increase timing
  private lastSpeedIncreaseTime = 0;
  private speedIncreaseInterval = 3000; // Increase speed every 4 seconds
  
  // Swap counter for multiplier system
  private swapCount = 0;

  // Gauge and multiplier system
  private swapGauge = 100; // Starts at max, decreases over time
  private maxGauge = 100;
  private gaugeDecayRate = 30; // Points per second (much faster)
  private scoreMultiplier = 1;
  // No max multiplier - let it run to infinity!
  private swapCooldown = 0;
  private maxSwapCooldown = 1000; // 1 second in milliseconds

  // UI Elements
  private gaugeBar!: GameObjects.Rectangle;
  private gaugeBarBg!: GameObjects.Rectangle;
  private multiplierText!: GameObjects.Text;
  private swapCounterText!: GameObjects.Text;
  private formSelector!: GameObjects.Container;
  private formIcons: GameObjects.Image[] = [];
  private cooldownOverlays: GameObjects.Rectangle[] = [];
  private formBackgrounds: GameObjects.Rectangle[] = [];
  private formBorders: GameObjects.Rectangle[] = [];

  // Position indicators
  private dinoIndicator!: GameObjects.Image;
  private eagleIndicator!: GameObjects.Image;
  private moleIndicator!: GameObjects.Image;

  // Moving background tiles
  private dirtTiles!: GameObjects.Group;

  // Mole claw animation
  private moleClawEffect!: GameObjects.Sprite;
  
  // Sound effects
  private bgm!: Phaser.Sound.BaseSound;
  private jumpSound!: Phaser.Sound.BaseSound;
  private dieSound!: Phaser.Sound.BaseSound;
  private multiplierSound!: Phaser.Sound.BaseSound;
  private swapSound!: Phaser.Sound.BaseSound;
  private switchLaneSound!: Phaser.Sound.BaseSound;

  constructor() {
    super("Game");
  }

  create() {
    // Reset game state completely
    this.isGameOver = false;
    this.score = 0;
    this.currentForm = "dino";
    this.isJumping = false;
    this.eagleY = SKY_Y;
    this.currentMoleLane = "MIDDLE";

    // Reset gauge and multiplier system
    this.swapGauge = this.maxGauge;
    this.scoreMultiplier = 1;
    this.swapCooldown = 0;

    // Reset speed increase timer
    this.lastSpeedIncreaseTime = 0;
    
    // Reset swap counter
    this.swapCount = 0;

    // Clear any existing tweens and timers
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.createAnimations();
    this.createLanes();
    this.createPositionIndicators();
    this.createPlayer();
    this.createMoleClawEffect();
    this.obstacleManager = new ObstacleManager(this);
    this.setupInputs();
    this.setupCollisions();
    this.createUI();
    this.setupSounds();

    this.cameras.main.setBackgroundColor("#ffffff");
  }

  private createAnimations() {
    // Create Dino running animation (frames 4-7 based on guide)
    this.anims.create({
      key: "dino-run",
      frames: this.anims.generateFrameNumbers("dino", { start: 4, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });

    // Create Eagle flying animation (row 7, frames 0-3 based on guide)
    this.anims.create({
      key: "eagle-fly",
      frames: this.anims.generateFrameNumbers("eagle", { start: 70, end: 73 }), // Row 7 (0-indexed) * 10 cols = 70
      frameRate: 10,
      repeat: -1,
    });

    // Create form-switching animation
    this.anims.create({
      key: "form-switch",
      frames: [
        { key: "fx001_01" },
        { key: "fx001_02" },
        { key: "fx001_03" },
        { key: "fx001_04" },
        { key: "fx001_05" },
      ],
      frameRate: 15,
      repeat: 0, // Play once
    });

    // Create mole claw animation
    this.anims.create({
      key: "mole-claw",
      frames: [
        { key: "fx045_01" },
        { key: "fx045_02" },
        { key: "fx045_03" },
        { key: "fx045_04" },
        { key: "fx045_05" },
        { key: "fx045_06" },
        { key: "fx045_07" },
      ],
      frameRate: 12,
      repeat: -1, // Loop continuously
    });
  }

  private createLanes() {
    // Create proper tiled lanes using the specific game tiles

    // Sky Lane (Top) - Use sky-tile for eagle area
    const skyLaneHeight = LANE_HEIGHT;
    for (let x = 0; x < GAME_WIDTH; x += 16) {
      for (let y = 0; y < skyLaneHeight; y += 16) {
        const skyTile = this.add.image(x + 8, y + 8, "sky-tile");
        skyTile.setOrigin(0.5, 0.5);
        skyTile.setDisplaySize(16, 16); // Scale to 16x16 for tiling
      }
    }

    // Ground Lane (Middle) - All sky-tile with ground-tile only at the very bottom
    const groundLaneY = LANE_HEIGHT;
    for (let x = 0; x < GAME_WIDTH; x += 16) {
      for (let y = groundLaneY; y < groundLaneY + LANE_HEIGHT; y += 16) {
        // Use sky-tile for most of ground lane
        if (y < groundLaneY + LANE_HEIGHT - 16) {
          // All but bottom row
          const skyTile = this.add.image(x + 8, y + 8, "sky-tile");
          skyTile.setOrigin(0.5, 0.5);
          skyTile.setDisplaySize(16, 16);
        } else {
          // Use ground-tile only for bottom row (where dino runs)
          const groundTile = this.add.image(x + 8, y + 8, "ground-tile");
          groundTile.setOrigin(0.5, 0.5);
          groundTile.setDisplaySize(16, 16);
        }
      }
    }

    // Underground Lane (Bottom) - Moving dirt tiles for perspective effect
    this.dirtTiles = this.add.group();
    const undergroundLaneY = LANE_HEIGHT * 2;

    // Create many extra tiles to ensure seamless scrolling
    const tileWidth = 16;
    const tilesPerRow = Math.ceil(GAME_WIDTH / tileWidth) + 20; // Much more extra tiles
    const rowsPerLane = Math.ceil(LANE_HEIGHT / tileWidth);

    for (let col = 0; col < tilesPerRow; col++) {
      for (let row = 0; row < rowsPerLane; row++) {
        const x = col * tileWidth - tileWidth * 10; // Start 10 tiles off-screen
        const y = undergroundLaneY + row * tileWidth;

        const dirtTile = this.add.image(x, y, "dirt-tile");
        dirtTile.setOrigin(0, 0); // Top-left origin for precise tiling
        dirtTile.setDisplaySize(tileWidth, tileWidth);
        this.dirtTiles.add(dirtTile);
      }
    }

    // Lane separation is now handled by different tile types - no divider lines needed
  }

  private createPositionIndicators() {
    // Create checkpoint indicators at each form's position
    this.dinoIndicator = this.add.image(PLAYER_X, GROUND_Y, "checkpoint");
    this.dinoIndicator.setAlpha(0.8);
    this.dinoIndicator.setScale(1.5);
    this.dinoIndicator.setOrigin(0.5, 1); // Bottom center for ground alignment

    this.eagleIndicator = this.add.image(PLAYER_X, SKY_Y, "checkpoint");
    this.eagleIndicator.setAlpha(0.8);
    this.eagleIndicator.setScale(1.5);
    this.eagleIndicator.setOrigin(0.5, 0.5); // Center for flying

    this.moleIndicator = this.add.image(PLAYER_X, UNDERGROUND_Y, "checkpoint");
    this.moleIndicator.setAlpha(0.8);
    this.moleIndicator.setScale(1.5);
    this.moleIndicator.setOrigin(0.5, 0.5); // Center for underground

    // Initially hide non-active indicators
    this.updateIndicators();
  }

  private createPlayer() {
    // Simple approach: hardcode the ground position
    const groundPosition = 396; // Fixed position on the ground tiles

    // Start with dino sprite
    this.player = this.add.sprite(PLAYER_X, groundPosition, "dino");
    this.player.play("dino-run");
    this.player.setScale(2.5); // Bigger dino scale
    this.player.setOrigin(0.5, 1); // Set origin to bottom center for proper ground alignment

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setGravityY(-1000); // Counteract world gravity
    body.setAllowGravity(false); // Start with no gravity
    body.setSize(16, 20); // Smaller width for more forgiving gameplay

    // Use the same fixed position everywhere
    this.dinoGroundY = groundPosition;
  }

  private createMoleClawEffect() {
    // Create the claw effect sprite positioned to the right of the mole (moved slightly left)
    this.moleClawEffect = this.add.sprite(
      PLAYER_X + 25,
      UNDERGROUND_Y,
      "fx045_01"
    );
    this.moleClawEffect.setOrigin(0.5, 0.5);
    this.moleClawEffect.setScale(1.5); // Make it visible
    this.moleClawEffect.setVisible(false); // Initially hidden

    // Start the claw animation
    this.moleClawEffect.play("mole-claw");
  }

  private setupInputs() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    const spaceBar = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    if (!spaceBar) return;

    // Form switching
    this.cursors.left.on("down", () => this.switchForm("prev"));
    this.cursors.right.on("down", () => this.switchForm("next"));

    // Dino jump with Space
    spaceBar.on("down", () => this.handleSpaceInput());

    // Mole lane switching - setup key press events
    this.cursors.up.on("down", () => {
      if (this.currentForm === "mole") {
        this.handleMoleUp();
      }
    });

    this.cursors.down.on("down", () => {
      if (this.currentForm === "mole") {
        this.handleMoleDown();
      }
    });
  }

  private setupSounds() {
    // Initialize all sound effects
    this.bgm = this.sound.add("bgm", { loop: true, volume: 0.3 });
    this.jumpSound = this.sound.add("jump", { volume: 0.5 });
    this.dieSound = this.sound.add("die", { volume: 0.7 });
    this.multiplierSound = this.sound.add("multiplier", { volume: 0.6 });
    this.swapSound = this.sound.add("swap", { volume: 0.5 });
    this.switchLaneSound = this.sound.add("switch-lane", { volume: 0.5 });

    // Start BGM when entering gameplay
    this.bgm.play();
  }

  private switchForm(direction: "prev" | "next") {
    // Check if swap is on cooldown
    if (this.swapCooldown > 0) {
      return; // Can't swap during cooldown
    }

    const forms: PlayerForm[] = ["dino", "eagle", "mole"];
    const currentIndex = forms.indexOf(this.currentForm);

    let newIndex: number;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % forms.length;
    } else {
      newIndex = (currentIndex - 1 + forms.length) % forms.length;
    }

    this.currentForm = forms[newIndex];
    this.updatePlayerForm();
    this.updateIndicators();
    this.updateControlsHint();
    this.playFormSwitchAnimation();

    // Play swap sound
    this.swapSound.play();

    // Reset gauge and increase multiplier every 2 swaps (only if gauge had energy)
    const hadEnergy = this.swapGauge > 0;
    this.swapGauge = this.maxGauge;
    
    // Only count swap if gauge had energy
    if (hadEnergy) {
      this.swapCount += 1;
      
      // Increase multiplier every 2 swaps
      if (this.swapCount % 2 === 0) {
        this.scoreMultiplier += 1;
        this.multiplierSound.play();
        this.showPowEffect();
      }
    }

    // Start swap cooldown
    this.swapCooldown = this.maxSwapCooldown;

    // Update UI
    this.updateFormSelector();
    this.updateSwapCounterDisplay();
  }

  private showPowEffect() {
    // Dynamic color system for infinite multipliers
    const getMultiplierColor = (multiplier: number): number => {
      if (multiplier <= 1) return 0xffffff; // White
      if (multiplier <= 2) return 0x00ff00; // Green
      if (multiplier <= 3) return 0xffff00; // Yellow
      if (multiplier <= 4) return 0xff8800; // Orange
      if (multiplier <= 5) return 0xff0000; // Red
      if (multiplier <= 7) return 0x8000ff; // Purple
      if (multiplier <= 10) return 0x00ffff; // Cyan
      if (multiplier <= 15) return 0xff00ff; // Magenta
      if (multiplier <= 20) return 0x00ff88; // Emerald
      if (multiplier <= 30) return 0xffffff; // Back to white but pulsing
      // Beyond x30: Rainbow cycling based on multiplier level
      const hue = (multiplier * 30) % 360;
      return Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1).color;
    };

    const color = getMultiplierColor(this.scoreMultiplier);

    // Create POW text
    const powText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 50,
      "POW!",
      {
        fontFamily: "PixelifySans",
        fontSize: Math.min(48 + this.scoreMultiplier * 2, 80), // Grow with multiplier
        color: `#${color.toString(16).padStart(6, "0")}`,
      }
    );
    powText.setOrigin(0.5);
    powText.setDepth(1000);

    // Create multiplier text
    const multiplierText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      `x${this.scoreMultiplier}`,
      {
        fontFamily: "PixelifySans",
        fontSize: Math.min(32 + this.scoreMultiplier, 60), // Grow with multiplier
        color: `#${color.toString(16).padStart(6, "0")}`,
      }
    );
    multiplierText.setOrigin(0.5);
    multiplierText.setDepth(1000);

    // Intensified screen shake for higher multipliers
    const shakeIntensity = Math.min(0.01 + this.scoreMultiplier * 0.002, 0.05);
    this.cameras.main.shake(200, shakeIntensity);

    // POW animation
    this.tweens.add({
      targets: powText,
      scaleX: { from: 0.5, to: 1.5 },
      scaleY: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: "Back.easeOut",
      onComplete: () => {
        powText.destroy();
      },
    });

    // Multiplier number animation
    this.tweens.add({
      targets: multiplierText,
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.8, to: 1.2 },
      y: GAME_HEIGHT / 2 + 30,
      alpha: { from: 1, to: 0 },
      duration: 800,
      ease: "Power2.easeOut",
      onComplete: () => {
        multiplierText.destroy();
      },
    });

    // Update multiplier UI with color
    this.updateMultiplierDisplay();
  }

  private updateMultiplierDisplay() {
    // Use same dynamic color system as POW effect
    const getMultiplierColor = (multiplier: number): number => {
      if (multiplier <= 1) return 0xffffff; // White
      if (multiplier <= 2) return 0x00ff00; // Green
      if (multiplier <= 3) return 0xffff00; // Yellow
      if (multiplier <= 4) return 0xff8800; // Orange
      if (multiplier <= 5) return 0xff0000; // Red
      if (multiplier <= 7) return 0x8000ff; // Purple
      if (multiplier <= 10) return 0x00ffff; // Cyan
      if (multiplier <= 15) return 0xff00ff; // Magenta
      if (multiplier <= 20) return 0x00ff88; // Emerald
      if (multiplier <= 30) return 0xffffff; // Back to white but pulsing
      // Beyond x30: Rainbow cycling based on multiplier level
      const hue = (multiplier * 30) % 360;
      return Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1).color;
    };

    const color = getMultiplierColor(this.scoreMultiplier);

    this.multiplierText.setText(`Multiplier: x${this.scoreMultiplier}`);
    this.multiplierText.setTint(color);

    // Add pulse effect for higher multipliers (more intense for higher levels)
    if (this.scoreMultiplier >= 3) {
      const pulseScale = Math.min(1 + this.scoreMultiplier * 0.02, 1.3);
      this.tweens.add({
        targets: this.multiplierText,
        scaleX: { from: 1, to: pulseScale },
        scaleY: { from: 1, to: pulseScale },
        duration: Math.max(300 - this.scoreMultiplier * 5, 100), // Faster pulse for higher multipliers
        yoyo: true,
        ease: "Power2.easeInOut",
      });
    }

    // Special rainbow pulse for extreme multipliers (x30+)
    if (this.scoreMultiplier >= 30) {
      this.tweens.add({
        targets: this.multiplierText,
        alpha: { from: 1, to: 0.7 },
        duration: 150,
        yoyo: true,
        repeat: 2,
        ease: "Power2.easeInOut",
      });
    }
  }

  private updateSwapCounterDisplay() {
    const currentProgress = this.swapCount % 2;
    const color = this.swapGauge > 0 ? "#00ff00" : "#ff6666"; // Green if energy, red if empty
    
    this.swapCounterText.setText(`Swaps: ${currentProgress}/2`);
    this.swapCounterText.setTint(parseInt(color.replace("#", "0x")));
  }

  private playFormSwitchAnimation() {
    // Create a temporary sprite for the animation at the new form's position
    let animationX = PLAYER_X;
    let animationY = this.player.y;

    // Adjust Y position to center of body for different forms
    if (this.currentForm === "dino") {
      // Dino origin is bottom center, so move animation up to center of body
      animationY -= 25; // Move up half the dino's visual height
    }
    // Eagle and mole already use center origin, so no adjustment needed

    const animSprite = this.add.sprite(animationX, animationY, "fx001_01");
    animSprite.setOrigin(0.5, 0.5);
    animSprite.setScale(2.5); // Much bigger effect

    // Play the form-switch animation
    animSprite.play("form-switch");

    // Remove the animation sprite after it completes
    animSprite.on("animationcomplete", () => {
      animSprite.destroy();
    });
  }

  private updatePlayerForm() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Stop current animation
    this.player.stop();

    switch (this.currentForm) {
      case "dino":
        this.player.setTexture("dino");
        this.player.play("dino-run");
        this.player.y = this.dinoGroundY;
        this.player.setScale(2.5); // Bigger dino
        this.player.setOrigin(0.5, 1); // Bottom center origin
        body.setAllowGravity(false);
        body.setSize(16, 22); // Smaller width for more forgiving gameplay

        // Hide mole claw effect
        this.moleClawEffect.setVisible(false);
        break;
      case "eagle":
        this.player.setTexture("eagle");
        this.player.play("eagle-fly");
        this.player.y = this.eagleY;
        this.player.setScale(2);
        this.player.setOrigin(0.5, 0.5); // Center origin for flying
        body.setAllowGravity(false);
        body.setSize(24, 16); // Smaller hitbox for more forgiving gameplay

        // Hide mole claw effect
        this.moleClawEffect.setVisible(false);
        break;
      case "mole":
        this.player.setTexture("mole");
        this.player.y = MOLE_LANES[this.currentMoleLane];
        this.player.setScale(0.12); // Slightly smaller scale for mole
        this.player.setOrigin(0.5, 0.5); // Center origin for underground
        body.setAllowGravity(false);
        body.setSize(250, 100); // Wider collision box for mole

        // Show and position mole claw effect
        this.moleClawEffect.setVisible(true);
        this.moleClawEffect.y = this.player.y;
        break;
    }

    this.isJumping = false;
    body.setVelocityY(0);
  }

  private handleDinoJump() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!this.isJumping) {
      body.setAllowGravity(true);
      body.setGravityY(DINO_GRAVITY); // Use constant for consistent gravity
      body.setVelocityY(DINO_JUMP_VELOCITY); // Use constant for jump velocity
      this.isJumping = true;
      
      // Play jump sound
      this.jumpSound.play();
    }
  }

  private handleMoleUp() {
    if (this.currentForm === "mole") {
      const prevLane = this.currentMoleLane;
      if (this.currentMoleLane === "MIDDLE") {
        this.currentMoleLane = "TOP";
      } else if (this.currentMoleLane === "BOTTOM") {
        this.currentMoleLane = "MIDDLE";
      }
      
      // Only play sound if lane actually changed
      if (prevLane !== this.currentMoleLane) {
        this.switchLaneSound.play();
      }
      
      this.player.y = MOLE_LANES[this.currentMoleLane];
      // Update indicator to remember mole position
      this.moleIndicator.y = MOLE_LANES[this.currentMoleLane];
      // Update claw effect position
      this.moleClawEffect.y = this.player.y;
    }
  }

  private handleMoleDown() {
    if (this.currentForm === "mole") {
      const prevLane = this.currentMoleLane;
      if (this.currentMoleLane === "TOP") {
        this.currentMoleLane = "MIDDLE";
      } else if (this.currentMoleLane === "MIDDLE") {
        this.currentMoleLane = "BOTTOM";
      }
      
      // Only play sound if lane actually changed
      if (prevLane !== this.currentMoleLane) {
        this.switchLaneSound.play();
      }
      
      this.player.y = MOLE_LANES[this.currentMoleLane];
      // Update indicator to remember mole position
      this.moleIndicator.y = MOLE_LANES[this.currentMoleLane];
      // Update claw effect position
      this.moleClawEffect.y = this.player.y;
    }
  }

  private handleSpaceInput() {
    if (this.currentForm === "dino") {
      this.handleDinoJump();
    }
  }

  private updateIndicators() {
    // Show only inactive form indicators, hide current form indicator
    this.dinoIndicator.setVisible(this.currentForm !== "dino");
    this.eagleIndicator.setVisible(this.currentForm !== "eagle");
    this.moleIndicator.setVisible(this.currentForm !== "mole");

    // Update eagle indicator position based on current eagle Y
    if (this.currentForm === "eagle") {
      // Keep updating the last known eagle position
      this.eagleIndicator.y = this.eagleY;
    }

    // Update mole indicator position based on current lane
    if (this.currentForm === "mole") {
      // Keep updating the last known mole position
      this.moleIndicator.y = MOLE_LANES[this.currentMoleLane];
    }
  }

  private updateControlsHint() {
    if (!this.controlsText) return;

    switch (this.currentForm) {
      case "dino":
        this.controlsText.setText("SPACE: Jump");
        break;
      case "eagle":
        this.controlsText.setText("↑↓: Move");
        break;
      case "mole":
        this.controlsText.setText("↑↓: Switch lanes");
        break;
    }
  }

  private setupCollisions() {
    // Add collision detection between player and obstacles for each form
    this.physics.add.overlap(
      this.player,
      this.obstacleManager.getGroundObstacles(),
      this.handleObstacleHit,
      this.shouldCheckCollision,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.obstacleManager.getSkyObstacles(),
      this.handleObstacleHit,
      this.shouldCheckCollision,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.obstacleManager.getUndergroundObstacles(),
      this.handleObstacleHit,
      this.shouldCheckCollision,
      this
    );
  }

  private shouldCheckCollision(_player: any, obstacle: any): boolean {
    // Only check collisions if the game is not over
    if (this.isGameOver) return false;

    // Only collide if player is in the same lane as the obstacle
    const obstacleY = obstacle.y;

    // Check which lane the obstacle is in and if player form matches
    if (this.currentForm === "dino") {
      // Dino collides with ground obstacles based on actual position
      return (
        Math.abs(obstacleY - GROUND_Y) < 30 &&
        Math.abs(this.player.y - obstacleY) < 40
      );
    } else if (this.currentForm === "eagle") {
      // Eagle collides with sky obstacles based on its current position
      return Math.abs(this.player.y - obstacleY) < 40;
    } else if (this.currentForm === "mole") {
      // Mole collides with underground obstacles at exact lane position
      return Math.abs(obstacleY - this.player.y) < 30;
    }

    return false;
  }

  private handleObstacleHit() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    // Stop BGM and play death sound
    this.bgm.stop();
    this.dieSound.play();

    // Flash the player red
    this.player.setTint(0xff0000);

    // Show game over text
    const gameOverText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 50,
      "GAME OVER",
      {
        fontFamily: "PixelifySans, Arial Black",
        fontSize: "64px",
        color: "#ff0000",
        fontStyle: "bold",
      }
    );
    gameOverText.setOrigin(0.5);

    const finalScore = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 20,
      `Final Score: ${Math.floor(this.score)}`,
      {
        fontFamily: "PixelifySans, Arial",
        fontSize: "32px",
        color: "#000000",
      }
    );
    finalScore.setOrigin(0.5);

    const restartText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 70,
      "Press SPACE to return to menu",
      {
        fontFamily: "PixelifySans, Arial",
        fontSize: "24px",
        color: "#666666",
      }
    );
    restartText.setOrigin(0.5);

    // Allow return to main menu with space
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.scene.start("MainMenu");
    });
  }

  private createUI() {
    // Score display
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontFamily: "PixelifySans, Arial",
      fontSize: "24px",
      color: "#000000",
      fontStyle: "bold",
    });

    // Multiplier display
    this.multiplierText = this.add.text(20, 50, "Multiplier: x1", {
      fontFamily: "PixelifySans, Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    // Swap counter display (shows progress toward next multiplier)
    this.swapCounterText = this.add.text(20, 75, "Swaps: 0/2", {
      fontFamily: "PixelifySans, Arial",
      fontSize: "16px",
      color: "#cccccc",
      fontStyle: "bold",
    });

    // Create swap gauge
    this.createSwapGauge();

    // Create form selector UI
    this.createFormSelector();

    // Controls hint
    this.controlsText = this.add.text(GAME_WIDTH - 20, 20, "SPACE: Jump", {
      fontFamily: "PixelifySans, Arial",
      fontSize: "16px",
      color: "#666666",
    });
    this.controlsText.setOrigin(1, 0);

    // Swap instructions
    this.add
      .text(GAME_WIDTH - 20, 45, "← → to swap forms", {
        fontFamily: "PixelifySans, Arial",
        fontSize: "14px",
        color: "#666666",
      })
      .setOrigin(1, 0);

    // Initialize UI states
    this.updateFormSelector();
    this.updateMultiplierDisplay();
    this.updateSwapCounterDisplay();
  }

  private createSwapGauge() {
    const gaugeX = GAME_WIDTH / 2 - 100;
    const gaugeY = 50; // Moved down from 30
    const gaugeWidth = 200;
    const gaugeHeight = 20;

    // Background
    this.gaugeBarBg = this.add.rectangle(
      gaugeX,
      gaugeY,
      gaugeWidth,
      gaugeHeight,
      0x333333
    );
    this.gaugeBarBg.setOrigin(0, 0.5);
    this.gaugeBarBg.setStrokeStyle(2, 0x000000);

    // Gauge bar
    this.gaugeBar = this.add.rectangle(
      gaugeX,
      gaugeY,
      gaugeWidth,
      gaugeHeight - 4,
      0x00ff00
    );
    this.gaugeBar.setOrigin(0, 0.5);

    // Label
    this.add
      .text(gaugeX, gaugeY - 25, "Swap Energy", {
        fontFamily: "PixelifySans, Arial",
        fontSize: "16px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);
  }

  private createFormSelector() {
    // Clear existing arrays to prevent duplication on replay
    this.formIcons = [];
    this.cooldownOverlays = [];
    this.formBackgrounds = [];
    this.formBorders = [];

    const selectorX = GAME_WIDTH / 2;
    const selectorY = 110; // Moved down from 80

    // Create container for form selector
    this.formSelector = this.add.container(selectorX, selectorY);

    // Create form icons (3 squares with form avatars)
    const forms = ["dino", "eagle", "mole"];
    const avatars = ["dino_avatar", "eagle_avatar", "mole_avatar"];
    const spacing = 70;

    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * spacing; // Center around container
      const y = 0;

      // Highlight background (for current form - initially hidden)
      const highlightBg = this.add.rectangle(x, y, 60, 60, 0xffff00, 0.3);
      highlightBg.setVisible(false);
      this.formBackgrounds.push(highlightBg);
      this.formSelector.add(highlightBg);

      // Background square
      const bg = this.add.rectangle(x, y, 50, 50, 0xffffff);
      bg.setStrokeStyle(3, 0x000000);
      this.formSelector.add(bg);

      // Animated border for current form (initially hidden)
      const border = this.add.rectangle(x, y, 54, 54, 0x000000, 0);
      border.setStrokeStyle(3, 0x00ff00);
      border.setVisible(false);
      this.formBorders.push(border);
      this.formSelector.add(border);

      // Form icon (using proper avatars)
      const icon = this.add.image(x, y, avatars[i]);
      icon.setScale(0.08); // Smaller scale to fit better in the squares

      // Initially set all icons to grayscale (no color)
      icon.setTint(0x888888); // Gray tint for inactive forms

      this.formIcons.push(icon);
      this.formSelector.add(icon);

      // Cooldown overlay (initially hidden)
      const overlay = this.add.rectangle(x, y, 50, 50, 0x000000, 0.7);
      overlay.setVisible(false);
      this.cooldownOverlays.push(overlay);
      this.formSelector.add(overlay);

      // Form label
      const label = this.add.text(x, y + 35, forms[i].toUpperCase(), {
        fontFamily: "PixelifySans, Arial",
        fontSize: "12px",
        color: "#000000",
        fontStyle: "bold",
      });
      label.setOrigin(0.5);
      this.formSelector.add(label);
    }

    // Update initial selection
    this.updateFormSelector();
  }

  private updateGaugeSystem(delta: number) {
    // Decrease gauge over time
    this.swapGauge -= (this.gaugeDecayRate * delta) / 1000;

    // Clamp gauge to valid range
    this.swapGauge = Math.max(0, this.swapGauge);

    // Reset multiplier if gauge reaches zero
    if (this.swapGauge <= 0) {
      this.scoreMultiplier = 1;
    }

    // Update gauge visual
    const gaugePercent = this.swapGauge / this.maxGauge;
    this.gaugeBar.width = 196 * gaugePercent; // 200 - 4 for padding

    // Change gauge color based on level
    if (gaugePercent > 0.6) {
      this.gaugeBar.setFillStyle(0x00ff00); // Green
    } else if (gaugePercent > 0.3) {
      this.gaugeBar.setFillStyle(0xffff00); // Yellow
    } else {
      this.gaugeBar.setFillStyle(0xff0000); // Red
    }

    // Update multiplier display
    this.updateMultiplierDisplay();
    this.updateSwapCounterDisplay();
  }

  private updateCooldownSystem(delta: number) {
    // Decrease swap cooldown
    if (this.swapCooldown > 0) {
      this.swapCooldown -= delta;
      this.swapCooldown = Math.max(0, this.swapCooldown);
    }

    // Update cooldown overlays
    this.updateFormSelector();
  }

  private updateFormSelector() {
    const forms: PlayerForm[] = ["dino", "eagle", "mole"];
    const currentIndex = forms.indexOf(this.currentForm);

    // Colors only for the current active form
    const formColors = [0x00ff00, 0x0080ff, 0xff8c00]; // Green, Blue, Orange
    const borderColors = [0x00ff00, 0x0080ff, 0xff8c00]; // Matching border colors

    for (let i = 0; i < 3; i++) {
      const icon = this.formIcons[i];
      const overlay = this.cooldownOverlays[i];
      const background = this.formBackgrounds[i];
      const border = this.formBorders[i];

      // Only the current form gets special treatment
      if (i === currentIndex) {
        // Current form: colored icon, visible background, and border
        icon.setTint(formColors[i]);
        background.setVisible(true);
        background.setFillStyle(formColors[i], 0.2); // Semi-transparent colored background
        border.setVisible(true);
        border.setStrokeStyle(3, borderColors[i]); // Colored border

        // Add a subtle pulse effect to the border
        this.tweens.add({
          targets: border,
          alpha: { from: 1, to: 0.5 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      } else {
        // Inactive forms: gray icon, hidden background and border
        icon.setTint(0x888888);
        background.setVisible(false);
        border.setVisible(false);

        // Stop any existing tweens for inactive borders
        this.tweens.killTweensOf(border);
        border.setAlpha(1); // Reset alpha
      }

      // Show cooldown overlay if swapping is on cooldown
      if (this.swapCooldown > 0) {
        overlay.setVisible(true);
        overlay.setAlpha(0.7 * (this.swapCooldown / this.maxSwapCooldown));
      } else {
        overlay.setVisible(false);
      }
    }
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Update score with multiplier (10x faster for more exciting numbers)
    this.score += delta * 0.1 * this.scoreMultiplier;
    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);

    // Update gauge and multiplier system
    this.updateGaugeSystem(delta);
    this.updateCooldownSystem(delta);

    // Update obstacle manager
    this.obstacleManager.update(time, delta);

    // Increase difficulty over time (every 4 seconds)
    if (time - this.lastSpeedIncreaseTime >= this.speedIncreaseInterval) {
      this.obstacleManager.increaseSpeed(1.02);
      this.lastSpeedIncreaseTime = time;
    }

    // Move dirt tiles at the same speed as obstacles for consistency
    const obstacleSpeed = this.obstacleManager.getCurrentScrollSpeed(); // pixels per second
    const frameSpeed = (obstacleSpeed * delta) / 1000; // convert to pixels per frame
    const tileWidth = 16;
    const totalWidth = GAME_WIDTH + tileWidth * 20; // Total width of our tile loop

    this.dirtTiles.children.entries.forEach((tile) => {
      const dirtTile = tile as GameObjects.Image;
      dirtTile.x -= frameSpeed;

      // Simple modulo-based wrapping for seamless scrolling
      if (dirtTile.x <= -tileWidth * 10) {
        dirtTile.x += totalWidth; // Jump to the end of the tile loop
      }
    });

    // Handle continuous input for different forms
    switch (this.currentForm) {
      case "dino":
        // Handle jump landing
        if (this.isJumping && this.player.y >= this.dinoGroundY) {
          this.player.y = this.dinoGroundY;
          body.setVelocityY(0);
          body.setAllowGravity(false);
          body.setGravityY(0); // Reset gravity
          this.isJumping = false;
        }
        // Handle dino controls - only jump
        if (this.cursors.up.isDown || this.cursors.space?.isDown) {
          this.handleDinoJump();
        }
        break;

      case "eagle":
        // Smooth continuous movement for eagle
        if (this.cursors.up.isDown) {
          this.eagleY = Math.max(SKY_Y - 50, this.eagleY - 3);
          this.player.y = this.eagleY;
        }
        if (this.cursors.down.isDown) {
          this.eagleY = Math.min(SKY_Y + 50, this.eagleY + 3);
          this.player.y = this.eagleY;
        }
        // Update indicator to remember eagle position
        this.eagleIndicator.y = this.eagleY;
        break;

      case "mole":
        // Mole uses discrete lane switching (handled by events, not continuous)
        break;
    }
  }
}
