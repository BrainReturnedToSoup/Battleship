import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";
import { Publisher } from "../LowLevelModules/Publisher";

import lodash from "lodash";

const errorManager = new ErrorManager();

//will use the helper classes for the player states in order to provide apis
//to interact with the game state. Also holds data for things that aren't directly
//related to the individual players, for instance, for transitioning the grid being displayed
//or perhaps limiting the ability to make a move to the other board after one has been made.
export class GameState {
  constructor() {
    try {
      this.#initGameStatePublisherInstances();

      this.#linkControllerToHelperStatePublishers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----STATE-AND-CONFIG-DATA-----//

  #stateData = {
    currentState: null,
    finishedStateStatus: {
      shipPlacement: false,
      match: false,
    },
  };

  #possibleCurrentStates = ["Ship Placements", "Match", "Reset", "Final"];

  #publisherInstanceNames = [
    "Player 1 State",
    "Player 2 State",
    "Ship Placement State",
    "Match State",
    "Game State",
  ];

  #playerStateInstances = {
    player1: new PlayerState(1),
    player2: new PlayerState(2),
  };

  #argumentValidationRules = {
    attackPlayer: {
      playerName: {
        type: "string",
        validValues: Object.keys(this.#playerStateInstances),
      },
      targetCoord: {
        isArray: true,
        arrElementType: "number",
      },
    },
    placeAShip: {
      playerName: {
        type: "string",
        validValues: Object.keys(this.#playerStateInstances),
      },
      originCoord: {
        isArray: true,
        arrElementType: "number",
      },
      axis: {
        type: "string",
        validValues: ["Vertical", "Horizontal"],
      },
    },
    subscribe: {
      publisherName: {
        type: "string",
        validValues: this.#publisherInstanceNames,
      },
      methodName: {
        type: "string",
      },
      entrypointMethod: {
        type: "function",
      },
    },
    unsubscribe: {
      publisherName: {
        type: "string",
        validValues: this.#publisherInstanceNames,
      },
      methodName: {
        type: "string",
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    publisher: new Publisher(),
  };

  // current = [ RESET, PICKING, GAME ]
  // whosTurn = [ Player 1, Player 2 ]
  #helperStateInstances = {
    shipPlacement: new ShipPlacementState(
      this.#playerStateInstances.player1,
      this.#playerStateInstances.player2
    ),
    match: new BattleState(
      this.#playerStateInstances.player1,
      this.#playerStateInstances.player2
    ),
  };

  //--------HELPER-METHODS---------//

  #initGameStatePublisherInstances() {
    const { publisher } = this.#helperClassInstances;

    for (let instanceName of this.#publisherInstanceNames) {
      publisher.addPublisherInstance(instanceName);
    }
  }

  #linkControllerToHelperStatePublishers() {
    const { player1, player2 } = this.#playerStateInstances,
      { shipPlacement, match } = this.#helperStateInstances,
      gameStateIdentifier = "Game State";

    player1.subscribe(
      gameStateIdentifier,
      this.#processPlayer1StateData.bind(this)
    );
    player2.subscribe(
      gameStateIdentifier,
      this.#processPlayer2StateData.bind(this)
    );

    shipPlacement.subscribe(
      gameStateIdentifier,
      this.#processShipPlacementStateData.bind(this)
    );
    match.subscribe(
      gameStateIdentifier,
      this.#processMatchStateData.bind(this)
    );
  }

  //-----GAME-STATE-MANAGEMENT-----//

  #applyAttack(playerName, targetCoord) {
    //checks to see if the current game state allows the move in the first place
    //if the game state allows attacks, that being the match state, attempt to make an attack

    if (this.#stateData.currentState !== this.#possibleCurrentStates[1]) {
      throw new Error(`Failed to apply an attack in the game state,
      as the current game state does not match the state of being mid match`);
    }

    this.#helperStateInstances.match.attackPlayer(playerName, targetCoord);
  }

  #applyShipPlacement(playerName, originCoord, axis) {
    //checks to see if the current game state allows the move in the first place
    //if the game state is for ship placements, attempt to place a ship using the helper state
    //api to do so

    if (this.#stateData.currentState !== this.#possibleCurrentStates[0]) {
      throw new Error(`Failed to apply a ship placement in the game state,
       as the current game state does not match the state for ship placements`);
    }

    this.#helperStateInstances.shipPlacement.placeAShip(
      playerName,
      originCoord,
      axis
    );
  }

  #shipPlacementsFinished() {
    this.beginMatch();
  }

  #matchFinished() {
    //sets the game state to final, meaning a complete game has successfully occured
    const { match } = this.#helperStateInstances;

    match.endMatch();

    this.#stateData.finishedStateStatus.match = true;
    this.#stateData.currentState = this.#possibleCurrentStates[3];

    this.#emitGameStateData();
  }

  #resetGameStateData() {
    this.#stateData.currentState = this.#possibleCurrentStates[2];

    this.#stateData.finishedStateStatus.shipPlacement = false;
    this.#stateData.finishedStateStatus.match = false;
  }

  //-------STATE-PROCESSING--------//

  //serves as the entrypoint for the individual state instance publishers,
  //so that the game state class can receive the data, use said data for
  //some underlying logic within itself, and then reemit the same data
  //to those that explicitly subscribe to one of these individual states

  #processMatchStateData(state) {
    if (state.currentState && state.finished) {
      this.#matchFinished();
    } else {
      this.#emitMatchStateData(state);
    }
  }

  #processShipPlacementStateData(state) {
    if (state.currentState && state.finished) {
      this.#shipPlacementsFinished();
    } else {
      this.#emitShipPickingStateData(state);
    }
  }

  #processPlayer1StateData(state) {
    this.#emitPlayer1StateData(state);
  }

  #processPlayer2StateData(state) {
    this.#emitPlayer2StateData(state);
  }

  //------MULTIPLE-STATE-PUB-SUB-------//

  #emitGameStateData() {
    const { publisher } = this.#helperClassInstances,
      gameStateClone = lodash.cloneDeep(this.#stateData);

    publisher.emitData(this.#publisherInstanceNames[4], gameStateClone);
  }

  #emitMatchStateData(state) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData(this.#publisherInstanceNames[3], state);
  }

  #emitShipPickingStateData(state) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData(this.#publisherInstanceNames[2], state);
  }

  #emitPlayer1StateData(state) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData(this.#publisherInstanceNames[0], state);
  }

  #emitPlayer2StateData(state) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData(this.#publisherInstanceNames[1], state);
  }

  //----------PUB-SUB-API----------//

  //used to subscribe to any of the available
  //publishers within the game state

  //should validate for specific publisher names that exist

  subscribe(publisherName, methodName, entrypointMethod) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("subscribe", {
      publisherName,
      methodName,
      entrypointMethod,
    });

    publisher.subscribe(publisherName, methodName, entrypointMethod);
  }

  unsubscribe(publisherName, methodName) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("unsubscribe", {
      publisherName,
      methodName,
    });

    publisher.unsubscribe(publisherName, methodName);
  }

  //-------------APIs--------------//

  //*****STATE-DEPENDENT*****//

  //acts as the api to place ships, which is based on the state of the game
  //other parts of the app will listen for the state, and thus know how to portray
  //themselves and interact with the game state instance in order to for instance place ships
  //or perhaps make an attack. The player arg is who is invoking the method
  //not the target player
  placeAShip(playerName, originCoord, axis) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("placeAShip", { playerName, originCoord, axis });

      this.#applyShipPlacement(playerName, originCoord, axis);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //another api that works based on the emitted game state letting other parts of the app
  //know this method is available for interaction. The player arg is who is invoking the method
  //not the target player
  attackPlayer(playerName, targetCoord) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("attackPlayer", { playerName, targetCoord });

      this.#applyAttack(playerName, targetCoord);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //*****STATE-INDEPENDENT*****//

  resetGameState() {
    //defines overall state, resets the game by invoking all of the apis on the helper states
    //that reset their internal data in some way. Resetting their states does not cause state
    //changes to bubble up, only within a mid game state of some type.

    const { player1, player2 } = this.#playerStateInstances,
      { shipPlacement, match } = this.#helperStateInstances;

    player1.resetState();
    player2.resetState();

    shipPlacement.resetState();
    match.resetState();

    this.#resetGameStateData();

    this.#emitGameStateData();
  }

  startShipPlacements() {
    //different from game reset, commences the ship picking process, which this
    //should be invoked after a game reset. Makes sure that only the apis for ship placements
    //work while such is not finished

    try {
      if (this.#stateData.currentState !== this.#possibleCurrentStates[2]) {
        throw new Error(
          `Failed to start ship placements, as such is only allowed if the current game state is in the reset position`
        );
      }

      const { shipPlacement } = this.#helperStateInstances;

      this.#stateData.currentState = this.#possibleCurrentStates[0];

      shipPlacement.beginShipPlacements();

      this.#emitGameStateData();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  beginMatch() {
    //Proceeds the ship placements, begins the actual match, in which the
    //ship placement apis stop working, and the match apis start working, such
    //as making attacks.

    try {
      //only works if the current state is for ship picking
      if (this.#stateData.currentState !== this.#possibleCurrentStates[0]) {
        throw new Error(
          `Failed to start match, as such is only allowed if the current game state is the ship placement state`
        );
      }

      const { shipPlacement, match } = this.#helperStateInstances;

      shipPlacement.endShipPlacements();
      this.#stateData.finishedStateStatus.shipPlacement = true;

      this.#stateData.currentState = this.#possibleCurrentStates[1];
      match.beginMatch();

      this.#emitGameStateData();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}

//These individual states need a reference to the two player states made in the game state
//in order to apply functionality based on the state.
export class BattleState {
  constructor(player1Instance, player2Instance) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("constructor", {
        player1Instance,
        player2Instance,
      });

      this.#playerInstances.player1 = player1Instance;
      this.#playerInstances.player2 = player2Instance;

      this.#initMatchStatePublisherInstance();
      this.#linkMatchStateToPlayerStatePublishers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----STATE-AND-CONFIG-DATA-----//

  #argumentValidationRules = {
    constructor: {
      player1Instance: {
        instanceof: PlayerState,
      },
      player2Instance: {
        instanceof: PlayerState,
      },
    },
    attackPlayer: {
      player: {
        type: "string",
        validValues: ["player1", "player2"],
      },
      targetCoord: {
        isArray: true,
        arrElementType: "number",
      },
    },
    subscribe: {
      methodName: {
        type: "string",
      },
      entrypointMethod: {
        type: "function",
      },
    },
    unsubscribe: {
      methodName: {
        type: "string",
      },
    },
  };

  #playerInstances = {
    player1: null,
    player2: null,
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    publisher: new Publisher(),
  };

  #stateData = {
    currentState: false,
    finished: false,
    whosTurn: null,
    player1Health: null,
    player2Health: null,
    winner: null,
  };

  //---------HELPER-METHODS--------//

  #initMatchStatePublisherInstance() {
    const { publisher } = this.#helperClassInstances;

    publisher.addPublisherInstance("Match State");
  }

  #linkMatchStateToPlayerStatePublishers() {
    const { player1, player2 } = this.#playerInstances,
      classScope = this;

    player1.subscribe(
      "Match State",
      this.#applyReceivedPlayer1State.bind(classScope)
    );
    player2.subscribe(
      "Match State",
      this.#applyReceivedPlayer2State.bind(classScope)
    );
  }

  //--------STATE-MANAGEMENT-------//

  #initMatchState() {
    const { player1, player2 } = this.#playerInstances;

    this.#stateData.player1Health = player1.returnTotalHealth();
    this.#stateData.player2Health = player2.returnTotalHealth();

    this.#stateData.currentState = true;
    this.#stateData.finished = false;

    this.#stateData.winner = null;
    this.#stateData.whosTurn = "player1";
  }

  #applyAttackToTargetPlayer(player, targetCoord) {
    const { whosTurn } = this.#stateData;

    if (player === whosTurn) {
      throw new Error(
        `Failed to attack the target player, as it appears to be their turn to make a move`
      );
    }

    if (whosTurn === "player1") {
      this.#attackPlayer2(targetCoord);
    } else {
      this.#attackPlayer1(targetCoord);
    }

    this.#checkMatchStateForWinner();
  }

  #attackPlayer1(targetCoord) {
    const { player1 } = this.#playerInstances,
      attackResultBool = player1.attackPlayer(targetCoord);

    if (!attackResultBool) {
      throw new Error(
        `Failed to attack player 1, as the attack is invalid for some reason,
         most likely an already made attack or an attack not on the board itself`
      );
    } else {
      this.#stateData.whosTurn = "player1";
    }
  }

  #attackPlayer2(targetCoord) {
    const { player2 } = this.#playerInstances,
      attackResultBool = player2.attackPlayer(targetCoord);

    if (!attackResultBool) {
      throw new Error(
        `Failed to attack player 2, as the attack is invalid for some reason,
         most likely an already made attack or an attack not on the board itself`
      );
    } else {
      this.#stateData.whosTurn = "player2";
    }
  }

  //checks the match state after all changes have been applied
  //in order to determine if say one player ran out of health after an attack
  //making the other player the winner, etc. Basically checks and applies flags
  //to the state so on its next emission, other parts of the app knows what going
  //on
  #checkMatchStateForWinner() {
    const { player1Health, player2Health } = this.#stateData;

    if (player1Health === 0) {
      this.#stateData.finished = true;
      this.#stateData.winner = "player2";
      this.#stateData.whosTurn = null;
    } else if (player2Health === 0) {
      this.#stateData.finished = true;
      this.#stateData.winner = "player1";
      this.#stateData.whosTurn = null;
    }
  }

  //will use the individual emitted player states in order to
  //update the match state in some way. Should only care about
  //the total health of each player state
  #applyReceivedPlayer1State(playerState) {
    const currentTotalHealth = playerState.totalHealth;

    this.#stateData.player1Health = currentTotalHealth;
  }

  #applyReceivedPlayer2State(playerState) {
    const currentTotalHealth = playerState.totalHealth;

    this.#stateData.player2Health = currentTotalHealth;
  }

  //------MATCH-STATE-PUB-SUB------//

  #emitMatchState() {
    const { publisher } = this.#helperClassInstances,
      matchStateDataCopy = lodash.cloneDeep(this.#stateData);

    publisher.emitData("Match State", matchStateDataCopy);
  }

  subscribe(methodName, entrypointMethod) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("subscribe", { methodName, entrypointMethod });

    publisher.subscribe("Match State", methodName, entrypointMethod);
  }

  unsubscribe(methodName) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("unsubscribe", { methodName });

    publisher.unsubscribe("Match State", methodName);
  }

  //-------------APIs--------------//

  resetState() {
    this.#stateData.currentState = false;
    this.#stateData.finished = false;

    this.#stateData.whosTurn = null;

    this.#stateData.player1Health = null;
    this.#stateData.player2Health = null;

    this.#stateData.winner = null;
  }

  attackPlayer(player, targetCoord) {
    try {
      const { currentState } = this.#stateData;

      if (!currentState) {
        throw new Error(
          `Failed to attack a player, as the current game state is not mid match`
        );
      }

      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("attackPlayer", { player, targetCoord });

      this.#applyAttackToTargetPlayer(player, targetCoord);
      this.#emitMatchState();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  endMatch() {
    try {
      const { currentState } = this.#stateData;

      if (!currentState) {
        throw new Error(`
          Failed to end match, as the current state of the game is not mid match
        `);
      }

      this.#stateData.currentState = false;

      this.#emitMatchState();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  beginMatch() {
    try {
      const { currentState } = this.#stateData;

      if (currentState) {
        throw new Error(
          `Failed to begin match, as the current state of the game is already mid match`
        );
      }

      this.#initMatchState();
      this.#emitMatchState();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}

//should manage the ship placement state, which then dictates what apis work on the encompassing game state class
//that in turn interact with the apis on this specific state class. Basically, you can only pick ships when the game state
//is within the ship picking stage
export class ShipPlacementState {
  constructor(player1Instance, player2Instance) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("constructor", {
        player1Instance,
        player2Instance,
      });

      this.#playerInstances.player1 = player1Instance;
      this.#playerInstances.player2 = player2Instance;

      this.#initShipPlacementStatePublisherInstance();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----STATE-AND-CONFIG-DATA-----//

  #argumentValidationRules = {
    constructor: {
      player1Instance: {
        instanceof: PlayerState,
      },
      player2Instance: {
        instanceof: PlayerState,
      },
    },
    subscribe: {
      methodName: {
        type: "string",
      },
      entrypointMethod: {
        type: "function",
      },
    },
    unsubscribe: {
      methodName: {
        type: "string",
      },
    },
    placeAShip: {
      playerName: {
        type: "string",
      },
      originCoord: {
        isArray: true,
        arrElementType: "number",
      },
      axis: {
        type: "string",
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    publisher: new Publisher(),
  };

  #playerInstances = {
    player1: null,
    player2: null,
  };

  #stateData = {
    currentState: false,
    finished: false,
    numOfShips: {
      player1: 0,
      player2: 0,
    },
    shipLengths: [5, 4, 3, 3, 2],
  };

  #maxShips = 5;

  //---------HELPER-METHODS--------//

  #initShipPlacementStatePublisherInstance() {
    const { publisher } = this.#helperClassInstances;

    publisher.addPublisherInstance("Ship Placement State");
  }

  //--------STATE-MANAGEMENT-------//

  //adds ships to the specific player's board using the number of ships the player has as the
  //index for the array representing ship lengths. This way I can use the data points to facilitate
  //only the correct amount of ships, as well as picking the ships in the right order naturally
  #addShipToPlayerBoard(playerName, originCoord, axis) {
    if (!(playerName in this.#playerInstances)) {
      throw new Error(
        `Failed to add ship to a specific player's board,
         the supplied player name was not recognized, should
          equal either 'player1' or 'player2', received '${playerName}'`
      );
    }

    //keeps track of the number of ships, which if the value is equal to the max ships value, that means
    //the target player cannot add any more ships
    if (this.#stateData.numOfShips[playerName] < this.#maxShips) {
      const playerInstance = this.#playerInstances[playerName],
        shipLength =
          this.#stateData.shipLengths[this.#stateData.numOfShips[playerName]];

      playerInstance.addShipToBoard(shipLength, originCoord, axis);

      this.#stateData.numOfShips[playerName]++;

      this.#checkStateForCompletion();
    }
  }

  //checks the state after each ship being placed,
  //if the state reflects that all ships have been placed,
  //check the flag of finished to equal true, and emit the final
  //state so other parts of the app can react to the state being
  //finished
  #checkStateForCompletion() {
    const { player1, player2 } = this.#stateData.numOfShips;

    //when both boards have 5 ships, thus the selection is complete
    if (player1 + player2 === this.#maxShips * 2) {
      this.#stateData.finished = true;
    }
  }

  //----PLACEMENT-STATE-PUB-SUB----//

  #emitShipPlacementState() {
    const { publisher } = this.#helperClassInstances,
      shipPlacementStateCopy = lodash.cloneDeep(this.#stateData);

    publisher.emitData("Ship Placement State", shipPlacementStateCopy);
  }

  subscribe(methodName, entrypointMethod) {
    try {
      const { argValidator, publisher } = this.#helperClassInstances;
      argValidator.validate("subscribe", { methodName, entrypointMethod });

      publisher.subscribe("Ship Placement State", methodName, entrypointMethod);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  unsubscribe(methodName) {
    try {
      const { argValidator, publisher } = this.#helperClassInstances;
      argValidator.validate("unsubscribe", { methodName });

      publisher.unsubscribe("Ship Placement State", methodName);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-------------APIs--------------//

  resetState() {
    this.#stateData.currentState = false;
    this.#stateData.finished = false;

    this.#stateData.numOfShips.player1 = 0;
    this.#stateData.numOfShips.player2 = 0;
  }

  //allows ship placements for either player, in which each player only gets five ships,
  //in which the ships are in order from longest to shortest when considering which one to place
  //this class also has to be the current state, otherwise this method will not work, since that means
  //the game isn't in ship placement mode of course

  //playerName = [ 'player1', 'player2' ] one of these choices
  //originCoord = [ rowNum, colNum ] as is, entire array that matches this structure
  //axis = [ 'Vertical', 'Horizontal' ] one of these choices
  placeAShip(playerName, originCoord, axis) {
    try {
      const { currentState } = this.#stateData;

      if (!currentState) {
        throw new Error(
          `Failed to place a ship, as the ship picking state is not the current game state`
        );
      }

      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("placeAShip", { playerName, originCoord, axis });

      this.#addShipToPlayerBoard(playerName, originCoord, axis);
      this.#emitShipPlacementState();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //configures the state as the non current state, so that the state dependent apis such as
  //the placeAShip method, no longer respond to invocation. Does not emit a new state, as this,
  //will essentially work as an off switch, and other parts of the app already know the ships
  //have been placed
  endShipPlacements() {
    try {
      const { currentState } = this.#stateData;

      if (!currentState) {
        throw new Error(
          `Failed to end ship placements, as ship placements is not the current state`
        );
      }

      this.#stateData.currentState = false;
      this.#emitShipPlacementState();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //defines this state as the current state, and does so by wiping the
  //individual player states, and configures its own blank state
  //emits the new state so that other parts of the app can react to such
  beginShipPlacements() {
    try {
      const { currentState } = this.#stateData;

      if (currentState) {
        throw new Error(
          `Failed to begin ship placements, as ship placements is the current state already`
        );
      }

      this.#stateData.currentState = true;
      this.#emitShipPlacementState();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}

//Each Should provide methods for making moves,
//as well as receiving attacks.
export class PlayerState {
  constructor(playerNum) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        playerNum,
      });

      //specifically for the case of initializing the player state instance
      this.#initPublisherInstance();
      this.#playerGameState.playerNum = playerNum;

      //general method to build both the main board that represents the ship placements
      //and the made attacks board that logs all spaces that have been attacked on the
      //player's board
      this.#playerGameState.mainBoard = this.#buildBoard();
      this.#playerGameState.madeAttacksBoard = this.#buildBoard();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----STATE-AND-CONFIG-DATA------//

  #argumentValidationRules = {
    constructor: {
      playerNum: {
        type: "number",
      },
    },
    addShipToBoard: {
      shipLength: {
        type: "number",
      },
      originCoord: {
        isArray: true,
        arrElementType: "number",
      },
      axis: {
        type: "string",
      },
    },
    attackPlayer: {
      gridCoord: {
        isArray: true,
        arrElementType: "number",
      },
    },
    subscribe: {
      methodName: {
        type: "string",
      },
      subscriberMethod: {
        type: "function",
      },
    },
    unsubscribe: {
      methodName: {
        type: "string",
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    publisher: new Publisher(),
  };

  #boardDimensions = {
    rows: 10,
    columns: 10,
  };

  #playerGameState = {
    playerNum: null,
    mainBoard: null,
    madeAttacksBoard: null,
    totalHealth: 0,
  };

  //keeps track of the individual placed ships by assigning
  //individual ships numbers in order to give the main board
  //tiles specific identification
  #shipNum = 1;

  //represents the grid values to be used to represent empty tiles
  //and tiles that have been attacked. The shipNum will represent
  //individual ships that were placed
  #gridVals = {
    emptySpace: 0,
    hitSpace: 1,
  };

  //---------HELPER-METHODS---------//

  #initPublisherInstance() {
    const { publisher } = this.#helperClassInstances;

    publisher.addPublisherInstance("Player State");
  }

  //builds an empty board, still uses the buildRow method to build
  //rows with empty spaces within such.
  #buildBoard() {
    const newBoard = [],
      { rows } = this.#boardDimensions;

    for (let i = 0; i < rows; i++) {
      const newRow = this.#buildRow();

      newBoard.push(newRow);
    }

    return newBoard;
  }

  //builds a generic row, autofilling the element slots according
  //to the number of columns, and filling each element as an empty space value
  #buildRow() {
    const newRow = [],
      { columns } = this.#boardDimensions;

    for (let i = 0; i < columns; i++) {
      newRow.push(this.#gridVals.emptySpace);
    }

    return newRow;
  }

  //----------SHIP-PLACEMENT--------//

  //should either return an of the placement coords if valid, or null if
  //not valid
  #determinePlacementLegibility(shipLength, originCoord, axis) {
    //should check the possible mapping on the player board given the args
    const { mainBoard } = this.#playerGameState,
      coordsListObj = this.#returnCoordsList(
        shipLength,
        originCoord,
        axis,
        mainBoard
      );

    //all values have to be equal to an empty space in order to be a valid placement
    for (let i = 0; i < coordsListObj.values.length; i++) {
      if (coordsListObj.values[i] !== this.#gridVals.emptySpace) {
        return null;
      }
    }

    return coordsListObj.coords;
  }

  #addShip(placementCoords) {
    //should include the mapping of the ship on the player board

    for (let i = 0; i < placementCoords.length; i++) {
      const row = placementCoords[i][0],
        column = placementCoords[i][1];

      //turn the respective coordinates equal to a ship tile using the current ship number available, and add a health point per added tile
      this.#playerGameState.mainBoard[row][column] = this.#shipNum;
      this.#playerGameState.totalHealth++;
    }

    this.#shipNum++;
  }

  //------APPLY-DAMAGE-TO-BOARD-----//

  #determineAttackLegibility(gridCoord) {
    //should check the possibility of making the given attack, both in terms of such being within the board
    //and not being an attack already made

    const row = gridCoord[0],
      column = gridCoord[1];

    const coordValue = this.#playerGameState.madeAttacksBoard[row][column];

    return coordValue === this.#gridVals.emptySpace; //determines if the coord is valid and hasn't been attacked already
  }

  #reflectAttackInState(gridCoord) {
    //make the attack essentially, which entails making the change to the state properties

    const row = gridCoord[0],
      column = gridCoord[1];

    const coordValue = this.#playerGameState.mainBoard[row][column];

    if (coordValue !== this.#gridVals.emptySpace) {
      //if the attack was a hit
      this.#playerGameState.totalHealth--;
    }

    this.#playerGameState.madeAttacksBoard[row][column] = 1;
  }

  //---------COORDS-RETRIEVAL-------//

  //creates an object with two arrays, in which each index corresponds with one another.
  //By traversing and recording the values of the supplied matrix, you can scan for
  //invalid spaces along the axis of the origin coord, in which you traverse the distance
  //of the supplied length along the starting point.

  //after such traversal and scan has been made, the corresponding values per traversed coord is returned,
  //and thus those values can be used in the comparison for the given situation, whether it be for
  //testing a ship placement, or making a valid attack.
  #returnCoordsList(length, originCoord, axis, suppliedMatrix) {
    const coordsList = {
      coords: [],
      values: [],
    };

    let row = originCoord[0],
      column = originCoord[1];

    for (let i = 0; i < length; i++) {
      if (axis === "Vertical") {
        //for traversing vertically
        const derivedCoord = [row, column],
          corresValue = suppliedMatrix[row][column];

        row++;

        //save the pair to the coordsList
        coordsList.coords.push(derivedCoord);
        coordsList.values.push(corresValue);
      } else if (axis === "Horizontal") {
        //for traversing horizontally
        const derivedCoord = [row, column],
          corresValue = suppliedMatrix[row][column];

        column++;

        //save the pair to the coordsList
        coordsList.coords.push(derivedCoord);
        coordsList.values.push(corresValue);
      } else {
        throw new ReferenceError(
          `Failed to return a coordinate list object, the supplied axis to traverse is not valid, should either equal "Vertical" or "Horizontal", received "${axis}"`
        );
      }
    }

    return coordsList;
  }

  //-------PLAYER-STATE-PUB-SUB-----//

  //used to emit the player state to subscribers any instance that
  //the state is changed in some way, be it an attack or a placed ship
  #emitPlayerStateToSubscribers() {
    const { publisher } = this.#helperClassInstances,
      playerStateCopy = lodash.cloneDeep(this.#playerGameState);

    publisher.emitData("Player State", playerStateCopy);
  }

  subscribe(methodName, subscriberMethod) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("subscribe", { methodName, subscriberMethod });

    publisher.subscribe("Player State", methodName, subscriberMethod);
  }

  unsubscribe(methodName) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("unsubscribe", { methodName });

    publisher.unsubscribe("Player State", methodName);
  }

  //--------------APIs--------------//

  returnTotalHealth() {
    try {
      const healthVal = lodash.cloneDeep(this.#playerGameState.totalHealth);

      return healthVal;
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //resets the player state for situations such as starting a new game
  resetState() {
    try {
      this.#playerGameState.mainBoard = this.#buildBoard();
      this.#playerGameState.madeAttacksBoard = this.#buildBoard();
      this.#playerGameState.totalHealth = 0;

      this.#emitPlayerStateToSubscribers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //takes the ships length, the origin to start at for placement, and the axis
  //in order to determine the orrientation of the ship, vertical or horizontal.

  //the ship should either point down or to the right from the origin
  addShipToBoard(shipLength, originCoord, axis) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("addShipToBoard", {
        shipLength,
        originCoord,
        axis,
      });

      const placementCoords = this.#determinePlacementLegibility(
        shipLength,
        originCoord,
        axis
      );

      if (placementCoords !== null) {
        this.#addShip(placementCoords);

        this.#emitPlayerStateToSubscribers();
      } else {
        throw new Error(`Failed to add ship to board, the supplied parameters provided an invalid
         placement of some sort, this includes a ship that may fall off the board,
          or perhaps a ship that intersects another ship`);
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  attackPlayer(gridCoord) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("attackPlayer", {
        gridCoord,
      });

      const isValidAttack = this.#determineAttackLegibility(gridCoord);

      if (isValidAttack) {
        this.#reflectAttackInState(gridCoord);

        this.#emitPlayerStateToSubscribers();

        return true;
      } else {
        return false;
        //this is so the game state can emit its own event based on an invalid move
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}
