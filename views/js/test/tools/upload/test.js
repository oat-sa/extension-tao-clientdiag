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
define(['taoClientDiagnostic/tools/upload/tester'], function(uploadTester){
    'use strict';

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert) {
        assert.ok(typeof uploadTester === 'function', 'The module exposes a function');
        assert.ok(typeof uploadTester() === 'object', 'uploadTester is a factory');
        assert.ok(typeof uploadTester().start === 'function', 'the test has a start method');
    });


    QUnit.module('Test');

    QUnit.asyncTest('The tester runs', function(assert) {

        QUnit.expect(7);

        uploadTester({size : 100}).start(function(result) {

            assert.ok(result.length > 0, 'Result array is not empty');
            assert.ok(typeof result[0].speed === 'number', 'Speed is a number');
            assert.ok(result[0].speed > 0, 'Speed is a positive number');
            assert.ok(typeof result[0].loaded === 'number', 'Loaded is a number');
            assert.ok(result[0].loaded > 0, 'Loaded is a positive number');
            assert.ok(typeof result[0].time === 'number', 'Time is a number');
            assert.ok(result[0].time > 0, 'Time is a positive number');

            QUnit.start();
        });

    });

});
