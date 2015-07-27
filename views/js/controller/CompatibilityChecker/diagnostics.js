/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

/**
 *
 * @author dieter <dieter@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'layout/loading-bar',
    'helpers',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/bandwidth/tester'
], function ($, __, loadingBar, helpers, performancesTester, bandwidthTester) {
    'use strict';

    /**
     * The typical bandwidth needed for a test taker (Mbps)
     * @type {Number}
     */
    var bandwidthUnit = 0.125;

    /**
     * The thresholds for optimal bandwidth. One by bar.
     * @type {Array}
     */
    var bandwidthThresholds = [
        20,
        30
    ];

    /**
     * The threshold for optimal performances
     * @type {Number}
     */
    var performanceThreshold = 250;

    /**
     * A list of thresholds
     * @type {Array}
     */
    var thresholds = [{
        threshold: 0,
        message: __("Very slow performance"),
        type: 'error'
    }, {
        threshold: 25,
        message: __('Average performance'),
        type: 'warning'
    }, {
        threshold: 75,
        message: __('Good performance'),
        type: 'success'
    }];

    /**
     * Gets the correct status message for a given percentage
     * @param {Number} percentage
     * @returns {String}
     */
    var getStatus = function(thresholds, percentage) {
        var len = thresholds.length;
        var status = thresholds[0];
        var i, step;

        percentage = Math.max(0, Math.min(100, Math.round(percentage)));

        for(i = 1; i < len; i++) {
            step = thresholds[i];
            if (step && percentage >= step.threshold) {
                status = step;
            } else {
                break;
            }
        }

        status = _.clone(status);
        status.percentage = percentage;

        return status;
    };

    /**
     * Set indicator and display bar
     *
     * @param {string} name
     * @param {object} status
     */
    function displayTestResult(name, status) {
        var $bar = $('[data-result="' + name + '"]'),
            $indicator = $bar.find('.quality-indicator');

        $bar.find('.feedback')
            .removeClass('feedback-error feedback-warning feedback-success')
            .addClass('feedback-' + status.type)
            .find('.msg').text(status.message);

        $bar.find('.icon')
            .removeClass('icon-error icon-warning icon-success')
            .addClass('icon-' + status.type);


        $bar.fadeIn(function() {
            if($indicator.length){
                $indicator.animate({
                    left: (status.percentage * $bar.outerWidth() / 100) - ($indicator.outerWidth() / 2)
                });
            }
        });
    }

    /**
     * Sets a particular bar, and update the total
     * @param {String} name
     * @param {Object} status
     * @param {Object} score
     */
    function updateTestResult(name, status, score) {
        var total;

        displayTestResult(name, status);
        if (score) {
            score[name] = status;
            total = _.min(score, 'percentage');
            displayTestResult('total', total);
        }
    }

    /**
     * Performs a browser checks
     * @param {Function} done
     */
    function checkBrowser(done) {
        var info = new WhichBrowser();
        var information = {
            browser: info.browser.name,
            browserVersion: info.browser.version.original,
            os: info.os.name,
            osVersion: info.os.version.alias || info.os.version.original
        };

        // which browser
        $.post(
            helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
            information,
            function(data){
                done(data, information);
            },
            "json"
        );
    }

    /**
     * Sends the detailed stats to the server
     * @param {String} type The type of stats
     * @param {Object} details The stats details
     * @param {Function} done A callback method called once server has responded
     */
    function storeData(type, details, done) {
        details = _.omit(details, 'values');
        details.type = type;

        $.post(
            helpers._url('storeData', 'CompatibilityChecker', 'taoClientDiagnostic'),
            details,
            done,
            "json"
        );
    };

    /**
     * Performs a browser bandwidth check
     * @param {Function} done
     */
    function checkBandwidth(done) {
        bandwidthTester().start(function(average, details) {
            storeData('bandwidth', details, function(){
                var status = [];

                _.forEach(bandwidthThresholds, function(threshold) {
                    var max = threshold * bandwidthUnit;
                    status.push(getStatus(thresholds, details.max / max * 100));
                });

                done(status, details);
            });
        });
    }

    /**
     * Performs a browser performances check
     * @param {Function} done
     */
    function checkPerformance(done) {
        performancesTester().start(function(average, details) {
            var max = 100;
            var status = getStatus(thresholds, performanceThreshold - average / max * 100);

            storeData('performance', details, function(){
                done(status, details);
            });
        });
    }

    function displayDetails(information) {
        var $detailsTable = $('#details');
        $.each(information, function(index, object) {
            var line = '<td>'+ object.message +'</td><td>'+ object.value +'</td>';
            $('tbody', $detailsTable).append('<tr>' + line + '</tr>');
        });
    }

    /**
     *
     */
    var init = function init(){

        var $testTriggerBtn = $('[data-action="test-launcher"]');
        var $bandWidthTriggerBtn = $('[data-action="bandwidth-launcher"]');
        var $detailsBtn = $('[data-action="display-details"]');
        var $bandWidthBox = $('.bandwidth-box'),
            status, information = {};
        var $detailsTable = $('#details');
        var scores = {};

        $testTriggerBtn.on('click', function(){
            loadingBar.start();
            $testTriggerBtn.hide();

            checkBrowser(function(status, details) {
                _.assign(information, {
                    browser : {message : __('Web browser'), value:details.browser + ' ' + details.browserVersion},
                    os      : {message : __('Operating system'), value:details.os + ' ' + details.osVersion}
                });
                updateTestResult('browser', status, scores);
            });

            checkPerformance(function(status, details) {
                _.assign(information, {
                    performancesMin : {message : __('Minimum rendering time'), value:details.min + ' s'},
                    performancesMax : {message : __('Maximum rendering time'), value:details.max + ' s'},
                    performancesAverage : {message : __('Average rendering time'), value:details.average + ' s'}
                });
                updateTestResult('performance', status, scores);

                loadingBar.stop();
                $bandWidthBox.show();
            });
        });


        $bandWidthTriggerBtn.on('click', function() {
            loadingBar.start();
            $bandWidthTriggerBtn.hide();

            checkBandwidth(function(status, details) {
                displayDetails({
                    bandwidthMin : {message : __('Minimum bandwidth'), value:details.min + ' Mbps'},
                    bandwidthMax : {message : __('Maximum bandwidth'), value:details.max + ' Mbps'},
                    bandwidthAverage : {message : __('Average bandwidth'), value:details.average + ' Mbps'}
                });

                _.forEach(status, function(st, i) {
                    updateTestResult('bandwidth-' + i, st, scores);
                });

                loadingBar.stop();
            });
        });

        $detailsBtn.on('click', function() {
            loadingBar.start();
            $detailsBtn.hide();

            displayDetails(information);

            status = getStatus(thresholds, 68);
            displayTestResult('details', status);

            loadingBar.stop();
        });
    };

    /**
     * @exports
     */
    return init();
});
