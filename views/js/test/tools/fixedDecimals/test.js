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
define(['taoClientDiagnostic/tools/fixedDecimals'], function(fixedDecimals){
    'use strict';

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert){
        assert.ok(typeof fixedDecimals === 'function', 'The module exposes a function');
    });


    QUnit.module('Test');

    QUnit.test('Conversions', function(assert){

        assert.equal(fixedDecimals(10, 2), 10, 'Fix decimals on an integer');
        assert.equal(fixedDecimals(10.6, 2), 10.6, 'Fix decimals on an already fixed decimals');
        assert.equal(fixedDecimals(10.66, 2), 10.66, 'Fix decimals on an already fixed decimals');
        assert.equal(fixedDecimals(10.666666666666, 2), 10.67, 'Fix decimals on an irrational value');
        assert.equal(fixedDecimals(10.666666666666, 3), 10.667, 'Fix decimals on an irrational value');
        assert.equal(fixedDecimals(10.111111111111, 2), 10.11, 'Fix decimals on an irrational value');
        assert.equal(fixedDecimals(10.111111111111, 3), 10.111, 'Fix decimals on an irrational value');

        assert.equal(fixedDecimals(10), 10, 'Fix decimals on an integer with the default number of decimals');
        assert.equal(fixedDecimals(10.6), 10.6, 'Fix decimals on an already fixed decimals with the default number of decimals');
        assert.equal(fixedDecimals(10.66), 10.7, 'Fix decimals on an already fixed decimals with the default number of decimals');
        assert.equal(fixedDecimals(10.666666666666), 10.7, 'Fix decimals on an irrational value with the default number of decimals');
        assert.equal(fixedDecimals(10.666666666666), 10.7, 'Fix decimals on an irrational value with the default number of decimals');
        assert.equal(fixedDecimals(10.111111111111), 10.1, 'Fix decimals on an irrational value with the default number of decimals');
        assert.equal(fixedDecimals(10.111111111111), 10.1, 'Fix decimals on an irrational value with the default number of decimals');

        assert.equal(fixedDecimals("one"), 0, 'Fix decimals on a string');

    });

});
