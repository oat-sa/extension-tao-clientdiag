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
    'layout/loading-bar',
    'helpers'

], function ($, loadingBar, helpers) {
    'use strict';

    /**
     * Set indicator and display bar
     *
     * @param name
     * @param percentage
     */
    function displayQualityBar(name, percentage) {
        if (typeof percentage === 'undefined') { percentage = 50; }
        var $bar = $('[data-result="' + name + '"]'),
            $indicator = $bar.find('.quality-indicator'),
            $barWidth = (function() {
                var width;
                $bar.show();
                width = $bar.outerWidth();
                $bar.hide();
                return width;
            }());

        $bar.fadeIn(function() {
            if($indicator.length){
                $indicator.animate({
                    left: (percentage * $barWidth / 100) - ($indicator.outerWidth() / 2)
                });
            }
        });
    }

    var $triggerBtn = $('[data-action="launcher"]');

    /**
     *
     */
    function checkBrowser(callback, options) {
        console.log('browser');
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
        return $.post(
            helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
            information,
            function(data){
                var $feedback = $('#feedback'),
                    $span = $('span', $feedback);
                $feedback.append(information.browser + ' ' + information.browserVersion + ' / ' + information.os + ' ' + information.osVersion);
                $feedback.addClass('feedback-'+data.status);
                $span.addClass('icon-'+data.status);

                displayQualityBar('browser');

                if (typeof callback === "function") {
                    callback(options);
                }
            },
            "json"
        );
    }

    /**
     *
     */
    function checkBandwidth(callback) {
        console.log('band');
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
        return $.post(
            helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
            information,
            function(data){
                displayQualityBar('bandwidth', 68);

                if (typeof callback === "function") {
                    callback();
                }
            },
            "json"
        );
    }

    /**
     *
     */
    function checkPerformance() {
        console.log('perf');
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
        return $.post(
            helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
            information,
            function(data){

                displayQualityBar('performance', 57);

            },
            "json"
        );
    }

    /**
     *
     */
    var init = function init(){
        // fake simulator
        $triggerBtn.on('click', function(){
            loadingBar.start();
            $triggerBtn.hide();
            checkBrowser(checkBandwidth, checkPerformance);
            setTimeout(function() {
                displayQualityBar('total', 73);
                loadingBar.stop();
            }, 3000);
        });
//        $triggerBtn.on('click', function(){
//            loadingBar.start();
//            $triggerBtn.hide();
//            $.when(checkBrowser(), checkBandwidth(), checkPerformance()).done(function() {
//                loadingBar.stop();
//            });
//        });
    };

    /**
     * @exports
     */
    return init();
});
