/**
 * The Smartwork login manager
 *
 * This component is responsible for keying the smartwork users into Morphic.
 *
 * Since the Smartwork credentials need to be used by different applications and
 * services running on the computer, we use the OS keyring to store/retrieve
 * such credentials.
 *
 * This component orchestrates the gpii keyIn process using the smartwork credentials
 * and eventually ask the users for the credentials at system startup.
 *
 * Copyright 2021 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion"),
    getUuid = require('uuid-by-string'),
    https = require("https"),
    keytar = require("keytar");

var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.app.smartworkLoginManager", {
    gradeNames: "fluid.modelComponent",
    model: {
        username: null,
        password: null,
        gpiiKey: null
    },
    components: {
        keyring: {
            type: "gpii.keyring",
            options: {
                service: "smartwork"
            }
        }
    },
    events: {
        onCredentialsFound: null,
        onNoCredentialsFound: null,
        onLoginSucceeded: null,
        onLoginFailed: null
    },
    listeners: {
        "onCreate.checkCredentials": {
            funcName: "gpii.app.smartworkLoginManager.checkCredentials",
            args: [
                "{that}",
                "{keyring}",
                "{that}.events.onCredentialsFound",
                "{that}.events.onNoCredentialsFound"
            ]
        },
        "onNoCredentialsFound.askForCredentials": {
            funcName: "console.log",
            args: "## askForCredentials needs to be implemented"
        },
        "onCredentialsFound.keyInUser": {
            funcName: "console.log",
            args: "## keyInUser needs to be implemented"
        },
        "onLoginSucceeded.debug": {
            funcName: "console.log",
            args: ["## onLoginSucceeded: ", "{arguments}.0"]
        },
        "onLoginSucceeded.saveIntoKeyring": {
            func: "{keyring}.setPassword",
            args: ["{arguments}.0.username", "{arguments}.0.password"]
        },
        "onLoginSucceeded.generateGpiiKey": {
            func: "{that}.generateGpiiKey",
            args: ["{arguments}.0.username", "{arguments}.0.password"]
        },
        "onLoginFailed.debug": {
            funcName: "console.log",
            args: ["## onLoginFailed: ", "{arguments}.0"]
        }
    },
    invokers: {
        logIntoSmartwork: {
            funcName: "gpii.app.smartworkLoginManager.logIntoSmartwork",
            args: ["{that}", "{arguments}.0", "{that}.events.onLoginSucceeded", "{that}.events.onLoginFailed"]
        },
        generateGpiiKey: {
            funcName: "gpii.app.smartworkLoginManager.generateGpiiKey",
            args: ["{that}"]
        }
    }
});

gpii.app.smartworkLoginManager.checkCredentials = function (that, keyring, credentialsFound, noCredentialsFound) {
    var credentials = keyring.findCredentials();
    credentials.then(function (result) {
        console.log("## result: ", result);
        if (!result) {
            // Couldn't find credentials, ask the user for credentials through morphic
            noCredentialsFound.fire();
        } else {
            // Found credentials, generate the uuid and trigger the keyIn process
            that.applier.change("username", result.account);
            that.applier.change("password", result.password);
            that.generateGpiiKey();
            credentialsFound.fire();
        }
    }, function (error) {
        fluid.fail("Failed while checking credentials - ", error);
    });
};

gpii.app.smartworkLoginManager.logIntoSmartwork = function (that, credentials, onLoginSucceeded, onLoginFailed) {
    var options = {
        hostname: "gsc.smartwork.gpii.net",
        port: 443,
        path: "/checkSmartworkAccount?username=" + credentials.username + "&password=" + credentials.password,
        method: "GET"
    };

    var req = https.request(options, function (res) {
        res.on("data", function (data) {
            console.log("#### data: ", data.toString());
            var resolution = JSON.parse(data.toString());

            console.log("#### resolution: ", resolution);
            if (resolution.result === "ok") {
                onLoginSucceeded.fire(credentials);
            } else {
                onLoginFailed.fire();
            }
        });
    });

    req.on("error", function (error) {
        console.log("There was an error while trying to authenticate, error was: ", error);
    });

    req.end()
};

gpii.app.smartworkLoginManager.generateGpiiKey = function (that) {
    var gpiiKey = getUuid("".concat(that.model.username, that.model.password));
    that.applier.change("gpiiKey", gpiiKey);
    console.log("#### gpiiKey: ", gpiiKey);
    return gpiiKey;
};

fluid.defaults("gpii.keyring", {
    gradeNames: "fluid.component",
    service: null,
    invokers: {
        findCredentials: {
            funcName: "gpii.keyring.findCredentials",
            args: ["{that}.options.service"]
        },
        setPassword: {
            funcName: "gpii.keyring.setPassword",
            args: [
                "{that}.options.service",
                "{arguments}.0", // account
                "{arguments}.1"  // password
            ]
        },
        deletePassword: {
            funcName: "gpii.keyring.deletePassword",
            args: [
                "{that}.options.service",
                "{arguments}.0", // account
            ]
        }
    }
});

gpii.keyring.findCredentials = function (service) {
    var promise = fluid.promise();

    keytar.findCredentials(service).then(function (credentials) {
        // Keytar returns an array of credentials, just in case there more than
        // one account in a particular service. In case of Smartwork, this is not
        // likely to happen, but just in case, we always return the first one, which
        // corresponds to the last added credentials.
        //
        // TODO: Think about a workflow through a user can remove the credentials
        // from the keyring.
        promise.resolve(credentials[0]);
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};

gpii.keyring.setPassword = function (service, account, password) {
    console.log("## setPassword: ", service, account, password);
    var promise = fluid.promise();

    keytar.setPassword(service, account, password).then(function () {
        promise.resolve();
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};

gpii.keyring.deletePassword = function (service, account) {
    var promise = fluid.promise();

    keytar.deletePassword(service, account).then(function (result) {
        // 'deletePassword' returns 'true' if deleted and 'false' if the account
        // couldn't be found in the keyring. There's no reason to reject but
        // we return the result anyway.
        promise.resolve(result);
    }, function (error) {
        promise.reject(error);
    });

    return promise;
};
