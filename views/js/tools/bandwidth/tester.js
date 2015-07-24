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
    'async',
    'context',
    'taoClientDiagnostic/tools/stats',
    'taoClientDiagnostic/tools/fixedDecimals',
    'lib/polyfill/performance-now'
], function(_, async, context, stats, fixedDecimals) {
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
     * List of descriptors defining the data sets to download.
     * - file : path of the file containing the test data
     * - size : the given size of the file
     * - timeout : the timeout for the download
     * - nb : number of download iterations
     * @type {Object}
     */
    var _downloadData = {
        "10KB" : {
            id : '10KB',
            file : 'data/bin10KB.data',
            size : 10 * _kilo,
            timeout : _second,
            nb : 10
        },
        "100KB" : {
            id : '100KB',
            file : 'data/bin100KB.data',
            size : 100 * _kilo,
            timeout : 2 * _second,
            nb : 5
        },
        "1MB" : {
            id : '1MB',
            file : 'data/bin1MB.data',
            size : _mega,
            timeout : 20 * _second,
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
        var start, end;
        var timeoutId;
        var url = context.root_url + '/taoClientDiagnostic/views/js/tools/bandwidth/' + data.file + '?' + Date.now();
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader('Accept', 'application/octet-stream');

        request.onload = function onRequestLoad () {
            end = window.performance.now();
            clearTimeout(timeoutId);
            return cb(null, {
                id : data.id,
                file : data.file,
                size : data.size,
                duration : end - start
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
     * @returns {{start: Function}}
     */
    var bandwidthTester = function bandwidthTester (){
        return {
            /**
             * Performs a bandwidth test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done){
                var tests = [];
                _.forEach(_downloadData, function(data) {
                    var cb = _.partial(download, data);
                    var iterations = data.nb || 1;
                    while (iterations --) {
                        tests.push(cb);
                    }
                });

                async.series(tests, function(err, measures) {
                    var duration = 0;
                    var size = 0;
                    var decimals = 2;
                    var getValue;
                    var results;

                    if (err && !measures.length) {
                        //something went wrong
                        throw err;
                    }

                    getValue = function(value) {
                        var bytes;
                        var seconds;
                        var speed = 0;

                        if (value) {
                            bytes = value.size;
                            seconds = value.duration / _second;
                            speed = bytes / seconds;

                            duration += seconds;
                            size += bytes;

                            //Speed in Mbps
                            speed = speed * 8 / _mega;
                            value.speed = fixedDecimals(speed, decimals);
                        }

                        return speed;
                    };

                    results = stats(measures, getValue, decimals);

                    results.duration = fixedDecimals(duration, decimals);
                    results.size = size;

                    done(results.average, results);
                });
            }
        };
    };

    return bandwidthTester;
});
