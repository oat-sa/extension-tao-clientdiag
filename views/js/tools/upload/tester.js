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
    'util/url',
    'taoClientDiagnostic/tools/stats',
    'taoClientDiagnostic/tools/fixedDecimals',
    'lib/polyfill/performance-now'
], function($, _, async, urlHelper, context, stats, fixedDecimals) {
    'use strict';

    /**
     * A binary kilo bytes (KiB)
     * @type {Number}
     * @private
     */
    var _kilo = 1024;

    /**
     * Result of calibration requests
     */
    var calibrationData = {
        total : 0
    };

    /**
     * Number of calibration requests
     * @type {number}
     */
    var calibrationRequestsNum = 3;

    /**
     * Generate random string of given length
     * @param length
     */
    var generateStr = function generateStr(length) {
        var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };

    /**
     * Download a data set as described by the provided descriptor and compute the duration.
     * @param {Object} data The data set descriptor to use for download
     * @param {Function} cb A callback function called at the end of the download.
     * This callback is also called if a timeout breaks the download;
     */
    var upload = function upload(size) {
        var url;
        var str;
        var result;
        var time;

        url = urlHelper.route('upload', 'CompatibilityChecker', 'taoClientDiagnostic', {cache : Date.now()});
        str = generateStr(size);

        time = Date.now();
        $.ajax({
            url : url,
            type : 'POST',
            data : {
                upload : str
            },
            async : false,
            success : function (resp) {
                result = resp;
            }
        });
        result.time = Date.now() - time;
        return result;
    };

    /**
     * Performs a bandwidth test by downloading a bunch of data sets with different sizes
     *
     * @returns {Object}
     */
    var bandwidthTester = function bandwidthTester (config){
        return {
            /**
             * Performs a bandwidth test, then call a function to provide the result
             * @param {Function} done
             */
            start : function start(done){
                var report = {
                    min : 0,
                    max : 0,
                    average : 0,
                };
                var total = 0;
                var successRequests = 0;
                var successCalibrationRequests = 0;

                for (var calibrationRequest = 0; calibrationRequest < calibrationRequestsNum; calibrationRequest++) {
                    var result = upload(0);
                    if (result.success) {
                        calibrationData.total += result.time;
                        successCalibrationRequests++;
                    }
                }

                calibrationData.average = calibrationData.total / successCalibrationRequests;

                _.forEach(config.cases, function (size) {
                    var result = upload(parseInt(size, 10));
                    var speed;
                    if (result.success) {
                        speed = size / ((result.time - calibrationData.average) / 1000); //bytes per sec

                        if (report.min === 0 || report.min > speed) {
                            report.min = speed;
                        }

                        if (report.max < speed) {
                            report.max = speed;
                        }

                        total += speed;
                        successRequests++;
                    }
                });
                report.average = (total / successRequests) * 8 / (1024 * 1024); //Mbps
                report.max = report.max * 8 / (1024 * 1024); //Mbps
                report.min = report.min * 8 / (1024 * 1024); //Mbps
                done(report);
            }
        };
    };

    return bandwidthTester;
});
