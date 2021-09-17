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
 * Copyright (c) 2016-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'i18n',
    'util/url',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getPlatformInfo',
    'taoClientDiagnostic/tools/getStatus'
], function($, __, url, getConfig, getLabels, getPlatformInfo, getStatus) {
    'use strict';

    /**
     * Some default values
     * @type {object}
     * @private
     */
    const _defaults = {
        id: 'browser',
        browserVersionAction: 'whichBrowser',
        browserVersionController: 'CompatibilityChecker',
        browserVersionExtension: 'taoClientDiagnostic',
        action: 'check',
        controller: 'DiagnosticChecker'
    };

    /**
     * Placeholder variables for custom messages
     * @type {object}
     * @private
     */
    const _placeHolders = {
        CURRENT_BROWSER: '%CURRENT_BROWSER%',
        CURRENT_OS: '%CURRENT_OS%'
    };

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {object}
     * @private
     */
    const _messages = [
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
     * @param {object} config - Some optional configs
     * @param {string} [config.id] - The identifier of the test
     * @param {string} [config.action] - The name of the action to call to get the browser checker
     * @param {string} [config.controller] - The name of the controller to call to get the browser checker
     * @param {string} [config.extension] - The name of the extension containing the controller to call to get the browser checker
     * @param {string} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {object}
     */
    return function browserTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs a browser support test, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                getPlatformInfo(window, initConfig).then(results => {
                    // which browser
                    $.post(
                        url.route(initConfig.action, initConfig.controller, initConfig.extension),
                        results,
                        data => {
                            const percentage = 'success' === data.type ? 100 : 'warning' === data.type ? 33 : 0;
                            const status = this.getFeedback(percentage, data);
                            const summary = this.getSummary(results);

                            status.customMsgRenderer = customMsg => {
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
             * @returns {object}
             */
            get labels() {
                return labels;
            },

            /**
             * Builds the results summary
             * @param {object} results
             * @returns {object}
             */
            getSummary(results) {
                const currentBrowser = `${results.browser} ${results.browserVersion}`;
                const currentOs = `${results.os} ${results.osVersion}`;
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
             * @param {number} result
             * @param {object} data
             * @returns {object}
             */
            getFeedback(result, data) {
                const status = getStatus(result, data);

                status.id = initConfig.id;
                status.title = labels.title;

                return status;
            }
        };
    };
});
