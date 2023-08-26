import { UI } from "./UI";
import { Game } from "./Game";
import { GameStatePopUp } from "./GameStatePopUp";

import { ElementRefManager } from "./LowLevelModules/Element-Ref-Manager";

class Battleship {
  constructor() {
    this.#initHelperClassInstances();

    this.#linkControllerToHelperClassPublishers();

    this.#createGameInstance();
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

  #listenForUIActions(action) {
    this.#validUIActions[action]();
  }

  #validUIActions = {
    pause: () => {
      this.pauseCurrentGame();
    },
    unpause: () => {
      this.resumeCurrentGame();
    },
    newGame: () => {
      this.newGame();
    },
  };

  #listenForGameState(event) {
    this.#validGameStateEvents[event]();
  }

  #validGameStateEvents = {
    //used to activate different displays
    //due to the current game state
    //using the game state pop up instance
    playerWins: () => {
      const { gameStatePopUp } = this.#helperClassInstances;

      gameStatePopUp.playerWins();
    },
    playerPicked: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.botsTurn();
      gameStatePopUp.botsTurn();
    },
    playerSunkAShip: () => {
      const { gameStatePopUp } = this.#helperClassInstances;

      gameStatePopUp.playerSunkAShip();
    },

    //*********************************************************//

    botWins: () => {
      const { gameStatePopUp } = this.#helperClassInstances;

      gameStatePopUp.botWins();
    },
    botPicked: () => {
      const { ui, gameStatePopUp } = this.#helperClassInstances;

      ui.playersTurn();
      gameStatePopUp.playersTurn();
    },
    botSunkAShip: () => {
      const { gameStatePopUp } = this.#helperClassInstances;

      gameStatePopUp.botSunkAShip();
    },
  };

  //-----------------APIs----------------//

  pauseCurrentGame() {
    const { game } = this.#helperClassInstances;

    game.pause();
  }

  resumeCurrentGame() {
    const { game } = this.#helperClassInstances;

    game.resume();
  }

  newGame() {
    const { game } = this.#helperClassInstances;

    game.reset();
    game.pickShipPlacement();
  }
}
