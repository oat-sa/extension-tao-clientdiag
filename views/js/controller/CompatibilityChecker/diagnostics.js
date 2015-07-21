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
    'layout/loading-bar'

], function ($, __, loadingBar) {
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

        // which browser
        return $.get(/* ...*/);
    }

    /**
     *
     */
    function checkBandwidth() {
        return $.get(/* ...*/);
    }

    /**
     *
     */
    function checkPerformance() {
        return $.get(/* ...*/);
    }

    /**
     *
     */
    var init = function init(){

        var $testTriggerBtn = $('[data-action="test-launcher"]');
        var $bandWidthTriggerBtn = $('[data-action="bandwidth-launcher"]');
        var $bandWidthBox = $('.bandwidth-box'),
            status;

        var thresholds = [{
            threshold: 0,
            message: __("Very bad"),
            type: 'error'
        }, {
            threshold: 25,
            message: __('Low'),
            type: 'warning'
        }, {
            threshold: 50,
            message: __('Good enough'),
            type: 'success'
        }, {
            threshold: 75,
            message: __('Nice!'),
            type: 'success'
        }];

        // fake simulator
        $testTriggerBtn.on('click', function(){
            loadingBar.start();
            $testTriggerBtn.hide();
            setTimeout(function() {
                // Browser/OS is result of async query
                // Dummy result
                var status = {
                    type: 'success',
                    message: 'Firefox 32 / Windows 8'
                };
                displayTestResult('browser', status);

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
            setTimeout(function() {

                status = getStatus(thresholds, 68);
                displayTestResult('bandwidth', status);
                loadingBar.stop();

            }, 3000);
        });
    };

    /**
     * @exports
     */
    return init();
});
