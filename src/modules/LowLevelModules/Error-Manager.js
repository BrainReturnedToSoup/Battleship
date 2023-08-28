import { ArgumentValidation } from "./Argument-Validation";

export class ErrorManager {
  constructor(endpointURL = null) {
    if (endpointURL !== null) {
      this.#helperClassInstances.argValidator.validate("constructor", {
        endpointURL,
      });

      this.#endpointURL = endpointURL;
    }
  }

  //---------STATE-AND-CONFIG-DATA----------//

  #argumentValidationRules = {
    constructor: {
      endpointURL: {
        type: "string",
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #endpointURL = null;

  #fetchConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: null, //put the error here
  };

  //-----------------APIs------------------//

  sendToAPI(error) {
    if (this.#endpointURL !== null) {
      const fetchConfig = this.#fetchConfig;

      fetchConfig.body = JSON.stringify({ error, errorStack: error.stack });

      fetch(this.#endpointURL, fetchConfig);
    } else {
      throw new TypeError(
        `Failed to send error instance to API endpoint, because the saved endpoint URL for this class instance is equal to null`
      );
    }
  }

  normalThrow(error) {
    console.error(error, error.stack);
  }
}
