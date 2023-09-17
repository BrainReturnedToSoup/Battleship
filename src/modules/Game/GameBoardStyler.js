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

      this.#initPublishers();
      this.#linkHelpersToPublishers();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-------STATE-AND-CONFIG-DATA--------//

  #publisherReferences = {
    publisherName: "Game Style State",
    boardAutoStylerName: "Board Auto Styler",
  };

  #gameStatePublisherInstanceNames = [
    "Player 1 State",
    "Player 2 State",
    "Ship Placement State",
    "Match State",
    "Game State",
  ];

  #styleStatePublisherInstanceNames = [
    "Board Focus State",
    "Ships Placed Style State",
    "Attacks Made Style State",
  ];

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

    this.#stylerHelperClassInstances.boardAutoStyler = new BoardAutoStyler(
      availableApis,
      this
    );
  }

  #initPublishers() {
    const { publisher } = this.#helperClassInstances;

    for (let name of this.#styleStatePublisherInstanceNames) {
      publisher.addPublisherInstance(name);
    }
  }

  #linkHelpersToPublishers() {}

  //-----STYLING-STATE-DATA-PUB-SUB-----//

  #emitStyleState(publisherName, stateCopy) {
    const { publisher } = this.#helperClassInstances;

    publisher.emitData(publisherName, stateCopy);
  }

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

class DisplayShipPlacements {
  constructor(elementRefManager) {}
}

class DisplayMadeAttacks {
  constructor(elementRefManager) {}
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

      this.#stateData.stylingApis = stylingApis;
    } catch (error) {}
  }

  //----------STATE-AND-CONFIG-DATA-----------//

  #argumentValidationRules = {
    constructor: {},
  };

  #stateData = {
    parentClassScope: null,
    stylingApis: null,
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #gameBoardStyleState = null;

  //---------STATE-CONDITION-FILTERS----------//

  //--------RECEIVED-STATE-PROCESSORS---------//

  processGameBoardStyleState(gameBoardStyleStateCopy) {}

  processGameState(gameStateCopy) {}

  processBattleState(battleStateCopy) {}

  processShipPickingState(pickingStateCopy) {}

  processPlayer1State(player1StateCopy) {}

  processPlayer2State(player2StateCopy) {}
}
