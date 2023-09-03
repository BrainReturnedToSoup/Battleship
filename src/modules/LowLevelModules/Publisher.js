import { ArgumentValidation } from "./Argument-Validation";
import { ErrorManager } from "./Error-Manager";

const errorManager = new ErrorManager();

export class Publisher {
  //------STATE-AND-CONFIG-DATA------//

  #argumentValidationRules = {
    addPublisherInstance: {
      publisherInstanceName: {
        type: "string",
      },
    },
    removePublisherInstance: {
      publisherInstanceName: {
        type: "string",
      },
    },
    emitData: {
      publisherInstanceName: {
        type: "string",
      },
    },
    subscribe: {
      publisherInstanceName: {
        type: "string",
      },
      methodName: {
        type: "string",
      },
      entrypointMethod: {
        type: "function",
      },
    },
    unsubscribe: {
      publisherInstanceName: {
        type: "string",
      },
      methodName: {
        type: "string",
      },
    },
  };

  #helperClassInstances = {
    argValidator: new ArgumentValidation(this.#argumentValidationRules),
  };

  #publisherInstances = {};

  //----------HELPER-METHODS---------//

  #addSubscriber(publisherInstanceName, methodName, entrypointMethod) {
    if (!(publisherInstanceName in this.#publisherInstances)) {
      throw new ReferenceError("");
    }

    if (methodName in this.#publisherInstances[publisherInstanceName]) {
      throw new ReferenceError(``);
    }

    this.#publisherInstances[publisherInstanceName][methodName] =
      entrypointMethod;
  }

  #removeSubscriber(publisherInstanceName, methodName) {
    if (!(publisherInstanceName in this.#publisherInstances)) {
      throw new ReferenceError(``);
    }

    if (!(methodName in this.#publisherInstances[publisherInstanceName])) {
      throw new ReferenceError(``);
    }

    delete this.#publisherInstances[publisherInstanceName][methodName];
  }

  #emitToSubscribers(publisherInstanceName, data) {
    if (!(publisherInstanceName in this.#publisherInstances)) {
      throw new ReferenceError("");
    }

    if (
      Object.keys(this.#publisherInstances[publisherInstanceName]).length > 0
    ) {
      for (let subscriber in this.#publisherInstances[publisherInstanceName]) {
        this.#publisherInstances[publisherInstanceName][subscriber](data);
      }
    }
  }

  #addPublisherInstanceProperty(publisherInstanceName) {
    if (publisherInstanceName in this.#publisherInstances) {
      throw new ReferenceError("");
    }

    this.#publisherInstances[publisherInstanceName] = new Object();
  }

  #removePublisherInstanceProperty(publisherInstanceName) {
    if (!(publisherInstanceName in this.#publisherInstances)) {
      throw new ReferenceError("");
    }

    delete this.#publisherInstances[publisherInstanceName];
  }

  //---------------APIs--------------//

  addPublisherInstance(publisherInstanceName) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("addPublisherInstance", { publisherInstanceName });

      this.#addPublisherInstanceProperty(publisherInstanceName);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  removePublisherInstance(publisherInstanceName) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("removePublisherInstance", {
        publisherInstanceName,
      });

      this.#removePublisherInstanceProperty(publisherInstanceName);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  emitData(publisherInstanceName, data) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("emitData", { publisherInstanceName });

      this.#emitToSubscribers(publisherInstanceName, data);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  subscribe(publisherInstanceName, methodName, entrypointMethod) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("subscribe", {
        publisherInstanceName,
        methodName,
        entrypointMethod,
      });

      this.#addSubscriber(publisherInstanceName, methodName, entrypointMethod);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }

  unsubscribe(publisherInstanceName, methodName) {
    try {
      const { argValidator } = this.#helperClassInstances;
      argValidator.validate("unsubscribe", {
        publisherInstanceName,
        methodName,
      });

      this.#removeSubscriber(publisherInstanceName, methodName);
    } catch (error) {
      errorManager.normalThrow(error);
    }
  }
}
