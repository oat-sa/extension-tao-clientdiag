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
define(function() {
    'use strict';

    /**
     * Rounds a value to a fixed number of decimals
     * @param {number} value - The value to round
     * @param {number} decimals - The number of decimal
     * @returns {number}
     */
    return function fixedDecimals(value, decimals) {
        const shift = Math.pow(10, Math.abs(decimals || 1));
        return Math.round(Number(value) * shift) / shift || 0;
    };
});
