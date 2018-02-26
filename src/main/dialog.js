/**
 * Base BrowserWindow dialog component
 *
 * A base component for all Electron BrowserWindow dialogs.
 * GPII Application
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

var fluid         = require("infusion");
var BrowserWindow = require("electron").BrowserWindow;

var gpii  = fluid.registerNamespace("gpii");

require("./utils.js");


/**
 * Base dialog component that provides initialization of
 * an Electron `BrowserWindow` and the generation of
 * the file URL that is to be loaded in the same `BrowserWindow`.
 * NOTE: The generated URL is always relative to the working
 * directory of the application (`module.terms()`)
 *
 * It also provides show/hide operations of the window through interaction
 * with the `isShown` property of the component
 * and handles Electron objects cleanup upon destruction.
 *
 * Requires:
 * - (optional) `attrs` - used as raw options for `BrowserWindow` generation.
 *   For full options list:  https://github.com/electron/electron/blob/master/docs/api/browser-window.md
 * - relative path from the application's working directory
 *    - `fileSuffixPath` - the suffix to the file
 *    - `filePrefixPath` (optional) - the prefix to the file
 *
 *   For example, a relative path such as `"/src/rendered/waitDialog/index.html"`,
 *   might be split into:
 *   `prefixPath = "src/renderer"`
 *   `fileSuffixPath = "waitDialog/index.html"`
 */
fluid.defaults("gpii.app.dialog", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        isShown: false
    },

    config: {
        attrs: {        // raw attributes used in `BrowserWindow` generation
            width: 800,
            height: 600,
            show: false,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false
        },
        filePrefixPath: "src/renderer",
        fileSuffixPath: null,           // e.g. "waitDialog/index.html"
        url: {
            expander: {
                funcName: "gpii.app.dialog.buildFileUrl",
                args: [
                    "{that}.options.config.filePrefixPath",
                    "{that}.options.config.fileSuffixPath"
                ]
            }
        }
    },
    members: {
        dialog: {
            expander: {
                funcName: "gpii.app.dialog.makeDialog",
                args: [
                    "{that}.options.config.attrs",
                    "{that}.options.config.url"
                ]
            }
        }
    },

    modelListeners: {
        isShown: {
            funcName: "gpii.app.dialog.toggle",
            args: ["{that}", "{change}.value"],
            namespace: "impl"
        }
    },
    listeners: {
        "onCreate.positionWindow": {
            func: "{that}.resetWindowPosition"
        },
        "onDestroy.cleanupElectron": {
            this: "{that}.dialog",
            method: "destroy"
        }
    },
    invokers: {
        getDesiredWindowPosition: {
            funcName: "gpii.app.getDesiredWindowPosition",
            args: ["{that}.dialog"]
        },
        resetWindowPosition: {
            funcName: "gpii.app.setWindowPosition",
            args: ["{that}.dialog", "@expand:{that}.getDesiredWindowPosition()"]
        },
        resize: {
            funcName: "gpii.app.dialog.resize",
            args: [
                "{that}",
                "{arguments}.0", // windowWidth
                "{arguments}.1"  // windowHeight
            ]
        },
        close: {
            this: "{that}.dialog",
            method: "close"
        }
    }
});

/**
 * Builds a file URL inside the application **Working Directory**.
 * @param prefixPath {String} Prefix for the file path, e.g. "src/renderer"
 * @param suffixPath {String} Suffix for the file path, e.g. "index.html"
 * @return {String} The generated URL
 */
gpii.app.dialog.buildFileUrl = function (prefixPath, suffixPath) {

    var appHomePath = fluid.module.terms()["gpii-app"];

    return fluid.stringTemplate(
        "file://%homePath/%prefixPath/%suffixPath",
        {
            homePath: appHomePath,
            prefixPath: prefixPath,
            suffixPath: suffixPath
        });
};

/**
 * Creates a dialog. This is done up front to avoid the delay from creating a new
 * dialog every time a new message should be displayed.
 * @param windowOptions {Object} The raw Electron `BrowserWindow` settings
 * @param url {String} The URL to be loaded in the `BrowserWindow`
 * @return {BrowserWindow} The Electron `BrowserWindow` component
 */
gpii.app.dialog.makeDialog = function (windowOptions, url) {
    var dialog = new BrowserWindow(windowOptions);

    dialog.loadURL(url);
    return dialog;
};

/**
 * Default show/hide behaviour of the electron `BrowserWindow` dialog, depending
 * on the `isShown` flag state.
 * In case it is shown, resets the position and shows the current dialog (`BrowserWindow`).
 * The reset is needed in order to handle cases such as resolution or
 * DPI settings changes.
 * @param dialog {Component} The diolog component to be shown
 * @param isShown {Boolean} Whether the window has to be shown
 */
gpii.app.dialog.toggle = function (dialog, isShown) {
    if (isShown) {
        dialog.resetWindowPosition();
        dialog.dialog.show();
    } else {
        dialog.dialog.hide();
    }
};

/**
 * Resizes the current window and repositions it to match the new size.
 * @param that {Component} The `gpii.app.dialog` instance
 * @param windowWidth {Number} The new width for the window
 * @param windowHeight {Number} The new height for the window
 */
gpii.app.dialog.resize = function (that, windowWidth, windowHeight) {
    that.dialog.setSize(Math.ceil(windowWidth), Math.ceil(windowHeight));
    that.resetWindowPosition();
};

/**
 * A wrapper for the creation of dialogs with the same type. This component makes
 * the instantiation of the actual dialog more elegant - the dialog is automatically
 * created by the framework when the `onDialogCreate` event is fired. Also, Infusion
 * takes care of destroying any other instances of the dialog that may be present
 * before actually creating a new one.
 */
fluid.defaults("gpii.app.dialogWrapper", {
    gradeNames: "fluid.modelComponent",

    components: {
        dialog: {
            type: "gpii.app.dialog",
            createOnEvent: "onDialogCreate"
        }
    },

    events: {
        onDialogCreate: null
    },

    invokers: {
        show: {
            funcName: "gpii.app.dialogWrapper.show",
            args: [
                "{that}",
                "{arguments}.0" // options
            ]
        },
        hide: {
            funcName: "gpii.app.dialogWrapper.hide",
            args: ["{that}"]
        },
        close: {
            funcName: "gpii.app.dialogWrapper.close",
            args: ["{that}"]
        }
    }
});

/**
 * Responsible for firing the `onDialogCreate` event which in turn creates the
 * wrapped dialog component.
 * @param that {Component} The `gpii.app.dialogWrapper` instance.
 * @param options {Object} An object containing the various properties for the
 * dialog which is to be created.
 */
gpii.app.dialogWrapper.show = function (that, options) {
    that.events.onDialogCreate.fire(options);
};

/**
 * Responsible for hiding the wrapped dialog if it exists.
 * @param that {Component} The `gpii.app.dialogWrapper` instance.
 */
gpii.app.dialogWrapper.hide = function (that) {
    if (that.dialog) {
        that.dialog.applier.change("isShown", false);
    }
};

/**
 * Responsible for closing the wrapped dialog if it exists.
 * @param that {Component} The `gpii.app.dialogWrapper` instance.
 */
gpii.app.dialogWrapper.close = function (that) {
    if (that.dialog) {
        that.dialog.close();
    }
};