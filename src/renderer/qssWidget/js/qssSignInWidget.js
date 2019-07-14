/**
 * The QSS Sign In widget
 *
 * TODO
 *
 * Copyright 2017 Raising the Floor - International
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
     * Represents the QSS Sign in widget.
     */
    fluid.defaults("gpii.qssWidget.signIn", {
        gradeNames: [
            "fluid.viewComponent",
            "gpii.psp.heightObservable",
            "gpii.psp.selectorsTextRenderer"
        ],

        model: {
            messages: {
                emailTextInputLabel: null,
                passwordInputLabel: null,
                passwordInputLink: null,
                signInButton: null,
                errorDetails: null
            },

            email: null,
            password: null,

            errorDetails: null
        },

        enableRichText: true,
        selectors: {
            emailTextInputLabel:  ".flc-emailTextInput-label",
            passwordInputLabel:   ".flc-passwordInput-label",
            passwordInputLink:    ".flc-passwordInput-link",

            emailTextInput:       ".flc-emailTextInput",
            passwordInput:        ".flc-passwordInput",

            signInBtn:            ".flc-signInBtn",

            error:                ".flc-error",
            errorDetails:         ".flc-errorDetails"
        },

        events: {
            onSignInClicked: null,
            onQssWidgetSignInRequested: null
        },

        invokers: {
            updateError: {
                funcName: "gpii.qssWidget.signIn.toggleError",
                args: [
                    "{that}",
                    "{arguments}.0"
                ]
            }
        },

        listeners: {
            onQssWidgetSignInRequested: "{channelNotifier}.events.onQssWidgetSignInRequested.fire",
            onSignInClicked: {
                funcName: "gpii.qssWidget.signIn.validateSignIn",
                args: [
                    "{that}",
                    "{that}.dom.emailTextInput",
                    "{that}.dom.passwordInput"
                ]
            },
            "onCreate.addFocusListener": {
                funcName: "gpii.qssWidget.signIn.addFocusListener",
                args: ["{that}.dom.emailTextInput"]
            },
            "onCreate.hideError" : {
                funcName: "gpii.qssWidget.signIn.toggleError",
                args: [
                    "{that}",
                    null
                ]
            },
            "onDestroy.removeFocusListener": {
                funcName: "gpii.qssWidget.signIn.removeFocusListener"
            }
        },

        components: {
            signInBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.signInBtn",
                options: {
                    attrs: {
                        "aria-label": "{signIn}.model.messages.signInButton"
                    },
                    model: {
                        label: "{signIn}.model.messages.signInButton"
                    },
                    invokers: {
                        "onClick": "{signIn}.events.onSignInClicked.fire"
                    }
                }
            }
        }
    });

    /**
     * Adds a listener so that whenever the page is focused, the email
     * field in the sign-in form (provided that it is visible) is focused.
     * @param {jQuery} emailInput - The email input element
     */
    gpii.qssWidget.signIn.addFocusListener = function (emailInput) {
        jQuery(window).on("focus.signIn", function () {
            if (emailInput.is(":visible")) {
                emailInput.focus();
            }
        });
    };

    /**
     * Removes the listener which focuses the email field in the sign-in form.
     * Useful if the component is destroyed.
     */
    gpii.qssWidget.signIn.removeFocusListener = function () {
        jQuery(window).off("focus.signIn");
    };


    /**
     * Validates and propagates the sign in request. In case there are
     * validation errors, an error message is shown to the user.
     *
     * @param {Component} that - The `gpii.qssWidget.signIn` instance
     * @param {jQuery} emailInput - The email input element
     * @param {jQuery} passwordInput - The password input element
     */
    gpii.qssWidget.signIn.validateSignIn = function (that, emailInput, passwordInput) {
        var email = emailInput.val(),
            password = passwordInput.val();

        // XXX temporary test validation
        if (!email || !password) {
            that.updateError(that.model.messages.errorDetails);
        } else {
            that.updateError(null);
            that.events.onQssWidgetSignInRequested.fire(email, password);
        }
    };

    /**
     * Shows or hides the error container and sets the corresponding
     * messages depending on whether an error has occurred.
     *
     * @param {Component} that - The `gpii.qssWidget.signIn` instance.
     * @param {String} errorDetails - Error message.
     */
    gpii.qssWidget.signIn.toggleError = function (that, errorDetails) {
        var errorContainer = that.dom.locate("error");
        if (errorDetails) {
            errorContainer.show();
            // for now this data is pre-filled properly
            // that.dom.locate("errorDetails").html(errorDetails);
        } else {
            errorContainer.hide();
        }
    };
})(fluid);
