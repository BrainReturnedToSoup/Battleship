export class UI {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#initHelperClassInstances();

      this.#linkControllerToHelperClassPublishers();
    } catch (error) {
      //ADD ERROR HANDLING METHOD HERE
    }
  }

  //---------STATE-AND-CONFIG-DATA----------//

  #helperClassInstances = {
    UIconstructor: null,
    UIfunctionality: null,
    UIstyler: null,
    elementRefManager: null,
  };

  #currentGameState = null;

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
      this.#emitButtonActionEventToSubscribers.bind(classScope)
    );
  }

  //-----------UI-ACTION-PUB-SUB------------//

  #emitButtonActionEventToSubscribers(event) {}

  #subscribers = {};

  subscribe(methodName, subscriberMethod) {
    try {
    } catch (error) {
      //ADD ERROR HANDLING METHOD HERE
    }
  }

  unsubscribe(methodName) {
    try {
    } catch (error) {
      //ADD ERROR HANDLING METHOD HERE
    }
  }

  //-----------------APIs-------------------//

  //for updating the background style to match the corresponding gamestate
  playersTurn() {}

  playerWins() {}

  playerSunkAShip() {}

  botsTurn() {}

  botWins() {}

  botSunkAShip() {}

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {}

  //same thing, an intermediary state, most likely a default styling
  currentlyPickingShips() {}

  //essentially will reset all event based styling to default
  gameReset() {}

  returnElementFrag() {}
}

//creates the HTML structure
export class UIConstructor {
  constructor(elementRefManager) {
    try {
      this.#helperClassInstance.elementRefManager = elementRefManager;

      this.#buildFragment();
    } catch (error) {
      //ADD ERROR HANDLING METHOD HERE
    }
  }

  //----------STATE-AND-CONFIG-DATA-----------//

  #helperClassInstance = {
    elementRefManager: null,
  };

  #UIfragment = null;

  //--------------HELPER-METHODS--------------//

  #storeElementRef(refName, ref) {
    const { elementRefManager } = this.#helperClassInstance;

    elementRefManager.addRef(refName, ref);
  }

  //------------ELEMENT-TEMPLATES-------------//

  #elementTemplates = {
    mainContainer: `<div class="UI-Container UI"></div>`,
    pauseToggle: `<button class="Pause-Toggle UI"></button>`,
    newGame: `<button class="New-Game UI"></button>`,
  };

  //-----------FRAGMENT-CONSTRUCTORS----------//

  #buildFragment() {
    const { mainContainer, pauseToggle, newGame } =
      this.#fragmentPortionBuilders;

    const mainContainerElement = mainContainer(),
      pauseToggleButtonElement = pauseToggle(),
      newGameButtonElement = newGame();

    mainContainerElement.append(pauseToggleButtonElement);
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
    pauseToggle: () => {
      const { pauseToggle } = this.#elementTemplates;

      const range = document.createRange(),
        frag = range.createContextualFragment(pauseToggle),
        pauseToggleButtonElement = frag.firstElementChild;

      const mainIdentifier = Array.from(pauseToggleButtonElement.classList)[0];
      this.#storeElementRef(mainIdentifier, pauseToggleButtonElement);

      return pauseToggleButtonElement;
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
      this.#helperClassInstances.elementRefManager = elementRefManager;

      this.#retrieveStoredElementRefs();
    } catch (error) {
      //ADD ERROR HANDLING LOGIC HERE
    }
  }

  //-----------STATE-AND-CONFIG-DATA----------//

  #helperClassInstances = {
    elementRefManager: null,
  };

  #neededElementRefs = {
    mainContainer: null,
    pauseToggle: null,
    newGame: null,
  };

  //--------------HELPER-METHODS--------------//

  #retrieveStoredElementRefs() {
    const { elementRefManager } = this.#helperClassInstances;

    this.#neededElementRefs.mainContainer =
      elementRefManager.retrieveRef("UI-Container");

    this.#neededElementRefs.pauseToggle =
      elementRefManager.retrieveRef("Pause-Toggle");

    this.#neededElementRefs.newGame = elementRefManager.retrieveRef("New-Game");
  }

  //---------------APPLY-STYLES---------------//

  #normal = {
    mainContainer: () => {},
    pauseToggle: () => {},
    newGame: () => {},
  };

  #playersTurn = {
    mainContainer: () => {},
  };

  #botsTurn = {
    mainContainer: () => {},
  };

  #playerWins = {
    mainContainer: () => {},
    pauseToggle: () => {},
    newGame: () => {},
  };

  #botWins = {
    mainContainer: () => {},
    pauseToggle: () => {},
    newGame: () => {},
  };

  //-------------------APIs-------------------//

  //for updating the background style to match the corresponding gamestate
  playersTurn() {}

  playerWins() {}

  playerSunkAShip() {}

  botsTurn() {}

  botWins() {}

  botSunkAShip() {}

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  updateAfterMove() {}

  //same thing, an intermediary state, most likely a default styling
  currentlyPickingShips() {}

  //essentially will reset all event based styling to default
  gameReset() {}
}

//mainly to emit events corresponding to the UI button pressed
export class UIFunctionality {
  constructor(elementRefManager) {}

  //----------STATE-AND-CONFIG-DATA-----------//

  //-------------HELPER-METHODS---------------//

  //------------UI-ACTION-PUB-SUB-------------//

  #emitButtonActionEventToSubscribers(event) {}

  #subscribers = {};

  subscribe(methodName, subscriberMethod) {
    try {
    } catch (error) {
      //ADD ERROR HANDLING METHOD HERE
    }
  }

  unsubscribe(methodName) {
    try {
    } catch (error) {
      //ADD ERROR HANDLING METHOD HERE
    }
  }
}
