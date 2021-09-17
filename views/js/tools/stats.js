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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA ;
 */
define(['lodash', 'taoClientDiagnostic/tools/fixedDecimals'], function(_, fixedDecimals) {
    'use strict';

    /**
     * Gets a getter function that extracts a value from a record.
     * @param {string|Function} name - the name to extract from the record, or a getter function
     * @returns {Function}
     * @private
     */
    function valueGetter(name) {
        if ('function' === typeof name) {
            return name;
        }

        return item => (item && item[name]) || 0;
    }

    /**
     * Computes some stats on a list from a particular field
     * @param {Array|object} list - The list to compute stats on
     * @param {string|Function} fieldName - The name of the field to process, or a callback method returning the value
     * @param {number} [decimals] - Optional number of fixed decimals for values
     * @returns {object}
     */
    return function stats(list, fieldName, decimals) {
        const getValue = valueGetter(fieldName);
        const values = [];
        let min = Number.MAX_VALUE;
        let max = 0;
        let count = 0;

        // process first pass stats: compute sum, min and max values
        const sum = _.reduce(
            list,
            (sum, item) => {
                if ('undefined' !== typeof item) {
                    const value = getValue(item);
                    values.push(value);
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                    sum += value;
                    count++;
                    return sum;
                }
            },
            0
        );

        // compute the average value
        const average = sum / (count || 1);

        // process second pass stats: compute variance
        const sum2 = values.reduce((sum, value) => {
            const diff = value - average;
            sum += diff * diff;
            return sum;
        }, 0);

        // compute standard variance
        const variance = count > 1 ? Math.sqrt(sum2 / (count - 1)) : 0;

        // compute the median value
        values.sort();
        const middle = count / 2;
        const median = (values[Math.floor(middle)] + values[Math.ceil(middle)]) / 2;

        const results = {
            min,
            max,
            sum,
            count,
            average,
            median,
            variance
        };

        if (decimals) {
            _.forEach(results, (value, key) => {
                results[key] = fixedDecimals(value, decimals);
            });
        }

        results.values = list;
        return results;
    };
});
