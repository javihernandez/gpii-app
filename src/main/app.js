/**
 * The PSP Main component
 *
 * A component that represents the whole PSP. It wraps all of the PSP's functionality and also provides information on whether there's someone keyIn or not.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid   = require("infusion");
var gpii    = fluid.registerNamespace("gpii");
var request = require("request");

require("./assetsManager.js");
require("./propertyHistoryManager.js");
require("./ws.js");
require("./factsManager.js");
require("./dialogManager.js");
require("./gpiiConnector.js");
require("./menu.js");
require("./psp.js");
require("./quickSetStrip/qss.js");
require("./settingsBroker.js");
require("./surveys/surveyManager.js");
require("./tray.js");
require("./utils.js");
require("../common/messageBundles.js");
require("../common/utils.js");
require("../common/channelUtils.js");

/**
 * Promise that resolves when the electron application is ready.
 * Required for testing multiple configs of the app.
 */
gpii.app.appReady = fluid.promise();

/**
 * Listens for the electron 'ready' event and resolves the promise accordingly.
 */
gpii.app.electronAppListener = function () {
    gpii.app.appReady.resolve(true);
};
require("electron").app.on("ready", gpii.app.electronAppListener);
// Override default behaviour - don't exit process once all windows are closed
require("electron").app.on("window-all-closed", fluid.identity);

/**
 * A component to manage the app. When  the PSP application is fully functional,
 * the `onPSPReady` event will be fired.
 */
