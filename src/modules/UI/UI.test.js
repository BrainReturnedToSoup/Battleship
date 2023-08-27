import { ElementRefManager } from "../LowLevelModules/Element-Ref-Manager.js";
import { UI, UIConstructor, UIStyler, UIFunctionality } from "./UI.js";

// const { JSDOM } = require("jsdom"); //need to have a DOM reference for this node environment in order to test front end modules
// const DOM = new JSDOM(""),
//   document = DOM.window.document,
//   Element = DOM.window.Element;
// //my element reference manager uses a reference to the Element instance,
// //which I need to create in order to reference it in a node environment

// global.document = document;

test("Should create a complete UI element fragment upon initialization, in which the instance provides a method to retrieve this fragment from within the state", () => {
  const ERM = new ElementRefManager(),
    UIC = new UIConstructor(ERM);

  console.log(UIC.returnElementFrag());

  expect(UIC.returnElementFrag()).not.toBeNull();
});
