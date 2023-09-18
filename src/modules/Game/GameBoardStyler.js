import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { Publisher } from "../LowLevelModules/Publisher";
import { ErrorManager } from "../LowLevelModules/Error-Manager";
import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager";

import lodash from "lodash";

const errorManager = new ErrorManager();

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
      this.#retrievePlayerRefs();
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

  #neededElementRefs = {
    player1: {},
    player2: {},
  };

  #stateData = {
    newPlayerShipGrid: {
      player1: false,
      player2: false,
    },
  };

  #playerShipGrids = {
    player1: null,
    player2: null,
  };

  #playerNames = {
    player1: "player1",
    player2: "player2",
  };

  #emptyGridSpace = 0;

  //---------HELPER-METHOD-----------//

  #retrievePlayerRefs() {
    //should retrieve the grid square references
    //for both player 1 and player 2
  }

  //-----STYLE-APPLYING-METHODS------//

  #scanForShipTag(element, gridTileVal) {
    //needs to return an object with the 'action' property that dictates the encompassing
    //action to do on the specific element. Uses the gridTileVal in order to decide whether
    //the element should be altered with class tag wise
  }

  #removeShipTag(element, instructions) {
    //uses the supplied instructions in order to remove the corresponding
    //class tag for a ship placement. The instructions should already include
    //the class tag alias exactly, as well as the index it exists at within
    //the class list
  }

  #addShipTag(element, shipNum) {
    //adds a ship tag using the ship number to create the tag, and then add
    //said tag to the class list of the element
  }

  #updateGridShipTags(playerName) {
    //should iterate over both matrices containing the placements
    //at the same time in which it will remove all ship tag references
    //and apply the right ship tag references if the current
    const playerGrid = this.#playerShipGrids[playerName],
      numOfRows = playerGrid.length,
      numOfCols = playerGrid[0].length;

    for (let r = 0; r < numOfRows; r++) {
      for (let c = 0; c < numOfCols; c++) {
        //iterates over the player grid matrix from top left
        //to bottom right

        //calculate the current grid tile number using the iterator index values
        const gridTileNum = r * 10 + c;

        //get the corresponding DOM grid tile, grid tile value within the state,
        //and the instructions on what to do to the DOM grid tile based on the returned
        //instructions from the element scan
        const corresDomGridTile =
            this.#neededElementRefs[playerName][`Tile-${gridTileNum}`],
          gridTileVal = playerGrid[r][c],
          scanInstructions = this.#scanForShipTag(
            corresDomGridTile,
            gridTileVal
          );

        //will remove the ship tag either on a remove or update
        if (
          scanInstructions.action === "Remove" ||
          scanInstructions.action === "Update"
        ) {
          this.#removeShipTag(corresDomGridTile, scanInstructions);
        }

        //will add the ship tag only on an update
        if (scanInstructions.action === "Update") {
          this.#addShipTag(corresDomGridTile, gridTileVal);
        }
      }
    }
  }

  //------------APIs-----------------//

  //should take the currently saved ship placements
  //in state, and apply the necessary class tags to the necessary
  //grid square

  displayPlayerPlacedShips(playerName) {
    //a visual update for the corresponding player will commence only
    //if a new player ship grid reference was supplied before hand
    try {
      if (this.#stateData.newPlayerShipGrid[playerName]) {
        const { argValidator } = this.#helperClassInstances;
        argValidator.validate("displayPlayerPlacedShips", { playerName });

        this.#updateGridShipTags(playerName);
        this.#stateData.newPlayerShipGrid[playerName] = false;
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
