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
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'i18n',
    'util/url',
    'taoClientDiagnostic/tools/getconfig',
    'taoClientDiagnostic/tools/diagnostic/status'
], function ($, __, url, getConfig, statusFactory) {
    'use strict';

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var _defaults = {
        browserVersionAction: 'whichBrowser',
        browserVersionController: 'CompatibilityChecker',
        browserVersionExtension: 'taoClientDiagnostic',
        action: 'check',
        controller: 'DiagnosticChecker'
    };

    /**
     * Placeholder variables for custom messages
     * @type {Object}
     * @private
     */
    var _placeHolders = {
        CURRENT_BROWSER: '%CURRENT_BROWSER%',
        CURRENT_OS: '%CURRENT_OS%'
    };

    /**
     * Gets the URL of the browser tester
     * @param {Window} window - Need an access to the window object
     * @param {String} action - The name of the action to call to get the browser checker
     * @param {String} controller - The name of the controller to call to get the browser checker
     * @param {String} extension - The name of the extension containing the controller to call to get the browser checker
     * @returns {String}
     */
    function getTesterUrl(window, action, controller, extension) {
        var document = window.document;
        var navigator = window.navigator;
        var screen = window.screen;
        var params = {};
        var e = 0;
        var f = 0;

        // append the browser user agent
        params.ua = navigator.userAgent;

        // detect browser family
        e |= window.ActiveXObject ? 1 : 0;
        e |= window.opera ? 2 : 0;
        e |= window.chrome ? 4 : 0;
        e |= 'getBoxObjectFor' in document || 'mozInnerScreenX' in window ? 8 : 0;
        e |= ('WebKitCSSMatrix' in window || 'WebKitPoint' in window || 'webkitStorageInfo' in window || 'webkitURL' in window) ? 16 : 0;
        e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
        params.e = e;

        // gather info about browser functionality
        f |= 'sandbox' in document.createElement('iframe') ? 1 : 0;
        f |= 'WebSocket' in window ? 2 : 0;
        f |= window.Worker ? 4 : 0;
        f |= window.applicationCache ? 8 : 0;
        f |= window.history && window.history.pushState ? 16 : 0;
        f |= document.documentElement.webkitRequestFullScreen ? 32 : 0;
        f |= 'FileReader' in window ? 64 : 0;
        params.f = f;

        // append a unique ID
        params.r = Math.random().toString(36).substring(7);

        // get the screen size
        params.w = screen.width;
        params.h = screen.height;

        return url.route(action, controller, extension, params);
    }

    /**
     * Performs a browser support test
     *
     * @param {Object} [config] - Some optional configs
     * @param {String} [config.action] - The name of the action to call to get the browser checker
     * @param {String} [config.controller] - The name of the controller to call to get the browser checker
     * @param {String} [config.extension] - The name of the extension containing the controller to call to get the browser checker
     * @returns {Object}
     */
    function browserTester(config, diagnosticTool) {
        var initConfig = getConfig(config || {}, _defaults);

        return {
            /**
             * Performs a browser support test, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var testerUrl = getTesterUrl(
                    window,
                    initConfig.browserVersionAction,
                    initConfig.browserVersionController,
                    initConfig.browserVersionExtension
                );

                diagnosticTool.changeStatus(__('Checking the browser...'));
                $.ajax({
                    url : testerUrl,
                    success : function(browserInfo) {
                        // which browser
                        $.post(
                            url.route(initConfig.action, initConfig.controller, initConfig.extension),
                            browserInfo,
                            function (data) {
                                var percentage = ('success' === data.type) ? 100 : (('warning' === data.type) ? 33 : 0);
                                var status = statusFactory().getStatus(percentage, data);
                                var currentBrowser = browserInfo.browser + ' ' + browserInfo.browserVersion;
                                var currentOs = browserInfo.os + ' ' + browserInfo.osVersion;
                                var summary = {
                                    browser: {
                                        message: __('Web browser'),
                                        value: currentBrowser
                                    },
                                    os: {
                                        message: __('Operating system'),
                                        value: currentOs
                                    }
                                };
                                var customMsg = diagnosticTool.getCustomMsg('diagBrowserCheckResult') || '';

                                status.id = 'browser';
                                status.title = __('Operating system and web browser');

                                customMsg = customMsg
                                    .replace(_placeHolders.CURRENT_BROWSER, currentBrowser)
                                    .replace(_placeHolders.CURRENT_OS, currentOs);
                                diagnosticTool.addCustomFeedbackMsg(status, customMsg);

                                done(status, summary, browserInfo);
                            },
                            'json'
                        );
                    }
                });
            }
        };
    }

    return browserTester;
});