fluid.defaults("gpii.app", {
    gradeNames: ["fluid.modelComponent", "gpii.app.messageBundles"],
    model: {
        keyedInUserToken: null,
        snapsetName: null,
        preferences: {
            sets: [],
            activeSet: null,
            settingGroups: [],
            closePSPOnBlur: null
        },
        theme: "{that}.options.defaultTheme"
    },
    // prerequisites
    members: {
        machineId: "@expand:{that}.installID.getMachineID()"
    },
    components: {
        errorHandler: {
            type: "gpii.app.errorHandler",
            options: {
                listeners: {
                    "onFatalError.exit": {
                        func: "{app}.exit"
                    }
                }
            }
        },
        installID: {
            type: "gpii.installID"
        },
        assetsManager: {
            type: "gpii.app.assetsManager"
        },
        factsManager: {
            type: "gpii.app.factsManager"
        },
        settingsBroker: {
            type: "gpii.app.settingsBroker",
            options: {
                model: {
                    keyedInUserToken: "{app}.model.keyedInUserToken"
                }
            }
        },
        gpiiConnector: {
            type: "gpii.app.gpiiConnector",
            createOnEvent: "onGPIIReady",
            options: {
                listeners: {
                    "onSnapsetNameUpdated.updateSnapsetName": "{app}.updateSnapsetName",
                    "onPreferencesUpdated.updateSets": "{app}.updatePreferences",

                    "{settingsBroker}.events.onSettingApplied": {
                        listener: "{that}.updateSetting",
                        args: ["{arguments}.0"], // setting
                        excludeSource: ["settingsBroker.undo"]
                    }
                },
                events: {
                    onConnected: "{app}.events.onPSPChannelConnected"
                }
            }
        },
        dialogManager: {
            type: "gpii.app.dialogManager",
            createOnEvent: "onPSPPrerequisitesReady",
            options: {
                model: {
                    keyedInUserToken: "{app}.model.keyedInUserToken"
                },
                modelListeners: {
                    "{lifecycleManager}.model.logonChange": {
                        func: "{that}.toggle",
                        args: ["waitDialog", "{change}.value.inProgress"],
                        excludeSource: "init"
                    }
                }
            }
        },
        surveyManager: {
            type: "gpii.app.surveyManager",
            createOnEvent: "onPSPPrerequisitesReady",
            options: {
                listeners: {
                    onSurveyRequired: {
                        func: "{dialogManager}.show",
                        args: ["survey", "{arguments}.0"]
                    }
                }
            }
        },
        qss: {
            type: "gpii.app.qssWrapper",
            createOnEvent: "onPSPPrerequisitesReady",
            options: {
                model: {
                    keyedInUserToken: "{app}.model.keyedInUserToken"
                },
                listeners: {
                    "{gpiiConnector}.events.onSettingUpdated":  "{that}.events.onSettingUpdated",
                    "{settingsBroker}.events.onSettingApplied": "{that}.events.onSettingUpdated",
                    "{gpiiConnector}.events.onPreferencesUpdated": "{that}.events.onPreferencesUpdated",

                    "onUndoRequired.activateUndo": {
                        func: "{propertyHistoryManager}.undo",
                        args: "gpii.app.qssWrapper"
                    },
                    "onCreate.regsiterUndo": {
                        funcName: "{propertyHistoryManager}.registerPropertyObserver",
                        args: [ "{that}", "settings.*" ]
                    }
                },
                modelListeners: {
                    "settings.*": {
                        func: "{settingsBroker}.applySetting",
                        args: ["{change}.value"],
                        includeSource: ["qss", "qssWidget", "gpii.app.propertyHistoryManager.undo"]
                    }
                }
            }
        },
        psp: {
            type: "gpii.app.pspInApp",
            createOnEvent: "onPSPPrerequisitesReady",
            options: {
                model: {
                    preferences: "{app}.model.preferences",
                    theme: "{app}.model.theme"
                },
                modelListeners: {
                    "{qssWrapper}.qss.model.isShown": {
                        funcName: "gpii.app.pspInApp.onQssToggled",
                        args: ["{that}", "{change}.value"]
                    }
                },
                listeners: {
                    "{qss}.events.onQssPspOpen": {
                        func: "{that}.show"
                    }
                }
            }
        },
        propertyHistoryManager: {
            type: "gpii.app.propertyHistoryManager"
        },
        tray: {
            type: "gpii.app.tray",
            createOnEvent: "onPSPPrerequisitesReady",
            options: {
                model: {
                    keyedInUserToken: "{gpii.app}.model.keyedInUserToken"
                },
                events: {
                    onActivePreferenceSetAltered: "{psp}.events.onActivePreferenceSetAltered",

                    onPspOpenShortcut: null,
                    onQssUndoShortcut: null
                },
                shortcuts: {
                    open: {
                        command: "Super+CmdOrCtrl+Alt+U",
                        event: "onPspOpenShortcut"
                    },
                    undo: {
                        command: "CmdOrCtrl+Z",
                        event: "onQssUndoShortcut",
                        condition: function () {
                            return gpii.browserWindow.isWindowFocused("gpii.app.qss");
                        }
                    }
                },
                listeners: {
                    onTrayIconClicked: [{
                        func: "{qssWrapper}.qss.show",
                        args: [
                            {shortcut: false}
                        ]
                    }, {
                        func: "{psp}.show"
                    }],
                    // filter shortcut
                    onQssUndoShortcut: {
                        // get current active window
                        funcName: "{propertyHistoryManager}.undo",
                        args: "gpii.app.qssWrapper"
                    },
                    onPspOpenShortcut: [{
                        func: "{psp}.show"
                    }, {
                        func: "{qssWrapper}.qss.show",
                        args: [
                            {shortcut: true}
                        ]
                    }]
                }
            }
        }
    },
    events: {
        onPSPPrerequisitesReady: {
            events: {
                onGPIIReady: "onGPIIReady",
                onAppReady: "onAppReady",
                onPSPChannelConnected: "onPSPChannelConnected"
            }
        },
        onGPIIReady: null,
        onAppReady: null,
        onPSPChannelConnected: null,
        onPSPReady: null,

        onKeyedIn: null,
        onKeyedOut: null,

        onBlur: null
    },
    listeners: {
        "onCreate.appReady": {
            listener: "gpii.app.fireAppReady",
            args: ["{that}.events.onAppReady.fire"]
        },
        "{kettle.server}.events.onListen": {
            "this": "{that}.events.onGPIIReady",
            method: "fire"
        },
        "{lifecycleManager}.events.onSessionStart": [{
            listener: "{that}.updateKeyedInUserToken",
            args: ["{arguments}.1"], // new token
            namespace: "onLifeCycleManagerUserKeyedIn"
        }, {
            listener: "{that}.events.onKeyedIn.fire",
            namespace: "notifyUserKeyedIn"
        }],
        "{lifecycleManager}.events.onSessionStop": [{
            listener: "gpii.app.handleSessionStop",
            args: ["{that}", "{arguments}.1.options.userToken"]
        }, {
            listener: "{that}.events.onKeyedOut.fire",
            namespace: "notifyUserKeyedOut"
        }],
        "onPSPPrerequisitesReady.notifyPSPReady": {
            this: "{that}.events.onPSPReady",
            method: "fire",
            priority: "last"
        },
        "onDestroy.beforeExit": {
            listener: "{that}.keyOut"
        }
    },
    invokers: {
        updateKeyedInUserToken: {
            changePath: "keyedInUserToken",
            value: "{arguments}.0"
        },
        updatePreferences: {
            changePath: "preferences",
            value: "{arguments}.0"
        },
        updateSnapsetName: {
            changePath: "snapsetName",
            value: "{arguments}.0"
        },
        keyIn: {
            funcName: "gpii.app.keyIn",
            args: ["{arguments}.0"] // token
        },
        keyOut: {
            funcName: "gpii.app.keyOut",
            args: "{that}.model.keyedInUserToken"
        },
        exit: {
            funcName: "gpii.app.exit",
            args: "{that}"
        }
    },
    defaultTheme: "white"
});

