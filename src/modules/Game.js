export class Game {
  constructor(elementRefManager) {}

  //---------GAME-EVENT-PUB-SUB---------//

  #emitGameStateEventToSubscribers(event) {}

  #subscribers = {};

  subscribe() {}

  unsubscribe() {}

  //----------------APIs----------------//

  pause() {
    //should disable either the player or bot from making changes to the game while paused
    //should also display some sort of paused indicator
  }

  resume() {
    //should enable the player or bot to make changes to the game
    //the indicator for being paused is removed
  }

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
