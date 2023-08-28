import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager";

import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";

const errorManager = new ErrorManager();

class GameStatePopUpConstructor {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#buildFragment();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //---------STATE-AND-CONFIG-DATA----------//

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

  #gameStatePopUpfragment = null;

  //--------------HELPER-METHODS--------------//

  #storeElementRef(refName, ref) {
    const { elementRefManager } = this.#helperClassInstances;

    elementRefManager.addRef(refName, ref);
  }

  //------------ELEMENT-TEMPLATES-------------//

  #elementTemplates = {
    gameStatePopUp: `<h3 class="Game-State-Pop-Up Normal"></h3>`,
  };

  //-----------FRAGMENT-CONSTRUCTORS----------//

  #buildFragment() {
    const { gameStatePopUp } = this.#elementTemplates;

    const range = document.createRange(),
      frag = range.createContextualFragment(gameStatePopUp),
      gameStatePopUpElement = frag.firstElementChild;

    const mainIdentifier = Array.from(gameStatePopUpElement.classList)[0];
    this.#storeElementRef(mainIdentifier, gameStatePopUpElement);

    this.#gameStatePopUpfragment = gameStatePopUpElement;
  }

  //-----------------APIs-------------------//

  returnElementFrag() {
    return this.#gameStatePopUpfragment;
  }
}

//should append the various classes in order to give
//room for css styling
class GameStatePopUpStyler {
  constructor(elementRefManager) {
    this.#helperClassInstances.argValidator.validate("constructor", {
      elementRefManager,
    });

    this.#helperClassInstances.elementRefManager = elementRefManager;

    this.#retrieveElementRefs();
    try {
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //---------STATE-AND-CONFIG-DATA----------//

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

  #neededElementRefs = {
    gameStatePopUp: null,
  };

  //------------HELPER-METHODS--------------//

  #retrieveElementRefs() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#neededElementRefs.gameStatePopUp =
      elementRefManager.retrieveRef("Game-State-Pop-Up");
  }

  #stateClassTags = {
    normal: "Normal",
    playersTurn: "Players-Turn",
    playerWins: "Player-Wins",
    botsTurn: "Bots-Turn",
    botWins: "Bot-Wins",
    currentlyPickingShips: "Currently-Picking-Ships",
  };

  #applyState(newStateTag) {
    const { gameStatePopUp } = this.#neededElementRefs;

    const classList = gameStatePopUp.classList,
      lastClass = classList[classList.length - 1];

    gameStatePopUp.classList.remove(lastClass);
    gameStatePopUp.classList.add(newStateTag);
  }

  //-----------------APIs-------------------//

  //should return some type of behavior, potentially matching
  //text and popup styles for the given event
  playersTurn() {
    const { playersTurn } = this.#stateClassTags;

    this.#applyState(playersTurn);
  }

  playerWins() {
    const { playerWins } = this.#stateClassTags;

    this.#applyState(playerWins);
  }

  playerSunkAShip() {
    const { playerSunkAShip } = this.#stateClassTags;

    this.#applyState(playerSunkAShip);
  }

  botsTurn() {
    const { botsTurn } = this.#stateClassTags;

    this.#applyState(botsTurn);
  }

  botWins() {
    const { botWins } = this.#stateClassTags;

    this.#applyState(botWins);
  }

  botSunkAShip() {
    const { botSunkAShip } = this.#stateClassTags;

    this.#applyState(botSunkAShip);
  }

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {
    const { updateAfterMove } = this.#stateClassTags;

    this.#applyState(updateAfterMove);
  }

  //an intermediary state, will show something like 'pick your ship placements'
  currentlyPickingShips() {
    const { currentlyPickingShips } = this.#stateClassTags;

    this.#applyState(currentlyPickingShips);
  }

  //essentially will reset all event based styling to default
  gameReset() {
    const { gameReset } = this.#stateClassTags;

    this.#applyState(gameReset);
  }
}

//should apply the internal text to the pop up
//to reflect the game state
class GameStatePopUpTextContent {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#retrieveElementRefs();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //---------STATE-AND-CONFIG-DATA----------//

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

