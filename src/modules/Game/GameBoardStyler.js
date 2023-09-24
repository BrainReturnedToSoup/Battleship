import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { Publisher } from "../LowLevelModules/Publisher";
import { ErrorManager } from "../LowLevelModules/Error-Manager";
import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager";

import lodash from "lodash";

const errorManager = new ErrorManager();

class PlayerEnums {
  #playerConstants = {
    PLAYER_1: "player1",
    PLAYER_2: "player2",
  };

  #gridConstants = {
    ELEMENT_TAG_PREFIX: "Tile-",
  };

  getPlayerConstants() {
    return lodash.cloneDeep(this.#playerConstants);
  }

  getGridConstants() {
    return lodash.cloneDeep(this.#gridConstants);
  }
}

const playerEnums = new PlayerEnums();

//*****************STYLER-LOGIC*******************/

class StyleBoardFocus {
  constructor(elementRefManager) {}
}

class DisplayMadeAttacks {
  constructor(elementRefManager) {}
}

class DisplayShipPlacements {
  constructor(elementRefManager) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("constructor", { elementRefManager });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#getPlayerConstants();

      this.#initStateDataStructures();

      this.#retrievePlayerRefs();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //------STATE-AND-CONFIG-DATA------//

  //derived from enums
  #playerConstants = null;

  #argumentValidationRules = {};

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    elementRefManager: null,
  };

  // player1: {},
  // player2: {},
  #retrievedElementRefs = {};

  // newPlayerShipGrid: {
  //   player1: false,
  //   player2: false,
  // },
  #stateData = {};

  //player1: false,
  //player2: false,
  #playerShipGrids = {};

  #instructionsValidProperties = {
    action: [`Remove`, `Update`],
  };

  #validTypes = ["object", "boolean", "null"];

  //---------HELPER-METHODS-----------//

  #getPlayerConstants() {
    this.#playerConstants = playerEnums.getPlayerConstants();
  }

  #initStateDataStructures() {
    for (let method of this.#initDataStructureHelperMethods) {
      method();
    }
  }

  #initDataStructureHelperMethods = {
    retrievedElementRefs: () => {
      const { PLAYER_1, PLAYER_2 } = this.#playerConstants;

      this.#initKeyValueStruct(
        this.#retrievedElementRefs,
        PLAYER_1,
        this.#validTypes[0]
      );

      this.#initKeyValueStruct(
        this.#retrievedElementRefs,
        PLAYER_2,
        this.#validTypes[0]
      );
    },
    playerShipGrids: () => {
      const { PLAYER_1, PLAYER_2 } = this.#playerConstants;

      this.#initKeyValueStruct(
        this.#playerShipGrids,
        PLAYER_1,
        this.#validTypes[2]
      );

      this.#initKeyValueStruct(
        this.#playerShipGrids,
        PLAYER_2,
        this.#validTypes[2]
      );
    },
    stateData: () => {
      const { PLAYER_1, PLAYER_2 } = this.#playerConstants;

      this.#initKeyValueStruct(
        this.#stateData,
        "newPlayerShipGrid",
        this.#validTypes[0]
      );

      this.#initKeyValueStruct(
        this.#stateData.newPlayerShipGrid,
        PLAYER_1,
        this.#validTypes[1]
      );

      this.#initKeyValueStruct(
        this.#stateData.newPlayerShipGrid,
        PLAYER_2,
        this.#validTypes[1]
      );
    },
  };

  #initKeyValueStruct(targetObj, key, dataType) {
    if (dataType === "object") {
      targetObj[key] = new Object();
    } else if (dataType === "boolean") {
      targetObj[key] = false;
    } else if (dataType === "null") {
      targetObj[key] = null;
    }
  }

  #retrievePlayerRefs() {
    //should retrieve the grid square references
    //for both player 1 and player 2
  }

  //creates a tile number string --> `Tile-${tileNum}`
  #createTileTag(tileNum) {}

  #updateNewGridFlags(gridsThatWereUpdated) {
    for (let player in gridsThatWereUpdated) {
      if (gridsThatWereUpdated[player]) {
        this.#stateData.newPlayerShipGrid[player] = false;
      }
    }
  }

  //-----STYLE-APPLYING-METHODS------//

  #determinePlayersToUpdate(updateRule) {
    const { PLAYER_1, PLAYER_2 } = this.#playerConstants;

    const playersToUpdate = {};
    playersToUpdate[PLAYER_1] = false;
    playersToUpdate[PLAYER_2] = false;

    if (updateRule === PLAYER_1 || updateRule === "All") {
      playersToUpdate[PLAYER_1] = true;
    }

    if (updateRule === PLAYER_2 || updateRule === "All") {
      playersToUpdate[PLAYER_2] = true;
    }

    return playersToUpdate;
  }

  #scanForShipTag(element, gridTileVal) {
    //needs to return an object with the 'action' property that dictates the encompassing
    //action to do on the specific element. Uses the gridTileVal in order to decide whether
    //the element should be altered with class tag wise
    const instructions = {
      action: null,
      tagFound: null,
    };
  }

  #removeShipTag(element, tagFound) {
    //uses the supplied instructions in order to remove the corresponding
    //class tag for a ship placement. The instructions should already include
    //the class tag alias exactly, as well as the index it exists at within
    //the class list
  }

  #addShipTag(element, shipNum) {
    //adds a ship tag using the ship number to create the tag, and then add
    //said tag to the class list of the element
  }

  #updatePlayerShipTag(playerName, gridTileNum, matrixCoordVal) {
    //gridTileVal is the value on the logical matrix, not the DOM tiles

    const playerTileElement = this.#retrievedElementRefs[playerName](
      this.#createTileTag(gridTileNum)
    );

    const instructions = this.#scanForShipTag(
      playerTileElement,
      matrixCoordVal
    );

    if (
      //remove
      instructions.action === this.#instructionsValidProperties.action[0] ||
      instructions.action === this.#instructionsValidProperties.action[1]
      //update
    ) {
      this.#removeShipTag(playerTileElement, instructions.tagFound);
    }

    if (
      //update
      instructions.action === this.#instructionsValidProperties.action[1]
    ) {
      this.#addShipTag(playerTileElement, matrixCoordVal);
    }
  }

  #updateGridShipTags(updateRule) {
    //should iterate over both matrices containing the placements
    //at the same time in which it will remove all ship tag references
    //and apply the right ship tag references if the current grid tile logically
    //is for a specific ship
    const { PLAYER_1, PLAYER_2 } = this.#playerConstants;

    const playerGrid = this.#playerShipGrids[PLAYER_1],
      numOfRows = playerGrid.length,
      numOfCols = playerGrid[0].length;

    const gridsToUpdate = this.#determinePlayersToUpdate(updateRule);

    for (let r = 0; r < numOfRows; r++) {
      for (let c = 0; c < numOfCols; c++) {
        //iterates over the player grid matrix from top left
        //to bottom right

        //calculate the current grid tile number using the iterator index values
        const gridTileNum = r * 10 + c;

        if (gridsToUpdate[PLAYER_1]) {
          //pull the corresponding logical matrix coordinate value
          const matrixCoordVal = this.#playerShipGrids[PLAYER_1][r][c];

          this.#updatePlayerShipTag(PLAYER_1, gridTileNum, matrixCoordVal);
        }

        if (gridsToUpdate[PLAYER_2]) {
          const matrixCoordVal = this.#playerShipGrids[PLAYER_2][r][c];

          this.#updatePlayerShipTag(PLAYER_2, gridTileNum, matrixCoordVal);
        }
      }
    }

    //will be used to update the corresponding new grid flags
    return gridsToUpdate;
  }

  //------------APIs-----------------//

  //should take the currently saved ship placements
  //in state, and apply the necessary class tags to the necessary
  //grid square

  displayPlayerPlacedShips(updateRule) {
    //a visual update for the corresponding player will commence only
    //if a new player ship grid reference was supplied before hand
    try {
      const { PLAYER_1, PLAYER_2 } = this.#playerConstants;

      const player1NewGrid = this.#stateData.newPlayerShipGrid[PLAYER_1],
        player2NewGrid = this.#stateData.newPlayerShipGrid[PLAYER_2];

      //only considers updating the DOM if atleast one flag has been check in terms
      //of a new player grid
      if (player1NewGrid || player2NewGrid) {
        const { argValidator } = this.#helperClassInstances;
        argValidator.validate("displayPlayerPlacedShips", { updateRule });

        const gridsUpdated = this.#updateGridShipTags(updateRule);
        this.#updateNewGridFlags(gridsUpdated);
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
