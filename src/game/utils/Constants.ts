export const GAME_WIDTH = 1200;
export const GAME_HEIGHT = 600;

export const LANE_HEIGHT = GAME_HEIGHT / 3;
export const SKY_Y = LANE_HEIGHT / 2; // Sky at 100px
export const GROUND_Y = LANE_HEIGHT * 2; // Ground surface aligned with lane boundary
export const UNDERGROUND_Y = GAME_HEIGHT - LANE_HEIGHT / 2; // Underground at 500px

export const PLAYER_X = 150;

export const COLORS = {
  PLAYER_DINO: 0x00ff00,
  PLAYER_EAGLE: 0x0080ff,
  PLAYER_MOLE: 0x8b4513,
  OBSTACLE_GROUND: 0xff0000,
  OBSTACLE_SKY: 0x808080,
  OBSTACLE_UNDERGROUND: 0xff8c00,
  LANE_SKY: 0x87ceeb,
  LANE_GROUND: 0x90ee90,
  LANE_UNDERGROUND: 0x654321,
};

export const PLAYER_SIZE = {
  width: 40,
  height: 40,
};

export const OBSTACLE_SIZE = {
  width: 30,
  height: 50,
};

export type PlayerForm = "dino" | "eagle" | "mole";

export const FORM_POSITIONS = {
  dino: GROUND_Y,
  eagle: SKY_Y,
  mole: UNDERGROUND_Y,
};

export const DINO_JUMP_HEIGHT = 120;
export const DINO_JUMP_VELOCITY = -600;
export const DINO_GRAVITY = 1200;

export const MOLE_LANES = {
  TOP: UNDERGROUND_Y - 50,
  MIDDLE: UNDERGROUND_Y,
  BOTTOM: UNDERGROUND_Y + 50,
};