  #neededElementRefs = {
    gameStatePopUp: null,
  };

  //------------HELPER-METHODS--------------//

  #retrieveElementRefs() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#neededElementRefs.gameStatePopUp =
      elementRefManager.retrieveRef("Game-State-Pop-Up");
  }

  #stateText = {
    normal: "",
    playersTurn: "Your Turn",
    playerWins: "You Win!",
    playerSunkAShip: "You Sunk an Enemy Ship!",
    botsTurn: "AI is Picking...",
    botWins: "AI Wins",
    currentlyPickingShips: "Place you Ships! | Press R to Rotate",
  };

  #applyStateText(stateText) {
    const { gameStatePopUp } = this.#neededElementRefs;

    gameStatePopUp.textContent = stateText;
  }

  //-----------------APIs-------------------//

  //should return some type of behavior, potentially matching
  //text and popup styles for the given event
  playersTurn() {
    const { playersTurn } = this.#stateText;

    this.#applyStateText(playersTurn);
  }

  playerWins() {
    const { playerWins } = this.#stateText;

    this.#applyStateText(playerWins);
  }

  playerSunkAShip() {
    const { playerSunkAShip } = this.#stateText;

    this.#applyStateText(playerSunkAShip);
  }

  botsTurn() {
    const { botsTurn } = this.#stateText;

    this.#applyStateText(botsTurn);
  }

  botWins() {
    const { botWins } = this.#stateText;

    this.#applyStateText(botWins);
  }

  botSunkAShip() {
    const { normal } = this.#stateText;

    this.#applyStateText(normal);
  }

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {
    const { normal } = this.#stateText;

    this.#applyStateText(normal);
  }

  //an intermediary state, will show something like 'pick your ship placements'
  currentlyPickingShips() {
    const { currentlyPickingShips } = this.#stateText;

    this.#applyStateText(currentlyPickingShips);
  }

  //essentially will reset all event based styling to default
  gameReset() {
    const { normal } = this.#stateText;

    this.#applyStateText(normal);
  }
}

export class GameStatePopUp {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#initHelperClassInstances();

      this.#retrieveElementFrag();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //---------STATE-AND-CONFIG-DATA-------//

  #argumentValidationRules = {
    constructor: {
      elementRefManager: {
        instanceof: ElementRefManager,
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
    gameStatePopUpConstructor: null,
    gameStatePopUpStyler: null,
    gameStatePopUpTextContent: null,
    elementRefManager: null,
  };

  #gameStatePopUpFragment = null;

  //------------HELPER-METHODS-----------//

  #initHelperClassInstances() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#helperClassInstances.gameStatePopUpConstructor =
      new GameStatePopUpConstructor(elementRefManager);

    this.#helperClassInstances.gameStatePopUpStyler = new GameStatePopUpStyler(
      elementRefManager
    );

    this.#helperClassInstances.gameStatePopUpTextContent =
      new GameStatePopUpTextContent(elementRefManager);
  }

  #retrieveElementFrag() {
    const { gameStatePopUpConstructor } = this.#helperClassInstances;

    this.#gameStatePopUpFragment =
      gameStatePopUpConstructor.returnElementFrag();
  }

  //----------------APIs-----------------//

  //should return some type of behavior, potentially matching
  //text and popup styles for the given event
  playersTurn() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.playersTurn();
    gameStatePopUpTextContent.playersTurn();
  }

  playerWins() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.playerWins();
    gameStatePopUpTextContent.playerWins();
  }

  playerSunkAShip() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.playerSunkAShip();
    gameStatePopUpTextContent.playerSunkAShip();
  }

  botsTurn() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.botsTurn();
    gameStatePopUpTextContent.botsTurn();
  }

  botWins() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.botWins();
    gameStatePopUpTextContent.botWins();
  }

  botSunkAShip() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.botSunkAShip();
    gameStatePopUpTextContent.botSunkAShip();
  }

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.updateAfterMove();
    gameStatePopUpTextContent.updateAfterMove();
  }

  //an intermediary state, will show something like 'pick your ship placements'
  currentlyPickingShips() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.currentlyPickingShips();
    gameStatePopUpTextContent.currentlyPickingShips();
  }

  //essentially will reset all event based styling to default
  gameReset() {
    const { gameStatePopUpStyler, gameStatePopUpTextContent } =
      this.#helperClassInstances;

    gameStatePopUpStyler.gameReset();
    gameStatePopUpTextContent.gameReset();
  }

  returnElementFrag() {
    return this.#gameStatePopUpFragment;
  }
}
