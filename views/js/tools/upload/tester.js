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
 * Copyright (c) 2016-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'async',
    'util/url',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getStatus'
], function($, _, __, async, urlHelper, getConfig, getLabels, getStatus) {
    'use strict';

    /**
     * A binary kilo bytes (KiB)
     * @type {number}
     * @private
     */
    const _kilo = 1024;

    /**
     * A binary mega bytes (MiB)
     * @type {number}
     * @private
     */
    const _mega = _kilo * _kilo;

    /**
     * Result of diagnostic
     * @type {Array}
     * @private
     */
    let data = [];

    /**
     * Default values for the upload speed tester
     * @type {object}
     * @private
     */
    const _defaults = {
        id: 'upload',

        // Size of data to sent to server during speed test in bytes
        size: _mega,

        // Optimal speed in bytes per second
        optimal: _mega
    };

    /**
     * A list of thresholds for bandwidth check
     * @type {Array}
     * @private
     */
    const _thresholds = [
        {
            threshold: 0,
            message: __('Low upload speed'),
            type: 'error'
        },
        {
            threshold: 33,
            message: __('Average upload speed'),
            type: 'warning'
        },
        {
            threshold: 66,
            message: __('Good upload speed'),
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
            title: __('Upload speed'),
            status: __('Checking upload speed...'),
            uploadAvg: __('Average upload speed'),
            uploadMax: __('Max upload speed')
        }
    ];

    /**
     * Generate random string of given length
     * @param {number} length
     */
    function generateStr(length) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    /**
     * Upload generated string to check upload speed.
     * @param {number} size of string to upload in bytes
     * @return {object} jqXHR
     */
    function upload(size) {
        const url = urlHelper.route('upload', 'CompatibilityChecker', 'taoClientDiagnostic', { cache: Date.now() });
        const str = generateStr(size);
        data = [];

        return $.ajax({
            url: url,
            type: 'POST',
            data: {
                upload: str
            },
            xhr: () => {
                const xhr = new window.XMLHttpRequest();
                const startTime = Date.now();
                // Upload progress
                xhr.upload.addEventListener(
                    'progress',
                    evt => {
                        if (evt.lengthComputable) {
                            const passedTime = Date.now() - startTime;
                            data.push({
                                time: passedTime,
                                loaded: evt.loaded,
                                speed: (evt.loaded * 8) / _mega / (passedTime / 1000)
                            });
                        }
                    },
                    false
                );

                return xhr;
            }
        });
    }

    /**
     * Performs a upload speed test
     * @param {object} config - Some optional configs
     * @param {string} [config.id] - The identifier of the test
     * @param {number} [config.size] - Size of data to sent to server during speed test in bytes
     * @param {number} [config.optimal] - Optimal speed in bytes per second
     * @param {string} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {object}
     */
    return function uploadTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs upload speed test, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                upload(parseInt(initConfig.size, 10)).then(() => {
                    let totalSpeed = 0;
                    let maxSpeed = 0;

                    _.forEach(data, val => {
                        totalSpeed += val.speed;
                        if (maxSpeed < val.speed) {
                            maxSpeed = Math.round(val.speed * 100) / 100;
                        }
                    });
                    const avgSpeed = Math.round((totalSpeed / data.length) * 100) / 100;
                    const results = {
                        max: maxSpeed,
                        avg: avgSpeed,
                        type: 'upload'
                    };

                    const status = this.getFeedback(avgSpeed);
                    const summary = this.getSummary(results);

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
                return {
                    uploadAvg: { message: labels.uploadAvg, value: `${results.avg} Mbps` },
                    uploadMax: { message: labels.uploadMax, value: `${results.max} Mbps` }
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {number} result
             * @returns {object}
             */
            getFeedback(result) {
                const optimal = initConfig.optimal / _mega;
                const status = getStatus((100 / optimal) * result, _thresholds);

                status.id = initConfig.id;
                status.title = labels.title;

                return status;
            }
        };
    };
});
