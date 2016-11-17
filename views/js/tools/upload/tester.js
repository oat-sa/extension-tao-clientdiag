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
    'jquery',
    'lodash',
    'async',
    'util/url'
], function($, _, async, urlHelper) {
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
     * Result of calibration requests
     */
    var data = [];

    /**
     * Generate random string of given length
     * @param length
     */
    var generateStr = function generateStr(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < length; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    };

    /**
     * Download a data set as described by the provided descriptor and compute the duration.
     * @param {Object} data The data set descriptor to use for download
     * @param {Function} cb A callback function called at the end of the download.
     * This callback is also called if a timeout breaks the download;
     */
    var upload = function upload(size) {

        var url = urlHelper.route('upload', 'CompatibilityChecker', 'taoClientDiagnostic', {cache : Date.now()});
        var str = generateStr(size);

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
    var uploadTester = function uploadTester (config){
        return {
            /**
             * Performs upload speed test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done) {
                var jqXHR = upload(parseInt(config.size, 10));
                jqXHR.then(function() {
                    done(data);
                });
            }
        };
    };

    return uploadTester;
});
