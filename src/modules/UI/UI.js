import { ArgumentValidation } from "../LowLevelModules/Argument-Validation";
import { ErrorManager } from "../LowLevelModules/Error-Manager";

import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager";

const errorManager = new ErrorManager();

//creates the HTML structure
export class UIConstructor {
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

  //----------STATE-AND-CONFIG-DATA-----------//

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

  #UIfragment = null;

  //--------------HELPER-METHODS--------------//

  #storeElementRef(refName, ref) {
    const { elementRefManager } = this.#helperClassInstances;

    elementRefManager.addRef(refName, ref);
  }

  //------------ELEMENT-TEMPLATES-------------//

  #elementTemplates = {
    mainContainer: `<div class="UI-Container UI Normal"></div>`,
    newGame: `<button class="New-Game UI Normal">New Game</button>`,
  };

  //-----------FRAGMENT-CONSTRUCTORS----------//

  #buildFragment() {
    const { mainContainer, newGame } = this.#fragmentPortionBuilders;

    const mainContainerElement = mainContainer(),
      newGameButtonElement = newGame();

    mainContainerElement.append(newGameButtonElement);

    this.#UIfragment = mainContainerElement;
  }

  //ELEMENT REF TAGS = UI-Container, Pause-Toggle, New-Game

  #fragmentPortionBuilders = {
    mainContainer: () => {
      const { mainContainer } = this.#elementTemplates;

      const range = document.createRange(),
        frag = range.createContextualFragment(mainContainer),
        mainContainerElement = frag.firstElementChild;

      const mainIdentifier = Array.from(mainContainerElement.classList)[0];
      this.#storeElementRef(mainIdentifier, mainContainerElement);

      return mainContainerElement;
    },
    newGame: () => {
      const { newGame } = this.#elementTemplates;

      const range = document.createRange(),
        frag = range.createContextualFragment(newGame),
        newGameButtonElement = frag.firstElementChild;

      const mainIdentifier = Array.from(newGameButtonElement.classList)[0];
      this.#storeElementRef(mainIdentifier, newGameButtonElement);

      return newGameButtonElement;
    },
  };

  //------------------APIs--------------------//

  returnElementFrag() {
    return this.#UIfragment;
  }
}

//for styling the UI to reflect the current
//state of the game
export class UIStyler {
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

  //-----------STATE-AND-CONFIG-DATA----------//

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
    mainContainer: null,
    newGame: null,
  };

  //--------------HELPER-METHODS--------------//

  #retrieveElementRefs() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#neededElementRefs.mainContainer =
      elementRefManager.retrieveRef("UI-Container");

    this.#neededElementRefs.newGame = elementRefManager.retrieveRef("New-Game");
  }

  //---------------APPLY-STYLES---------------//

  #stateClassTags = {
    normal: "Normal",
    playersTurn: "Players-Turn",
    playerWins: "Player-Wins",
    botsTurn: "Bots-Turn",
    botWins: "Bot-Wins",
    currentlyPickingShips: "Currently-Picking-Ships",
  };

  #alterState = {
    mainContainer: (newStateTag) => {
      const { mainContainer } = this.#neededElementRefs,
        classList = mainContainer.classList,
        lastClass = classList[classList.length - 1];

      mainContainer.classList.remove(lastClass);
      mainContainer.classList.add(newStateTag);
    },
    newGame: (newStateTag) => {
      const { newGame } = this.#neededElementRefs,
        classList = newGame.classList,
        lastClass = classList[classList.length - 1];

      newGame.classList.remove(lastClass);
      newGame.classList.add(newStateTag);
    },
  };

  #applyState(newStateTag) {
    for (let element in this.#alterState) {
      this.#alterState[element](newStateTag);
    }
  }

  //-------------------APIs-------------------//

  //for updating the background style to match the corresponding gamestate
  playersTurn() {
    const { playersTurn } = this.#stateClassTags;

    this.#applyState(playersTurn);
  }

  playerWins() {
    const { playerWins } = this.#stateClassTags;

    this.#applyState(playerWins);
  }

  playerSunkAShip() {
    const { normal } = this.#stateClassTags;

    this.#applyState(normal);
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
    const { normal } = this.#stateClassTags;

    this.#applyState(normal);
  }

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {
    const { normal } = this.#stateClassTags;

    this.#applyState(normal);
  }

  //same thing, an intermediary state, most likely a default styling
  currentlyPickingShips() {
    const { normal } = this.#stateClassTags;

    this.#applyState(normal);
  }

  //essentially will reset all event based styling to default
  gameReset() {
    const { normal } = this.#stateClassTags;

    this.#applyState(normal);
  }
}

