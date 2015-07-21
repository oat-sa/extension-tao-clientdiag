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
define(['lodash', 'async', 'context', 'lib/polyfill/performance-now'], function(_, async, context){
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
     * Number of samples to download to estimate connection speed before computing the bandwidth
     * @type {Number}
     * @private
     */
    var _nbSamples = 3;

    /**
     * List of descriptors defining the test data sets.
     * - file : path of the file containing the test data
     * - size : the given size of the file
     * - threshold : the maximum allowed time for download
     * @type {Object}
     */
    var downloadData = {
        "10KB" : {
            file : 'data/bin10KB.data',
            size : 10 * _kilo,
            threshold : -1
        },
        "100KB" : {
            file : 'data/bin100KB.data',
            size : 100 * _kilo,
            threshold : 5 * _second
        },
        "1MB" : {
            file : 'data/bin1MB.data',
            size : _mega,
            threshold : 30 * _second
        },
        "10MB" : {
            file : 'data/bin10MB.data',
            size : 10 * _mega,
            threshold : 60 * _second
        },
        "100MB" : {
            file : 'data/bin100MB.data',
            size : 100 * _mega,
            threshold : 2 * 60 * _second
        }
    };

    /**
     * Download a data set as described by the provided descriptor and compute the duration.
     * @param {Object} data The data set descriptor to use for download
     * @param {Function} cb A callback function called at the end of the download.
     * This callback is also called if a timeout breaks the download;
     */
    var download = function download(data, cb){
        var start, end;
        var timeoutId;
        var url = context.root_url + '/taoClientDiagnostic/views/js/tools/bandwith/' + data.file + '?' + Date.now();
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader('Accept', 'application/octet-stream');

        request.onload = function onRequestLoad (){
            end = window.performance.now();
            clearTimeout(timeoutId);
            return cb(null, {
                file : data.file,
                size : data.size,
                duration : end - start
            });
        };
        request.onerror = function onRequestError (err){
            clearTimeout(timeoutId);
            cb(err);
        };

        if(data.threshold > 0){
            timeoutId = _.delay(cb, data.threshold, 'timeout');
        }
        start = window.performance.now();
        request.send();
    };

    /**
     * Computes the speed in bytes per seconds
     * @param {Object} result
     * @returns {Number}
     */
    var getSpeed = function getSpeed(result) {
        var bytes = result.size;
        var seconds = result.duration / _second;
        return bytes / seconds;
    };

    /**
     * Estimates the available connection speed to adjust threshold timeouts.
     * The speed is estimated in bytes per seconds.
     * @param {Function} done A callback function called to provide the result
     */
    var getConnectionSpeed = function getConnectionSpeed(done) {
        var len = _nbSamples;
        var samples = [];

        while (len --) {
            samples.push(_.partial(download, downloadData["10KB"]));
        }

        async.series(samples, function(err, results){
            var sum;
            if(err && !results.length){
                //something went wrong
                throw err;
            }

            sum = _.reduce(results, function(acc, result) {
                return acc + getSpeed(result);
            }, 0);

            done( sum / results.length );
        });
    };

    /**
     * Performs a bandwidth test by downloading a bunch of data sets with different sizes
     *
     * @returns {{start: Function}}
     */
    var bandWithTester = function bandWithTester (){
        return {
            /**
             * Performs a bandwidth test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done){
                getConnectionSpeed(function(unit) {
                    var tests = _.map(downloadData, function(data){

                        // Set a custom threshold timeout based on the connection speed.
                        // This timeout is computed from the amount of data to download,
                        // related to the connection speed and a tolerance of 20%.
                        if (unit && data.threshold > 0) {
                            data = _.assign({}, data);
                            data.threshold = Math.ceil((data.size / unit) * 1.2) * _second;
                        }

                        return _.partial(download, data);
                    });

                    async.series(tests, function(err, results){
                        var sum;
                        if(err && !results.length){
                            //something went wrong
                            throw err;
                        }

                        sum = _.reduce(results, function(acc, result){
                            //Speed in Mbps
                            var speed =  getSpeed(result) / _mega * 8;
                            speed = Math.round( speed * 100) / 100;

                            return acc + speed;
                        }, 0);

                        done( sum / results.length );
                    });
                });
            }
        };
    };


    return bandWithTester;
});
