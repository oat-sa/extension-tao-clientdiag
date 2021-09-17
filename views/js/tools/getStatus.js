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
define(['lodash'], function(_) {
    'use strict';

    /**
     * Gets the correct status message for a given percentage from a list of thresholds.
     * @param {number|string} percentage - The actual percentage. Must be comprised between 0 and 100.
     *                                     Other values will be adjusted to fit the interval.
     * @param {Array|object} [thresholds] - A list of descriptors for each thresholds.
     *                                      A threshold field must be provided for each.
     * @param {object} [opts]
     * @param {object} [minimumGlobalPercentage] - lowest value that will be used in the global score computation
     * @returns {object} Returns the corresponding threshold, or an empty object if none match.
     */
    return function getStatus(percentage, thresholds, opts) {
        const options = opts || {};
        const testPercentage = Math.max(0, Math.min(100, Math.round(parseInt(percentage, 10) || 0)));
        const globalPercentage = options.minimumGlobalPercentage
            ? Math.max(testPercentage, options.minimumGlobalPercentage)
            : testPercentage;

        // need a structure compatible with the handlebars template
        const status = {
            // the percentage is between 0 and 100 and obviously must be a number
            percentage: testPercentage,
            globalPercentage: globalPercentage,
            quality: {}
        };

        // grab a feedback related to the percentage in the thresholds list
        if (thresholds) {
            if (!Array.isArray(thresholds)) {
                thresholds = [thresholds];
            }

            let feedback;
            const len = thresholds.length >>> 0;
            for (let i = 0; i < len; i++) {
                const step = thresholds[i];
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
