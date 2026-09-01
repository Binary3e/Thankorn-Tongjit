export type Player = 'player1' | 'player2'; // player1 = Bottom (White/Light Wood), player2 = Top (Red/Dark Wood / AI)

export type PieceType = 'man' | 'king';

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
}

export interface Position {
  r: number;
  c: number;
}

export interface Step {
  from: Position;
  to: Position;
  capturedPos?: Position;
  promoted?: boolean;
}

export interface Move {
  pieceId: string;
  player: Player;
  from: Position;
  to: Position;
  steps: Step[];
  capturedPositions: Position[];
  becomesKing: boolean;
}

export type Board = (Piece | null)[][];

export type GameMode = 'pve' | 'pvp'; // 'pve' = Play vs AI, 'pvp' = 2 Players on same device

export type AiDifficulty = 'easy' | 'normal' | 'hard'; // 'มือใหม่', 'มาตรฐาน', 'เซียน'

export type GameStatus = 'playing' | 'player1_won' | 'player2_won' | 'draw';

export interface GameState {
  board: Board;
  turn: Player;
  selectedPos: Position | null;
  validMoves: Move[];
  status: GameStatus;
  mode: GameMode;
  aiThinking: boolean;
  moveHistory: {
    move: Move;
    boardSnapshot: Board;
  }[];
  capturedByP1: Piece[];
  capturedByP2: Piece[];
  isMandatoryCaptureActive: boolean;
}
