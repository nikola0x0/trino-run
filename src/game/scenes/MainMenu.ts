import { Scene } from "phaser";
import { GAME_WIDTH } from "../utils/Constants";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // Set white background for retro monochrome style
    this.cameras.main.setBackgroundColor("#ffffff");

    // Add logo at the top (moved down to prevent cutoff)
    const logo = this.add.image(GAME_WIDTH / 2, 200, "logo");
    logo.setOrigin(0.5);
    logo.setScale(1.0); // Full size since it's the main focal point

    // Add instructions using PixelifySans font
    this.add
      .text(GAME_WIDTH / 2, 390, "How to Play:", {
        fontFamily: "PixelifySans, Arial",
        fontSize: 24,
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    const controls = [
      "← → : Switch Forms",
      "SPACE/↑ : Jump (Dino)",
      "↑ ↓ : Move (Eagle) / Switch Lanes (Mole)",
    ];

    controls.forEach((text, index) => {
      this.add
        .text(GAME_WIDTH / 2, 420 + index * 30, text, {
          fontFamily: "PixelifySans, Arial",
          fontSize: 18,
          color: "#666666",
          align: "center",
        })
        .setOrigin(0.5);
    });

    // Add start prompt using PixelifySans font
    const startText = this.add
      .text(GAME_WIDTH / 2, 550, "PRESS ANY KEY TO START", {
        fontFamily: "PixelifySans, Arial Black",
        fontSize: 32,
        color: "#000000",
        stroke: "#ffffff",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5);

    // Make start text blink
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Start game on any key press or click
    this.input.keyboard?.on("keydown", () => {
      this.scene.start("Game");
    });
    
    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
