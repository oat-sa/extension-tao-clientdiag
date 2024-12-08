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
    'lodash',
    'i18n',
    'util/url',
    'core/logger',
    'core/request',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getPlatformInfo',
    'taoClientDiagnostic/tools/getStatus'
], function($, _, __, urlHelper, loggerFactory, request, getConfig, getLabels, getPlatformInfo, getStatus) {
    'use strict';

    /**
     * @type {logger}
     * @private
     */
    const logger = loggerFactory('taoClientDiagnostic/browser');

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
        controller: 'DiagnosticChecker',
        browserslistUrl: 'https://oat-sa.github.io/browserslist-app-tao/api.json'
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
     * Fallback name to recover from connectivity error
     * @param {string}
     * @private
     */
    const unknown = __('Unknown');

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

        /**
         * Fetches the list of fully supported browsers
         * @returns {Promise<Array>}
         * @private
         */
        const fetchBrowserList = () => request({ url: initConfig.browserslistUrl, noToken: true }).catch(() => []);

        /**
         * Checks the current browser against the list of fully supported browsers
         * @param platformInfo
         * @returns {Promise<boolean>}
         * @private
         */
        function checkBrowserSupport(platformInfo) {
            const currentDevice = platformInfo.isMobile ? 'mobile' : 'desktop';
            const currentOS = platformInfo.os.toLowerCase();
            const currentBrowser = platformInfo.browser.toLowerCase();
            const currentVersion = platformInfo.browserVersion;
            return fetchBrowserList().then(list =>
                list.some(entry => {
                    const { browser, device, os, versions } = entry;

                    if (currentDevice !== device) {
                        return false;
                    }

                    if (os && os.toLowerCase() !== currentOS) {
                        return false;
                    }

                    if (browser.toLowerCase() !== currentBrowser) {
                        return false;
                    }

                    // Using lodash because of IE support.
                    // Some useful traversal algorithms are needed and they don't have polyfill in our bundles.
                    // The versions come with an inconsistent format and they need to be processed upfront.
                    return _(versions)
                        .map(version => `${version}`.split('-'))
                        .flatten()
                        .value()
                        .some(version => currentVersion.localeCompare(version, void 0, { numeric: true }) >= 0);
                }, {})
            );
        }

        return {
            /**
             * Performs a browser support test, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                getPlatformInfo(window, initConfig)
                    .catch(err => {
                        logger.error(err);
                        return {
                            browser: unknown,
                            browserVersion: '',
                            os: unknown,
                            osVersion: '',
                            isMobile: false
                        };
                    })
                    .then(platformInfo =>
                        checkBrowserSupport(platformInfo).then(browserSupported =>
                            Object.assign(platformInfo, { browserSupported })
                        )
                    )
                    .then(platformInfo => {
                        request({
                            url: urlHelper.route(initConfig.action, initConfig.controller, initConfig.extension),
                            data: platformInfo,
                            method: 'POST',
                            noToken: true
                        })
                            .catch(() => {
                                return {
                                    success: false,
                                    type: 'error',
                                    message: __('Unable to validate the data as the server did not respond in time.')
                                };
                            })
                            .then(data => {
                                const percentage = 'success' === data.type ? 100 : 'warning' === data.type ? 33 : 0;
                                const status = this.getFeedback(percentage, data);
                                const summary = this.getSummary(platformInfo);

                                status.customMsgRenderer = customMsg => {
                                    return (customMsg || '')
                                        .replace(_placeHolders.CURRENT_BROWSER, summary.browser.value)
                                        .replace(_placeHolders.CURRENT_OS, summary.os.value);
                                };

                                done(status, summary, platformInfo);
                            });
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
