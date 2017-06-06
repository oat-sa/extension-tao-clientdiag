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
define(['taoClientDiagnostic/tools/performances/tester'], function(performancesTester){
    'use strict';

    var diagnosticTool = {
        changeStatus : function changeStatus() {}
    };

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert){
        assert.ok(typeof performancesTester === 'function', 'The module exposes a function');
        assert.ok(typeof performancesTester() === 'object', 'performancesTester is a factory');
        assert.ok(typeof performancesTester().start === 'function', 'the test has a start method');
    });


    QUnit.module('Test');

    QUnit.asyncTest('The tester runs', function(assert){

        QUnit.expect(10);

        performancesTester({}, diagnosticTool).start(function(status, details, results) {
            var duration = results.average;
            var toString = {}.toString;

            assert.ok(typeof status === 'object', 'The status is a object');
            assert.ok(typeof details === 'object', 'The details is a object');
            assert.ok(typeof results === 'object', 'The results is a object');
            assert.ok(duration > 0, 'The result is a positive number');
            assert.ok(typeof results.min === 'number', 'The minimum speed is provided inside the details');
            assert.ok(typeof results.max === 'number', 'The maximum speed is provided inside the details');
            assert.ok(typeof results.average === 'number', 'The average speed is provided inside the details');
            assert.ok(typeof results.variance === 'number', 'The speed variance is provided inside the details');
            assert.equal(duration, results.average, 'The total duration provided inside the details must be equal to provided duration');
            assert.ok(toString.call(results.values) === '[object Array]', 'The detailed measures are provided inside the details');

            QUnit.start();
        });

    });

});
