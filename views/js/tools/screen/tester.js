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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'core/format',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getStatus'
], function (_, __, format, getConfig, getLabels, getStatus) {
    'use strict';

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var _defaults = {
        id: 'screen',
        threshold: {
            width: 1024,
            height: 768
        }
    };

    /**
     * Placeholder variables for custom messages
     * @type {Object}
     * @private
     */
    var _placeHolders = {
        WIDTH: '%WIDTH%',
        HEIGHT: '%HEIGHT%'
    };

    /**
     * A list of thresholds
     * @type {Array}
     * @private
     */
    var _thresholds = [{
        threshold: 0,
        message: __('The device screen does not meet the minimum resolution of %s!'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('The device screen has the minimum required resolution.'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('The device screen resolution meets the requirements.'),
        type: 'success'
    }];

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {Object}
     * @private
     */
    var _messages = [
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
     * @param {Object} config - Some optional configs
     * @param {String} [config.id] - The identifier of the test
     * @param {String} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @param {Object} [config.threshold] - The minimum resolution expected
     * @returns {Object}
     */
    function screenTester(config) {
        var initConfig = getConfig(config, _defaults);
        var labels = getLabels(_messages, initConfig.level);

        return {
            /**
             * Performs a screen resolution check, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var results = _.pick(window.screen, ['width', 'height']);
                var status = this.getFeedback(results);
                var summary = this.getSummary(results);

                status.customMsgRenderer = function(customMsg) {
                    return (customMsg || '')
                        .replace(_placeHolders.WIDTH, results.width)
                        .replace(_placeHolders.HEIGHT, results.height)
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
             * @param {Object} results
             * @returns {Object}
             */
            getSummary: function getSummary(results) {
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
             * @param {Object} results
             * @returns {Object}}
             */
            getFeedback: function getFeedback(results) {
                var threshold = initConfig.threshold || {};
                var expectedWidth = threshold.width || _defaults.threshold.width;
                var expectedHeight = threshold.height || _defaults.threshold.height;
                var percentage, status;

                if (!results || results.height < expectedHeight || results.width < expectedWidth) {
                    percentage = 0;
                } else if (results.height > expectedHeight || results.width > expectedWidth) {
                    percentage = 100;
                } else {
                    percentage = 50
                }

                status = getStatus(percentage, _thresholds);
                status.id = initConfig.id;
                status.title = labels.title;
                status.feedback.message = format(status.feedback.message, expectedWidth + 'x' + expectedHeight);

                return status;
            }
        };
    }

    return screenTester;
});
