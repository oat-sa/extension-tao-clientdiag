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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
define([
    'taoClientDiagnostic/tools/screen/tester'
], function (screenTester) {
    'use strict';

    QUnit.module('API');

    QUnit.test('The tester has the right form', function (assert) {
        QUnit.expect(6);
        assert.ok(typeof screenTester === 'function', 'The module exposes a function');
        assert.ok(typeof screenTester() === 'object', 'screenTester is a factory');
        assert.ok(typeof screenTester().start === 'function', 'the test has a start method');
        assert.ok(typeof screenTester().getSummary === 'function', 'the test has a getSummary method');
        assert.ok(typeof screenTester().getFeedback === 'function', 'the test has a getFeedback method');
        assert.ok(typeof screenTester().labels === 'object', 'the test has a labels objects');
    });


    QUnit.cases([{
        title: 'no level'
    }, {
        title: 'level 0',
        level: 0
    }, {
        title: 'level 1',
        level: 1
    }, {
        title: 'level 2',
        level: 2
    }, {
        title: 'level 3',
        level: 3
    }])
        .test('labels', function (data, assert) {
            var labels = screenTester({level: data.level}).labels;
            var labelKeys = [
                'title',
                'status',
                'width',
                'height'
            ];

            QUnit.expect(labelKeys.length + 1);

            assert.equal(typeof labels, 'object', 'A set of labels is returned');
            labelKeys.forEach(function (key) {
                assert.equal(typeof labels[key], 'string', 'The label ' + key + ' exists');
            });
        });


    QUnit.test('getSummary', function(assert) {
        var tester = screenTester({});
        var results = {
            width: 1280,
            height: 1024
        };
        var summary = tester.getSummary(results);

        QUnit.expect(7);

        assert.equal(typeof summary, 'object', 'The method has returned the summary');

        assert.equal(typeof summary.width, 'object', 'The summary contains entry for the screen width');
        assert.equal(typeof summary.width.message, 'string', 'The summary contains label for the screen width');
        assert.equal(summary.width.value, results.width, 'The summary contains the expected value for the screen width');

        assert.equal(typeof summary.height, 'object', 'The summary contains entry for the screen height');
        assert.equal(typeof summary.height.message, 'string', 'The summary contains label for the screen height');
        assert.equal(summary.height.value, results.height, 'The summary contains the expected value for the screen height');
    });


    QUnit.cases([{
        title: 'requirements not met (width)',
        threshold: {
            width: 1024,
            height: 768
        },
        results: {
            width: 768,
            height: 1024
        },
        percentage: 0,
        type: 'error'
    }, {
        title: 'requirements not met (height)',
        threshold: {
            width: 1024,
            height: 768
        },
        results: {
            width: 1024,
            height: 600
        },
        percentage: 0,
        type: 'error'
    }, {
        title: 'requirements just met',
        threshold: {
            width: 1024,
            height: 768
        },
        results: {
            width: 1024,
            height: 768
        },
        percentage: 50,
        type: 'warning'
    }, {
        title: 'requirements fully met',
        threshold: {
            width: 1024,
            height: 768
        },
        results: {
            width: 1280,
            height: 1024
        },
        percentage: 100,
        type: 'success'
    }])
        .test('getFeedback', function (data, assert) {
            var tester = screenTester({threshold: data.threshold});
            var status = tester.getFeedback(data.results);

            QUnit.expect(6);

            assert.equal(typeof status, 'object', 'The method has returned the status');
            assert.equal(status.id, 'screen', 'The status contains the tester id');
            assert.equal(status.percentage, data.percentage, 'The status contains the expected percentage');
            assert.equal(typeof status.title, 'string', 'The status contains a title');
            assert.equal(typeof status.feedback, 'object', 'The status contains a feedback descriptor');
            assert.equal(status.feedback.type, data.type, 'The status contains the expected feedback type');
        });


    QUnit.module('Test');


    QUnit.asyncTest('The tester runs', function (assert) {

        QUnit.expect(5);

        screenTester({}).start(function (status, details, results) {

            assert.equal(typeof status, 'object', 'The status is an object');
            assert.equal(typeof details, 'object', 'The details is an object');
            assert.equal(typeof results, 'object', 'The details are provided inside an object');
            assert.equal(results.width, window.screen.width, 'The screen width is provided');
            assert.equal(results.height, window.screen.height, 'The screen height is provided');

            QUnit.start();
        });

    });


});
