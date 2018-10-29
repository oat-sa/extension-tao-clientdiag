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
 * Copyright (c) 2015-2017 (original work) Open Assessment Technologies SA ;
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
     * @type {Number}
     * @private
     */
    var _kilo = 1024;

    /**
     * A binary mega bytes (MiB)
     * @type {Number}
     * @private
     */
    var _mega = _kilo * _kilo;

    /**
     * Duration of one second (in milliseconds)
     * @type {Number}
     * @private
     */
    var _second = 1000;

    /**
     * A list of thresholds for bandwidth check
     * @type {Array}
     * @private
     */
    var _thresholds = [{
        threshold: 0,
        message: __('Low bandwidth'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average bandwidth'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good bandwidth'),
        type: 'success'
    }];

    /**
     * Default values for the bandwidth tester
     * @type {Object}
     * @private
     */
    var _defaults = {
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
     * @type {Object}
     */
    var _downloadData = {
        "10KB" : {
            id : '10KB',
            file : 'data/bin10KB.data',
            size : 10 * _kilo,
            timeout : _second,
            threshold : 0,
            nb : 10
        },
        "100KB" : {
            id : '100KB',
            file : 'data/bin100KB.data',
            size : 100 * _kilo,
            timeout : 2 * _second,
            threshold : 0,
            nb : 5
        },
        "1MB" : {
            id : '1MB',
            file : 'data/bin1MB.data',
            size : _mega,
            timeout : 20 * _second,
            threshold : 0,
            nb : 3
        }
    };

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {Object}
     * @private
     */
    var _messages = [
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
     * @param {Object} data The data set descriptor to use for download
     * @param {Function} cb A callback function called at the end of the download.
     * This callback is also called if a timeout breaks the download;
     */
    function download(data, cb) {
        var self = this;
        var start, end;
        var timeoutId;
        var url;
        var request;

        if (data.threshold && this.bandwidth < data.threshold) {
            return cb('threshold');
        }

        url = context['root_url'] + 'taoClientDiagnostic/views/js/tools/bandwidth/' + data.file + '?' + Date.now();
        request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader('Accept', 'application/octet-stream');

        request.onload = function onRequestLoad () {
            var duration;
            var bytes;
            var seconds;
            var speed;

            end = window.performance.now();
            clearTimeout(timeoutId);

            duration = end - start;
            bytes = data.size;
            seconds = duration / _second;

            // speed in Mbps
            speed = ((bytes * 8) / seconds) / _mega;

            self.bandwidth = Math.max(self.bandwidth, speed);

            return cb(null, {
                id : data.id,
                file : data.file,
                size : data.size,
                duration : duration,
                speed : speed
            });
        };
        request.onerror = function onRequestError (err) {
            clearTimeout(timeoutId);
            cb(err);
        };

        request.onreadystatechange = function () {
            if(request.readyState === 4 && request.status !== 200) {
                clearTimeout(timeoutId);
                cb(request.status);
            }
        };

        timeoutId = _.delay(cb, data.timeout, 'timeout');
        start = window.performance.now();
        request.send();
    }

    /**
     * Performs a bandwidth test by downloading a bunch of data sets with different sizes
     *
     * @param {Object} config - Some optional configs
     * @param {String} [config.id] - The identifier of the test
     * @param {Number} [config.unit] - The typical bandwidth needed for a test taker (Mbps)
     * @param {Number} [config.ideal] - The thresholds for optimal bandwidth
     * @param {Number} [config.max] - Maximum number of test takers to display
     * @param {String} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {Object}
     */
    function bandwidthTester (config) {
        var initConfig = getConfig(config, _defaults);
        var labels = getLabels(_messages, initConfig.level);

        // override the feedback thresholds given by the config in case it is an empty array
        if (_.isArray(initConfig.feedbackThresholds) && !initConfig.feedbackThresholds.length) {
            initConfig.feedbackThresholds = _thresholds;
        }

        return {
            /**
             * Performs a bandwidth test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done) {
                var self = this;
                var tests = [];

                _.forEach(_downloadData, function(data) {
                    var cb = _.bind(download, self, data);
                    var iterations = data.nb || 1;
                    while (iterations --) {
                        tests.push(cb);
                    }
                });

                this.bandwidth = 0;

                async.series(tests, function(err, measures) {
                    var duration = 0;
                    var size = 0;
                    var decimals = 2;
                    var results;
                    var summary;
                    var status;

                    function getValue(value) {
                        var speed = 0;

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

                    results = stats(measures, getValue, decimals);

                    results.duration = fixedDecimals(duration / _second, decimals);
                    results.size = size;

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
             * @returns {Object}
             */
            getSummary: function getSummary(results) {
                return {
                    bandwidthMin: {message: labels.bandwidthMin, value: results.min + ' Mbps'},
                    bandwidthMax: {message: labels.bandwidthMax, value: results.max + ' Mbps'},
                    bandwidthAverage: {message:  labels.bandwidthAverage, value: results.average + ' Mbps'}
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {Object} result
             * @param {Number} result.max
             * @param {Number} result.min
             * @param {Number} result.average
             * @returns {Object}
             */
            getFeedback: function getFeedback(result) {
                var avgResult = result.average;
                var bandwidthUnit = initConfig.unit;
                var threshold = initConfig.ideal;
                var maxTestTakers = initConfig.max;
                var max = threshold * bandwidthUnit;
                var getStatusOptions = (initConfig.minimumGlobalPercentage)
                    ? { minimumGlobalPercentage: initConfig.minimumGlobalPercentage }
                    : {};
                var baseBandwidth = avgResult;
                var status;
                var nb;

                if (result.min / avgResult > initConfig.fallbackThreshold){
                    baseBandwidth = result.min;
                }

                status = getStatus(
                    baseBandwidth / max * 100,
                    initConfig.feedbackThresholds,
                    getStatusOptions
                );

                nb = Math.floor(baseBandwidth / bandwidthUnit );


                if (nb > maxTestTakers) {
                    nb = '>' + maxTestTakers;
                }

                status.id = initConfig.id;
                status.title = labels.title;
                status.feedback.legend = labels.legend;
                status.quality.label = nb;

                if (nb.toString().length > 2) {
                    status.quality.wide = true;
                }

                return status;
            }
        };
    }

    return bandwidthTester;
});
