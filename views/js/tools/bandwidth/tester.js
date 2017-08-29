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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'i18n',
    'async',
    'context',
    'taoClientDiagnostic/tools/getconfig',
    'taoClientDiagnostic/tools/stats',
    'taoClientDiagnostic/tools/fixedDecimals',
    'taoClientDiagnostic/tools/diagnostic/status',
    'lib/polyfill/performance-now'
], function(_, __, async, context, getConfig, stats, fixedDecimals, statusFactory) {
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
     * Default values for the bandwidth tester
     * @type {Object}
     * @private
     */
    var _defaults = {
        // The typical bandwidth needed for a test taker (Mbps)
        unit: 0.16,

        // The thresholds for optimal bandwidth
        ideal: 45,

        // Maximum number of test takers to display
        max: 100
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
     * Download a data set as described by the provided descriptor and compute the duration.
     * @param {Object} data The data set descriptor to use for download
     * @param {Function} cb A callback function called at the end of the download.
     * This callback is also called if a timeout breaks the download;
     */
    var download = function download(data, cb) {
        var self = this;
        var start, end;
        var timeoutId;
        var url;
        var request;

        if (data.threshold && this.bandwidth < data.threshold) {
            return cb('threshold');
        }

        url = context.base_www + 'js/tools/bandwidth/' + data.file + '?' + Date.now();
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

        timeoutId = _.delay(cb, data.timeout, 'timeout');
        start = window.performance.now();
        request.send();
    };

    /**
     * Performs a bandwidth test by downloading a bunch of data sets with different sizes
     *
     * @returns {Object}
     */
    var bandwidthTester = function bandwidthTester (config, diagnosticTool) {
        var initConfig = getConfig(config || {}, _defaults);

        return {
            /**
             * Performs a bandwidth test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done) {
                var self = this;
                var tests = [];

                diagnosticTool.changeStatus(__('Checking the bandwidth...'));

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
                    var getValue;
                    var results;
                    var summary;
                    var status;
                    var nb;
                    var bandwidthUnit = initConfig.unit;
                    var threshold = initConfig.ideal;
                    var maxTestTakers = initConfig.max;
                    var max = threshold * bandwidthUnit;

                    if (err && !measures.length) {
                        //something went wrong
                        throw err;
                    }

                    getValue = function(value) {
                        var speed = 0;

                        if (value) {
                            duration += value.duration;
                            size += value.size;

                            speed = value.speed;
                            value.speed = fixedDecimals(speed, decimals);
                        }

                        return speed;
                    };

                    results = stats(measures, getValue, decimals);

                    results.duration = fixedDecimals(duration / _second, decimals);
                    results.size = size;

                    summary = {
                        bandwidthMin: {message: __('Minimum bandwidth'), value: results.min + ' Mbps'},
                        bandwidthMax: {message: __('Maximum bandwidth'), value: results.max + ' Mbps'},
                        bandwidthAverage: {message: __('Average bandwidth'), value: results.average + ' Mbps'}
                    };

                    status = statusFactory().getStatus(results.max / max * 100, 'bandwidth');
                    nb = Math.floor(results.max / bandwidthUnit);

                    if (nb > maxTestTakers) {
                        nb = '>' + maxTestTakers;
                    }

                    status.id = 'bandwidth';
                    status.title = __('Bandwidth');
                    status.feedback.legend = __('Number of simultaneous test takers the connection can handle');
                    diagnosticTool.addCustomFeedbackMsg(status, diagnosticTool.getCustomMsg('diagBandwithCheckResult'));

                    status.quality.label = nb;

                    if (nb.toString().length > 2) {
                        status.quality.wide = true;
                    }

                    done(status, summary, results);
                });
            }
        };
    };

    return bandwidthTester;
});
