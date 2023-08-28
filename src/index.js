import { GameStatePopUp } from "./modules/GameStatePopUp/GameStatePopUp";
import { ElementRefManager } from "./modules/LowLevelModules/Element-Ref-Manager";

const ERM = new ElementRefManager(),
  GameStatePopUpInstance = new GameStatePopUp(ERM),
  GSPUIfrag = GameStatePopUpInstance.returnElementFrag();

GameStatePopUpInstance.currentlyPickingShips();

console.log(ERM);

document.body.append(GSPUIfrag);