gpii.app.pspInApp.onQssToggled = function (psp, isQssShown) {
    if (!isQssShown) {
        psp.hide();
    }
};

/**
 * A component for handling errors during app runtime. It triggers showing of an "Error Dialog"
 * with all the details for the occurred error.
 *
 * This error handling system is more or less in a temporary state until GPII-1313 (a mechanism for notifying the
 * PSP for errors) is finished. Currently we are using error descriptions that are hard-coded in the PSP and
 * a listener for any fluid `UncaughtException`.
 */
fluid.defaults("gpii.app.errorHandler", {
    gradeNames: ["fluid.component"],

    errorsDescriptionMap: {
        "EADDRINUSE": {
            title:   "GPII can't start",
            subhead: "There is another application listening on port the same port",
            details: "Stop the other running application and try again. If the problem is still present, contact GPII Technical Support.",
            fatal: true
        },
        "EKEYINFAIL": {
            title:   "Cannot Key In",
            subhead: "There might be a problem with the user you are trying to use",
            details: "You can try keying in again. If the problem is still present, contact GPII Technical Support.",
            btnLabel1: "OK",
            fatal: false
        },
        "ENOCONNECTION": {
            title:   "No Internet connection",
            subhead: "There seem to be a problem your Internet connectivity",
            details: "Have you tried turning it off and on again? If the problem is still present, contact GPII Technical Support.",
            btnLabel1: "OK",
            btnLabel2: "Cancel",
            fatal: false
        }
    },

    events: {
        onFatalError: null
    },

    listeners: {
        "onCreate.registerErrorListener": {
            funcName: "gpii.app.errorHandler.registerErrorListener",
            args: ["{that}"]
        },
        "onDestroy.clearListener": {
            funcName: "fluid.onUncaughtException.removeListener",
            args: ["gpii.app.errorHandler"]
        }
    },

    // Attach keyIn error listener to the core component
    distributeOptions: {
        target: "{flowManager requests stateChangeHandler}.options.listeners.onError",
        record: "gpii.app.errorHandler.onKeyInError"
    },

    invokers: {
        handleUncaughtException: {
            funcName: "gpii.app.errorHandler.handleUncaughtException",
            args: [
                "{that}",
                "{dialogManager}",
                "{that}.options.errorsDescriptionMap",
                "{arguments}.0" // error
            ]
        }
    }
});

/**
 * A function which is called whenever an error occurs while keying in. Note that a real error would have its `isError`
 * property set to true.
 *
 * @param {Object} error - The error which has occurred.
 */
gpii.app.errorHandler.onKeyInError = function (error) {
    if (error.isError) {
        fluid.onUncaughtException.fire({
            code: "EKEYINFAIL"
        });
    }
};