//mainly to emit events corresponding to the UI button pressed
export class UIFunctionality {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#retrieveElementRefs();

      this.#initEventListeners();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //----------STATE-AND-CONFIG-DATA-----------//

  #argumentValidationRules = {
    constructor: {
      elementRefManager: {
        instanceof: ElementRefManager,
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
    elementRefManager: null,
  };

  #neededElementRefs = {
    mainContainer: null,
    newGame: null,
  };

  //-------------HELPER-METHODS---------------//

  #retrieveElementRefs() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#neededElementRefs.mainContainer =
      elementRefManager.retrieveRef("UI-Container");

    this.#neededElementRefs.newGame = elementRefManager.retrieveRef("New-Game");
  }

  #initEventListeners() {
    const { mainContainer } = this.#neededElementRefs;

    mainContainer.addEventListener("click", (e) => {
      this.#buttonLogic(e);
    });
  }

  //---------------BUTTON-LOGIC----------------//

  #buttonEvents = {
    newGame: "NewGame",
  };

  #buttonLogic(clickEvent) {
    const { newGame } = this.#neededElementRefs;

    if (clickEvent.target === newGame) {
      this.#newGameClicked();
    }
  }

  #newGameClicked() {
    const { newGame } = this.#buttonEvents;

    this.#emitButtonActionEventToSubscribers(newGame);
  }

  //------------UI-ACTION-PUB-SUB-------------//

  #emitButtonActionEventToSubscribers(event) {
    try {
      if (Object.keys(this.#subscribers).length > 0) {
        for (let subscriber in this.#subscribers) {
          this.#subscribers[subscriber](event);
        }
      }
    } catch (error) {
      errorManager.normalThrow(error);
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
          `Failed to add subscriber to UIFunctionality button event publisher, the supplied method name appears to already exist as a subscriber, received '${methodName}'`
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
          `Failed to remove subscriber from UIFunctionality button event publisher, the supplied method name appears to not exist as a subscriber, received '${methodName}'`
        );
      }
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}

//main controller class that combines the previous helpers together into a cohesive unit
export class UI {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.argValidator.validate("constructor", {
        elementRefManager,
      });

      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#initHelperClassInstances();
      this.#linkControllerToHelperClassPublishers();
      this.#retrieveUIFragmennt();
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
    UIconstructor: null,
    UIfunctionality: null,
    UIstyler: null,
    elementRefManager: null,
  };

  #UIFrag = null;

  //------------HELPER-METHODS--------------//

  #initHelperClassInstances() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#helperClassInstances.UIconstructor = new UIConstructor(
      elementRefManager
    );
    this.#helperClassInstances.UIfunctionality = new UIFunctionality(
      elementRefManager
    );
    this.#helperClassInstances.UIstyler = new UIStyler(elementRefManager);
  }

  #linkControllerToHelperClassPublishers() {
    const { UIfunctionality } = this.#helperClassInstances,
      classScope = this;

    UIfunctionality.subscribe(
      "UIController",
      this.#emitButtonActionEventToSubscribers.bind(classScope)
    );
  }

  #retrieveUIFragmennt() {
    const { UIconstructor } = this.#helperClassInstances;

    this.#UIFrag = UIconstructor.returnElementFrag();
  }

  //-----------UI-ACTION-PUB-SUB------------//

  #emitButtonActionEventToSubscribers(event) {
    try {
      if (Object.keys(this.#subscribers).length > 0) {
        for (let subscriber in this.#subscribers) {
          this.#subscribers[subscriber](event);
        }
      }
    } catch (error) {
      errorManager.normalThrow(error);
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

  //-----------------APIs-------------------//

  //for updating the background style to match the corresponding gamestate
  playersTurn() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.playersTurn();
  }

  playerWins() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.playerWins();
  }

  playerSunkAShip() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.playerSunkAShip();
  }

  botsTurn() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.botsTurn();
  }

  botWins() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.botWins();
  }

  botSunkAShip() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.botSunkAShip();
  }

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {
    const { UIstyler } = this.#helperClassInstances;

    UIstyler.updateAfterMove();
  }

  //same thing, an intermediary state, most likely a default styling
  currentlyPickingShips() {
    const { UIstyler, UIfunctionality } = this.#helperClassInstances;

    UIstyler.currentlyPickingShips();
  }

  //essentially will reset all event based styling to default
  gameReset() {
    const { UIstyler, UIfunctionality } = this.#helperClassInstances;

    UIstyler.gameReset();
  }

  returnElementFrag() {
    return this.#UIFrag;
  }
}
