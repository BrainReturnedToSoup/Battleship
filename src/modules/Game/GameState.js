import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";

const errorManager = new ErrorManager();

//will use the helper classes for the player states in order to provide apis
//to interact with the game state. Also holds data for things that aren't directly
//related to the individual players, for instance, for transitioning the grid being displayed
//or perhaps limiting the ability to make a move to the other board after one has been made.
class GameState {
  //-------------APIs--------------//

  gameReset() {}

  startShipPicking() {}

  beginGame() {}
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
      shipLength: {},
      originCoord: {},
      axis: {},
    },
    attackPlayer: {},
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
      newRow.push("-");
    }

    return newRow;
  }

  //----------SHIP-PLACEMENT--------//

  //should either return an of the placement coords if valid, or null/undefined if
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
      if (coordsListObj.values[i] !== "-") {
        return null;
      }
    }

    return coordsListObj.coords;
  }

  #addShip(placementCoords) {
    //should include the mapping of the ship on the player board

    for (let i = 0; i < placementCoords.length; i++) {
      const row = placementCoords[0],
        column = placementCoords[1];

      //turn the respective coordinates equal to a ship tile, and add a health point per added tile
      this.#playerGameState.mainBoard[row][column] = "Ship";
      this.#playerGameState.totalHealth++;
    }
  }

  //------APPLY-DAMAGE-TO-BOARD-----//

  #determineAttackLegibility(gridCoord) {
    //should check the possibility of making the given attack, both in terms of such being within the board
    //and not being an attack already made
  }

  #reflectAttackInState(gridCoord) {
    //make the attack essentially, which entails making the change to the state properties
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
        row++;

        const derivedCoord = [row, column],
          corresValue = suppliedMatrix[row][column];

        coordsList.coords.push(derivedCoord);
        coordsList.values.push(corresValue);
      } else if (axis === "Horizontal") {
        column++;

        const derivedCoord = [row, column],
          corresValue = suppliedMatrix[row][column];

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
      for (let subscriber in this.#subscribers) {
        this.#subscribers[subscriber](this.#playerGameState);
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
      this.#helperClassInstances.argValidator.validate("addShipToBoard", {
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
