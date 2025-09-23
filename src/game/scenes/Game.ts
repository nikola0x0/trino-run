import { Scene, GameObjects } from 'phaser';
import { 
    GAME_WIDTH, 
    GAME_HEIGHT, 
    LANE_HEIGHT, 
    SKY_Y, 
    GROUND_Y, 
    UNDERGROUND_Y,
    PLAYER_X,
    COLORS,
    PlayerForm,
    FORM_POSITIONS,
    MOLE_LANES,
    DINO_JUMP_VELOCITY,
    DINO_GRAVITY
} from '../utils/Constants';
import { ObstacleManager } from '../entities/ObstacleManager';

export class Game extends Scene {
    private player!: GameObjects.Sprite;
    private currentForm: PlayerForm = 'dino';
    private obstacleManager!: ObstacleManager;
    
    private isJumping = false;
    private eagleY = SKY_Y;
    private currentMoleLane: 'TOP' | 'MIDDLE' | 'BOTTOM' = 'MIDDLE';
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    
    // Game state
    private isGameOver = false;
    private score = 0;
    private scoreText!: GameObjects.Text;
    private controlsText!: GameObjects.Text;
    
    // Position indicators
    private dinoIndicator!: GameObjects.Sprite;
    private eagleIndicator!: GameObjects.Sprite;
    private moleIndicator!: GameObjects.Sprite;

    constructor() {
        super('Game');
    }

    create() {
        // Reset game state
        this.isGameOver = false;
        this.score = 0;
        this.currentForm = 'dino';
        this.isJumping = false;
        this.eagleY = SKY_Y;
        this.currentMoleLane = 'MIDDLE';
        
        this.createAnimations();
        this.createLanes();
        this.createPositionIndicators();
        this.createPlayer();
        this.obstacleManager = new ObstacleManager(this);
        this.setupInputs();
        this.setupCollisions();
        this.createUI();
        
        this.cameras.main.setBackgroundColor('#ffffff');
    }

