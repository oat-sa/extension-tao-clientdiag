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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
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
     * Result of diagnostic
     */
    var data = [];

    /**
     * Default values for the upload speed tester
     * @type {Object}
     * @private
     */
    var _defaults = {
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
    var _thresholds = [{
        threshold: 0,
        message: __('Low upload speed'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average upload speed'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good upload speed'),
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
            title: __('Upload speed'),
            status: __('Checking upload speed...'),
            uploadAvg: __('Average upload speed'),
            uploadMax: __('Max upload speed')
        }
    ];

    /**
     * Generate random string of given length
     * @param length
     */
    var generateStr = function generateStr(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var i;

        for (i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    };

    /**
     * Upload generated string to check upload speed.
     * @param {number} size of string to upload in bytes
     * @return {object} jqXHR
     */
    var upload = function upload(size) {

        var url = urlHelper.route('upload', 'CompatibilityChecker', 'taoClientDiagnostic', {cache : Date.now()});
        var str = generateStr(size);
        data = [];

        return $.ajax({
            url : url,
            type : 'POST',
            data : {
                upload : str
            },
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                var startTime = Date.now();
                // Upload progress
                xhr.upload.addEventListener("progress", function(evt){
                    var passedTime;
                    if (evt.lengthComputable) {
                        passedTime = Date.now() - startTime;
                        data.push({
                            time: passedTime,
                            loaded: evt.loaded,
                            speed: ((evt.loaded * 8) / _mega) / (passedTime / 1000)
                        });
                    }
                }, false);

                return xhr;
            }
        });
    };

    /**
     * Performs a upload speed test
     * @param {Object} config - Some optional configs
     * @param {String} [config.id] - The identifier of the test
     * @param {Number} [config.size] - Size of data to sent to server during speed test in bytes
     * @param {Number} [config.optimal] - Optimal speed in bytes per second
     * @param {String} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {Object}
     */
    var uploadTester = function uploadTester(config) {
        var initConfig = getConfig(config, _defaults);
        var labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs upload speed test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done) {
                var self = this;

                upload(parseInt(initConfig.size, 10)).then(function() {
                    var totalSpeed = 0;
                    var avgSpeed;
                    var maxSpeed = 0;
                    var status, summary, results;

                    _.forEach(data, function (val) {
                        totalSpeed += val.speed;
                        if (maxSpeed < val.speed) {
                            maxSpeed = Math.round(val.speed * 100) / 100;
                        }
                    });
                    avgSpeed = Math.round(totalSpeed / data.length * 100) / 100;
                    results = {
                        max: maxSpeed,
                        avg: avgSpeed,
                        type: 'upload'
                    };

                    status = self.getFeedback(avgSpeed);
                    summary = self.getSummary(results);

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
                    uploadAvg: {message: labels.uploadAvg, value: results.avg + ' Mbps'},
                    uploadMax: {message: labels.uploadMax, value: results.max + ' Mbps'}
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {Number} result
             * @returns {Object}
             */
            getFeedback: function getFeedback(result) {
                var optimal = initConfig.optimal / _mega;
                var status = getStatus((100 / optimal) * result, _thresholds);

                status.id = initConfig.id;
                status.title =  labels.title;

                return status;
            }
        };
    };

    return uploadTester;
});
