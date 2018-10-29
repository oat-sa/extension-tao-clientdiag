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
 * Copyright (c) 2015-2017 (original work) Open Assessment Technologies SA ;
 */
define([
    'context',
    'taoClientDiagnostic/tools/bandwidth/tester',
], function(context, bandwidthTester){
    'use strict';

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert){
        QUnit.expect(6);
        assert.ok(typeof bandwidthTester === 'function', 'The module exposes a function');
        assert.ok(typeof bandwidthTester() === 'object', 'bandwidthTester is a factory');
        assert.ok(typeof bandwidthTester().start === 'function', 'the test has a start method');
        assert.ok(typeof bandwidthTester().getSummary === 'function', 'the test has a getSummary method');
        assert.ok(typeof bandwidthTester().getFeedback === 'function', 'the test has a getFeedback method');
        assert.ok(typeof bandwidthTester().labels === 'object', 'the test has a labels objects');
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
        .test('labels', function(data, assert) {
            var labels = bandwidthTester({level: data.level}).labels;
            var labelKeys = [
                'title',
                'status',
                'legend',
                'bandwidthMin',
                'bandwidthMax',
                'bandwidthAverage'
            ];

            QUnit.expect(labelKeys.length + 1);

            assert.equal(typeof labels, 'object', 'A set of labels is returned');
            labelKeys.forEach(function(key) {
                assert.equal(typeof labels[key], 'string', 'The label ' + key + ' exists');
            });
        });

    QUnit.test('getSummary', function(assert) {
        var tester = bandwidthTester({});
        var results = {
            min: 30,
            max: 90,
            average: 60
        };
        var summary = tester.getSummary(results);

        QUnit.expect(10);

        assert.equal(typeof summary, 'object', 'The method has returned the summary');

        assert.equal(typeof summary.bandwidthMin, 'object', 'The summary contains entry for min bandwidth');
        assert.equal(typeof summary.bandwidthMin.message, 'string', 'The summary contains label for min bandwidth');
        assert.equal(summary.bandwidthMin.value, results.min + ' Mbps', 'The summary contains the expected value for min bandwidth');

        assert.equal(typeof summary.bandwidthMax, 'object', 'The summary contains entry for max bandwidth');
        assert.equal(typeof summary.bandwidthMax.message, 'string', 'The summary contains label for max bandwidth');
        assert.equal(summary.bandwidthMax.value, results.max + ' Mbps', 'The summary contains the expected value for max bandwidth');

        assert.equal(typeof summary.bandwidthAverage, 'object', 'The summary contains entry for average bandwidth');
        assert.equal(typeof summary.bandwidthAverage.message, 'string', 'The summary contains label for average bandwidth');
        assert.equal(summary.bandwidthAverage.value, results.average + ' Mbps', 'The summary contains the expected value for average bandwidth');
    });

    QUnit.test('getFeedback', function(assert) {
        var tester = bandwidthTester({});
        var result = {max: 100, min: 10, average: 55};
        var status = tester.getFeedback(result);

        QUnit.expect(6);

        assert.equal(typeof status, 'object', 'The method has returned the status');
        assert.equal(status.id, 'bandwidth', 'The status contains the tester id');
        assert.equal(status.percentage, 100, 'The status contains the expected percentage');
        assert.equal(typeof status.title, 'string', 'The status contains a title');
        assert.equal(typeof status.quality, 'object', 'The status contains a quality descriptor');
        assert.equal(typeof status.feedback, 'object', 'The status contains a feedback descriptor');
    });

    QUnit.module('Test');

    QUnit.asyncTest('The tester runs', function(assert){

        QUnit.expect(13);

        // override root_url to be able to download the files during unit tests
        context.root_url = '../../';

        bandwidthTester({}).start(function(status, details, results){

            var toString = {}.toString;
            var speed = results.average;

            assert.ok(typeof status === 'object', 'The status is a object');
            assert.ok(typeof details === 'object', 'The details is a object');
            assert.ok(typeof results === 'object', 'The results is a object');
            assert.ok(speed > 0, 'The result is a positive number');
            assert.ok(typeof results === 'object', 'The details are provided inside an object');
            assert.ok(typeof results.min === 'number', 'The minimum speed is provided inside the details');
            assert.ok(typeof results.max === 'number', 'The maximum speed is provided inside the details');
            assert.ok(typeof results.average === 'number', 'The average speed is provided inside the details');
            assert.ok(typeof results.variance === 'number', 'The speed variance is provided inside the details');
            assert.ok(typeof results.duration === 'number', 'The total duration of the test is provided inside the details');
            assert.ok(typeof results.size === 'number', 'The total size of the test is provided inside the details');
            assert.equal(speed, results.average, 'The speed provided inside the details must be equal to provided speed');
            assert.ok(toString.call(results.values) === '[object Array]', 'The detailed measures are provided inside the details');

            QUnit.start();
        });

    });

});
