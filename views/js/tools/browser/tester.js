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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'util/url',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getPlatformInfo',
    'taoClientDiagnostic/tools/getStatus'
], function ($, __, url, getConfig, getLabels, getPlatformInfo, getStatus) {
    'use strict';

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var _defaults = {
        id: 'browser',
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
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {Object}
     * @private
     */
    var _messages = [
        // level 1
        {
            title: __('Operating system and web browser'),
            status: __('Checking the browser...'),
            browser: __('Web browser'),
            os: __('Operating system')
        }
    ];

    /**
     * Performs a browser support test
     *
     * @param {Object} config - Some optional configs
     * @param {String} [config.id] - The identifier of the test
     * @param {String} [config.action] - The name of the action to call to get the browser checker
     * @param {String} [config.controller] - The name of the controller to call to get the browser checker
     * @param {String} [config.extension] - The name of the extension containing the controller to call to get the browser checker
     * @param {String} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {Object}
     */
    function browserTester(config) {
        var initConfig = getConfig(config, _defaults);
        var labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs a browser support test, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var self = this;

                getPlatformInfo(window, initConfig)
                    .then(function(results) {
                        // which browser
                        $.post(
                            url.route(initConfig.action, initConfig.controller, initConfig.extension),
                            results,
                            function (data) {
                                var percentage = ('success' === data.type) ? 100 : (('warning' === data.type) ? 33 : 0);
                                var status = self.getFeedback(percentage, data);
                                var summary = self.getSummary(results);

                                status.customMsgRenderer = function(customMsg) {
                                    return (customMsg || '')
                                        .replace(_placeHolders.CURRENT_BROWSER, summary.browser.value)
                                        .replace(_placeHolders.CURRENT_OS, summary.os.value);
                                };

                                done(status, summary, results);
                            },
                            'json'
                        );
                    });
            },

            /**
             * Gets the labels loaded for the tester
             * @returns {Object}
             */
            get labels() {
                return labels;
            },

            /**
             * Builds the results summary
             * @param {Object} results
             * @returns {Object}
             */
            getSummary: function getSummary(results) {
                var currentBrowser = results.browser + ' ' + results.browserVersion;
                var currentOs = results.os + ' ' + results.osVersion;
                return {
                    browser: {
                        message: labels.browser,
                        value: currentBrowser
                    },
                    os: {
                        message: labels.os,
                        value: currentOs
                    }
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {Number} result
             * @param {Object} data
             * @returns {Object}
             */
            getFeedback: function getFeedback(result, data) {
                var status = getStatus(result, data);

                status.id = initConfig.id;
                status.title =  labels.title;

                return status;
            }
        };
    }

    return browserTester;
});
