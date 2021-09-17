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
 * Copyright (c) 2017-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'util/url',
    'core/logger',
    'core/store',
    'core/format',
    'lib/uuid',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getStatus',
    'taoClientDiagnostic/lib/fingerprint/fingerprint2'
], function($, _, __, url, loggerFactory, store, format, uuid, getConfig, getLabels, getStatus, Fingerprint2) {
    'use strict';

    /**
     * @type {logger}
     * @private
     */
    const logger = loggerFactory('taoClientDiagnostic/fingerprint');

    /**
     * Some default values
     * @type {object}
     * @private
     */
    const _defaults = {
        id: 'fingerprint'
    };

    /**
     * The names of the storage keys used to persist info on the browser
     * @type {object}
     * @private
     */
    const _storageKeys = {
        store: 'client-diagnostic',
        uuid: 'uuid',
        fingerprint: 'value',
        details: 'details',
        errors: 'errors',
        changed: 'changed'
    };

    /**
     * List of threshold values, for each kind of context
     * @type {object}
     * @private
     */
    const _thresholdValues = {
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
    const _thresholds = [
        {
            threshold: _thresholdValues.error,
            message: __('Cannot get your fingerprint'),
            type: 'error'
        },
        {
            threshold: _thresholdValues.storageIssue,
            message: __(
                'Your fingerprint is %s. However we encountered issue while retrieving the data. Maybe your available disk space is too small'
            ),
            type: 'warning'
        },
        {
            threshold: _thresholdValues.changedFingerprint,
            message: __(
                'Your fingerprint is %s. However it seems it has changed since the last check. It could be related to changes in your system.'
            ),
            type: 'success'
        },
        {
            threshold: _thresholdValues.success,
            message: __('Your fingerprint is %s'),
            type: 'success'
        }
    ];

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {object}
     * @private
     */
    const _messages = [
        // level 1
        {
            title: __('Fingerprint'),
            status: __('Computing the fingerprint...'),
            fingerprintValue: __('Fingerprint'),
            fingerprintUUID: __('Dynamic UID'),
            fingerprintDetails: __('Fingerprint sources'),
            fingerprintChanged: __('Change since last fingerprint'),
            fingerprintErrors: __('Fingerprint errors'),
            fingerprintError: __('Fingerprint error')
        }
    ];

    /**
     * Performs a browser fingerprint capture
     *
     * @param {object} config - Some optional configs
     * @param {string} [config.id] - The identifier of the test
     * @param {string} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {object}
     */
    return function browserFingerprint(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs a browser fingerprint capture, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                let browserId = 'error';
                let lastFingerprint = 'error';
                let freshBrowserId = false;
                let newFingerprint = false;
                let browserStorage;
                const errors = [];

                function handleError(error) {
                    errors.push({
                        key: 'error',
                        value: '' + error
                    });
                    logger.error(error);
                }

                function getStorageKey(key) {
                    return `${initConfig.id}-${_storageKeys[key]}`;
                }

                store(_storageKeys.store)
                    .then(storage => {
                        browserStorage = storage;
                        return Promise.all([
                            browserStorage.getItem(getStorageKey('uuid')).then(value => {
                                browserId = value;
                            }),
                            browserStorage.getItem(getStorageKey('fingerprint')).then(value => {
                                lastFingerprint = value;
                            })
                        ]);
                    })
                    .catch(handleError)
                    .then(() => {
                        return new Promise(resolve => {
                            new Fingerprint2().get((result, details) => {
                                const results = {};
                                results[_storageKeys.fingerprint] = ('' + result).toUpperCase();
                                results[_storageKeys.details] = details;
                                resolve(results);
                            });
                        });
                    })
                    .then(results => {
                        const pendingPromises = [];
                        const resultFingerprint = results[_storageKeys.fingerprint];

                        if (!browserId) {
                            browserId = uuid(32, 16);
                            freshBrowserId = true;
                        }

                        newFingerprint = lastFingerprint !== resultFingerprint && lastFingerprint !== 'error';

                        // update the results with storage state
                        // also detect a change in the fingerprint
                        // (if the browser already have a uuid in the storage but the fingerprint changes)
                        results[_storageKeys.uuid] = browserId;
                        results[_storageKeys.changed] = newFingerprint && !freshBrowserId;

                        if (browserStorage) {
                            if (freshBrowserId) {
                                pendingPromises.push(browserStorage.setItem(getStorageKey('uuid'), browserId));
                            }
                            if (newFingerprint) {
                                pendingPromises.push(
                                    browserStorage.setItem(getStorageKey('fingerprint'), resultFingerprint)
                                );
                            }
                        }

                        return Promise.all(pendingPromises)
                            .catch(handleError)
                            .then(() => results);
                    })
                    .catch(handleError)
                    .then(results => {
                        results = results || {};
                        if (errors.length) {
                            results[_storageKeys.errors] = errors.length;
                            results[_storageKeys.details] = (results[_storageKeys.details] || []).concat(errors);
                        }

                        const summary = this.getSummary(results);
                        const status = this.getFeedback(results);
                        done(status, summary, results);
                    });
            },

            /**
             * Gets the labels loaded for the tester
             * @returns {object}
             */
            get labels() {
                return labels;
            },

            /**
             * Builds the results summary
             * @param {object} results
             * @returns {object}
             */
            getSummary(results) {
                const sources = _(results[_storageKeys.details])
                    .map('key')
                    .pull('error')
                    .value();
                const summary = {
                    fingerprintValue: {
                        message: labels.fingerprintValue,
                        value: results[_storageKeys.fingerprint]
                    },
                    fingerprintDetails: {
                        message: labels.fingerprintDetails,
                        value: __('%d sources (%s)', _.size(sources), sources.join(', '))
                    },
                    fingerprintChanged: {
                        message: labels.fingerprintChanged,
                        value: results[_storageKeys.changed] ? __('Yes') : __('No')
                    }
                };

                if (results[_storageKeys.errors]) {
                    summary.fingerprintErrors = {
                        message: labels.fingerprintErrors,
                        value: results[_storageKeys.errors]
                    };

                    _.forEach(results[_storageKeys.details], (details, idx) => {
                        if (details.key === 'error') {
                            summary['fingerprintError' + idx] = {
                                message: labels.fingerprintError,
                                value: details.value
                            };
                        }
                    });
                }

                return summary;
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {object} results
             * @returns {object}
             */
            getFeedback(results) {
                let percentage;

                if (!results || !results[_storageKeys.fingerprint] || results[_storageKeys.fingerprint] === 'error') {
                    percentage = _thresholdValues.error;
                } else if (results[_storageKeys.uuid] === 'error') {
                    percentage = _thresholdValues.storageIssue;
                } else if (results[_storageKeys.changed]) {
                    percentage = _thresholdValues.changedFingerprint;
                } else {
                    percentage = _thresholdValues.success;
                }

                const status = getStatus(percentage, _thresholds);
                status.id = initConfig.id;
                status.title = labels.title;
                status.feedback.message = format(status.feedback.message, results && results[_storageKeys.fingerprint]);

                return status;
            }
        };
    };
});
