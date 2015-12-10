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
    'lodash',
    'i18n',
    'async',
    'helpers',
    'layout/loading-bar',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/bandwidth/tester',
    'ui/feedback'
], function ($, _, __, async, helpers, loadingBar, performancesTester, bandwidthTester, feedback) {
    'use strict';

    /**
     * The typical bandwidth needed for a test taker (Mbps)
     * @type {Number}
     */
    var bandwidthUnit = 0.16;

    /**
     * The thresholds for optimal bandwidth. One by bar.
     * @type {Array}
     */
    var testTakers = [
        45
    ];

    /**
     * Maximum number of test takers to display
     * @type {Number}
     */
    var maxTestTakers = 100;

    /**
     * The threshold for optimal performances
     * @type {Number}
     */
    var performanceOptimal = 0.025;

    /**
     * The threshold for minimal performances
     * @type {Number}
     */
    var performanceThreshold = 0.25;

    /**
     * A list of thresholds
     * @type {Array}
     */
    var thresholds = [{
        threshold: 0,
        message: __('Very slow performance'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average performance'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good performance'),
        type: 'success'
    }];

    /**
     * A list of thresholds for bandwidth
     * @type {Array}
     */
    var bandwidthThresholds = [{
        threshold: 0,
        message: __('Low bandwidth'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average bandwidth'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good bandwidth'),
        type: 'success'
    }];

    /**
     * A list of thresholds for summary
     * @type {Array}
     */
    var summaryThresholds = [{
        threshold: 0,
        message: __('Your system requires a compatibility update, please contact your system administrator.'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Your system is not optimal, please contact your system administrator.'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Your system is fully compliant.'),
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
     * Gets the config related to a particular checker
     * @param {String} name
     * @returns {Object}
     */
    var getResultConfig = function(name) {
        var $result = $('[data-result="' + name + '"]');
        var config = $result.data('config');
        return config || {};
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

        if (_.isNumber(status.label) || _.isString(status.label)) {
            $indicator.attr('title', status.label);
            $indicator.toggleClass('wide', status.label.toString().length > 2);
        }

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
        displayTestResult(name, status);
        if (score) {
            score[name] = status;
        }
    }

    /**
     * Displays the results summary
     * @param {Object} score
     */
    function displaySummary(score) {
        var total = _.min(score, 'percentage');
        displayTestResult('total', getStatus(summaryThresholds, total.percentage));
    }

    /**
     * Performs a browser checks
     * @param {Function} done
     */
    function checkBrowser(done) {
        var info = new WhichBrowser();
        var browser = info.browser;
        var os = info.os;
        var information = {
            browser: browser && browser.name || __('Unknown browser'),
            browserVersion: browser && browser.version && browser.version.original || __('Unknown version'),
            os: os && os.name || __('Unknown OS'),
            osVersion: os && os.version && (os.version.alias || os.version.original) || __('Unknown version')
        };

        // which browser
        $.post(
            helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
            information,
            function(data){
                if ('success' === data.type) {
                    data.percentage = 100;
                } else {
                    data.percentage = 0;
                }
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
     * @param {Object} config
     * @param {Number} [config.unit] - The typical bandwidth needed for a test taker (Mbps)
     * @param {Number} [config.ideal] - The ideal number of simultaneous test takers
     * @param {Number} [config.max] - Maximum number of test takers to display on a bar
     * @param {Function} done
     */
    function checkBandwidth(config, done) {
        var unit = config.unit || bandwidthUnit;
        var tt = config.ideal || testTakers;
        var maxTT = config.max || maxTestTakers;

        if (!_.isArray(tt)) {
            tt = [tt];
        }

        bandwidthTester().start(function(average, details) {
            storeData('bandwidth', details, function(){
                var status = [];

                _.forEach(tt, function(threshold) {
                    var max = threshold * unit;
                    var st = getStatus(bandwidthThresholds, details.max / max * 100);
                    var nb = Math.floor(details.max / unit);

                    if (nb > maxTT) {
                        nb = '>' + maxTT;
                    }

                    st.label = nb;
                    status.push(st);
                });

                done(status, details);
            });
        });
    }

    /**
     * Performs a browser performances check
     * @param {Object} config
     * @param {Array} [config.samples] - A list of samples to render in order to compute the rendering performances
     * @param {Number} [config.occurrences] - The number of renderings by samples
     * @param {Number} [config.timeout] - Max allowed duration for a sample rendering
     * @param {Number} [config.optimal] - The threshold for optimal performances
     * @param {Number} [config.threshold] - The threshold for minimal performances
     * @param {Function} done
     */
    function checkPerformance(config, done) {
        var optimal = config.optimal || performanceOptimal;
        var range = Math.abs(optimal - (config.threshold || performanceThreshold));

        performancesTester(config.samples, config.occurrences, config.timeout * 1000).start(function(average, details) {
            var cursor = range - average + optimal;
            var status = getStatus(thresholds, cursor / range * 100);

            storeData('performance', details, function(){
                done(status, details);
            });
        });
    }

    /**
     * Updates the displayed details
     * @param {Object} information
     */
    function displayDetails(information) {
        var $detailsTable = $('#details');
        $('tbody', $detailsTable).empty();
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
        var $detailsBtn = $('[data-action="display-details"]');
        var status, information = {};
        var scores = {};
        var $feedbackBox = $('#feedback-box');

        $testTriggerBtn.on('click', function(){
            loadingBar.start();
            $testTriggerBtn.hide();

            async.series([function(cb) {
                checkBrowser(function(status, details) {
                    _.assign(information, {
                        browser: {message: __('Web browser'), value: details.browser + ' ' + details.browserVersion},
                        os: {message: __('Operating system'), value: details.os + ' ' + details.osVersion}
                    });
                    displayDetails(information);
                    updateTestResult('browser', status, scores);
                    cb();
                });
            }, function(cb) {
                checkPerformance(getResultConfig('performance'), function(status, details) {
                    _.assign(information, {
                        performancesMin : {message : __('Minimum rendering time'), value:details.min + ' s'},
                        performancesMax : {message : __('Maximum rendering time'), value:details.max + ' s'},
                        performancesAverage : {message : __('Average rendering time'), value:details.average + ' s'}
                    });
                    displayDetails(information);
                    updateTestResult('performance', status, scores);
                    cb();
                });
            }, function(cb) {
                checkBandwidth(getResultConfig('bandwidth-0'), function(status, details) {
                    _.assign(information, {
                        bandwidthMin : {message : __('Minimum bandwidth'), value:details.min + ' Mbps'},
                        bandwidthMax : {message : __('Maximum bandwidth'), value:details.max + ' Mbps'},
                        bandwidthAverage : {message : __('Average bandwidth'), value:details.average + ' Mbps'}
                    });
                    displayDetails(information);

                    _.forEach(status, function(st, i) {
                        updateTestResult('bandwidth-' + i, st, scores);
                    });

                    cb();
                });
            }], function() {
                displaySummary(scores);
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


        if(!!$feedbackBox.data('error')){
            feedback().error($feedbackBox.data('error'));
        }
        if($feedbackBox.data('message')){
            feedback().error($feedbackBox.data('message'));
        }
    };

    /**
     * @exports
     */
    return init();
});
