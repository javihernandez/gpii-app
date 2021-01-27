/**
 * Morphic Settings editor
 *
 * Introduces a component that uses an Electron BrowserWindow to represent an "Advanced Settings editor" dialog.
 * Copyright 2021 RtF-I
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
var electron = require("electron");

require("./basic/dialog.js");

var gpii = fluid.registerNamespace("gpii");

/**
 * Component that represents the dialog
 */
fluid.defaults("gpii.app.morphicSettingsEditor", {
    gradeNames: ["gpii.app.dialog", "gpii.app.centeredDialog"],
    config: {
        fileSuffixPath: "morphicSettingsEditor/index.html",
        attrs: {
            width: 600,
            height: 400,
            alwaysOnTop: true,
            frame: true,
            resizable: true,
            transparent: false, // needs to be false to enable resizing and maximizing
            movable: true,
            minimizable: true,
            maximizable: true,
            autoHideMenuBar: true,
            titleBarStyle: "default",
        }
    },
    listeners: {
        "onCreate.show": {
            func: "{that}.show"
        },
        "onCreate.debug": {
            funcName: "gpii.app.morphicSettingsEditor.debug",
            args: "{that}"
        }
    }
});

gpii.app.morphicSettingsEditor.debug = function (that) {
    that.dialog.webContents.once("dom-ready", function () {
        console.log("#### it worked");
    })
};
