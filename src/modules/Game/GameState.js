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

      this.#playerNum = playerNum;

      this.#buildBoard();
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
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #playerNum = null;

  #gameState = {
    playerBoard: null,
    playerShips: null,
  };

  //---------HELPER-METHODS---------//

  #buildBoard() {}

  //-------PLAYER-STATE-PUB-SUB-----//

  //--------------APIs--------------//
}

class Ship {
  constructor(shipLength, gridCoordsArr) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        shipLength,
        gridCoordsArr,
      });

      this.#initShipProperties(shipLength, gridCoordsArr);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //------STATE-AND-CONFIG-DATA-----//

  #argumentValidationRules = {
    constructor: {
      shipLength: {
        type: "number",
      },
      gridCoordsArr: {
        isArray: true,
        arrElementType: "object",
      },
    },
    damageShip: {
      gridCoord: {
        isArray: true,
        arrElementType: "number",
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #shipSectionArr = null;

  #shipHealth = null;

  #correspondingCoords = null;

  //---------HELPER-METHODS---------//

  #initShipProperties(shipLength, gridCoordsArr) {}

  #findCorrespondingShipSection(gridCoord) {
    for (let i = 0; i < this.#correspondingCoords; i++) {
      const isMatchingCoord = this.#checkCoord(
        this.#correspondingCoords[i],
        gridCoords
      );

      if (isMatchingCoord) {
        return i;
      }
    }

    return null;
  }

  #checkCoord(currCoord, suppliedCoord) {
    let matchingCoord = true;

    for (let element in currCoord) {
      if (currCoord[element] !== suppliedCoord[element]) {
        matchingCoord = false;
        break;
      }
    }

    return matchingCoord;
  }

  #applyDamage(shipSectionIndex) {
    if (this.#shipSectionArr[shipSectionIndex] === "-") {
      this.#shipSectionArr[shipSectionIndex] = "X";
      this.#shipHealth--;
    }
  }

  //--------------APIs--------------//

  //uses supplied grid coords in order to compare which portion of the ship
  //was hit, and apply the damage to the specific section that the ship exists
  //in, in relation to the grid itself.
  damageShip(gridCoord) {
    try {
      this.#helperClassInstances.argValidator.validate("damageShip", {
        gridCoord,
      });

      const shipSectionIndex = this.#findCorrespondingShipSection(gridCoord);

      if (shipSectionIndex !== null) {
        this.#applyDamage(shipSectionIndex);
      } else {
        throw new Error(`Failed to damage ship, as the supplied grid coordinate does not match any
         of the corresponding ship coordinates, received ${gridCoord} as the supplied grid coordinate`);
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //returns data on the current state of the ship for any type of use
  currentState() {
    return {
      shipSections: this.#shipSectionArr,
      shipHealth: this.#shipHealth,
    };
  }
}
