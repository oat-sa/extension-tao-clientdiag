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
    'taoClientDiagnostic/tools/diagnostic/status'
], function($, _, __, async, urlHelper, statusFactory) {
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
     * Generate random string of given length
     * @param length
     */
    var generateStr = function generateStr(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i=0; i < length; i++ ) {
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
                    if (evt.lengthComputable) {
                        var passedTime = Date.now() - startTime;
                        data.push({
                            time: passedTime,
                            loaded: evt.loaded,
                            speed: ((evt.loaded * 8) / _mega) / (passedTime / 1000)
                        });
                    }
                }, false);

                return xhr;
            },
        });
    };

    /**
     * Performs a upload speed test
     * @returns {Object}
     */
    var uploadTester = function uploadTester(config, diagnosticTool) {
        return {
            /**
             * Performs upload speed test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done) {
                var jqXHR = upload(parseInt(config.size, 10));
                diagnosticTool.changeStatus(__('Checking upload speed...'));
                jqXHR.then(function() {
                    var totalSpeed = 0;
                    var avgSpeed;
                    var maxSpeed = 0;
                    var optimal = config.optimal / 1024 / 1024;

                    _.forEach(data, function (val) {
                        totalSpeed += val.speed;
                        if (maxSpeed < val.speed) {
                            maxSpeed = Math.round(val.speed * 100) / 100;
                        }
                    });
                    avgSpeed = Math.round(totalSpeed / data.length * 100) / 100;

                    var status = statusFactory().getStatus((100 / optimal) * avgSpeed, 'upload');
                    var summary = {
                        uploadAvg: {message: __('Average upload speed'), value: avgSpeed + ' Mbps'},
                        uploadMax: {message: __('Max upload speed'), value: maxSpeed + ' Mbps'}
                    };

                    var result = {
                        max: maxSpeed,
                        avg: avgSpeed,
                        type: 'upload'
                    };

                    status.id = 'upload';
                    status.title = __('Upload speed');
                    diagnosticTool.addCustomFeedbackMsg(status, diagnosticTool.getCustomMsg('diagUploadCheckResult'));

                    done(status, summary, result);
                });
            }
        };
    };

    return uploadTester;
});
