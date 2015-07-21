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
    'layout/loading-bar'

], function ($, loadingBar) {
    'use strict';

    /**
     * Set indicator and display bar
     *
     * @param name
     * @param percentage
     */
    function displayQualityBar(name, percentage) {
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
        // fake simulator
        $triggerBtn.on('click', function(){
            loadingBar.start();
            $triggerBtn.hide();
            setTimeout(function() {
                displayQualityBar('browser', 50);
                displayQualityBar('bandwidth', 68);
                displayQualityBar('performance', 57);
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
