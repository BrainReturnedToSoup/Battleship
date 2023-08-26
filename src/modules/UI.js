export class UI {
  constructor(elementRefManager) {}

  //-----------UI-ACTION-PUB-SUB------------//

  #emitEventToSubscribers(event) {}

  #subscribers = {};

  subscribe(methodName, subscriberMethod) {}

  unsubscribe(methodName) {}

  //-----------------APIs-------------------//

  //for updating the background style to match the corresponding gamestate
  playersTurn() {}

  playerWins() {}

  botsTurn() {}

  botWins() {}

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  moveMade() {}

  //same thing, an intermediary state, most likely a default styling
  currentlyPickingShips() {}

  returnElementFrag() {}
}
