/**
 * The websockets settingsHandler connector
 *
 * Component that manages the connection with the GPII websockets settingsHandler.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
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
require("./common/utils.js");

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

/**
 * @module settingsHandlerConnector
 * Responsible for creation and housekeeping of the connection to the websockets
 * settingsHandler.
 */
fluid.defaults("gpii.app.settingsHandlerConnector", {
    gradeNames: ["gpii.app.ws", "fluid.modelComponent"],
    solutionId: "net.gpii.morphic",
    model: {
        "scaleFactor": null
    },
    listeners: {
        "onCreate.connect": "{that}.connect",
        "onConnected.setup": {
            func: "{that}.setup",
            priority: "after:connect"
        },
        "onMessageReceived.handleRawChannelMessage": "{that}.handleRawChannelMessage"
    },
    modelListeners: {
        "scaleFactor": {
            funcName: "gpii.app.settingsHandlerConnector.modelChanged",
            args: ["{that}", "{change}"]
        }
    },
    invokers: {
        handleRawChannelMessage: {
            funcName: "gpii.app.settingsHandlerConnector.handleRawChannelMessage",
            args: ["{that}", "{arguments}.0"] // message
        },
        setup: {
            funcName: "gpii.app.settingsHandlerConnector.setup",
            args: ["{that}", "{that}.options.solutionId"]
        }
    }
});

/**
 * Responsible for parsing messages from the GPII socket connection. Currently messages use
 * the format of changeApplier with the path, value and type.
 * @param {Object} settingsHandlerConnector - The `gpii.app.settingsHandlerConnector` instance
 * @param {Object} message - The received PSP Channel message
 */
gpii.app.settingsHandlerConnector.handleRawChannelMessage = function (that, message) {
    console.log("# Received message", JSON.stringify(message));
};

gpii.app.settingsHandlerConnector.setup = function (that, solutionId) {
    console.log("# Connected - setting up ", solutionId);
    that.send({ type: "connect", payload: {solutionId: solutionId }});
};

gpii.app.settingsHandlerConnector.modelChanged = function (that, change) {
    console.log("## model changed: ", change);
};