    private createAnimations() {
        // Create Dino running animation (frames 4-7 based on guide)
        this.anims.create({
            key: 'dino-run',
            frames: this.anims.generateFrameNumbers('dino', { start: 4, end: 9 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Create Eagle flying animation (row 7, frames 0-3 based on guide)
        this.anims.create({
            key: 'eagle-fly',
            frames: this.anims.generateFrameNumbers('eagle', { start: 70, end: 73 }), // Row 7 (0-indexed) * 10 cols = 70
            frameRate: 10,
            repeat: -1
        });
    }
    
    private createLanes() {
        // Create tileset-based lane backgrounds for retro pixel art style
        
        // Sky Lane (Top) - Light blue background with repeating pattern
        const skyLaneHeight = LANE_HEIGHT;
        for (let x = 0; x < GAME_WIDTH; x += 16) {
            // Use light blue tiles from tilemap-backgrounds (index 0-1 are light blue)
            const skyTile = this.add.image(x + 8, skyLaneHeight / 2, 'tilemap-backgrounds');
            skyTile.setOrigin(0.5, 0.5);
            skyTile.setFrame(0); // Light blue background tile
            skyTile.setScale(1);
            skyTile.setAlpha(0.3); // Subtle background
        }
        
        // Ground Lane (Middle) - Brown/tan background with grass elements
        for (let x = 0; x < GAME_WIDTH; x += 16) {
            // Use brown tiles from tilemap-backgrounds (index 2-3 are brown)
            const groundTile = this.add.image(x + 8, GAME_HEIGHT / 2, 'tilemap-backgrounds');
            groundTile.setOrigin(0.5, 0.5);
            groundTile.setFrame(2); // Brown background tile
            groundTile.setScale(1);
            groundTile.setAlpha(0.3); // Subtle background
        }
        
        // Underground Lane (Bottom) - Dark brown/stone background
        for (let x = 0; x < GAME_WIDTH; x += 16) {
            // Use green tiles from tilemap-backgrounds (index 4-5 are green, but we'll treat as underground)
            const undergroundTile = this.add.image(x + 8, GAME_HEIGHT - skyLaneHeight / 2, 'tilemap-backgrounds');
            undergroundTile.setOrigin(0.5, 0.5);
            undergroundTile.setFrame(4); // Dark background tile for underground
            undergroundTile.setScale(1);
            undergroundTile.setAlpha(0.3); // Subtle background
        }
    }

    private createPositionIndicators() {
        // Create semi-transparent indicators at each form's position
        this.dinoIndicator = this.add.sprite(PLAYER_X, GROUND_Y, 'dino', 4);
        this.dinoIndicator.setAlpha(0.3);
        this.dinoIndicator.setScale(2.5);  // Bigger dino
        this.dinoIndicator.setOrigin(0.5, 1); // Bottom center for ground alignment
        
        this.eagleIndicator = this.add.sprite(PLAYER_X, SKY_Y, 'eagle', 70);
        this.eagleIndicator.setAlpha(0.3);
        this.eagleIndicator.setScale(2);
        this.eagleIndicator.setOrigin(0.5, 0.5); // Center for flying
        
        this.moleIndicator = this.add.sprite(PLAYER_X, UNDERGROUND_Y, 'mole');
        this.moleIndicator.setAlpha(0.3);
        this.moleIndicator.setScale(0.12); // Slightly smaller scale for mole
        this.moleIndicator.setOrigin(0.5, 0.5); // Center for underground
        
        // Initially hide non-active indicators
        this.updateIndicators();
    }

    private createPlayer() {
        // Start with dino sprite
        this.player = this.add.sprite(PLAYER_X, FORM_POSITIONS[this.currentForm], 'dino');
        this.player.play('dino-run');
        this.player.setScale(2.5); // Bigger dino scale
        this.player.setOrigin(0.5, 1); // Set origin to bottom center for proper ground alignment
        
        this.physics.add.existing(this.player);
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setGravityY(-1000); // Counteract world gravity
        body.setAllowGravity(false); // Start with no gravity
        body.setSize(20, 20); // Adjust collision box
    }


    private setupInputs() {
        this.cursors = this.input.keyboard!.createCursorKeys();
        const spaceBar = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        if (!spaceBar) return;
        
        // Form switching
        this.cursors.left.on('down', () => this.switchForm('prev'));
        this.cursors.right.on('down', () => this.switchForm('next'));
        
        // Dino jump with Space
        spaceBar.on('down', () => this.handleSpaceInput());
        
        // Mole lane switching - setup key press events
        this.cursors.up.on('down', () => {
            if (this.currentForm === 'mole') {
                this.handleMoleUp();
            }
        });
        
        this.cursors.down.on('down', () => {
            if (this.currentForm === 'mole') {
                this.handleMoleDown();
            }
        });
    }

    private switchForm(direction: 'prev' | 'next') {
        const forms: PlayerForm[] = ['dino', 'eagle', 'mole'];
        const currentIndex = forms.indexOf(this.currentForm);
        
        let newIndex: number;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % forms.length;
        } else {
            newIndex = (currentIndex - 1 + forms.length) % forms.length;
        }
        
        this.currentForm = forms[newIndex];
        this.updatePlayerForm();
        this.updateIndicators();
        this.updateControlsHint();
    }

    private updatePlayerForm() {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        
        // Stop current animation
        this.player.stop();
        
        switch (this.currentForm) {
            case 'dino':
                this.player.setTexture('dino');
                this.player.play('dino-run');
                this.player.y = GROUND_Y;
                this.player.setScale(2.5);  // Bigger dino
                this.player.setOrigin(0.5, 1); // Bottom center origin
                body.setAllowGravity(false);
                body.setSize(20, 22);
                break;
            case 'eagle':
                this.player.setTexture('eagle');
                this.player.play('eagle-fly');
                this.player.y = this.eagleY;
                this.player.setScale(2);
                this.player.setOrigin(0.5, 0.5); // Center origin for flying
                body.setAllowGravity(false);
                body.setSize(28, 18);
                break;
            case 'mole':
                this.player.setTexture('mole');
                this.player.y = MOLE_LANES[this.currentMoleLane];
                this.player.setScale(0.12); // Slightly smaller scale for mole
                this.player.setOrigin(0.5, 0.5); // Center origin for underground
                body.setAllowGravity(false);
                body.setSize(60, 28);  // Bigger collision box for mole
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
        }
    }


    private handleMoleUp() {
        if (this.currentForm === 'mole') {
            if (this.currentMoleLane === 'MIDDLE') {
                this.currentMoleLane = 'TOP';
            } else if (this.currentMoleLane === 'BOTTOM') {
                this.currentMoleLane = 'MIDDLE';
            }
            this.player.y = MOLE_LANES[this.currentMoleLane];
            // Update indicator to remember mole position
            this.moleIndicator.y = MOLE_LANES[this.currentMoleLane];
        }
    }

    private handleMoleDown() {
        if (this.currentForm === 'mole') {
            if (this.currentMoleLane === 'TOP') {
                this.currentMoleLane = 'MIDDLE';
            } else if (this.currentMoleLane === 'MIDDLE') {
                this.currentMoleLane = 'BOTTOM';
            }
            this.player.y = MOLE_LANES[this.currentMoleLane];
            // Update indicator to remember mole position
            this.moleIndicator.y = MOLE_LANES[this.currentMoleLane];
        }
    }

    private handleSpaceInput() {
        if (this.currentForm === 'dino') {
            this.handleDinoJump();
        }
    }

    private updateIndicators() {
        // Show only inactive form indicators, hide current form indicator
        this.dinoIndicator.setVisible(this.currentForm !== 'dino');
        this.eagleIndicator.setVisible(this.currentForm !== 'eagle');
        this.moleIndicator.setVisible(this.currentForm !== 'mole');
        
        // Update eagle indicator position based on current eagle Y
        if (this.currentForm === 'eagle') {
            // Keep updating the last known eagle position
            this.eagleIndicator.y = this.eagleY;
        }
        
        // Update mole indicator position based on current lane
        if (this.currentForm === 'mole') {
            // Keep updating the last known mole position
            this.moleIndicator.y = MOLE_LANES[this.currentMoleLane];
        }
    }

    private updateControlsHint() {
        if (!this.controlsText) return;
        
        switch (this.currentForm) {
            case 'dino':
                this.controlsText.setText('SPACE: Jump');
                break;
            case 'eagle':
                this.controlsText.setText('↑↓: Move');
                break;
            case 'mole':
                this.controlsText.setText('↑↓: Switch lanes');
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
        if (this.currentForm === 'dino') {
            // Dino only collides with ground obstacles (not while jumping)
            return Math.abs(obstacleY - GROUND_Y) < 30 && !this.isJumping;
        } else if (this.currentForm === 'eagle') {
            // Eagle collides with sky obstacles at similar Y position
            return Math.abs(obstacleY - SKY_Y) < 30 && Math.abs(this.player.y - obstacleY) < 40;
        } else if (this.currentForm === 'mole') {
            // Mole collides with underground obstacles at exact lane position
            return Math.abs(obstacleY - this.player.y) < 30;
        }
        
        return false;
    }

    private handleObstacleHit() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.physics.pause();
        
        // Flash the player red
        this.player.setTint(0xff0000);
        
        // Show game over text
        const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'GAME OVER', {
            fontFamily: 'PixelifySans, Arial Black',
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        });
        gameOverText.setOrigin(0.5);
        
        const finalScore = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `Final Score: ${Math.floor(this.score)}`, {
            fontFamily: 'PixelifySans, Arial',
            fontSize: '32px',
            color: '#000000'
        });
        finalScore.setOrigin(0.5);
        
        const restartText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, 'Press SPACE to restart', {
            fontFamily: 'PixelifySans, Arial',
            fontSize: '24px',
            color: '#666666'
        });
        restartText.setOrigin(0.5);
        
        // Allow restart with space
        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }

