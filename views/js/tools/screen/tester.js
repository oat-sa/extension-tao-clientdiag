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
 * Copyright (c) 2018-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'i18n',
    'core/format',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getStatus'
], function(_, __, format, getConfig, getLabels, getStatus) {
    'use strict';

    /**
     * Some default values
     * @type {object}
     * @private
     */
    const _defaults = {
        id: 'screen',
        threshold: {
            width: 1024,
            height: 768
        }
    };

    /**
     * Placeholder const iables for custom messages
     * @type {object}
     * @private
     */
    const _placeHolders = {
        WIDTH: '%WIDTH%',
        HEIGHT: '%HEIGHT%'
    };

    /**
     * A list of thresholds
     * @type {Array}
     * @private
     */
    const _thresholds = [
        {
            threshold: 0,
            message: __('The device screen does not meet the minimum resolution of %s!'),
            type: 'error'
        },
        {
            threshold: 33,
            message: __('The device screen has the minimum required resolution.'),
            type: 'warning'
        },
        {
            threshold: 66,
            message: __('The device screen resolution meets the requirements.'),
            type: 'success'
        }
    ];

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {object}
     * @private
     */
    const _messages = [
        // level 1
        {
            title: __('Screen resolution'),
            status: __('Checking the screen...'),
            width: __('Screen Width'),
            height: __('Screen Height')
        }
    ];

    /**
     * Performs a screen resolution check
     *
     * @param {object} config - Some optional configs
     * @param {string} [config.id] - The identifier of the test
     * @param {string} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @param {object} [config.threshold] - The minimum resolution expected
     * @returns {object}
     */
    return function screenTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs a screen resolution check, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                const results = _.pick(window.screen, ['width', 'height']);
                const status = this.getFeedback(results);
                const summary = this.getSummary(results);

                status.customMsgRenderer = customMsg => {
                    return (customMsg || '')
                        .replace(_placeHolders.WIDTH, results.width)
                        .replace(_placeHolders.HEIGHT, results.height);
                };

                done(status, summary, results);
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
             * @param {object} results
             * @returns {object}
             */
            getSummary(results) {
                return {
                    width: {
                        message: labels.width,
                        value: results.width
                    },
                    height: {
                        message: labels.height,
                        value: results.height
                    }
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {object} results
             * @returns {object}}
             */
            getFeedback(results) {
                const threshold = initConfig.threshold || {};
                const expectedWidth = threshold.width || _defaults.threshold.width;
                const expectedHeight = threshold.height || _defaults.threshold.height;
                let percentage;

                if (!results || results.height < expectedHeight || results.width < expectedWidth) {
                    percentage = 0;
                } else if (results.height > expectedHeight || results.width > expectedWidth) {
                    percentage = 100;
                } else {
                    percentage = 50;
                }

                const status = getStatus(percentage, _thresholds);
                status.id = initConfig.id;
                status.title = labels.title;
                status.feedback.message = format(status.feedback.message, `${expectedWidth}x${expectedHeight}`);

                return status;
            }
        };
    };
});
