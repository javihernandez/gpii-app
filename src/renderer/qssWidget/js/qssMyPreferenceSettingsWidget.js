/**
 * The QSS My saved preference settings widget
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
     * Represents the QSS My saved preference settings widget.
     */
    fluid.defaults("gpii.qssWidget.myPreferenceSettings", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        model: {
            messages: {
                signOutButtonLabel: null
            }
        },

        enableRichText: true,
        selectors: {
            signOutBtn: ".flc-signOutBtn",
            menuControlsWrapper: ".flc-qssMenuWidget-controlsWrapper",
            menuControls: ".flc-qssMenuWidget-controls"
        },

        events: {
            onSignOutClicked: null
        },

        components: {
            preferenceList: {
                type: "gpii.psp.repeater",
                container: "{myPreferenceSettings}.dom.menuControls",
                options: {
                    model: {
                        disabled: "{myPreferenceSettings}.model.disabled",
                        value: "My Settings"
                    },
                    modelRelay: {
                        items: {
                            target: "items",
                            singleTransform: {
                                type: "fluid.transforms.free",
                                func: "gpii.qssWidget.myPreferenceSettings.getRepeaterItems",
                                args: [
                                    "{myPreferenceSettings}.model.setting"
                                ]
                            }
                        }
                    },
                    dynamicContainerMarkup: {
                        container: "<div role=\"radio\" class=\"%containerClass fl-qssWidgetMenu-item fl-focusable\" tabindex=\"0\"></div>",
                        containerClassPrefix: "flc-qssWidgetMenu-item"
                    },
                    handlerType: "gpii.qssWidget.myPreferenceSettings.presenter",
                    markup: null,
                    styles: {
                        disabled: "disabled"
                    },
                    events: {
                        onItemFocus: null
                    },
                    invokers: {
                        changePreference: {
                            funcName: "gpii.qssWidget.myPreferenceSettings.changePreference",
                            args: []
                        }
                    },
                    listeners: {
                        "onCreate.enable": {
                            this: "{that}.container",
                            method: "removeClass",
                            args: ["{that}.options.styles.disabled"]
                        }
                    }
                }
            },
            signOutBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.signOutBtn",
                options: {
                    attrs: {
                        "aria-label": "{myPreferenceSettings}.model.messages.signOutButtonLabel"
                    },
                    model: {
                        label: "{myPreferenceSettings}.model.messages.signOutButtonLabel"
                    },
                    invokers: {
                        "onClick": "{myPreferenceSettings}.events.onSignOutClicked.fire"
                    }
                }
            }
        }
    });

     /**
     * TODO
     */
    gpii.qssWidget.myPreferenceSettings.changePreference = function () {
        return null;
    };

    /**
     * TODO
     * @return {Object[]} - An array of key-value pairs describing the key and the value
     * (the visible name) of the setting.
     */
    gpii.qssWidget.myPreferenceSettings.getRepeaterItems = function () {
            var values = ["My Settings"];
            var keys = ["My Settings"];

        return fluid.transform(keys, function (key, index) {
            return {
                key: key,
                value: values[index]
            };
        });
    };


    /**
     * A handler for the `repeater` instance in the QSS myPreferenceSettings widget. Takes care of rendering
     * a particular setting option and handling user interaction.
     */
    fluid.defaults("gpii.qssWidget.myPreferenceSettings.presenter", {
        gradeNames: ["fluid.viewComponent", "gpii.qssWidget.button"],
        model: {
            item: null
        },
        styles: {
            active: "fl-qssWidgetMenu-active",
            default: "fl-qssWidgetMenu-default"
        },
        modelListeners: {
            item: {
                this: "{that}.container",
                method: "text",
                args: ["{that}.model.item.value"]
            },
            "{repeater}.model.value": [{
                funcName: "gpii.qssWidget.myPreferenceSettings.presenter.toggleCheckmark",
                args: ["{change}.value", "{that}.model.item", "{that}.container"]
            }, {
                funcName: "gpii.qssWidget.myPreferenceSettings.presenter.animateActivation",
                args: ["{change}.value", "{that}.model.item", "{that}.container", "{that}.options.styles"],
                includeSource: "settingAlter"
            }]
        },
        events: {
            onItemFocus: "{repeater}.events.onItemFocus"
        },
        listeners: {
            // Call function that set an attribute which is used for styling purporses.
            "onCreate.defaultValue": {
                funcName: "gpii.qssWidget.myPreferenceSettings.presenter.defaultValue",
                args: ["{that}.model.item.key", "{myPreferenceSettings}.model.setting.schema.default", "{that}.container", "{that}.options.styles"]
            },
            onItemFocus: {
                funcName: "gpii.qssWidget.myPreferenceSettings.presenter.focusItem",
                args: [
                    "{that}",
                    "{focusManager}",
                    "{that}.container",
                    "{arguments}.0" // index
                ]
            }
        },
        invokers: {
            activate: {
                func: "{repeater}.changePreference",
                args: [
                    "{that}.model.item.key"
                ]
            }
        }
    });

    /**
     * Focuses the current QSS menu option if its index matches the specified `index` parameter.
     * @param {Component} that - The `gpii.qssWidget.myPreferenceSettings.presenter` instance.
     * @param {focusManager} focusManager - The `gpii.qss.focusManager` instance. for the QSS.
     * @param {jQuery} container - A jQuery object representing the setting option's container.
     * @param {Number} index - The index of the setting option to be focused.
     */
    gpii.qssWidget.myPreferenceSettings.presenter.focusItem = function (that, focusManager, container, index) {
        if (that.model.index === index) {
            focusManager.focusElement(container, true);
        }
    };

    /**
     * Adds a checkmark next to a setting option if it is the currently selected one for the setting.
     * @param {String} key - The `key` of the selected setting option.
     * @param {Object} item - The current setting option.
     * @param {jQuery} container - A jQuery object representing the setting option's container.
     */
    gpii.qssWidget.myPreferenceSettings.presenter.toggleCheckmark = function (key, item, container) {
        container.attr("aria-checked", item.key === key);
    };

    /**
     * Applies the necessary CSS classes to the current setting option if it has been just selected
     * by the user to be the new setting value.
     * @param {String} key - The `key` of the selected setting option.
     * @param {Object} item - The current setting option.
     * @param {jQuery} container - A jQuery object representing the setting option's container.
     * @param {Object} styles - An object containing useful predefined CSS classes.
     */
    gpii.qssWidget.myPreferenceSettings.presenter.animateActivation = function (key, item, container, styles) {
        container.toggleClass(styles.active, item.key === key);
    };

    /**
     * Adds an attribute property for the default setting value.
     * @param {String} key - The `key` of the setting option.
     * @param {Object} item - The default value from the settings.
     * @param {jQuery} container - A jQuery object representing the setting option's container.
     * @param {Object} styles - An object containing useful predefined CSS classes.
     */
    gpii.qssWidget.myPreferenceSettings.presenter.defaultValue = function (key, item, container, styles) {
        if (key === item) {
            container.addClass(styles["default"]);
        }
    };

})(fluid);
