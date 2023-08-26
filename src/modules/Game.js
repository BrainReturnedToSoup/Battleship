export class Game {
  constructor(elementRefManager) {}

  //---------GAME-EVENT-PUB-SUB---------//

  #emitGameStateEventToSubscribers(event) {}

  #subscribers = {};

  subscribe() {}

  unsubscribe() {}

  //----------------APIs----------------//

  reset() {
    //should reset the main game state,
    //including the current board state, as well
    //as the data relating to the various ship placements
    //for both sides
  }

  pickShipPlacement() {}

  returnElementFrag() {}
}
