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
    'taoClientDiagnostic/tools/getPlatformInfo',
    'taoClientDiagnostic/tools/diagnostic/status'
], function ($, __, url, getConfig, getPlatformInfo, statusFactory) {
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
                diagnosticTool.changeStatus(__('Checking the browser...'));

                getPlatformInfo(window, initConfig)
                    .then(function(platformInfo) {
                        // which browser
                        $.post(
                            url.route(initConfig.action, initConfig.controller, initConfig.extension),
                            platformInfo,
                            function (data) {
                                var percentage = ('success' === data.type) ? 100 : (('warning' === data.type) ? 33 : 0);
                                var status = statusFactory().getStatus(percentage, data);
                                var currentBrowser = platformInfo.browser + ' ' + platformInfo.browserVersion;
                                var currentOs = platformInfo.os + ' ' + platformInfo.osVersion;
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
                                var customMsg = diagnosticTool.getCustomMsg('diagBrowserOsCheckResult') || '';

                                status.id = 'browser';
                                status.title = __('Operating system and web browser');

                                customMsg = customMsg
                                    .replace(_placeHolders.CURRENT_BROWSER, currentBrowser)
                                    .replace(_placeHolders.CURRENT_OS, currentOs);
                                diagnosticTool.addCustomFeedbackMsg(status, customMsg);

                                done(status, summary, platformInfo);
                            },
                            'json'
                        );
                    });
            }
        };
    }

    return browserTester;
});
