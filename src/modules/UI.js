export class UI {
  constructor(elementRefManager) {}

  //-----------UI-ACTION-PUB-SUB------------//

  #emitEventToSubscribers(event) {}

  #subscribers = {};

  subscribe(methodName, subscriberMethod) {}

  unsubscribe(methodName) {}

  //-----------------APIs-------------------//

  //for updating the background style to match the game state in some way
  playersTurn() {}

  playerWins() {}

  botsTurn() {}

  botWins() {}

  returnElementFrag() {}
}
