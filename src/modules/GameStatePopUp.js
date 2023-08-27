export class GameStatePopUp {
  constructor(elementRefManager) {}

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
  updateAfterMove() {}

  //an intermediary state, will show something like 'pick your ship placements'
  currentlyPickingShips() {}

  //essentially will reset all event based styling to default
  gameReset() {}

  returnElementFrag() {}
}
