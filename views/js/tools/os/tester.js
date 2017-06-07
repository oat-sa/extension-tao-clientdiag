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
        action: 'checkOs',
        controller: 'DiagnosticChecker'
    };

    /**
     * Gets the URL of the browser tester
     * @param {Window} window - Need an access to the window object
     * @param {String} action - The name of the action to call to get the browser checker
     * @param {String} controller - The name of the controller to call to get the browser checker
     * @param {String} extension - The name of the extension containing the controller to call to get the browser checker
     * @returns {String}
     */
    function getTesterUrl(action, controller, extension) {
        return url.route(action, controller, extension);
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
                    initConfig.browserVersionAction,
                    initConfig.browserVersionController,
                    initConfig.browserVersionExtension
                );

                diagnosticTool.changeStatus(__('Checking the operating system...'));
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
                                var summary = {
                                    os: {
                                        message: __('Operating system'),
                                        value: browserInfo.os + ' ' + browserInfo.osVersion
                                    }
                                };

                                status.id = 'browser';
                                status.title = __('Operating system');

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
