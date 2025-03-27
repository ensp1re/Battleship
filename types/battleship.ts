export type CellStatus = "empty" | "ship" | "hit" | "miss";

export interface Ship {
  id: string;
  type: string;
  size: number;
  positions: { row: number; col: number }[];
  hits: number;
  sunk: boolean;
}

export interface Cell {
  row: number;
  col: number;
  status: CellStatus;
  ship: string | null;
}

export type Board = Cell[][];

export type GameState = "setup" | "playing" | "gameOver";
