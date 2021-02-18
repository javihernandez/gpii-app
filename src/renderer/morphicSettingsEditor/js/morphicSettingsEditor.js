/**
 * The Morphic Settings Editor dialog
 *
 * Represents the Morphic Settings Editor dialog.
 * Copyright 2021 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * Represents the controller for the settings editor.
     */
    fluid.defaults("gpii.morphicSettingsEditor", {
        gradeNames: ["fluid.viewComponent"],

        buttonList: null,
        morePanelList: null,

        model: {
            buttonList: "{that}.options.buttonList",
            morePanelList: "{that}.options.morePanelList"
        },

        selectors: {
            buttonList: ".flc-buttonList",
            morePanelList: ".flc-morePanelList",
        },

        invokers: {
            renderButtonList: {
                this: "{that}.dom.buttonList",
                method: "html",
                args: "{that}.model.buttonList"
            },
            renderMorePanelList: {
                this: "{that}.dom.morePanelList",
                method: "html",
                args: "{that}.model.morePanelList"
            }
        },

        modelListeners: {
            "buttonList": {
                this: "{that}.dom.buttonList",
                method: "html",
                args: ["{change}.value"]
            },
            "morePanelList": {
                this: "{that}.dom.morePanelList",
                method: "html",
                args: ["{change}.value"]
            }
        },

        listeners: {
            "onCreate.renderButtonList": {
                func: "{that}.renderButtonList"
            },
            "onCreate.renderMorePanelList": {
                func: "{that}.renderMorePanelList"
            }
        }

    });

})(fluid);
