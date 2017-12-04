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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define(['lodash'], function (_) {
    'use strict';

    /**
     * Gets the list of messages related to a particular level.
     * The level is provided as a numeric value, starting from 1.
     * @param {Array|Object} messages - The list of messages for all levels.
     *                                  If only one object is provided is will be wrapped into an array
     * @param {Number|String} level - The level for which filter the messages.
     *                                It should be comprised within the available indexes.
     *                                Higher levels will be reduced to the higher available,
     *                                lower levels will be increased to the lowest.
     * @returns {Object}
     */
    return function getLabels(messages, level) {
        messages = messages || {};

        if (!_.isArray(messages)) {
            messages = [messages];
        }

        // Compute the level value that targets which list of labels to use.
        // It should be comprised within the available indexes.
        // Higher levels will be reduced to the higher available, lower levels will be increased to the lowest.
        level = Math.min(Math.max(parseInt(level, 10) || 0, 1), messages.length || 1) - 1;

        return messages[level] || {};
    };
});
