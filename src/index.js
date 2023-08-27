import { UI } from "./modules/UI/UI";
import { ElementRefManager } from "./modules/LowLevelModules/Element-Ref-Manager";

const ERM = new ElementRefManager(),
  UIinstance = new UI(ERM),
  UIfrag = UIinstance.returnElementFrag();

UIinstance.gameReset();

document.body.append(UIfrag);