/**
 * Handles the process of displaying errors through the usage of the "error dialog".
 * @param {Component} that - An instance of gpii.app.
 * @param {Component} dialogManager - An instance of `gpii.app.dialogManager`.
 * @param {Object} errorsDescription - A map with more detailed description for the errors.
 * @param {Object} error - The error which has occurred.
 */
gpii.app.errorHandler.handleUncaughtException = function (that, dialogManager, errorsDescription, error) {
    var errCode = error && error.code,
        errDetails = errorsDescription[errCode],
        errorOptions = fluid.extend(true, {}, errDetails, {
            errCode: errCode
        });

    if (!fluid.isValue(errDetails)) {
        return;
    }

    dialogManager.hide("waitDialog");
    dialogManager.show("error", errorOptions);

    if (errDetails.fatal) {
        dialogManager.error.applier.modelChanged.addListener("isShown", function (isShown) {
            if (!isShown) {
                that.onFatalError.fire(errDetails);
            }
        });
    }
};

/**
 * Register a global listener for all fluid exceptions.
 *
 * @param {Component} errorHandler - The `gpii.app.errorHandler` component
 */
gpii.app.errorHandler.registerErrorListener = function (errorHandler) {
    fluid.onUncaughtException.addListener(function (err) {
        fluid.log("Uncaught Exception", err);
        errorHandler.handleUncaughtException(err);
    }, "gpii.app.errorHandler", "last");
};

gpii.app.fireAppReady = function (fireFn) {
    gpii.app.appReady.then(fireFn);
};

/**
  * Keys into the GPII.
  * Currently uses an url to key in although this should be changed to use Electron IPC.
  * @param {String} token - The token to key in with.
  */
gpii.app.keyIn = function (token) {
    request("http://localhost:8081/user/" + token + "/login", function (/* error, response */) {
        // empty
    });
};

/**
  * Keys out of the GPII.
  * Currently uses an url to key out although this should be changed to use Electron IPC.
  * @param {String} token - The token to key out with.
  * @return {Promise} A promise that will be resolved/rejected when the request is finished.
  */
gpii.app.keyOut = function (token) {
    var togo = fluid.promise();
    request("http://localhost:8081/user/" + token + "/logout", function (error, response, body) {
        //TODO Put in some error logging
        if (error) {
            togo.reject(error);
            fluid.log("Key out response:", response);
            fluid.log("Key out body:", body);
        } else {
            togo.resolve();
        }
    });
    return togo;
};

/**
  * Stops the Electron Application.
  * @return {Promise} An already resolved promise.
  */
gpii.app.performQuit = function () {
    var app = require("electron").app;
    var togo = fluid.promise();

    gpii.stop();
    app.quit();

    togo.resolve();
    return togo;
};

/**
  * Handles the exit of the Electron Application.
  * @param {Component} that - An instance of gpii.app
  */
gpii.app.exit = function (that) {
    if (that.model.keyedInUserToken) {
        fluid.promise.sequence([
            gpii.rejectToLog(that.keyOut(), "Couldn't logout current user"),
            gpii.app.performQuit
        ]);
    } else {
        gpii.app.performQuit();
    }
};

/**
 * Handles when a user token is keyed out through other means besides the task tray key out feature.
 * @param {Component} that - An instance of gpii.app
 * @param {String} keyedOutUserToken - The token that was keyed out.
 */
gpii.app.handleSessionStop = function (that, keyedOutUserToken) {
    var currentKeyedInUserToken = that.model.keyedInUserToken;

    if (keyedOutUserToken !== currentKeyedInUserToken) {
        console.log("Warning: The keyed out user token does NOT match the current keyed in user token.");
    } else {
        that.updateKeyedInUserToken(null);
    }
};

// A wrapper that wraps gpii.app as a subcomponent. This is the grade need by configs/app.json
// to distribute gpii.app as a subcomponent of GPII flow manager since infusion doesn't support
// broadcasting directly to "components" block which probably would destroy GPII.

fluid.defaults("gpii.appWrapper", {
    gradeNames: ["fluid.component"],
    components: {
        app: {
            type: "gpii.app"
        }
    }
});

