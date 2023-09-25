import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { Publisher } from "../LowLevelModules/Publisher";
import { ErrorManager } from "../LowLevelModules/Error-Manager";
import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager";

import lodash from "lodash";

const errorManager = new ErrorManager();

class BattleShipEnums {
  static playerConstants = {
    PLAYER_1_NAME: "player1",
    PLAYER_2_NAME: "player2",
  };

  static DOMGridConstants = Object.freeze({
    //For defining a specific ship space on the DOM grid
    SHIP_CLASS_TAG_PREFIX: "Ship-",
    HIT_CLASS_TAG: "Hit",
    MISS_CLASS_TAG: "Miss",

    //element ref prefixes used in tandem in order to define
    //a specific grid tile belonging to a specific player
    ELEMENT_REF_PLAYER_PREFIX: "Player-",
    ELEMENT_REF_TILE_PREFIX: "Tile-",
  });

  static matrixConstants = Object.freeze({
    EMPTY_SPACE: 0,
    NUM_OF_ROWS: 10,
    NUM_OF_COLUMNS: 10,
  });

  static attacksMadeMatrixConstants = Object.freeze({
    ATTACK_MADE: 1,
  });

  static shipPlacementMatrixConstants = Object.freeze({
    SHIP_LENGTHS: [5, 4, 3, 3, 2],
    SHIP_1: 1,
    SHIP_2: 2,
    SHIP_3: 3,
    SHIP_4: 4,
    SHIP_5: 5,
  });
}

class PublisherEnums {
  static gameState = Object.freeze({});

  static gameBoardStyler = Object.freeze({});

  static UI = Object.freeze({});

  static gameStatePopUp = Object.freeze({});
}

//*****************STYLER-LOGIC*******************/

class StyleBoardFocus {
  constructor(elementRefManager) {}
}

//should be able to accept both ship placement matrices and
//attacks made matrices from both players. If a ship placement grid
//is supplied when an attack has already been applied to the DOM
//the DOM is wiped of all applied made attacks, as well as the attacks made
//matrices currently in state. This is so that any instance of a new ship placement
//automatically resets the attacks made visually and logically for correct syncing

//applying the attacks made to the DOM will otherwise be similar to how
//ship placements are applied to the DOM. Supply the updated matrix,
//and then display the matrix stored to state.

class DisplayMadeAttacks {
  constructor(elementRefManager) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("constructor", { elementRefManager });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#initStateDataStructures();
      this.#retrieveElementRefs();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //------STATE-AND-CONFIG-DATA------//

