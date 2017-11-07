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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'async',
    'util/url',
    'taoClientDiagnostic/tools/getconfig',
    'taoClientDiagnostic/tools/diagnostic/status'
], function($, _, __, async, urlHelper, getConfig, statusFactory) {
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
        // Size of data to sent to server during speed test in bytes
        size: _mega,

        // Optimal speed in bytes per second
        optimal: _mega
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
     * @param {Object} diagnosticTool
     * @returns {Object}
     */
    var uploadTester = function uploadTester(config, diagnosticTool) {
        var initConfig = getConfig(config, _defaults);

        // Compute the level value that targets which messages list to use for the feedbacks.
        // It should be comprised within the available indexes.
        // Higher level will be down to the higher available, lower level will be up to the lowest.
        var level = Math.min(Math.max(parseInt(initConfig.level, 10), 1), _messages.length) - 1;

        return {
            /**
             * Performs upload speed test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done) {
                var jqXHR = upload(parseInt(initConfig.size, 10));
                diagnosticTool.changeStatus(_messages[level].status);
                jqXHR.then(function() {
                    var totalSpeed = 0;
                    var avgSpeed;
                    var maxSpeed = 0;
                    var optimal = initConfig.optimal / _mega;
                    var status, summary, result;

                    _.forEach(data, function (val) {
                        totalSpeed += val.speed;
                        if (maxSpeed < val.speed) {
                            maxSpeed = Math.round(val.speed * 100) / 100;
                        }
                    });
                    avgSpeed = Math.round(totalSpeed / data.length * 100) / 100;

                    status = statusFactory().getStatus((100 / optimal) * avgSpeed, 'upload');
                    summary = {
                        uploadAvg: {message: _messages[level].uploadAvg, value: avgSpeed + ' Mbps'},
                        uploadMax: {message: _messages[level].uploadMax, value: maxSpeed + ' Mbps'}
                    };

                    result = {
                        max: maxSpeed,
                        avg: avgSpeed,
                        type: 'upload'
                    };

                    status.id = initConfig.id || 'upload';
                    status.title =  _messages[level].title;
                    diagnosticTool.addCustomFeedbackMsg(status, diagnosticTool.getCustomMsg('diagUploadCheckResult'));

                    done(status, summary, result);
                });
            }
        };
    };

    return uploadTester;
});