    private createUI() {
        // Score display
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontFamily: 'PixelifySans, Arial',
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        });
        
        // Form indicator text
        this.add.text(20, 50, 'Forms: ← → to switch', {
            fontFamily: 'PixelifySans, Arial',
            fontSize: '16px',
            color: '#666666'
        });
        
        // Controls hint
        this.controlsText = this.add.text(GAME_WIDTH - 20, 20, 'SPACE: Jump', {
            fontFamily: 'PixelifySans, Arial',
            fontSize: '16px',
            color: '#666666'
        });
        this.controlsText.setOrigin(1, 0);
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;
        
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        
        // Update score (10x faster for more exciting numbers)
        this.score += delta * 0.1;
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
        
        // Update obstacle manager
        this.obstacleManager.update(time, delta);
        
        // Increase difficulty over time
        if (Math.floor(this.score) > 0 && Math.floor(this.score) % 100 === 0) {
            this.obstacleManager.increaseSpeed(1.05);
        }
        
        // Handle continuous input for different forms
        switch (this.currentForm) {
            case 'dino':
                // Handle jump landing
                if (this.isJumping && this.player.y >= GROUND_Y) {
                    this.player.y = GROUND_Y;
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
                
            case 'eagle':
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
                
            case 'mole':
                // Mole uses discrete lane switching (handled by events, not continuous)
                break;
        }
    }
}