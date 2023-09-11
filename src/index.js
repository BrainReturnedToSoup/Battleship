import { ArgumentValidation } from "./modules/LowLevelModules/Argument-Validation";
import { ErrorManager } from "./modules/LowLevelModules/Error-Manager";
import { Publisher } from "./modules/LowLevelModules/Publisher";

import lodash from "lodash";

const errorManager = new ErrorManager();

import { GameState } from "./modules/Game/GameState.js";

const gameState = new GameState();
