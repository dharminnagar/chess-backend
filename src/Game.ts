import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { z } from "zod";
import { MOVE } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private moves: string[];
  private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date();
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // validate the type of move using zod
    const MoveSchema = z.object({
      from: z.string(),
      to: z.string(),
    });
    MoveSchema.parse(move);

    // check if it is the player's turn
    // Length is even, it is white's turn
    // Length is odd, it is black's turn
    if (this.moves.length % 2 === 0 && socket !== this.player1) {
      return;
    }

    if (this.moves.length % 2 === 1 && socket !== this.player2) {
      return;
    }

    // Make the move
    // move is valid or not is checked internally by the library
    try {
      this.board.move(move);
    } catch (error) {
      // send an error message to the player
      return error;
    }

    // check if the game is over
    // check for win
    // check for draw
    // Checkmate, stalemate etc.
    if (this.board.isGameOver()) {
      // send the game over message to both players
      this.player1.emit(
        JSON.stringify({
          type: "GAME_OVER",
          payload: {
            result: this.board.turn() === "w" ? "BLACK_WON" : "WHITE_WON",
          },
        })
      );
      this.player2.emit(
        JSON.stringify({
          type: "GAME_OVER",
          payload: {
            result: this.board.turn() === "w" ? "BLACK_WON" : "WHITE_WON",
          },
        })
      );
    }

    // send the updated board to both players
    if (this.moves.length % 2 === 0) {
      this.player2.emit(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.emit(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
  }
}
