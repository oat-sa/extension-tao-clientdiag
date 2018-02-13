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
 * @author dieter <dieter@taotesting.com>
 */
define(['lodash'], function (_) {
    'use strict';

    /**
     * Gets the correct status message for a given percentage from a list of thresholds.
     * @param {Number|String} percentage - The actual percentage. Must be comprised between 0 and 100.
     *                                     Other values will be adjusted to fit the interval.
     * @param {Array|Object} [thresholds] - A list of descriptors for each thresholds.
     *                                      A threshold field must be provided for each.
     * @param {Object} [opts]
     * @param {Object} [minimumGlobalPercentage] - lowest value that will be used in the global score computation
     * @returns {Object} Returns the corresponding threshold, or an empty object if none match.
     */
    return function getStatus(percentage, thresholds, opts) {
        var options = opts || {};
        var testPercentage = Math.max(0, Math.min(100, Math.round(parseInt(percentage, 10) || 0)));
        var globalPercentage = (options.minimumGlobalPercentage)
            ? Math.max(testPercentage, options.minimumGlobalPercentage)
            : testPercentage;

        // need a structure compatible with the handlebars template
        var status = {
            // the percentage is between 0 and 100 and obviously must be a number
            percentage: testPercentage,
            globalPercentage: globalPercentage,
            quality: {}
        };
        var len, feedback, i, step;

        // grab a feedback related to the percentage in the thresholds list
        if (thresholds) {
            if (!_.isArray(thresholds)) {
                thresholds = [thresholds];
            }

            len = thresholds.length;
            for (i = 0; i < len; i++) {
                step = thresholds[i];
                if (step && (!step.threshold || status.percentage >= step.threshold)) {
                    feedback = step;
                } else {
                    break;
                }
            }

            if (feedback) {
                status.feedback = _.clone(feedback);
            }
        }

        return status;
    };
});
