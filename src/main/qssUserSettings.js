/**
 * The morphic QuickStrip settings holder component
 *
 * Component that holds a model of all the user configurable settings of the
 * Morphic QuickStrip.
 *
 * Copyright 2020 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

/**
 * @module qssUserSettings
 * Responsible for creation and housekeeping of the connection to the websockets
 * settingsHandler.
 */
fluid.defaults("gpii.app.qssUserSettings", {
    gradeNames: ["fluid.modelComponent"],
    model: {
        scaleFactor: null,
        closeQssOnClickOutside: null
    },
    modelListeners: {
      "*": {
          funcName: "gpii.app.qssUserSettings.modelChanged",
          args: ["{that}", "{change}"],
          excludeSource: "init"
      }
    }
});

gpii.app.qssUserSettings.modelChanged = function (that, change) {
    console.log("# qssUserSettings model changed: ", change);
};
