
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export type ObstacleType = 'TREE' | 'ROCK' | 'SNOWMAN';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
}
