/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'util/url',
    'core/logger',
    'core/store',
    'core/promise',
    'core/format',
    'lib/uuid',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/fingerprint/fingerprint2',
    'taoClientDiagnostic/tools/getStatus'
], function ($, _, __, url, loggerFactory, store, Promise, format, uuid, getConfig, getLabels, Fingerprint2, getStatus) {
    'use strict';

    /**
     * @type {logger}
     */
    var logger = loggerFactory('taoClientDiagnostic/fingerprint');

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var _defaults = {
        id: 'fingerprint'
    };

    /**
     * The names of the storage keys used to persist info on the browser
     * @type {Object}
     * @private
     */
    var _storageKeys = {
        store: 'client-diagnostic',
        browserId: 'uuid',
        fingerprint: 'fingerprint',
        details: 'seed',
        errors: 'errors',
        updated: 'updated'
    };

    /**
     * List of threshold values, for each kind of context
     * @type {Object}
     * @private
     */
    var _thresholdValues = {
        error: 0,
        storageIssue: 50,
        changedFingerprint: 90,
        success: 100
    };

    /**
     * A list of thresholds
     * @type {Array}
     * @private
     */
    var _thresholds = [{
        threshold: _thresholdValues.error,
        message: __('Cannot get your fingerprint'),
        type: 'error'
    }, {
        threshold: _thresholdValues.storageIssue,
        message: __('Your fingerprint is %s. However we encountered issue while retrieving the data. Maybe your available disk space is too small'),
        type: 'warning'
    }, {
        threshold: _thresholdValues.changedFingerprint,
        message: __('Your fingerprint is %s. However it seems it has changed since the last check. It could be related to changes in your system.'),
        type: 'success'
    }, {
        threshold: _thresholdValues.success,
        message: __('Your fingerprint is %s'),
        type: 'success'
    }];

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {Object}
     * @private
     */
    var _messages = [
        // level 1
        {
            title: __('Fingerprint'),
            status: __('Computing the fingerprint...'),
            fingerprintValue: __('Fingerprint'),
            fingerprintBrowserId: __('Browser UID'),
            fingerprintSources: __('Fingerprint sources'),
            fingerprintErrors: __('Fingerprint errors')
        }
    ];

    /**
     * Performs a browser fingerprint capture
     *
     * @param {Object} config - Some optional configs
     * @param {String} [config.id] - The identifier of the test
     * @param {String} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {Object}
     */
    function browserFingerprint(config) {
        var initConfig = getConfig(config, _defaults);
        var labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs a browser fingerprint capture, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var browserStorage;
                var browserId = 'error';
                var lastFingerprint = 'error';
                var freshBrowserId = false;
                var newFingerprint = false;
                var self = this;
                var errors = [];

                store(_storageKeys.store)
                    .then(function (storage) {
                        browserStorage = storage;
                        return Promise.all([
                            browserStorage.getItem(_storageKeys.browserId).then(function (value) {
                                browserId = value;
                            }),
                            browserStorage.getItem(_storageKeys.fingerprint).then(function (value) {
                                lastFingerprint = value;
                            })
                        ]);
                    })
                    .catch(function (err) {
                        errors.push(err);
                        logger.error(err);
                    })
                    .then(function () {
                        return new Promise(function (resolve) {
                            new Fingerprint2().get(function (result, details) {
                                var results = {};
                                results[_storageKeys.fingerprint] = ('' + result).toUpperCase();
                                results[_storageKeys.details] = details;
                                resolve(results);
                            });
                        });
                    })
                    .then(function (results) {
                        var pendingPromises = [];
                        var resultFingerprint = results[_storageKeys.fingerprint];

                        if (!browserId) {
                            browserId = uuid(32, 16);
                            freshBrowserId = true;
                        }

                        newFingerprint = lastFingerprint !== resultFingerprint && lastFingerprint !== 'error';

                        // update the results with storage state
                        // also detect a change in the fingerprint
                        // (if the browser already have a uuid in the storage but the fingerprint changes)
                        results[_storageKeys.browserId] = browserId;
                        results[_storageKeys.updated] = newFingerprint && !freshBrowserId;

                        if (browserStorage) {
                            if (freshBrowserId) {
                                pendingPromises.push(browserStorage.setItem(_storageKeys.browserId, browserId));
                            }
                            if (newFingerprint) {
                                pendingPromises.push(browserStorage.setItem(_storageKeys.fingerprint, resultFingerprint));
                            }
                        }

                        return Promise.all(pendingPromises)
                            .catch(function (err) {
                                errors.push(err);
                                logger.error(err);
                            })
                            .then(function () {
                                return results;
                            });
                    })
                    .catch(function (err) {
                        errors.push(err);
                        logger.error(err);
                    })
                    .then(function (results) {
                        var summary, status;

                        results = results || {};
                        if (errors.length) {
                            results[_storageKeys.errors] = errors;
                        }

                        summary = self.getSummary(results);
                        status = self.getFeedback(results);
                        done(status, summary, results);
                    });
            },

            /**
             * Gets the labels loaded for the tester
             * @returns {Object}
             */
            get labels() {
                return labels;
            },

            /**
             * Builds the results summary
             * @param {Object} results
             * @returns {Object}}
             */
            getSummary: function getSummary(results) {
                var summary = {
                    fingerprintValue: {
                        message: labels.fingerprintValue,
                        value: results[_storageKeys.fingerprint]
                    },
                    fingerprintBrowserId: {
                        message: labels.fingerprintBrowserId,
                        value: results[_storageKeys.browserId]
                    },
                    fingerprintSources: {
                        message: labels.fingerprintSources,
                        value: _.size(results[_storageKeys.details])
                    }
                };

                if (results[_storageKeys.errors]) {
                    summary.fingerprintErrors = {
                        message: labels.fingerprintErrors,
                        value: _.size(results[_storageKeys.errors])
                    };
                }

                return summary;
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {Object} results
             * @returns {Object}}
             */
            getFeedback: function getFeedback(results) {
                var status, percentage;

                if (!results ||
                    !results[_storageKeys.fingerprint] ||
                    results[_storageKeys.fingerprint] === 'error') {
                    percentage = _thresholdValues.error;
                } else if (results[_storageKeys.browserId] === 'error') {
                    percentage = _thresholdValues.storageIssue;
                } else if (results[_storageKeys.updated]) {
                    percentage = _thresholdValues.changedFingerprint;
                } else {
                    percentage = _thresholdValues.success;
                }

                status = getStatus(percentage, _thresholds);
                status.id = initConfig.id;
                status.title = labels.title;
                status.feedback.message = format(status.feedback.message, results && results[_storageKeys.fingerprint]);

                return status;
            }
        };
    }

    return browserFingerprint;
});
