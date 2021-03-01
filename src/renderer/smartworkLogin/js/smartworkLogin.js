/**
 * The Smartwork login dialog
 *
 * Represents the Smartwork login dialog.
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
    fluid.defaults("gpii.smartworkLogin", {
        gradeNames: ["fluid.viewComponent", "gpii.binder.bindOnCreate"],

        model: {
            username: null,
            password: null
        },

        selectors: {
            usernameInput: ".flc-username",
            passwordInput: ".flc-password",
            submitButton: ".flc-submitBtn",
            feedbackLabel: ".flc-feedbackLabel",
            progressRing: ".progress-ring"
        },

        bindings: {
            // selector  :  model
            usernameInput: "username",
            passwordInput: "password"
        },

        events: {
            onClick: null
        },

        invokers: {
            // TODO
            showSuccessLabel: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "Login succeeded"
            },
            showFailureLabel: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "Invalid credentials"
            }
        },

        components: {
            channelListener: {
                type: "gpii.psp.channelListener",
                options: {
                    events: {
                        onLoginSucceeded: null,
                        onLoginFailed: null
                    },
                    listeners: {
                        onLoginSucceeded: [{
                            func: "{smartworkLogin}.showSuccessLabel"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "removeClass",
                            args: "alert-danger"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-success"
                        }, {
                            this: "{smartworkLogin}.dom.progressRing",
                            method: "hide",
                            args: ["slow"]
                        }],
                        onLoginFailed: [{
                            func: "{smartworkLogin}.showFailureLabel"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "removeClass",
                            args: "alert-success"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-danger"
                        }, {
                            this: "{smartworkLogin}.dom.progressRing",
                            method: "hide",
                            args: ["slow"]
                        }]
                    }
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onSmartworkCredentialsInput: null
                    }
                }
            }
        },

        modelListeners: {
            "username": {
                funcName: "console.log",
                args: ["username changed!", "{change}.value"]
            },
            "password": {
                funcName: "console.log",
                args: ["password changed!", "{change}.value"]
            }
        },

        listeners: {
            "onCreate.announce": {
                funcName: "console.log",
                args: "smartworkLogin dialog ready!"
            },
            "onCreate.addClickHandler": {
                "this": "{that}.dom.submitButton",
                method: "click",
                args: ["{that}.events.onClick.fire"]
            },
            "onCreate.toggleProgressRing": {
                this: "{that}.dom.progressRing",
                method: "hide"
            },
            "onClick.sayClick": {
                funcName: "console.log",
                args: ["submit button clicked, user credentials: ", "{that}.model"]
            },
            "onClick.notifiyMainProcess": {
                funcName: "{that}.channelNotifier.events.onSmartworkCredentialsInput.fire",
                args: ["{that}.model"]
            },
            "onClick.clearFeedbackLabel": {
                this: "{that}.dom.feedbackLabel",
                method: "empty"
            },
            "onClick.toggleProgressRing": {
                this: "{that}.dom.progressRing",
                method: "show",
                args: ["slow"]
            }
        }

    });

})(fluid);
