import { UI } from "./UI/UI";
import { Game } from "./Game/Game";
import { GameStatePopUp } from "./GameStatePopUp/GameStatePopUp";

import { ElementRefManager } from "./LowLevelModules/Element-Ref-Manager";
import { ErrorManager } from "./LowLevelModules/Error-Manager";

const errorManager = new ErrorManager();

class Battleship {
  constructor() {
    try {
      this.#initHelperClassInstances();

      this.#linkControllerToHelperClassPublishers();

      this.#createGameInstance();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  //--------STATE-AND-CONFIG-DATA--------//

  #helperClassInstances = {
    game: null,
    ui: null,
    gameStatePopUp: null,
    elementReferenceManager: null,
  };

  #gameInstance = null;

  //------------HELPER-METHODS-----------//

  #initHelperClassInstances() {
    this.#helperClassInstances.elementReferenceManager =
      new ElementRefManager();

    const { elementReferenceManager } = this.#helperClassInstances;
    this.#helperClassInstances.game = new Game(elementReferenceManager);
    this.#helperClassInstances.ui = new UI(elementReferenceManager);
    this.#helperClassInstances.gameStatePopUp = new GameStatePopUp(
      elementReferenceManager
    );
  }

  #linkControllerToHelperClassPublishers() {
    const { ui, game } = this.#helperClassInstances,
      classScope = this;

    ui.subscribe("MainController", this.#listenForUIActions.bind(classScope));

    game.subscribe("MainController", this.#listenForGameState.bind(classScope));
  }

  #createGameInstance() {
    const mainContainer = document.createElement("main"),
      { game, ui, gameStatePopUp } = this.#helperClassInstances;

    const gameFrag = game.returnElementFrag(),
      uiFrag = ui.returnElementFrag(),
      gameStatePopUpFrag = gameStatePopUp.returnElementFrag();

    mainContainer.append(gameFrag);
    mainContainer.append(uiFrag);
    mainContainer.append(gameStatePopUpFrag);

    this.#gameInstance = mainContainer;

    document.body.append(this.#gameInstance);
  }

  //-----------OBSERVER-BASED-FUNCTIONALITIES-----------//

  #listenForUIActions(action) {
    try {
      this.#validUIActions[action]();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  #validUIActions = {
    newGame: () => {
      this.newGame();
    },
  };

  #listenForGameState(event) {
    try {
      this.#validGameStateEvents[event]();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  #validGameStateEvents = {
    //used to activate different displays
    //due to the current game state
    //using the game state pop up instance and UI in some way

    //********************MID*GAME*EVENTS********************//

    playerWins: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.playerWins();
      gameStatePopUp.playerWins();
    },
    playerSunkAShip: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.playerSunkAShip();
      gameStatePopUp.playerSunkAShip();
    },
    playersTurn: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.playersTurn();
      gameStatePopUp.playersTurn();
    },

    //*******************************************************//

    botWins: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.botWins();
      gameStatePopUp.botWins();
    },
    botSunkAShip: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.botSunkAShip();
      gameStatePopUp.botSunkAShip();
    },
    botsTurn: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.botsTurn();
      gameStatePopUp.botsTurn();
    },

    //******************GENERAL*GAME*EVENTS*****************//

    inBetweenMoves: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.updateAfterMove();
      gameStatePopUp.updateAfterMove();
    },

    currentlyPickingShips: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.currentlyPickingShips();
      gameStatePopUp.currentlyPickingShips();
    },

    gameReset: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.gameReset();
      gameStatePopUp.gameReset();
    },
  };

  //-----------------APIs----------------//

  newGame() {
    try {
      const { game } = this.#helperClassInstances;

      //resets the game state and activates the screen to pick ship placements
      game.reset();
      game.pickShipPlacement();
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}