  #argumentValidationRules = {};

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    elementRefManager: null,
  };

  //upon init
  // player1: {},
  // player2: {},
  #retrievedElementRefs = {};

  //flags for managing whether to allow
  //a visual update for a specific player
  //based on if a new grid reference was supplied

  //upon init
  // newPlayerMadeAttacksGrid: {
  //   player1: false,
  //   player2: false,
  // },
  // madeAttacksAppliedToDOM: {
  //   player1: false,
  //   player2: false,
  // },
  #stateData = {};

  //upon init
  //player1: null,
  //player2: null,
  #playerMadeAttacksGrids = {};

  //upon init
  //player1: null,
  //player2: null,
  #playerShipGrids = {};

  #instructionsValidProperties = {
    action: [`Remove`, `Update`, `Reset`],
  };

  #validTypes = ["object", "boolean", "null"];

  //---------HELPER-METHODS-----------//

  //******INITIALIZATION*******/
  #initStateDataStructures() {
    for (let method of this.#initDataStructureHelperMethods) {
      method();
    }
  }

  #initDataStructureHelperMethods = {
    retrievedElementRefs: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

      //inits player 1 and player 2 properties
      //equal to empty objects
      this.#initKeyValueStruct(
        this.#retrievedElementRefs,
        PLAYER_1_NAME,
        this.#validTypes[0]
      );

      this.#initKeyValueStruct(
        this.#retrievedElementRefs,
        PLAYER_2_NAME,
        this.#validTypes[0]
      );
    },
    playerMadeAttacksGrids: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

      //inits player 1 and player 2 properties equal
      //to null
      this.#initKeyValueStruct(
        this.#playerMadeAttacksGrids,
        PLAYER_1_NAME,
        this.#validTypes[2]
      );

      this.#initKeyValueStruct(
        this.#playerMadeAttacksGrids,
        PLAYER_2_NAME,
        this.#validTypes[2]
      );
    },
    stateData: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants,
        NPMAG = "newPlayerMadeAttacksGrid",
        MAATD = "madeAttacksAppliedToDOM";

      //inits a property 'newPlayerShipGrid' in which within it inits
      //player 1 and player 2 properties equal to a boolean value, starting
      //with false

      //*******NPMAG*******/

      this.#initKeyValueStruct(this.#stateData, NPMAG, this.#validTypes[0]);

      //NESTED
      this.#initKeyValueStruct(
        this.#stateData[NPMAG],
        PLAYER_1_NAME,
        this.#validTypes[1] //boolean
      );

      this.#initKeyValueStruct(
        this.#stateData[NPMAG],
        PLAYER_2_NAME,
        this.#validTypes[1]
      );

      //*******MAATD*******/

      this.#initKeyValueStruct(this.#stateData, MAATD, this.#validTypes[0]);

      //NESTED
      this.#initKeyValueStruct(
        this.#stateData[MAATD],
        PLAYER_1_NAME,
        this.#validTypes[1]
      );

      this.#initKeyValueStruct(
        this.#stateData[MAATD],
        PLAYER_2_NAME,
        this.#validTypes[1]
      );
    },
    playerShipGrids: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

      //inits player 1 and player 2 properties equal
      //to null
      this.#initKeyValueStruct(
        this.#playerShipGrids,
        PLAYER_1_NAME,
        this.#validTypes[2]
      );

      this.#initKeyValueStruct(
        this.#playerShipGrids,
        PLAYER_2_NAME,
        this.#validTypes[2]
      );
    },
  };

  #initKeyValueStruct(targetObj, key, dataType) {
    //have to initialize the needed data structures in state, as their properties
    //are determined by a global constant
    if (dataType === "object") {
      targetObj[key] = new Object();
    } else if (dataType === "boolean") {
      targetObj[key] = false;
    } else if (dataType === "null") {
      targetObj[key] = null;
    }
  }

  #retrieveElementRefs() {
    //should retrieve the grid square references
    //for both player 1 and player 2
    const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

    //retrieves the DOM tiles references that represent a corresponding
    //matrix
    this.#retrievePlayerTileDOMRefs(1, PLAYER_1_NAME);
    this.#retrievePlayerTileDOMRefs(2, PLAYER_2_NAME);
  }

  #retrievePlayerTileDOMRefs(playerNum, playerName) {
    const { elementRefManager } = this.#helperClassInstances,
      { NUM_OF_ROWS, NUM_OF_COLUMNS } = BattleShipEnums.matrixConstants,
      { ELEMENT_REF_TILE_PREFIX } = BattleShipEnums.DOMGridConstants;

    const elementRefPlayerString =
      BattleShipEnums.DOMGridConstants.ELEMENT_REF_PLAYER_PREFIX + playerNum;

    //iterates over the matrix in order to create the necessary
    //references keys for retrieving the grid tiles from the
    //DOM for the corresponding player
    for (let r = 0; r < NUM_OF_ROWS; r++) {
      for (let c = 0; c < NUM_OF_COLUMNS; c++) {
        const gridTileNum = this.#calcTileNum(r, c), // returns the current tile number based on the iteration
          tileTag = ELEMENT_REF_TILE_PREFIX + gridTileNum, // tile${gridTileNum}
          refKey = elementRefPlayerString + tileTag; //creates the complete ref key representing a specific DOM tile for a specific player

        const retrievedTile = elementRefManager.retrieveRef(refKey);

        //ex: player1: {
        //      tile0: element,
        //      tile1: element,
        //       ... for the complete iteration
        //    }
        this.#retrievedElementRefs[playerName][tileTag] = retrievedTile;
      }
    }
  }

  //*********UTILITIES*********/

  #updateNewMadeAttacksGridFlags(gridsThatWereUpdated) {
    //checks each player property, in which if that player
    //was updated, change the new ship grid flag corresponding to
    //them to false
    for (let player in gridsThatWereUpdated) {
      if (gridsThatWereUpdated[player]) {
        this.#stateData.newPlayerMadeAttacksGrid[player] = false;
        this.#stateData.madeAttacksAppliedToDOM[player] = true;
      }
    }
  }

  #createTileTag(tileNum) {
    const { ELEMENT_REF_TILE_PREFIX } = BattleShipEnums.DOMGridConstants;
    return ELEMENT_REF_TILE_PREFIX + tileNum;
    //returns something like 'Tile-${tileNum}'
  }

  #calcTileNum(rowNum, colNum) {
    //both the rows and columns on the logical matrices use a 0 index,
    //thus you can multiply the current row number by 10 and add it to the column
    //number to get the corresponding tile number starting from 0
    return rowNum * 10 + colNum;
  }

  //-----STYLE-ORIENTED-METHODS------//

  #determinePlayersToUpdate(updateRule) {
    const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

    //create the flag data structure using the enums constants for
    //the players
    const playersToUpdate = {};
    playersToUpdate[PLAYER_1_NAME] = false;
    playersToUpdate[PLAYER_2_NAME] = false;

    //all players in some capacity
    if (updateRule === "All" || updateRule === "Reset") {
      for (let player in playersToUpdate) {
        playersToUpdate[player] = true;
      }
    }

    //specific target players

    if (updateRule === PLAYER_1_NAME) {
      playersToUpdate[PLAYER_1_NAME] = true;
    }

    if (updateRule === PLAYER_2_NAME) {
      playersToUpdate[PLAYER_2_NAME] = true;
    }

    return playersToUpdate;
  }

  createClassAlteringInstructions(
    element,
    madeAttacksMatrixCoordVal,
    shipsPlacedMatrixCoordVal
  ) {
    //needs to return an object with the 'action' property that dictates the encompassing
    //action to do on the specific element. Uses the matrixCoordVal in order to decide whether
    //the element should be altered with class tag wise for attacks
    const { HIT_CLASS_TAG, MISS_CLASS_TAG } = BattleShipEnums.DOMGridConstants,
      { EMPTY_SPACE } = BattleShipEnums.matrixConstants,
      { ATTACK_MADE } = BattleShipEnums.attacksMadeMatrixConstants;

    const instructions = {
      action: null,
      tagFound: null,
      shipPlacementMatrixCoordVal: null,
    };

    //logic in order to create the right instructions based on whether the logical representation is

    return instructions;
  }

  #removeShipTag(element, instructions) {
    //logic to remove a tag if applicable by the instructions
  }

  #addShipTag(element, instructions) {
    //adds a specific attack tag representing a specific attack if applicable by the instructions
  }

  #updatePlayerMadeAttackTag(
    playerName,
    gridTileNum,
    madeAttacksMatrixCoordVal,
    shipsPlacedMatrixCoordVal
  ) {
    //matrixCoordVal is the value on the logical matrix, not the DOM tiles, in this
    //case the matrix for managing made attacks
    const playerTileElement =
      this.#retrievedElementRefs[playerName][this.#createTileTag(gridTileNum)];

    const instructions = this.createClassAlteringInstructions(
      playerTileElement,
      madeAttacksMatrixCoordVal,
      shipsPlacedMatrixCoordVal
    );

    //consolidates the generic actions to take on the element based on the
    //action to take based on the instructions created for the given element
    //these methods will execute based on the supplied instructions
    this.#removeShipTag(playerTileElement, instructions);
    this.#addShipTag(playerTileElement, instructions);
  }

  #updateGridMadeAttacksTags(updateRule) {
    //should iterate over both player matrices containing the logical placements
    //at the same time. It will remove all incorrect ship tag references
    //and apply the right ship tag references if applicable for the specific coordinate
    const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants,
      { NUM_OF_ROWS, NUM_OF_COLUMNS } = BattleShipEnums.matrixConstants;

    //enables the ability to determine a complex update list based on the supplied rule
    //including things like specific players, or all players
    const gridsToUpdate = this.#determinePlayersToUpdate(updateRule);

    for (let r = 0; r < NUM_OF_ROWS; r++) {
      for (let c = 0; c < NUM_OF_COLUMNS; c++) {
        //iterates over the player grid matrix from top left
        //to bottom right

        //calculate the current grid tile number using the iterator index values
        const gridTileNum = this.#calcTileNum(r, c);

        if (gridsToUpdate[PLAYER_1]) {
          //pull the corresponding logical matrix coordinate value
          const madeAttacksMatrixCoordVal =
            this.#playerMadeAttacksGrids[PLAYER_1_NAME][r][c];

          const shipPlacementMatrixCoordVal =
            this.#playerShipGrids[PLAYER_1_NAME][r][c];

          this.#updatePlayerMadeAttackTag(
            PLAYER_1_NAME,
            gridTileNum,
            madeAttacksMatrixCoordVal,
            shipPlacementMatrixCoordVal
          );
        }

        if (gridsToUpdate[PLAYER_2]) {
          const madeAttacksMatrixCoordVal =
            this.#playerMadeAttacksGrids[PLAYER_2_NAME][r][c];

          const shipPlacementMatrixCoordVal =
            this.#playerShipGrids[PLAYER_2_NAME][r][c];

          this.#updatePlayerMadeAttackTag(
            PLAYER_2_NAME,
            gridTileNum,
            madeAttacksMatrixCoordVal,
            shipPlacementMatrixCoordVal
          );
        }
      }
    }

    //same flags will be used in order to
    //update the stored new grid flags in state
    return gridsToUpdate;
  }

  //------------APIs-----------------//

  //when the placed ships are updated, will also wipe all attacks
  //if applicable
  updatePlayerPlacedShips(playerName, playerShipGrid) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("updatePlayerPlacedShips", {
        playerName,
        playerShipGrid,
      });

      //store the grid, no update flag though
      this.#playerShipGrids[playerName] = playerShipGrid;
      this.#stateData.newPlayerShipGrid[playerName] = true;

      if (this.#stateData.madeAttacksAppliedToDOM[playerName]) {
        //logic to wipe the corresponding player grid of the applied attacks
        //class tag wise. Also involves reseting the various flags related
        //to applying the made attacks in state to DOM

        this.#stateData.madeAttacksAppliedToDOM[playerName] = false;
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //The methods below should only be invoked when the ship placements
  //are final
  updatePlayerMadeAttacks(playerName, playerMadeAttacksGrid) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("updatePlayerMadeAttacks", {
        playerName,
        playerMadeAttacksGrid,
      });

      //store the grid, and update the new grid flag
      this.#playerMadeAttacksGrids[playerName] = playerMadeAttacksGrid;
      this.#stateData.madeAttacksAppliedToDOM[playerName] = true;
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //updateRule -> player 1 name enum val, player 2 name enum val, 'All'
  displayPlayerMadeAttacks(updateRule) {
    //a visual update for the corresponding player will commence only
    //if a new player ship grid reference was supplied before hand
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("displayPlayerMadeAttacks", { updateRule });

      //will immediately return if the specific made attacks grid is not new, if
      //such is a player of course. The validator will catch args that aren't allowed,
      //thus if such fails the if check, then its most likely a special rule
      if (
        updateRule in this.#stateData.newPlayerMadeAttacksGrid &&
        !this.#stateData.newPlayerMadeAttacksGrid[updateRule]
      ) {
        return;
      } else {
        const gridsUpdated = this.#updateGridMadeAttacksTags(updateRule);
        this.#updateNewMadeAttacksGridFlags(gridsUpdated);
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}

class DisplayShipPlacements {
  constructor(elementRefManager) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("constructor", { elementRefManager });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#initStateDataStructures();
      this.#retrieveElementRefs();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //------STATE-AND-CONFIG-DATA------//

  #argumentValidationRules = {
    constructor: {
      elementRefManager: {
        instanceof: ElementRefManager,
      },
    },
    displayPlayerPlacedShips: {
      updateRule: {
        typeof: "string",
        validValues: [
          BattleShipEnums.playerConstants.PLAYER_1_NAME,
          BattleShipEnums.playerConstants.PLAYER_2_NAME,
          "All",
        ],
      },
    },
    updatePlayerPlacedShips: {
      playerName: {
        typeof: "string",
        validValues: [
          BattleShipEnums.playerConstants.PLAYER_1_NAME,
          BattleShipEnums.playerConstants.PLAYER_2_NAME,
        ],
      },
      playerShipGrid: {
        isArray: true,
        arrElementType: "object", //checks for elements that equal an array, which has and object type
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    elementRefManager: null,
  };

  //upon init
  // player1: {},
  // player2: {},
  #retrievedElementRefs = {};

  //flags for managing whether to allow
  //a visual update for a specific player
  //based on if a new grid reference was supplied

  //upon init
  // newPlayerShipGrid: {
  //   player1: false,
  //   player2: false,
  // },
  #stateData = {};

  //upon init
  //player1: null,
  //player2: null,
  #playerShipGrids = {};

  #instructionsValidProperties = {
    action: [`Remove`, `Update`],
  };

  #validTypes = ["object", "boolean", "null"];

  //---------HELPER-METHODS-----------//

  //******INITIALIZATION*******/
  #initStateDataStructures() {
    for (let method of this.#initDataStructureHelperMethods) {
      method();
    }
  }

  #initDataStructureHelperMethods = {
    retrievedElementRefs: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

      //inits player 1 and player 2 properties
      //equal to empty objects
      this.#initKeyValueStruct(
        this.#retrievedElementRefs,
        PLAYER_1_NAME,
        this.#validTypes[0]
      );

      this.#initKeyValueStruct(
        this.#retrievedElementRefs,
        PLAYER_2_NAME,
        this.#validTypes[0]
      );
    },
    playerShipGrids: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

      //inits player 1 and player 2 properties equal
      //to null
      this.#initKeyValueStruct(
        this.#playerShipGrids,
        PLAYER_1_NAME,
        this.#validTypes[2]
      );

      this.#initKeyValueStruct(
        this.#playerShipGrids,
        PLAYER_2_NAME,
        this.#validTypes[2]
      );
    },
    stateData: () => {
      const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants,
        outerProperty = "newPlayerShipGrid";

      //inits a property 'newPlayerShipGrid' in which within it inits
      //player 1 and player 2 properties equal to a boolean value, starting
      //with false
      this.#initKeyValueStruct(
        this.#stateData,
        outerProperty,
        this.#validTypes[0]
      );

      //NESTED
      this.#initKeyValueStruct(
        this.#stateData[outerProperty],
        PLAYER_1_NAME,
        this.#validTypes[1]
      );

      this.#initKeyValueStruct(
        this.#stateData[outerProperty],
        PLAYER_2_NAME,
        this.#validTypes[1]
      );
    },
  };

  #initKeyValueStruct(targetObj, key, dataType) {
    //have to initialize the needed data structures in state, as their properties
    //are determined by a global constant
    if (dataType === "object") {
      targetObj[key] = new Object();
    } else if (dataType === "boolean") {
      targetObj[key] = false;
    } else if (dataType === "null") {
      targetObj[key] = null;
    }
  }

  #retrieveElementRefs() {
    //should retrieve the grid square references
    //for both player 1 and player 2
    const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

    //retrieves the DOM tiles references that represent a corresponding
    //matrix
    this.#retrievePlayerTileDOMRefs(1, PLAYER_1_NAME);
    this.#retrievePlayerTileDOMRefs(2, PLAYER_2_NAME);
  }

  #retrievePlayerTileDOMRefs(playerNum, playerName) {
    const { elementRefManager } = this.#helperClassInstances,
      { NUM_OF_ROWS, NUM_OF_COLUMNS } = BattleShipEnums.matrixConstants,
      { ELEMENT_REF_TILE_PREFIX } = BattleShipEnums.DOMGridConstants;

    const elementRefPlayerString =
      BattleShipEnums.DOMGridConstants.ELEMENT_REF_PLAYER_PREFIX + playerNum;

    //iterates over the matrix in order to create the necessary
    //references keys for retrieving the grid tiles from the
    //DOM for the corresponding player
    for (let r = 0; r < NUM_OF_ROWS; r++) {
      for (let c = 0; c < NUM_OF_COLUMNS; c++) {
        const gridTileNum = this.#calcTileNum(r, c), // returns the current tile number based on the iteration
          tileTag = ELEMENT_REF_TILE_PREFIX + gridTileNum, // Tile-${gridTileNum}
          refKey = elementRefPlayerString + tileTag; //creates the complete ref key representing a specific DOM tile for a specific player

        const retrievedTile = elementRefManager.retrieveRef(refKey);

        //ex: player1: {
        //      Tile-0: element,
        //      Tile-1: element,
        //       ... for the complete iteration
        //    }
        this.#retrievedElementRefs[playerName][tileTag] = retrievedTile;
      }
    }
  }

  //*********UTILITIES*********/

  #determinePlayersToUpdate(updateRule) {
    const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants;

    //create the flag data structure using the enums constants for
    //the players
    const playersToUpdate = {};
    playersToUpdate[PLAYER_1_NAME] = false;
    playersToUpdate[PLAYER_2_NAME] = false;

    //all players in some capacity, but not limited to "All"
    //conceptually
    if (updateRule === "All") {
      for (let player in playersToUpdate) {
        playersToUpdate[player] = true;
      }
    }

    //specific target players

    if (updateRule === PLAYER_1_NAME) {
      playersToUpdate[PLAYER_1_NAME] = true;
    }

    if (updateRule === PLAYER_2_NAME) {
      playersToUpdate[PLAYER_2_NAME] = true;
    }

    return playersToUpdate;
  }
  #updateNewShipMatrixFlags(gridsThatWereUpdated) {
    //checks each player property, in which if that player
    //was updated, change the new ship grid flag corresponding to
    //them to false
    for (let player in gridsThatWereUpdated) {
      if (gridsThatWereUpdated[player]) {
        this.#stateData.newPlayerShipGrid[player] = false;
      }
    }
  }

  #createTileTag(tileNum) {
    const { ELEMENT_REF_TILE_PREFIX } = BattleShipEnums.DOMGridConstants;
    return ELEMENT_REF_TILE_PREFIX + tileNum;
    //returns something like 'Tile-${tileNum}'
  }

  #calcTileNum(rowNum, colNum) {
    //both the rows and columns on the logical matrices use a 0 index,
    //thus you can multiply the current row number by 10 and add it to the column
    //number to get the corresponding tile number starting from 0

    const rowMultiplier = 10;

    return rowNum * rowMultiplier + colNum;
  }

  //---CLASS-TAG-ORIENTED-METHODS----//

  #scanForShipTag(element, matrixCoordVal) {
    //needs to return an object with the 'action' property that dictates the encompassing
    //action to do on the specific element. Uses the gridTileVal in order to decide whether
    //the element should be altered with class tag wise
    const { SHIP_CLASS_TAG_PREFIX } = BattleShipEnums.DOMGridConstants,
      { EMPTY_SPACE } = BattleShipEnums.matrixConstants;

    const instructions = {
      action: null,
      tagFound: null,
    };

    const elementClassList = element.classList;
    let tagShipNum = null;

    for (let tag of elementClassList) {
      if (tag.startsWith(SHIP_CLASS_TAG_PREFIX)) {
        instructions.tagFound = tag; //a ship tag was found, store it in the instructions

        tagShipNum = parseInt(tag.split("").pop()); //need to grab the ship number off the end of the tag
        break;
      }
    }

    if (
      //if the logical coordinate is supposed to be an empty space, the
      //corresponding tile on the DOM should not have a ship tag that was retrieved.
      //if a tag is found, that means some type of ship exists on that tile in the DOM
      matrixCoordVal === EMPTY_SPACE &&
      tagFound !== null
    ) {
      instructions.action = this.#instructionsValidProperties.action[0];
      //instructions to remove tag
    } else if (
      //if the logical coordinate is not supposed to be an empty space
      //and that the retrieved tag ship number does not equal the logical coordinate
      //this applies to wrong ships as well as non existent ship tiles
      matrixCoordVal !== EMPTY_SPACE &&
      matrixCoordVal !== tagShipNum
    ) {
      instructions.action = this.#instructionsValidProperties.action[1];
      //instruction to update tag
    }

    return instructions;
  }

  #removeShipTag(element, instructions) {
    if (
      //remove
      instructions.action === this.#instructionsValidProperties.action[0] ||
      instructions.action === this.#instructionsValidProperties.action[1]
      //or update
    ) {
      element.classList.remove(tagFound);
    }
  }

  #addShipTag(element, shipNum) {
    //adds a ship tag using the ship number to create the tag, and then add
    //said tag to the class list of the element

    if (
      //update
      instructions.action === this.#instructionsValidProperties.action[1]
    ) {
      const { SHIP_CLASS_TAG_PREFIX } = BattleShipEnums.DOMGridConstants,
        shipClassTag = SHIP_CLASS_TAG_PREFIX + shipNum;

      element.classList.add(shipClassTag);
    }
  }

  #updatePlayerShipTag(playerName, gridTileNum, matrixCoordVal) {
    //matrixCoordVal is the value on the logical matrix, not the DOM tiles

    const playerTileElement =
      this.#retrievedElementRefs[playerName][this.#createTileTag(gridTileNum)];

    const instructions = this.#scanForShipTag(
      playerTileElement,
      matrixCoordVal
    );

    //consolidates the generic actions to take on the element based on the
    //action to take based on the instructions created for the given element

    this.#removeShipTag(playerTileElement, instructions);
    this.#addShipTag(playerTileElement, instructions);
  }

  #updateGridShipTags(updateRule) {
    //should iterate over both player matrices containing the logical placements
    //at the same time. It will remove all ship tag references
    //and apply the right ship tag references if the current grid tile logically
    //is for a specific ship
    const { PLAYER_1_NAME, PLAYER_2_NAME } = BattleShipEnums.playerConstants,
      { NUM_OF_ROWS, NUM_OF_COLUMNS } = BattleShipEnums.matrixConstants;

    //enables the ability to update either a specific player or all players
    const gridsToUpdate = this.#determinePlayersToUpdate(updateRule);

    for (let r = 0; r < NUM_OF_ROWS; r++) {
      for (let c = 0; c < NUM_OF_COLUMNS; c++) {
        //iterates over the player grid matrix from top left
        //to bottom right

        //calculate the current grid tile number using the iterator index values
        const gridTileNum = this.#calcTileNum(r, c);

        if (gridsToUpdate[PLAYER_1]) {
          //pull the corresponding logical matrix coordinate value
          const matrixCoordVal = this.#playerShipGrids[PLAYER_1_NAME][r][c];

          this.#updatePlayerShipTag(PLAYER_1_NAME, gridTileNum, matrixCoordVal);
        }

        if (gridsToUpdate[PLAYER_2]) {
          const matrixCoordVal = this.#playerShipGrids[PLAYER_2_NAME][r][c];

          this.#updatePlayerShipTag(PLAYER_2_NAME, gridTileNum, matrixCoordVal);
        }
      }
    }

    //same flags will be used in order to
    //update the stored new grid flags in state
    return gridsToUpdate;
  }

  //------------APIs-----------------//

  //updateRule -> player 1 name enum val, player 2 name enum val, 'All'
  displayPlayerPlacedShips(updateRule) {
    //a visual update for the corresponding player will commence only
    //if a new player ship grid reference was supplied before hand
    try {
      //only considers updating the DOM if atleast one flag has been check in terms
      //of a new player grid
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("displayPlayerPlacedShips", { updateRule });

      //will immediately return if the specific made attacks grid is not new, if
      //such is a player of course. The validator will catch args that aren't allowed,
      //thus if such fails the if check, then its most likely a special rule
      if (
        updateRule in this.#stateData.newPlayerShipGrid &&
        !this.#stateData.newPlayerShipGrid[updateRule]
      ) {
        return;
      } else {
        const gridsUpdated = this.#updateGridShipTags(updateRule);
        this.#updateNewShipMatrixFlags(gridsUpdated);
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
  updatePlayerPlacedShips(playerName, playerShipGrid) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("updatePlayerPlacedShips", {
        playerName,
        playerShipGrid,
      });

      //store the grid, and update the new grid flag
      this.#playerShipGrids[playerName] = playerShipGrid;
      this.#stateData.newPlayerShipGrid[playerName] = true;
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}

//reference manager identifiers:
//'Game-Container'
//'Player-One-Board'
//'Player-Two-Board'
//'Player-One-Grid'
//'Player-Two-Grid'
//'Grid-Square-${num}-Player-${playerNum}'

//player state

// #playerGameState = {
//   playerNum: null,
//   mainBoard: null,
//   madeAttacksBoard: null,
//   totalHealth: 0,
// };

//ship placement state

// #stateData = {
//   currentState: false,
//   finished: false,
//   numOfShips: {
//     player1: 0,
//     player2: 0,
//   },
//   shipLengths: [5, 4, 3, 3, 2],
// };

//battle state

// #stateData = {
//   currentState: false,
//   finished: false,
//   whosTurn: null,
//   player1Health: null,
//   player2Health: null,
//   winner: null,
// };

//game state

// #stateData = {
//   currentState: null,
//   finishedStateStatus: {
//     shipPlacement: false,
//     match: false,
//   },
// };

//Should only auto apply styles when states related to the game state are received,
//but should also receive current style states for determining how to change the style
//when said game states are received.
class BoardAutoStyler {
  constructor(stylingApis, parentClassScope) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("constructor", {
        stylingApis,
        parentClassScope,
      });

      this.#gameBoardStyleState = gameBoardStyleState;

      this.#stylingApis = stylingApis;
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //----------STATE-AND-CONFIG-DATA-----------//

  #argumentValidationRules = {
    constructor: {},
  };

  #stateData = {
    parentClassScope: null,
  };

  #stylingApis = null;

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #gameBoardStyleState = null;

  //---------STATE-CONDITION-FILTERS----------//

  //-----RECEIVED-STYLE-STATE-PROCESSORS------//

  styleStateProcessors = {
    styleBoardFocus: (stateCopy) => {},
    displayPlacedShips: (stateCopy) => {},
    displayMadeAttacks: (stateCopy) => {},
  };

  //-----RECEIVED-GAME-STATE-PROCESSORS-------//

  gameStateProcessors = {
    gameState: (stateCopy) => {},
    battleState: (stateCopy) => {},
    shipPlacement: (stateCopy) => {},
    player1: (stateCopy) => {},
    player2: (stateCopy) => {},
  };
}

