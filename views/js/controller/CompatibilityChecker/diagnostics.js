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
    'helpers'

], function ($, __, loadingBar, helpers) {
    'use strict';

    /**
     * Gets the correct status message for a given percentage
     * @param {Number} percentage
     * @returns {String}
     */
    var getStatus = function(thresholds, percentage) {

        var len = thresholds.length;
        var status = thresholds[0];
        var i, step;

        for(i = 1; i < len; i++) {
            thresholds[i].percentage = percentage;
            step = thresholds[i];
            if (step && percentage >= step.threshold) {
                status = step;
            } else {
                break;
            }
        }

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
            $indicator = $bar.find('.quality-indicator'),
            percentageTxt = (function() {
                if(!status.percentage) {
                    return '';
                }
                var tmp = Math.round(status.percentage);
                tmp = Math.max(0, tmp);
                tmp = Math.min(100, tmp);
                return tmp.toString();
            }());

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
     *
     */
    function checkBrowser() {
        var info = new WhichBrowser();
        var osVersion = info.os.version.alias;
        if(osVersion === null){
            osVersion = info.os.version.original;
        }
        var information = {
            browser: info.browser.name,
            browserVersion: info.browser.version.original,
            os: info.os.name,
            osVersion: osVersion
        };


        // which browser
        $.post(
            helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
            information,
            function(data){
                displayTestResult('browser', data);
            },
            "json"
        );

        return {
            browser : {message : __('Browser'), value:information.browser + ' ' + information.browserVersion},
            os      : {message : __('Operating system'), value:information.os + ' ' + information.osVersion}
        };
    }

    /**
     *
     */
    function checkBandwidth() {
    }

    /**
     *
     */
    function checkPerformance() {
    }

    /**
     *
     */
    var init = function init(){

        var $testTriggerBtn = $('[data-action="test-launcher"]');
        var $bandWidthTriggerBtn = $('[data-action="bandwidth-launcher"]');
        var $detailsBtn = $('[data-action="display-details"]');
        var $bandWidthBox = $('.bandwidth-box'),
            status, information;
        var $detailsTable = $('#details');

        var thresholds = [{
            threshold: 0,
            message: __("Very bad"),
            type: 'error'
        }, {
            threshold: 25,
            message: __('Low'),
            type: 'warning'
        }, {
            threshold: 75,
            message: __('Nice!'),
            type: 'success'
        }];

        $testTriggerBtn.on('click', function(){
            loadingBar.start();
            $testTriggerBtn.hide();
            information = checkBrowser();

            // fake simulator
            setTimeout(function() {
                // Browser/OS is result of async query
                status = getStatus(thresholds, 20);
                displayTestResult('performance', status);

                status = getStatus(thresholds, 75);
                displayTestResult('total', status);

                loadingBar.stop();
                $bandWidthBox.show();
            }, 3000);
        });


        $bandWidthTriggerBtn.on('click', function() {
            loadingBar.start();
            $bandWidthTriggerBtn.hide();

            // fake simulator
            setTimeout(function() {

                status = getStatus(thresholds, 68);
                displayTestResult('bandwidth', status);
                loadingBar.stop();

            }, 3000);
        });

        $detailsBtn.on('click', function() {
            loadingBar.start();
            $detailsBtn.hide();

            $.each(information, function(index, object) {
                var line = '<td>'+ object.message +'</td><td>'+ object.value +'</td>';
                $('tbody', $detailsTable).append('<tr>' + line + '</tr>');
            });

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
