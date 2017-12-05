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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'taoClientDiagnostic/tools/upload/tester'
], function($, _, uploadTester){
    'use strict';

    // backup/restore ajax method between each test
    var ajaxBackup;

    QUnit.testStart(function () {
        ajaxBackup = $.ajax;
    });
    QUnit.testDone(function () {
        $.ajax = ajaxBackup;
    });

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert) {
        QUnit.expect(6);
        assert.ok(typeof uploadTester === 'function', 'The module exposes a function');
        assert.ok(typeof uploadTester() === 'object', 'uploadTester is a factory');
        assert.ok(typeof uploadTester().start === 'function', 'the test has a start method');
        assert.ok(typeof uploadTester().getSummary === 'function', 'the test has a getSummary method');
        assert.ok(typeof uploadTester().getFeedback === 'function', 'the test has a getFeedback method');
        assert.ok(typeof uploadTester().labels === 'object', 'the test has a labels objects');
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
            var labels = uploadTester({level: data.level}).labels;
            var labelKeys = [
                'title',
                'status',
                'uploadAvg',
                'uploadMax'
            ];

            QUnit.expect(labelKeys.length + 1);

            assert.equal(typeof labels, 'object', 'A set of labels is returned');
            labelKeys.forEach(function(key) {
                assert.equal(typeof labels[key], 'string', 'The label ' + key + ' exists');
            });
        });

    QUnit.test('getSummary', function(assert) {
        var tester = uploadTester({});
        var results = {
            max: 90,
            avg: 60
        };
        var summary = tester.getSummary(results);

        QUnit.expect(7);

        assert.equal(typeof summary, 'object', 'The method has returned the summary');

        assert.equal(typeof summary.uploadMax, 'object', 'The summary contains entry for max bandwidth');
        assert.equal(typeof summary.uploadMax.message, 'string', 'The summary contains label for max bandwidth');
        assert.equal(summary.uploadMax.value, results.max + ' Mbps', 'The summary contains the expected value for max bandwidth');

        assert.equal(typeof summary.uploadAvg, 'object', 'The summary contains entry for average bandwidth');
        assert.equal(typeof summary.uploadAvg.message, 'string', 'The summary contains label for average bandwidth');
        assert.equal(summary.uploadAvg.value, results.avg + ' Mbps', 'The summary contains the expected value for average bandwidth');
    });

    QUnit.test('getFeedback', function(assert) {
        var tester = uploadTester();
        var result = 1024 * 1024;
        var status = tester.getFeedback(result);

        QUnit.expect(6);

        assert.equal(typeof status, 'object', 'The method has returned the status');
        assert.equal(status.id, 'upload', 'The status contains the tester id');
        assert.equal(status.percentage, 100, 'The status contains the expected percentage');
        assert.equal(typeof status.title, 'string', 'The status contains a title');
        assert.equal(typeof status.quality, 'object', 'The status contains a quality descriptor');
        assert.equal(typeof status.feedback, 'object', 'The status contains a feedback descriptor');
    });


    QUnit.module('Test');

    QUnit.asyncTest('The tester runs', function(assert) {
        var expectedSize = 100;
        var $ajax = $.ajax;

        QUnit.expect(4);

        $.ajax = function (config) {
            config.url = window.location.href.replace('test.html', 'test.json');
            return $ajax(config);
        };

        uploadTester({size : expectedSize}).start(function(status, details, result) {
            assert.ok(typeof result.avg === 'number', 'Speed is a number');
            assert.ok(result.avg > 0, 'Speed is a positive number');
            assert.ok(typeof result.avg === 'number', 'Loaded is a number');
            assert.ok(result.avg > 0, 'Loaded is a positive number');

            QUnit.start();
        });

    });

});
