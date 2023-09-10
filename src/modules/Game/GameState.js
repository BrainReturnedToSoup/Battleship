import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";
import { Publisher } from "../LowLevelModules/Publisher";

import lodash from "lodash";

const errorManager = new ErrorManager();

//will use the helper classes for the player states in order to provide apis
//to interact with the game state. Also holds data for things that aren't directly
//related to the individual players, for instance, for transitioning the grid being displayed
//or perhaps limiting the ability to make a move to the other board after one has been made.
class GameState {
  constructor() {
    try {
      this.#initPublisherInstances();

      this.#linkControllerToPlayerStatePublishers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----STATE-AND-CONFIG-DATA-----//

  #argumentValidationRules = {};

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    publisher: new Publisher(),
  };

  #playerStates = {
    player1: new PlayerState(1),
    player2: new PlayerState(2),
  };

  // current = [ RESET, PICKING, GAME ]
  // whosTurn = [ Player 1, Player 2 ]
  #gameState = {
    current: null,
    whosTurn: null,
    placedShips: {
      player1: 0,
      player2: 0,
    },
    shipSizes: [5, 4, 4, 3, 3, 2],
  };

  //used to determine when the ship picking state

  //--------HELPER-METHODS---------//

  #initPublisherInstances() {
    const { publisher } = this.#helperClassInstances;

    publisher.addPublisherInstance("Player 1 State");
    publisher.addPublisherInstance("Player 2 State");
    publisher.addPublisherInstance("Game State");
  }

  #linkControllerToPlayerStatePublishers() {
    const { player1, player2 } = this.#playerStates,
      { publisher } = this.#helperClassInstances;

    player1.subscribe("Player State", publisher.emitData.bind(publisher));
    player2.subscribe("Player State", publisher.emitData.bind(publisher));
  }

  //-----GAME-STATE-MANAGEMENT-----//

  #applyAttack(player, targetCoord) {
    this.#playerStates[player].attackPlayer(targetCoord);
  }

  #applyShipPlacement(player, originCoord, axis) {
    //should make a ship placement, and after each placement, check to see
    //if all of the placements have been made. If so, begin the next stage, that
    //being the actual game
  }

  //------GAME-STATE-PUB-SUB-------//

  #emitGameStateToSubscribers() {
    const { publisher } = this.#helperClassInstances,
      gameStateClone = lodash.cloneDeep(this.#gameState);

    publisher.emitData("Game State", gameStateClone);
  }

  subscribeToGameState(methodName, subscriberMethod) {
    const { publisher } = this.#helperClassInstances;

    publisher.subscribe("Game State", methodName, subscriberMethod);
  }

  unsubscribeFromGameState(methodName) {
    const { publisher } = this.#helperClassInstances;

    publisher.unsubscribe("Game State", methodName);
  }

  //-----PLAYER-STATE-PUB-SUB------//

  #emitPlayer1StateToSubscribers(state) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData("Player 1 State", state);
  }

  #emitPlayer2StateToSubscribers(state) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData("Player 2 State", state);
  }

  subscribeToPlayerState(playerStateName, methodName, subscriberMethod) {
    const { publisher } = this.#helperClassInstances;

    publisher.subscribe(playerStateName, methodName, subscriberMethod);
  }

  unsubscribeFromPlayerState(playerStateName, methodName) {
    const { publisher } = this.#helperClassInstances;

    publisher.unsubscribe(playerStateName, methodName);
  }

  //-------------APIs--------------//

  //******STATE-DEPENDENT******//

  //acts as the api to place ships, which is based on the state of the game
  //other parts of the app will listen for the state, and thus know how to portray
  //themselves and interact with the game state instance in order to for instance place ships
  //or perhaps make an attack. The player arg is who is invoking the method
  //not the target player
  placeAShip(player, originCoord, axis) {
    try {
      const { current } = this.#gameState;

      if (current !== "PICKING") {
        throw new Error(`Failed to make ship placement, the game state is not
        the picking stage, the current state is '${current}'`);
      }

      if (!(this.#gameState.placedShips[player] < 5)) {
        throw new Error(`Failed to make a ship placement, the player attempting to pick,
         ${player}, has already reached the maximum amount of placements`);
      }

      this.#applyShipPlacement(player, originCoord, axis);

      this.#emitGameStateToSubscribers();
      this.#emitPlayer1StateToSubscribers();
      this.#emitPlayer2StateToSubscribers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //another api that works based on the emitted game state letting other parts of the app
  //know this method is available for interaction. The player arg is who is invoking the method
  //not the target player
  attackPlayer(player, targetCoord) {
    try {
      const { current, whosTurn } = this.#gameState;

      if (current !== "GAME") {
        throw new Error(
          `Failed to make an attack, the game state is not
           mid game, the current state is '${current}'`
        );
      }

      if (whosTurn !== player) {
        throw new Error(
          `Failed to make an attack, the attack being made is not in turn,
           the current turn is '${whosTurn}', but '${player}' attempted to make an attack`
        );
      }

      this.#applyAttack(player, targetCoord);

      this.#emitGameStateToSubscribers();
      this.#emitPlayer1StateToSubscribers();
      this.#emitPlayer2StateToSubscribers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //*****STATE-INDEPENDENT*****//

  gameReset() {
    //defines overall state, resets the game and the respective
    //player states
  }

  startShipPicking() {
    //defines overall state, enables the ability to place ships using the
    //placeAShip API
  }

  beginGame() {
    //defines overall state, starts the actual game after the ships
    //have been placed
  }
}

//These individual states need a reference to the two player states made in the game state
//in order to apply functionality based on the state.
export class MatchState {
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
      this.#initMatchState();
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
  };

  #playerInstances = {
    player1: null,
    player2: null,
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(),
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
    const { whosTurn } = this.#stateData,
      { player1, player2 } = this.#playerInstances;

    if (player === whosTurn) {
      throw new Error(
        `Failed to attack a specific player, as it appears to actually be their turn to make a move`
      );
    }

    if (whosTurn === "player1") {
      player2.attackPlayer(targetCoord);

      this.#stateData.whosTurn = "player2";
    } else {
      player1.attackPlayer(targetCoord);

      this.#stateData.whosTurn = "player1";
    }

    this.#checkMatchStateForWinner();
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
    } else if (player2Health === 0) {
      this.#stateData.finished = true;
      this.#stateData.winner = "player1";
    }
  }

  //will use the individual emitted player states in order to
  //update the match state in some way. Should only care about
  //the total health of each player state
  #applyReceivedPlayer1State(playerState) {
    const currenTotalHealth = playerState.totalHealth;

    this.#stateData.player1Health = currenTotalHealth;
  }

  #applyReceivedPlayer2State(playerState) {
    const currenTotalHealth = playerState.totalHealth;

    this.#stateData.player1Health = currenTotalHealth;
  }

  //------MATCH-STATE-PUB-SUB------//

  #emitMatchState() {
    const { publisher } = this.#helperClassInstances,
      matchStateDataCopy = lodash.cloneDeep(this.#stateData);

    publisher.emitData("Match State", matchStateDataCopy);
  }

  subscribe(methodName, subscriberMethod) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("subscribe", { methodName, subscriberMethod });

    publisher.subscribe("Match State", methodName, subscriberMethod);
  }

  unsubscribe(methodName) {
    const { publisher, argValidator } = this.#helperClassInstances;

    argValidator.validate("unsubscribe", { methodName });

    publisher.unsubscribe("Match State", methodName);
  }

  //-------------APIs--------------//

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

  //initializes/resets the state
  #initState() {
    const { player1, player2 } = this.#playerInstances;

    player1.resetState();
    player2.resetState();

    this.#stateData.currentState = true;
    this.#stateData.finished = false;

    this.#stateData.numOfShips.player1 = 0;
    this.#stateData.numOfShips.player2 = 0;
  }

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

  //allows ship placements for either player, in which each player only gets five ships,
  //in which the ships are in order from longest to shortest when considering which one to place
  //this class also has to be the current state, otherwise this method will not work, since that means
  //the game isn't in ship placement mode of course

  //playerName = [ 'player1', 'player2' ] one of these choices
  //originCoord = [ rowNum, colNum ] as is, entire array that matches this structure
  //axis = [ 'Vertical', 'Horizontal' ] one of these choices
  placeAShip(playerName, originCoord, axis) {
    try {
      const { currentState, finished } = this.#stateData;

      if (!currentState) {
        throw new Error(
          `Failed to place a ship, as the ship picking state is not the current game state`
        );
      }

      if (finished) {
        throw new Error(
          `Failed to place a ship, as the ship picking state is finished, both sides have places their limit in terms of ships`
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

      this.#initState();
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

      this.#initPublisherInstance();
      this.#playerGameState.playerNum = playerNum;

      this.#buildBoard();
      this.#buildMadeAttacksBoard();
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

  //---------HELPER-METHODS---------//

  #initPublisherInstance() {
    const { publisher } = this.#helperClassInstances;

    publisher.addPublisherInstance("Player State");
  }

  #buildBoard() {
    const newBoard = [],
      { rows } = this.#boardDimensions;

    for (let i = 0; i < rows; i++) {
      const newRow = this.#buildRow();

      newBoard.push(newRow);
    }

    this.#playerGameState.mainBoard = newBoard;
  }

  #buildMadeAttacksBoard() {
    const newBoard = [],
      { rows } = this.#boardDimensions;

    for (let i = 0; i < rows; i++) {
      const newRow = this.#buildRow();

      newBoard.push(newRow);
    }

    this.#playerGameState.madeAttacksBoard = newBoard;
  }

  #buildRow() {
    const newRow = [],
      { columns } = this.#boardDimensions;

    for (let i = 0; i < columns; i++) {
      newRow.push("----");
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

    //all values have to be equal to "-" in order to be a valid placement
    for (let i = 0; i < coordsListObj.values.length; i++) {
      if (coordsListObj.values[i] !== "----") {
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

      //turn the respective coordinates equal to a ship tile, and add a health point per added tile
      this.#playerGameState.mainBoard[row][column] = "Ship";
      this.#playerGameState.totalHealth++;
    }
  }

  //------APPLY-DAMAGE-TO-BOARD-----//

  #determineAttackLegibility(gridCoord) {
    //should check the possibility of making the given attack, both in terms of such being within the board
    //and not being an attack already made

    const row = gridCoord[0],
      column = gridCoord[1];

    const coordValue = this.#playerGameState.madeAttacksBoard[row][column];

    return coordValue === "----"; //determines if the coord is valid and hasn't been attacked already
  }

  #reflectAttackInState(gridCoord) {
    //make the attack essentially, which entails making the change to the state properties

    const row = gridCoord[0],
      column = gridCoord[1];

    const coordValue = this.#playerGameState.mainBoard[row][column];

    if (coordValue === "Ship") {
      //if the attack was a hit
      this.#playerGameState.totalHealth--;
    }

    this.#playerGameState.madeAttacksBoard[row][column] = "XXXX";
  }

  //---------COORDS-RETRIEVAL-------//

  //creates an object with two arrays, in which each index corresponds with one another
  //this way you can check the values plainly for a valid move, and then use the corresponding
  //coords for said values in a single easy to use format
  #returnCoordsList(length, originCoord, axis, suppliedMatrix) {
    const coordsList = {
      coords: [],
      values: [],
    };

    let row = originCoord[0],
      column = originCoord[1];

    for (let i = 0; i < length; i++) {
      if (axis === "Vertical") {
        const derivedCoord = [row, column],
          corresValue = suppliedMatrix[row][column];

        row++;

        coordsList.coords.push(derivedCoord);
        coordsList.values.push(corresValue);
      } else if (axis === "Horizontal") {
        const derivedCoord = [row, column],
          corresValue = suppliedMatrix[row][column];

        column++;

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
      this.#buildBoard();
      this.#buildMadeAttacksBoard();

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
      } else {
        return null;
        //this is so the game state can emit its own event based on an invalid move
        //for instance, if the move is something already made, the state will emit a 'try again' type
        //of event
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}
