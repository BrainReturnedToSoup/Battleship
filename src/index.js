import {
  MatchState,
  ShipPlacementState,
  PlayerState,
} from "./modules/Game/GameState";

import { ArgumentValidation } from "./modules/LowLevelModules/Argument-Validation";
import { ErrorManager } from "./modules/LowLevelModules/Error-Manager";
import { Publisher } from "./modules/LowLevelModules/Publisher";

import lodash from "lodash";

const player1 = new PlayerState(1),
  player2 = new PlayerState(2);

player1.subscribe("Testing State", (state) => {
  console.log("Player 1", state);
});

player2.subscribe("Testing State", (state) => {
  console.log("Player 2", state);
});

const shipPlacementState = new ShipPlacementState(player1, player2);

shipPlacementState.subscribe("Ship Placement State", (state) => {
  console.log("Ship Placement State", state);
});

shipPlacementState.beginShipPlacements();

shipPlacementState.placeAShip("player1", [0, 0], "Horizontal");
shipPlacementState.placeAShip("player1", [1, 0], "Vertical");
shipPlacementState.placeAShip("player1", [2, 2], "Horizontal");
shipPlacementState.placeAShip("player1", [4, 5], "Horizontal");
shipPlacementState.placeAShip("player1", [8, 4], "Horizontal");

shipPlacementState.placeAShip("player2", [0, 1], "Horizontal");
shipPlacementState.placeAShip("player2", [1, 0], "Vertical");
shipPlacementState.placeAShip("player2", [2, 2], "Horizontal");
shipPlacementState.placeAShip("player2", [4, 5], "Horizontal");
shipPlacementState.placeAShip("player2", [8, 4], "Horizontal");

shipPlacementState.endShipPlacements();