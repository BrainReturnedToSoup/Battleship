import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";

import lodash from "lodash";

const errorManager = new ErrorManager();

//will use the helper classes for the player states in order to provide apis
//to interact with the game state. Also holds data for things that aren't directly
//related to the individual players, for instance, for transitioning the grid being displayed
//or perhaps limiting the ability to make a move to the other board after one has been made.
class GameState {
  constructor() {
    try {
      this.#linkControllerToPlayerStatePublishers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----STATE-AND-CONFIG-DATA-----//

  #argumentValidationRules = {};

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #playerStates = {
    player1: new PlayerState(1),
    player2: new PlayerState(2),
  };

  #gameState = {
    current: null,
    whosTurn: null,
  };

  //--------HELPER-METHODS---------//

  #linkControllerToPlayerStatePublishers() {
    const { player1, player2 } = this.#playerStates,
      classScope = this;

    player1.subscribe(
      "GameState",
      this.#emitPlayer1StateToSubscribers.bind(classScope)
    );

    player2.subscribe(
      "GameState",
      this.#emitPlayer2StateToSubscribers.bind(classScope)
    );
  }

  //-----GAME-STATE-MANAGEMENT-----//

  //------GAME-STATE-PUB-SUB-------//

  #emitGameStateToSubscribers() {
    if (Object.keys(this.#gameStateSubscribers).length > 0) {
      const gameStateCopy = lodash.cloneDeep(this.#gameState);

      for (let subscriber in this.#gameStateSubscribers) {
        this.#gameStateSubscribers[subscriber](gameStateCopy);
      }
    }
  }

  #gameStateSubscribers = {};

  subscribeToGameState(methodName, subscriberMethod) {
    try {
      if (!(methodName in this.#gameStateSubscribers)) {
        this.#gameStateSubscribers[methodName] = subscriberMethod;
      } else {
        throw new TypeError(
          `Failed to add subscriber to a game state event publisher, the supplied method name appears to already exist as a subscriber, received '${methodName}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  unsubscribeFromGameState(methodName) {
    try {
      if (methodName in this.#gameStateSubscribers) {
        delete this.#gameStateSubscribers[methodName];
      } else {
        throw new TypeError(
          `Failed to remove subscriber from a game state event publisher, the supplied method name appears to not exist as a subscriber, received '${methodName}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-----PLAYER-STATE-PUB-SUB------//

  #emitPlayer1StateToSubscribers(state) {
    if (Object.keys(this.#player1StateSubscribers).length > 0) {
      //should already be a deep clone from the player instance

      for (let subscriber in this.#player1StateSubscribers) {
        this.#player1StateSubscribers[subscriber](state);
      }
    }
  }

  #emitPlayer2StateToSubscribers(state) {
    if (Object.keys(this.#player2StateSubscribers).length > 0) {
      //should already be a deep clone from the player instance

      for (let subscriber in this.#player2StateSubscribers) {
        this.#player2StateSubscribers[subscriber](state);
      }
    }
  }

  #player1StateSubscribers = {};

  #player2StateSubscribers = {};

  #determineSelectedPlayer(player) {
    if (player === "Player 1") {
      return this.#player1StateSubscribers;
    } else if (player === "Player 2") {
      return this.#player2StateSubscribers;
    }

    throw new ReferenceError(
      `Failed to add subscriber to a player state publisher, the supplied player value is not valid, should be equal to either 'Player 1' or 'Player 2', received '${player}'`
    );
  }

  subscribeToPlayerState(player, methodName, subscriberMethod) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("subscribe", {
        player,
        methodName,
        subscriberMethod,
      });

      //determine which subscriber pool to target
      const subscribers = this.#determineSelectedPlayer(player);

      //add the entrypoint to the corresponding object
      if (!(methodName in subscribers)) {
        subscribers[methodName] = subscriberMethod;
      } else {
        throw new TypeError(
          `Failed to add subscriber to a player state event publisher, the supplied method name appears to already exist as a subscriber, received '${methodName}' for '${player}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  unsubscribeFromPlayerState(player, methodName) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("unsubscribe", { player, methodName });

      //determine which subscriber pool to target
      const subscribers = this.#determineSelectedPlayer(player);

      //delete the subscriber if such exists as a subscriber
      if (methodName in subscribers) {
        delete subscribers[methodName];
      } else {
        throw new TypeError(
          `Failed to remove subscriber from a player state event publisher, the supplied method name appears to not exist as a subscriber, received '${methodName}' for '${player}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-------------APIs--------------//

  //******STATE-DEPENDENT******//

  placeAShip(player, originCoord, axis) {
    //acts as the api to place ships, which is based on the state of the game
    //other parts of the app will listen for the state, and thus know how to portray
    //themselves and interact with the game state instance in order to for instance place ships
    //or perhaps make an attack. The player arg is who is invoking the method
    //not the target player
  }

  makeAnAttack(player, targetCoord) {
    //another api that works based on the emitted game state letting other parts of the app
    //know this method is available for interaction. The player arg is who is invoking the method
    //not the target player
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

//Each Should provide methods for making moves,
//as well as receiving attacks.
class PlayerState {
  constructor(playerNum) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        playerNum,
      });

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
        type: "string",
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
    if (Object.keys(this.#subscribers).length > 0) {
      const playerGameStateCopy = lodash.cloneDeep(this.#playerGameState);
      //have to use the lodash library because making a deep clone on a complex object
      //is a pain in the ass. Also making a deep clone is important, as you don't want
      //the subscribers having an actual reference to the state, just a copy

      for (let subscriber in this.#subscribers) {
        this.#subscribers[subscriber](playerGameStateCopy);
      }
    }
  }

  #subscribers = {};

  subscribe(methodName, subscriberMethod) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("subscribe", { methodName, subscriberMethod });

      if (!(methodName in this.#subscribers)) {
        this.#subscribers[methodName] = subscriberMethod;
      } else {
        throw new TypeError(
          `Failed to add subscriber to UI Controller button event publisher, the supplied method name appears to already exist as a subscriber, received '${methodName}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  unsubscribe(methodName) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("unsubscribe", { methodName });

      if (methodName in this.#subscribers) {
        delete this.#subscribers[methodName];
      } else {
        throw new TypeError(
          `Failed to remove subscriber from UI Controller button event publisher, the supplied method name appears to not exist as a subscriber, received '${methodName}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //--------------APIs--------------//

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
