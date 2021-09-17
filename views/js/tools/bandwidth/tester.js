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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'i18n',
    'async',
    'context',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/stats',
    'taoClientDiagnostic/tools/fixedDecimals',
    'taoClientDiagnostic/tools/getStatus'
], function(_, __, async, context, getConfig, getLabels, stats, fixedDecimals, getStatus) {
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
     * Duration of one second (in milliseconds)
     * @type {number}
     * @private
     */
    const _second = 1000;

    /**
     * A list of thresholds for bandwidth check
     * @type {Array}
     * @private
     */
    const _thresholds = [
        {
            threshold: 0,
            message: __('Low bandwidth'),
            type: 'error'
        },
        {
            threshold: 33,
            message: __('Average bandwidth'),
            type: 'warning'
        },
        {
            threshold: 66,
            message: __('Good bandwidth'),
            type: 'success'
        }
    ];

    /**
     * Default values for the bandwidth tester
     * @type {object}
     * @private
     */
    const _defaults = {
        id: 'bandwidth',

        // The typical bandwidth needed for a test taker (Mbps)
        unit: 0.16,

        // The thresholds for optimal bandwidth
        ideal: 45,

        // Maximum number of test takers to display
        max: 100,

        // Lowest value that will be used in the global score computation
        minimumGlobalPercentage: false,

        // A list of thresholds for bandwidth check
        feedbackThresholds: _thresholds,

        fallbackThreshold: 0.2
    };

    /**
     * List of descriptors defining the data sets to download.
     * - file : path of the file containing the test data
     * - size : the given size of the file
     * - timeout : the timeout for the download
     * - threshold : a bandwidth threshold above which the data set can be downloaded to evaluate a more accurate value
     * - nb : number of download iterations
     * @type {object}
     * @private
     */
    const _downloadData = {
        '10KB': {
            id: '10KB',
            file: 'data/bin10KB.data',
            size: 10 * _kilo,
            timeout: _second,
            threshold: 0,
            nb: 10
        },
        '100KB': {
            id: '100KB',
            file: 'data/bin100KB.data',
            size: 100 * _kilo,
            timeout: 2 * _second,
            threshold: 0,
            nb: 5
        },
        '1MB': {
            id: '1MB',
            file: 'data/bin1MB.data',
            size: _mega,
            timeout: 20 * _second,
            threshold: 0,
            nb: 3
        }
    };

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {object[]}
     * @private
     */
    const _messages = [
        // level 1
        {
            title: __('Bandwidth'),
            status: __('Checking the bandwidth...'),
            legend: __('Number of simultaneous test takers the connection can handle'),
            bandwidthMin: __('Minimum bandwidth'),
            bandwidthMax: __('Maximum bandwidth'),
            bandwidthAverage: __('Average bandwidth')
        },
        // level 2
        {
            title: __('Media intensive bandwidth'),
            status: __('Checking the media intensive bandwidth...'),
            legend: __('Number of simultaneous test takers the connection can handle with media intensive'),
            bandwidthMin: __('Minimum intensive bandwidth'),
            bandwidthMax: __('Maximum intensive bandwidth'),
            bandwidthAverage: __('Average intensive bandwidth')
        }
    ];

    /**
     * Download a data set as described by the provided descriptor and compute the duration.
     * @param {object} data The data set descriptor to use for download
     * @param {Function} cb A callback function called at the end of the download.
     * This callback is also called if a timeout breaks the download;
     * @private
     */
    function download(data, cb) {
        if (data.threshold && this.bandwidth < data.threshold) {
            return cb('threshold');
        }

        const start = window.performance.now();
        const url = `${context['root_url']}taoClientDiagnostic/views/js/tools/bandwidth/${data.file}?${Date.now()}`;
        const timeoutId = window.setTimeout(cb, data.timeout, 'timeout');
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader('Accept', 'application/octet-stream');

        request.onload = () => {
            const end = window.performance.now();
            clearTimeout(timeoutId);

            const duration = end - start;
            const bytes = data.size;
            const seconds = duration / _second;

            // speed in Mbps
            const speed = (bytes * 8) / seconds / _mega;

            this.bandwidth = Math.max(this.bandwidth, speed);

            return cb(null, {
                id: data.id,
                file: data.file,
                size: data.size,
                duration,
                speed
            });
        };
        request.onerror = err => {
            clearTimeout(timeoutId);
            cb(err);
        };

        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status !== 200) {
                clearTimeout(timeoutId);
                cb(request.status);
            }
        };

        request.send();
    }

    /**
     * Performs a bandwidth test by downloading a bunch of data sets with different sizes
     *
     * @param {object} config - Some optional configs
     * @param {string} [config.id] - The identifier of the test
     * @param {number} [config.unit] - The typical bandwidth needed for a test taker (Mbps)
     * @param {number} [config.ideal] - The thresholds for optimal bandwidth
     * @param {number} [config.max] - Maximum number of test takers to display
     * @param {string} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {object}
     */
    return function bandwidthTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        // override the feedback thresholds given by the config in case it is an empty array
        if (_.isArray(initConfig.feedbackThresholds) && !initConfig.feedbackThresholds.length) {
            initConfig.feedbackThresholds = _thresholds;
        }

        return {
            /**
             * Performs a bandwidth test, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                const tests = [];

                _.forEach(_downloadData, data => {
                    const cb = download.bind(this, data);
                    let iterations = data.nb || 1;
                    while (iterations--) {
                        tests.push(cb);
                    }
                });

                this.bandwidth = 0;

                async.series(tests, (err, measures) => {
                    let duration = 0;
                    let size = 0;
                    const decimals = 2;
                    const resultsBySize = {};

                    function getValue(value) {
                        let speed = 0;

                        if (value) {
                            duration += value.duration;
                            size += value.size;

                            speed = value.speed;
                            value.speed = fixedDecimals(speed, decimals);
                        }

                        return speed;
                    }

                    if (err && !measures.length) {
                        //something went wrong
                        throw err;
                    }
                    const results = stats(measures, getValue, decimals);

                    _.forEach(_downloadData, (data, key) => {
                        resultsBySize[key] = stats(
                            _.filter(measures, o => o.id === key),
                            getValue,
                            decimals
                        );
                    });

                    results.duration = fixedDecimals(duration / _second, decimals);
                    results.size = size;

                    const summary = this.getSummary(results);
                    const status = this.getFeedback(results, resultsBySize);

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
                    bandwidthMin: { message: labels.bandwidthMin, value: results.min + ' Mbps' },
                    bandwidthMax: { message: labels.bandwidthMax, value: results.max + ' Mbps' },
                    bandwidthAverage: { message: labels.bandwidthAverage, value: results.average + ' Mbps' }
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {object} result
             * @param {number} result.max
             * @param {number} result.min
             * @param {number} result.average
             * @param {object} resultsBySize - result statistics grouped by size
             * @returns {object}
             */
            getFeedback(result, resultsBySize) {
                const avgResult = result.average;
                const bandwidthUnit = initConfig.unit;
                const threshold = initConfig.ideal;
                const maxTestTakers = initConfig.max;
                const max = threshold * bandwidthUnit;
                const getStatusOptions = initConfig.minimumGlobalPercentage
                    ? { minimumGlobalPercentage: initConfig.minimumGlobalPercentage }
                    : {};
                const baseBandwidth = avgResult;
                let stable = true;

                _.forEach(resultsBySize, resultBySize => {
                    if (resultBySize.min / resultBySize.average < initConfig.fallbackThreshold) {
                        stable = false;
                    }
                });

                const status = getStatus((baseBandwidth / max) * 100, initConfig.feedbackThresholds, getStatusOptions);

                let nb = Math.floor(baseBandwidth / bandwidthUnit);

                if (nb > maxTestTakers) {
                    nb = '>' + maxTestTakers;
                }

                status.id = initConfig.id;
                status.title = labels.title;
                status.feedback.legend = labels.legend;
                status.quality.label = nb;

                if (!stable) {
                    status.feedback.type = 'warning';
                    status.feedback.message = __(
                        'Unstable bandwidth, temporary fluctuations in connection speed may affect test taker experience.'
                    );
                    status.feedback.legend = __('Simultaneous test takers under normal connection conditions.');
                }

                if (nb.toString().length > 2) {
                    status.quality.wide = true;
                }

                return status;
            }
        };
    };
});
