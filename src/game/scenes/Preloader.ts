import { Scene } from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../utils/Constants";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // Set monochrome background color to match game style
    this.cameras.main.setBackgroundColor("#f0f0f0");

    // Game title text in pixel style
    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "TRINO RUN", {
      fontFamily: "monospace, Arial",
      fontSize: "48px",
      color: "#000000",
      fontStyle: "bold"
    });
    titleText.setOrigin(0.5);

    // Subtitle text
    const subtitleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, "Loading...", {
      fontFamily: "monospace, Arial", 
      fontSize: "20px",
      color: "#666666"
    });
    subtitleText.setOrigin(0.5);

    // Pixel-style progress bar background
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 320, 24, 0xcccccc);
    barBg.setStrokeStyle(3, 0x000000);

    // Progress bar container for pixel texture effect
    const barContainer = this.add.container(GAME_WIDTH / 2 - 158, GAME_HEIGHT / 2 + 20);
    
    // Create pixel texture using small rectangles for chunky look
    const pixelBlocks: Phaser.GameObjects.Rectangle[] = [];
    const blockWidth = 8; // Each pixel block width
    const blockHeight = 18;
    const totalBlocks = Math.floor(312 / blockWidth); // Total number of blocks
    
    for (let i = 0; i < totalBlocks; i++) {
      const block = this.add.rectangle(i * blockWidth, 0, blockWidth - 1, blockHeight, 0x333333);
      block.setOrigin(0, 0.5);
      block.setVisible(false); // Start invisible
      pixelBlocks.push(block);
      barContainer.add(block);
    }

    // Loading dots animation
    const dots = [".", "..", "..."];
    let dotIndex = 0;
    
    this.time.addEvent({
      delay: 500,
      callback: () => {
        subtitleText.setText(`Loading${dots[dotIndex]}`);
        dotIndex = (dotIndex + 1) % dots.length;
      },
      loop: true
    });

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      // Show pixel blocks based on progress
      const blocksToShow = Math.floor(totalBlocks * progress);
      
      for (let i = 0; i < totalBlocks; i++) {
        if (i < blocksToShow) {
          pixelBlocks[i].setVisible(true);
        } else {
          pixelBlocks[i].setVisible(false);
        }
      }
    });
  }

  preload() {
    // Load logo from root public directory
    this.load.image("logo", "logo.png");

    //  Load the assets for the game
    this.load.setPath("assets");

    // Load game tiles for lanes
    this.load.image("ground-tile", "tilesets/game_tiles/ground.png");
    this.load.image("dirt-tile", "tilesets/game_tiles/dirt.png");
    this.load.image("sky-tile", "tilesets/game_tiles/sky.png");

    // Load player sprites
    this.load.spritesheet("dino", "players/24x24_dino_1row_24col.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet("eagle", "players/32x21_eagle_9row_10col.png", {
      frameWidth: 32,
      frameHeight: 21,
    });

    this.load.image("mole", "players/mole.png");
    
    // Load checkpoint indicator
    this.load.image("checkpoint", "players/checkpoint.png");
    
    // Load form avatars for UI
    this.load.image("dino_avatar", "players/dino_avt.png");
    this.load.image("eagle_avatar", "players/eagle_avt.png");
    this.load.image("mole_avatar", "players/mole_avt.png");
    
    // Load form-switching animation
    this.load.image("fx001_01", "anims/FX001/FX001_01.png");
    this.load.image("fx001_02", "anims/FX001/FX001_02.png");
    this.load.image("fx001_03", "anims/FX001/FX001_03.png");
    this.load.image("fx001_04", "anims/FX001/FX001_04.png");
    this.load.image("fx001_05", "anims/FX001/FX001_05.png");
    
    // Load mole claw animation
    this.load.image("fx045_01", "anims/FX045_nyknck/FX45_01.png");
    this.load.image("fx045_02", "anims/FX045_nyknck/FX45_02.png");
    this.load.image("fx045_03", "anims/FX045_nyknck/FX45_03.png");
    this.load.image("fx045_04", "anims/FX045_nyknck/FX45_04.png");
    this.load.image("fx045_05", "anims/FX045_nyknck/FX45_05.png");
    this.load.image("fx045_06", "anims/FX045_nyknck/FX45_06.png");
    this.load.image("fx045_07", "anims/FX045_nyknck/FX45_07.png");

    // Load obstacle sprites
    this.load.spritesheet("cacti", "obstacles/64x64_cacti_9col_2row.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    
    // Load jet for sky obstacles (as gif/image)
    this.load.image("jet", "obstacles/jet.gif");
    
    // Load rocks spritesheet for underground obstacles
    this.load.spritesheet("rocks", "obstacles/rocks.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    // Load sound effects
    this.load.audio("bgm", "sounds/bgm.mp3");
    this.load.audio("jump", "sounds/jump.wav");
    this.load.audio("die", "sounds/die.wav");
    this.load.audio("multiplier", "sounds/multiplier.wav");
    this.load.audio("swap", "sounds/swap.wav");
    this.load.audio("switch-lane", "sounds/switch-lane.wav");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    // Load PixelifySans font using FontFace API
    const newFontFace = new FontFace('PixelifySans', 'url(assets/fonts/PixelifySans/PixelifySans-VariableFont_wght.ttf)');
    document.fonts.add(newFontFace);
    newFontFace.load().then(() => {
      //  Move to the MainMenu after font is loaded
      this.scene.start("MainMenu");
    }).catch(() => {
      // If font fails to load, continue anyway
      console.warn('Failed to load PixelifySans font');
      this.scene.start("MainMenu");
    });
  }
}
