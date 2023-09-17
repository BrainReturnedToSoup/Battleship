import { ArgumentValidation } from "./modules/LowLevelModules/Argument-Validation";
import { ErrorManager } from "./modules/LowLevelModules/Error-Manager";
import { Publisher } from "./modules/LowLevelModules/Publisher";

import lodash from "lodash";

const errorManager = new ErrorManager();

import { GameState } from "./modules/Game/GameState.js";

const gameState = new GameState();

// "Player 1 State",
// "Player 2 State",
// "Ship Placement State",
// "Match State",
// "Game State",

gameState.subscribe("Game State", "Test", (state) => {
  console.log("Game State", state);
});

gameState.subscribe("Match State", "Test", (state) => {
  console.log("Match State", state);
});

gameState.subscribe("Ship Placement State", "Test", (state) => {
  console.log("Ship Placement State", state);
});

gameState.subscribe("Player 1 State", "Test", (state) => {
  console.log("Player 1 State", state);
});

gameState.subscribe("Player 2 State", "Test", (state) => {
  console.log("Player 2 State", state);
});

//-----------------Game-Simulation----------------

//-pick-ships

gameState.resetGameState();
gameState.startShipPlacements();

gameState.placeAShip("player1", [0, 0], "Vertical");
gameState.placeAShip("player1", [0, 1], "Horizontal");
gameState.placeAShip("player1", [2, 2], "Horizontal");
gameState.placeAShip("player1", [4, 2], "Horizontal");
gameState.placeAShip("player1", [6, 2], "Horizontal");

gameState.placeAShip("player2", [0, 0], "Vertical");
gameState.placeAShip("player2", [0, 1], "Horizontal");
gameState.placeAShip("player2", [2, 2], "Horizontal");
gameState.placeAShip("player2", [4, 2], "Horizontal");
gameState.placeAShip("player2", [6, 2], "Horizontal");

//-start-match

gameState.attackPlayer("player2", [0, 0]);
gameState.attackPlayer("player1", [0, 0]);

gameState.attackPlayer("player2", [1, 0]);
gameState.attackPlayer("player1", [1, 0]);

gameState.attackPlayer("player2", [2, 0]);
gameState.attackPlayer("player1", [2, 0]);

gameState.attackPlayer("player2", [3, 0]);
gameState.attackPlayer("player1", [3, 0]);

gameState.attackPlayer("player2", [4, 0]);
gameState.attackPlayer("player1", [4, 0]);

gameState.attackPlayer("player2", [0, 1]);
gameState.attackPlayer("player1", [0, 1]);

gameState.attackPlayer("player2", [0, 2]);
gameState.attackPlayer("player1", [0, 2]);

gameState.attackPlayer("player2", [0, 3]);
gameState.attackPlayer("player1", [0, 3]);

gameState.attackPlayer("player2", [0, 4]);
gameState.attackPlayer("player1", [0, 4]);

gameState.attackPlayer("player2", [2, 2]);
gameState.attackPlayer("player1", [2, 2]);

gameState.attackPlayer("player2", [2, 3]);
gameState.attackPlayer("player1", [2, 3]);

gameState.attackPlayer("player2", [2, 4]);
gameState.attackPlayer("player1", [2, 4]);

gameState.attackPlayer("player2", [4, 2]);
gameState.attackPlayer("player1", [4, 2]);

gameState.attackPlayer("player2", [4, 3]);
gameState.attackPlayer("player1", [4, 3]);

gameState.attackPlayer("player2", [4, 4]);
gameState.attackPlayer("player1", [4, 4]);

gameState.attackPlayer("player2", [6, 2]);
gameState.attackPlayer("player1", [6, 2]);

gameState.attackPlayer("player2", [6, 3]);

