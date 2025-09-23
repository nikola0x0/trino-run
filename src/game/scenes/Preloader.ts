import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    // Load logo from root public directory
    this.load.image("logo", "logo.png");

    //  Load the assets for the game
    this.load.setPath("assets");

    // Load tilesets for environment
    this.load.image("tilemap", "tilesets/Tilemap/tilemap.png");
    this.load.image("tilemap-backgrounds", "tilesets/Tilemap/tilemap-backgrounds.png");

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
