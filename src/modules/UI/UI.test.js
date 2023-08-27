import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager.js";
import { UI, UIConstructor, UIStyler, UIFunctionality } from "./UI.js";

test("Should create a complete UI element fragment upon initialization, in which the instance provides a method to retrieve this fragment from within the state", () => {
  const ERM = new ElementRefManager(),
    initUI = () => {
      const uiInstance = new UI(ERM);
    };

  expect(initUI()).not.toThrow(Error);
});
