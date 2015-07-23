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
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'async',
    'context',
    'lib/polyfill/performance-now'
], function($, _, async, context) {
    'use strict';

    /**
     * Duration of one second (in milliseconds)
     * @type {Number}
     * @private
     */
    var _second = 1000;

    /**
     * List of descriptors defining the pages to load.
     * - url : path of the page
     * - timeout : the timeout for the run
     * - nb : number of tests iterations
     * @type {Object}
     * @private
     */
    var _samples = {
        'sample' : {
            id : 'sample',
            url : 'data/sample.html',
            timeout : 30 * _second,
            nb : 3
        }
    };

    /**
     * Loads a page inside a frame and compute the time to load
     * @param {Object} data The descriptor of the page to load
     * @param {Function} done A callback function called to provide the result
     */
    var loadFrame = function loadFrame(data, done) {
        var url = context.root_url + '/taoClientDiagnostic/views/js/tools/performances/' + data.url + '?' + Date.now();
        var $frame = $('<iframe name="performancesCheck" style="position: absolute; left: -100000px;" />');
        var frameEl = $frame.get(0);
        var frameWindow;
        var framePerf;
        var framePerfData;
        var totalDuration;
        var networkDuration;
        var requestDuration;
        var displayDuration;
        var start;
        var end;
        var requestStart;
        var responseEnd;

        $frame.on('load', function() {
            // use a deferred call to be sure the function is executed after load
            setTimeout(function() {
                end = Date.now();
                frameWindow = frameEl.contentWindow;
                framePerf = frameWindow && frameWindow.performance;

                framePerfData = framePerf && framePerf.timing;
                if (framePerfData) {
                    totalDuration = Math.round(framePerf.now());
                    start = framePerfData.navigationStart;
                    responseEnd = framePerfData.responseEnd;
                    requestStart = framePerfData.requestStart;

                    displayDuration = end - responseEnd;
                    networkDuration = responseEnd - start;
                    requestDuration = responseEnd - requestStart;
                } else {
                    totalDuration = end - start;
                    displayDuration = totalDuration;
                    networkDuration = 0;
                    requestDuration = 0;
                }

                done(null, {
                    id : data.id,
                    url : data.url,
                    totalDuration: totalDuration,
                    networkDuration : networkDuration,
                    requestDuration : requestDuration,
                    displayDuration : displayDuration,
                    performance: framePerfData
                });

                $frame.remove();
            }, 0);
        }).appendTo('body');

        start = Date.now();
        $frame.attr('src', url);
    };

    /**
     * Rounds a value to a fixed number of decimals
     * @param {Number} value The value to round
     * @param {Number} decimals The number of decimal
     * @returns {Number}
     */
    var fixedDecimals = function fixedDecimals(value, decimals) {
        var shift = Math.pow(10, Math.abs(decimals || 0));
        return Math.round(value * shift) / shift;
    };

    /**
     * Performs a browser performances test by running a heavy page
     *
     * @returns {{start: Function}}
     */
    var performancesTester = function performancesTester() {
        return {
            /**
             * Performs a performances test, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var tests = [];
                _.forEach(_samples, function(data) {
                    var cb = _.partial(loadFrame, data);
                    var iterations = data.nb || 1;
                    while (iterations --) {
                        tests.push(cb);
                    }
                });

                async.series(tests, function(err, measures) {
                    var sum;
                    var sum2;
                    var avg;
                    var min = Number.MAX_VALUE;
                    var max = 0;
                    var variance;
                    var results;
                    var count = measures.length;

                    if(err && !count){
                        //something went wrong
                        throw err;
                    }

                    // compute each duration, then compute the sum
                    sum = _.reduce(measures, function(acc, measure) {
                        var duration = measure.displayDuration;
                        min = Math.min(min, duration);
                        max = Math.max(max, duration);
                        return acc + duration;
                    }, 0);

                    avg = sum / (count || 1);

                    // compute the sum of variances
                    sum2 = _.reduce(measures, function(acc, measure) {
                        var duration = measure.displayDuration;
                        var diff = duration - avg;

                        return acc + diff * diff;
                    }, 0);

                    variance = count > 1 ? sum2 / (count - 1) : 0;

                    results = {
                        min : min,
                        max : max,
                        average : fixedDecimals(avg, 2),
                        variance : fixedDecimals(variance, 2),
                        measures : measures
                    };

                    done( results.average, results );
                });
            }
        };
    };

    return performancesTester;
});