class GameBoardStyler {
  constructor(elementRefManager, gameStateInstance) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
        gameStateInstance,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;
      this.#helperClassInstances.gameState = gameStateInstance;

      this.#initStylerHelperClassInstances();

      this.#initControllerPublishers();

      this.#linkControllerToStylerHelperClassPublishers();
      this.#linkAutoStylerToStylerHelperClassPublishers();
      this.#linkAutoStylerToGameStatePublishers();
      //logic to facilitate all of the necessary publisher links
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-------STATE-AND-CONFIG-DATA--------//

  #publisherReferences = {
    publisherName: "Game Board Style State",
    boardAutoStylerName: "Board Auto Styler",
  };

  #gameStatePublisherInstanceNames = {
    player1: "Player 1 State",
    player2: "Player 2 State",
    shipPlacement: "Ship Placement State",
    battleState: "Battle State",
    gameState: "Game State",
  };

  #stylerStatePublisherInstanceNames = {
    styleBoardFocus: "Board Focus Style State",
    displayPlacedShips: "Ships Placed Style State",
    displayMadeAttacks: "Attacks Made Style State",
  };

  #stylerHelperClassInstances = {
    boardAutoStyler: null,
    styleBoardFocus: null,
    displayPlacedShips: null,
    displayMadeAttacks: null,
  };

  #argumentValidationRules = {
    constructor: {
      elementRefManager: {
        instanceof: ElementRefManager,
      },
    },
    displayPlacedShips: {
      player1ShipsPlaced: {
        isArray: true,
      },
      player2ShipsPlaced: {
        isArray: true,
      },
    },
    displayMadeAttacks: {
      player1AttacksMade: {
        isArray: true,
      },
      player2AttacksMade: {
        isArray: true,
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    publisher: new Publisher(),
    elementRefManager: null,
    gameState: null,
  };

  //----------HELPER-METHODS------------//

  //need to supply a bundled reference of the apis on this parent class to the
  //auto styler helper, as the auto styler will use these apis in order to
  //facilitate the actual styling, of course based on the received game states
  #getAvailableApis() {
    const toggleHoverView = this.toggleHoverView,
      displayPlacedShips = this.displayPlacedShips,
      displayMadeAttacks = this.displayMadeAttacks;

    return {
      toggleHoverView,
      displayPlacedShips,
      displayMadeAttacks,
    };
  }

  #initStylerHelperClassInstances() {
    const availableApis = this.#getAvailableApis(),
      { elementRefManager } = this.#helperClassInstances;

    this.#stylerHelperClassInstances.displayPlacedShips =
      new DisplayShipPlacements(elementRefManager);

    this.#stylerHelperClassInstances.displayMadeAttacks =
      new DisplayMadeAttacks(elementRefManager);

    this.#stylerHelperClassInstances.styleBoardFocus = new StyleBoardFocus(
      elementRefManager
    );

    //receives the apis from the controller class, as well as its scope, so
    //that it can use these to invoke the necessary apis to activate a styling of
    //some sort
    this.#stylerHelperClassInstances.boardAutoStyler = new BoardAutoStyler(
      availableApis,
      this
    );
  }

  #initControllerPublishers() {
    const { publisher } = this.#helperClassInstances;

    for (let name of this.#stylerStatePublisherInstanceNames) {
      publisher.addPublisherInstance(name);
    }
  }

  #linkAutoStylerToGameStatePublishers() {
    const { gameState } = this.#helperClassInstances,
      { boardAutoStyler } = this.#stylerHelperClassInstances,
      gameStateProcessors = boardAutoStyler.gameStateProcessors;

    //uses matching property names of the game state publisher saved in the controller class
    //in order to facilitate the correct method links
    for (let propertyName in this.#gameStatePublisherInstanceNames) {
      const GSPIString = this.#gameStatePublisherInstanceNames[propertyName];

      gameState.subscribe(
        GSPIString,
        this.#publisherReferences.boardAutoStylerName,
        gameStateProcessors[propertyName].bind(boardAutoStyler)
      );
    }
  }

  // links the styling classes to the autostyler so that
  // the auto styler can keep track of the current styles
  // that are already applied. It uses this information to make
  // styling decisions based on the next time it receives game state
  // data
  #linkAutoStylerToStylerHelperClassPublishers() {
    const { boardAutoStyler } = this.#stylerHelperClassInstances,
      styleStateProcessors = boardAutoStyler.styleStateProcessors;

    //uses matching property names of the styler helper instances saved in the controller class
    //in order to facilitate the correct method links
    for (let propertyName in this.#stylerStatePublisherInstanceNames) {
      this.#stylerHelperClassInstances[propertyName].subscribe(
        this.#publisherReferences.boardAutoStylerName,
        styleStateProcessors[propertyName].bind(boardAutoStyler)
      );
    }
  }

  // links the various helper classes to the publishers of the
  // controller class they exist within, which is this class,
  // so that their publishers may chain with the styling state
  // data pub sub that this controller offers, which essentially
  // acts as an interface to receive various styling states from said
  // helpers without direct connection to do so
  #linkControllerToStylerHelperClassPublishers() {
    const emitterMethods = this.#styleStateEmitters;

    for (let propertyName in this.#stylerStatePublisherInstanceNames) {
      this.#stylerHelperClassInstances[propertyName].subscribe(
        this.#publisherReferences.publisherName,
        emitterMethods[propertyName].bind(this)
      );
    }
  }

  //-----STYLING-STATE-DATA-PUB-SUB-----//

  #styleStateEmitters = {
    styleBoardFocus: (stateCopy) => {
      //logic to emit the copy on the right publisher
      const { publisher } = this.#helperClassInstances;

      publisher.emitData(
        this.#stylerStatePublisherInstanceNames.styleBoardFocus,
        stateCopy
      );
    },
    displayPlacedShips: (stateCopy) => {
      //logic to emit the copy on the right publisher
      const { publisher } = this.#helperClassInstances;

      publisher.emitData(
        this.#stylerStatePublisherInstanceNames.displayPlacedShips,
        stateCopy
      );
    },
    displayMadeAttacks: (stateCopy) => {
      //logic to emit the copy on the right publisher
      const { publisher } = this.#helperClassInstances;

      publisher.emitData(
        this.#stylerStatePublisherInstanceNames.displayMadeAttacks,
        stateCopy
      );
    },
  };
  subscribe(publisherName, methodName, entrypointMethod) {
    try {
      const { argValidator, publisher } = this.#helperClassInstances;
      argValidator.validate("subscribe", {
        publisherName,
        methodName,
        entrypointMethod,
      });

      publisher.subscribe(publisherName, methodName, entrypointMethod);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  unsubscribe(publisherName, methodName) {
    try {
      const { argValidator, publisher } = this.#helperClassInstances;
      argValidator.validate("unsubscribe", {
        publisherName,
        methodName,
      });

      publisher.unsubscribe(publisherName, methodName);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //----------------APIs----------------//

  //used to toggle the game board to hover over
  //view wise. This hover view is also used by
  //by the auto processing.
  toggleHoverView() {
    //logic for toggling board focus
    //should use a helper class to do so
  }

  //maps the ships placed in state on both
  //the players tables, which it does so by specific class identifiers on
  //the corresponding tiles according to each ship
  displayPlacedShips(player1ShipsPlaced, player2ShipsPlaced) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("displayPlacedShips", {
        player1ShipsPlaced,
        player2ShipsPlaced,
      });
      //logic for displaying made attacks
      //should use a helper class to do so
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //maps the attacks made in state on both
  //the players tables
  displayMadeAttacks(player1AttacksMade, player2AttacksMade) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("displayMadeAttacks", {
        player1AttacksMade,
        player2AttacksMade,
      });
      //logic for displaying made attacks
      //should use helper class to do so
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}
