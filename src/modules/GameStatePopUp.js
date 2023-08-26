export class GameStatePopUp {
  constructor(elementReferenceManager) {}

  //----------------APIs-----------------//

  //should return some type of behavior, potentially matching
  //text and popup styles for the given event
  playersTurn() {}

  playerWins() {}

  playerSunkAShip() {}

  botsTurn() {}

  botWins() {}

  botSunkAShip() {}

  //sort of an intermediary state between either the player or the bot making a move
  //will set the style to default
  moveMade() {}

  //an intermediary state, will show something like 'pick your ship placements'
  currentlyPickingShips() {}

  returnElementFrag() {}
}
