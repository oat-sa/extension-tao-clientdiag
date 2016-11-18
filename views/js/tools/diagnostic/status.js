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
 * @author dieter <dieter@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n'
], function ($, _, __) {
    'use strict';

    /**
     * A list of thresholds for performances check
     * @type {Array}
     */
    var performancesThresholds = [{
        threshold: 0,
        message: __('Very slow performances'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average performances'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good performances'),
        type: 'success'
    }];

    /**
     * A list of thresholds for bandwidth check
     * @type {Array}
     */
    var bandwidthThresholds = [{
        threshold: 0,
        message: __('Low bandwidth'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average bandwidth'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good bandwidth'),
        type: 'success'
    }];

    /**
     * A list of thresholds for bandwidth check
     * @type {Array}
     */
    var uploadThresholds = [{
        threshold: 0,
        message: __('Low upload speed'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average upload speed'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good upload speed'),
        type: 'success'
    }];

    /**
     * A list of thresholds for summary
     * @type {Array}
     */
    var summaryThresholds = [{
        threshold: 0,
        message: __('Your system requires a compatibility update, please contact your system administrator.'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Your system is not optimal, please contact your system administrator.'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Your system is fully compliant.'),
        type: 'success'
    }];

    /**
     * Gets a diagnostic factory manager
     * @returns {Object}
     */
    function diagnosticStatusFactory() {
        return {
            /**
             * The list of known thresholds by context
             */
            thresholds: {
                performances: performancesThresholds,
                bandwidth: bandwidthThresholds,
                upload: uploadThresholds,
                summary: summaryThresholds
            },

            /**
             * Gets the thresholds for a particular context
             * @param {String} name
             * @returns {Array}
             */
            getThresholds: function getThresholds(name) {
                return this.thresholds[name];
            },

            /**
             * Gets the correct status message for a given percentage
             * @param {Number} percentage
             * @param {Array|String} thresholds
             * @returns {Object}
             */
            getStatus: function getStatus(percentage, thresholds) {
                var len, feedback, i, step, status;

                // the percentage is between 0 and 100 and obviously must be a number
                percentage = Math.max(0, Math.min(100, Math.round(parseInt(percentage, 10))));

                if (_.isString(thresholds)) {
                    thresholds = this.getThresholds(thresholds);
                }

                // grab a feedback related to the percentage in the thresholds list
                if (thresholds) {
                    if (!_.isArray(thresholds)) {
                        thresholds = [thresholds];
                    }

                    len = thresholds.length;
                    feedback = thresholds[0];
                    for (i = 1; i < len; i++) {
                        step = thresholds[i];
                        if (step && percentage >= step.threshold) {
                            feedback = step;
                        } else {
                            break;
                        }
                    }
                }

                // need a structure compatible with the handlebars template
                status = {
                    percentage: percentage,
                    quality: {}
                };

                if (feedback) {
                    status.feedback = _.clone(feedback);
                }

                return status;
            }
        };
    }

    return diagnosticStatusFactory;
});
