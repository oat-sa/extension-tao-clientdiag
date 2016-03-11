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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash',
    'taoClientDiagnostic/tools/fixedDecimals'
], function (_, fixedDecimals) {
    'use strict';

    /**
     * Computes some stats on a list from a particular field
     * @param {Array|Object} list The list to compute stats on
     * @param {String|Function} fieldName The name of the field to process, or a callback method returning the value
     * @param {Number} [decimals] Optional number of fixed decimals for values
     * @returns {Object}
     */
    var stats = function stats(list, fieldName, decimals) {
        var sum = 0;
        var sum2 = 0;
        var min = Number.MAX_VALUE;
        var max = 0;
        var variance;
        var count = 0;
        var values = [];
        var avg;
        var med;
        var middle;
        var getValue;
        var results;

        if (_.isFunction(fieldName)) {
            getValue = fieldName;
        } else {
            getValue = function(item) {
                return item && item[fieldName] || 0;
            };
        }

        // process 1st pass stats: compute sum, min and max values
        _.forEach(list, function(item) {
            var value;
            if (undefined !== item) {
                value = getValue(item);
                values.push(value);
                min = Math.min(min, value);
                max = Math.max(max, value);
                sum += value;
                count++;
            }
        });

        // compute the average value
        avg = sum / (count || 1);

        // process 2nd pass stats: compute variance
        _.forEach(values, function(value) {
            var diff = value - avg;
            sum2 += diff * diff;
        });

        // compute de standard variance
        variance = count > 1 ? Math.sqrt(sum2 / (count - 1)) : 0;

        // compute the median value
        values.sort();
        middle = count / 2;
        med = (values[Math.floor(middle)] + values[Math.ceil(middle)]) / 2;

        results = {
            min : min,
            max : max,
            sum : sum,
            count : count,
            average : avg,
            median : med,
            variance : variance
        };

        if (decimals) {
            _.forEach(results, function(value, key) {
                results[key] = fixedDecimals(value, decimals);
            });
        }

        results.values = list;
        return results;
    };

    return stats;
});
