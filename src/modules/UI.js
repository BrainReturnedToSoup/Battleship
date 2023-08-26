export class UI {
  constructor(elementRefManager) {}

  //-----------UI-ACTION-PUB-SUB------------//

  #emitButtonActionEventToSubscribers(event) {}

  #subscribers = {};

  subscribe(methodName, subscriberMethod) {}

  unsubscribe(methodName) {}

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
