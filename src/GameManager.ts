import { WebSocket } from "ws";
import { INIT_GAME } from "./messages";

interface Game {
  id: number;
  name: string;
  player1: WebSocket;
  player2: WebSocket;
}

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null = null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
    // Stop the game as the user has disconnected
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          // start a new game
          // this.createGame(socket, this.pendingUser);
        } else {
          this.pendingUser = socket;
        }
      }
    });
  }
}
