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
            credentials: {
                username: null,
                password: null
            },

            // Transaltable strings
            messages: {
                loginSuccess: "Login succeeded",
                loginFail: "Invalid Credentials"
            }
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
            usernameInput: "credentials.username",
            passwordInput: "credentials.password"
        },

        styles: {
            loginSuccess: "alert-success",
            loginFailed: "alert-danger"
        },

        events: {
            onClick: null
        },

        invokers: {
            // TODO: i18n
            showSuccessLabel: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "{that}.model.messages.loginSuccess"
            },
            showFailureLabel: {
                this: "{that}.dom.feedbackLabel",
                method: "text",
                args: "{that}.model.messages.loginFail"
            },
            toggleProgressRing: {
                this: "{smartworkLogin}.dom.progressRing",
                method: "toggle",
                args: ["slow"]
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
                        // TODO: Refactor these listeners in a decent way
                        onLoginSucceeded: [{
                            func: "{smartworkLogin}.toggleProgressRing"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "removeClass",
                            args: "alert-danger"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-success"
                        }, {
                            func: "{smartworkLogin}.showSuccessLabel"
                        }],
                        onLoginFailed: [{
                            func: "{smartworkLogin}.toggleProgressRing"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "removeClass",
                            args: "alert-success"
                        }, {
                            this: "{smartworkLogin}.dom.feedbackLabel",
                            method: "addClass",
                            args: "alert-danger"
                        }, {
                            func: "{smartworkLogin}.showFailureLabel"
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

        listeners: {
            "onCreate.addClickHandler": {
                "this": "{that}.dom.submitButton",
                method: "click",
                args: ["{that}.events.onClick.fire"]
            },
            "onCreate.hideProgressRing": {
                this: "{that}.dom.progressRing",
                method: "hide"
            },
            "onClick.notifiyMainProcess": {
                funcName: "{that}.channelNotifier.events.onSmartworkCredentialsInput.fire",
                args: ["{that}.model.credentials"]
            },
            "onClick.clearFeedbackLabel": {
                this: "{that}.dom.feedbackLabel",
                method: "empty"
            },
            "onClick.toggleProgressRing": {
                func: "{smartworkLogin}.toggleProgressRing"
            }
        }
    });

})(fluid);
