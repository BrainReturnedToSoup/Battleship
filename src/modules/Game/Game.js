import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";

import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager";

const errorManager = new ErrorManager();

//USE WORMS ARMAGEDDON THEME SONG FOR GAME THEME

//constructs the entire game board for both sides, should
//be overlapping elements, in which the back layer is
//a back drop of the ocean, and the front layer is
//the actual game board coordinates, thus a total of four layers

//Each board is a 10*10
export class GameBoardContructor {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#buildCompleteBattleBoardFragment();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //-------STATE-AND-CONFIG-DATA--------//

  #argumentValidationRules = {
    constructor: {
      elementRefManager: {
        instanceof: ElementRefManager,
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    elementRefManager: null,
  };

  #numOfGridCellsPerBoard = 100;

  #completeBattleBoardFrag = null;

  //-----------HELPER-METHODS-----------//

  #storeElementRef(refName, ref) {
    const { elementRefManager } = this.#helperClassInstances;

    elementRefManager.addRef(refName, ref);
  }

  //---------ELEMENT-TEMPLATES----------//

  #elementTemplates = {
    gameContainer: `<main class="Game-Container"></main>`,
    playerBoard: {
      One: `<div class="Player-One-Board></div>`,
      Two: `<div class="Player-Two-Board></div>`,
    },
    playerGrid: {
      One: `<div class="Player-One-Grid"></div>`,
      Two: `<div class="Player-Two-Grid"></div>`,
    },
    gridCell: `<div class="Grid-Cell"></div>`,
  };

  //-------FRAGMENT-CONSTRUCTION--------//

  #buildCompleteBattleBoardFragment() {
    const { gameContainer } = this.#elementTemplates;

    const range = document.createRange(),
      frag = range.createContextualFragment(gameContainer),
      mainContainerElement = frag.firstElementChild;

    const mainIdentifier = Array.from(mainContainerElement.classList)[0];
    this.#storeElementRef(mainIdentifier, mainContainerElement);

    //***********************************//

    const playerOneBoard = this.#buildPlayerBoard("One"),
      playerTwoBoard = this.#buildPlayerBoard("Two");

    mainContainerElement.appendChild(playerOneBoard);
    mainContainerElement.appendChild(playerTwoBoard);

    this.#completeBattleBoardFrag = mainContainerElement;
  }

  #buildPlayerBoard(playerNum) {
    const playerBoardTemplateString =
      this.#elementTemplates.playerBoard[playerNum];

    const range = document.createRange(),
      frag = range.createContextualFragment(playerBoardTemplateString),
      playerBoardElement = frag.firstElementChild;

    const mainIdentifier = Array.from(playerBoardElement.classList)[0];
    this.#storeElementRef(mainIdentifier, playerBoardElement);

    //***********************************//

    const playerGridElement = this.#buildPlayerGrid(playerNum);

    playerBoardElement.appendChild(playerGridElement);

    return playerBoardElement;
  }

  #buildPlayerGrid(playerNum) {
    const playerGridTemplateString =
      this.#elementTemplates.playerGrid[playerNum];

    const range = document.createRange(),
      frag = range.createContextualFragment(playerGridTemplateString),
      playerGridElement = frag.firstElementChild;

    const mainIdentifier = Array.from(playerGridElement.classList)[0];
    this.#storeElementRef(mainIdentifier, playerGridElement);

    //***********************************//

    for (let i = 0; i < this.#numOfGridCellsPerBoard; i++) {
      const gridSquare = this.#buildGridSquare(playerNum, i);

      playerGridElement.appendChild(gridSquare);
    }

    return playerGridElement;
  }

  #buildGridSquare(playerNum, gridNum) {
    const { gridCell } = this.#elementTemplates;

    const range = document.createRange(),
      frag = range.createContextualFragment(gridCell),
      gridCellElement = frag.firstElementChild;

    gridCellElement.classList.add(gridNum);
    gridCellElement.classList.add(`Player-${playerNum}`);

    const mainIdentifier = `${
      Array.from(gridCellElement.classList)[0]
    }-${gridNum}-Player-${playerNum}`;

    this.#storeElementRef(mainIdentifier, gridCellElement);

    return gridCellElement;
  }

  //reference manager identifiers:
  //'Game-Container'
  //'Player-One-Board'
  //'Player-Two-Board'
  //'Player-One-Grid'
  //'Player-Two-Grid'
  //'Grid-Square-${num}-Player-${playerNum}'

  //----------------APIs----------------//

  returnElementFrag() {
    return this.#completeBattleBoardFrag;
  }
}

//deals with all styling with the game boards, both sides
//includes both auto processing and manual overrides when it comes to
//styling. The auto processing uses received game states in order to reflect
//stylings. Some manual overrides for styling exists, but they will be used by other
//parts of the application to use.


//deals with the functionality of interacting with the actual game by emitting square clicks
//should keep a tab on the state of the game regarding the current turn, who wins or losses,
//etc, so that the user for instance cannot click on the board unless it's their turn
class GameBoardFunctionality {}

//represents the entire game, should include all that is needed when it comes to facilitating
//the game, as well as the AI opponent as an instance that interacts with the game state
export class Game {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#initHelperClassInstances();

      //add logic for creating helper classes
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //--------STATE-AND-CONFIG-DATA-------//

  #argumentValidationRules = {
    constructor: {
      elementRefManager: {
        instanceof: ElementRefManager,
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    elementRefManager: null,
  };

  //-----------HELPER-METHODS-----------//

  #initHelperClassInstances() {}

  //---------GAME-EVENT-PUB-SUB---------//

  #emitGameStateEventToSubscribers(event) {
    if (Object.keys(this.#subscribers).length > 0) {
      for (let subscriber in this.#subscribers) {
        this.#subscribers[subscriber](event);
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

  //----------------APIs----------------//

  reset() {
    //should reset the main game state,
    //including the current board state, as well
    //as the data relating to the various ship placements
    //for both sides
  }

  pickShipPlacement() {
    //activates the state and screen for the player to pick the
    //spots for their ship
  }

  returnElementFrag() {}
}
