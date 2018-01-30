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
define([
    'core/store',
    'taoClientDiagnostic/tools/fingerprint/tester',
    'taoClientDiagnostic/lib/fingerprint/fingerprint2'
], function (storeMock, fingerprintTester, fingerprintMock) {
    'use strict';

    var fingerprint = 'foo123bar456';
    var components = [{
        foo: 'bar'
    }];


    QUnit.module('API');

    QUnit.test('The tester has the right form', function (assert) {
        QUnit.expect(6);
        assert.ok(typeof fingerprintTester === 'function', 'The module exposes a function');
        assert.ok(typeof fingerprintTester() === 'object', 'fingerprintTester is a factory');
        assert.ok(typeof fingerprintTester().start === 'function', 'the test has a start method');
        assert.ok(typeof fingerprintTester().getSummary === 'function', 'the test has a getSummary method');
        assert.ok(typeof fingerprintTester().getFeedback === 'function', 'the test has a getFeedback method');
        assert.ok(typeof fingerprintTester().labels === 'object', 'the test has a labels objects');
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
            var labels = fingerprintTester({level: data.level}).labels;
            var labelKeys = [
                'title',
                'status',
                'fingerprintValue',
                'fingerprintUUID',
                'fingerprintDetails',
                'fingerprintChanged',
                'fingerprintErrors'
            ];

            QUnit.expect(labelKeys.length + 1);

            assert.equal(typeof labels, 'object', 'A set of labels is returned');
            labelKeys.forEach(function (key) {
                assert.equal(typeof labels[key], 'string', 'The label ' + key + ' exists');
            });
        });


    QUnit.cases([{
        title: 'no errors',
        errors: false,
        results: {
            value: fingerprint,
            uuid: 1234,
            details: [{
                foo: 'bar'
            }]
        }
    }, {
        title: 'with errors',
        errors: true,
        results: {
            value: fingerprint,
            uuid: 1234,
            details: [{
                foo: 'bar'
            }, {
                type: 'error'
            }],
            errors: 1
        }
    }])
        .test('getSummary', function (data, assert) {
            var tester = fingerprintTester({});
            var summary = tester.getSummary(data.results);

            QUnit.expect(10 + (data.errors ? 3 : 0));

            assert.equal(typeof summary, 'object', 'The method has returned the summary');

            assert.equal(typeof summary.fingerprintValue, 'object', 'The summary contains entry for fingerprint');
            assert.equal(typeof summary.fingerprintValue.message, 'string', 'The summary contains label for fingerprint');
            assert.equal(summary.fingerprintValue.value, data.results.value, 'The summary contains the expected value for fingerprint');

            assert.equal(typeof summary.fingerprintDetails, 'object', 'The summary contains entry for fingerprint sources');
            assert.equal(typeof summary.fingerprintDetails.message, 'string', 'The summary contains label for fingerprint sources');
            assert.equal(typeof summary.fingerprintDetails.value, 'string', 'The summary contains the expected value for fingerprint sources');

            assert.equal(typeof summary.fingerprintChanged, 'object', 'The summary contains entry for fingerprint change');
            assert.equal(typeof summary.fingerprintChanged.message, 'string', 'The summary contains label for fingerprint change');
            assert.equal(typeof summary.fingerprintChanged.value, 'string', 'The summary contains the expected value for fingerprint change');

            if (data.errors) {
                assert.equal(typeof summary.fingerprintErrors, 'object', 'The summary contains entry for fingerprint errors');
                assert.equal(typeof summary.fingerprintErrors.message, 'string', 'The summary contains label for fingerprint errors');
                assert.equal(summary.fingerprintErrors.value, data.results.errors, 'The summary contains the expected value for fingerprint errors');
            }
        });


    QUnit.cases([{
        title: 'error no results',
        percentage: 0,
        type: 'error',
        results: null
    }, {
        title: 'error no fingerprint',
        percentage: 0,
        type: 'error',
        results: {
            value: null
        }
    }, {
        title: 'error fingerprint',
        percentage: 0,
        type: 'error',
        results: {
            value: 'error',
            uuid: 1234,
            changed: false,
            details: [{
                foo: 'bar'
            }]
        }
    }, {
        title: 'warning storage',
        percentage: 50,
        type: 'warning',
        results: {
            value: fingerprint,
            uuid: 'error',
            changed: false,
            details: [{
                foo: 'bar'
            }]
        }
    }, {
        title: 'success but updated',
        percentage: 90,
        type: 'success',
        results: {
            value: fingerprint,
            uuid: 1234,
            changed: true,
            details: [{
                foo: 'bar'
            }]
        }
    }, {
        title: 'success',
        percentage: 100,
        type: 'success',
        results: {
            value: fingerprint,
            uuid: 1234,
            changed: false,
            details: [{
                foo: 'bar'
            }]
        }
    }])
        .test('getFeedback', function (data, assert) {
            var tester = fingerprintTester({});
            var status = tester.getFeedback(data.results);

            QUnit.expect(6);

            assert.equal(typeof status, 'object', 'The method has returned the status');
            assert.equal(status.id, 'fingerprint', 'The status contains the tester id');
            assert.equal(status.percentage, data.percentage, 'The status contains the expected percentage');
            assert.equal(typeof status.title, 'string', 'The status contains a title');
            assert.equal(typeof status.feedback, 'object', 'The status contains a feedback descriptor');
            assert.equal(status.feedback.type, data.type, 'The status contains the expected feedback type');
        });


    QUnit.module('Test');

    // cleans up the storage between each test
    QUnit.testStart(function () {
        storeMock('client-diagnostic').then(function (storage) {
            storage.clear();
        });
    });

    QUnit.asyncTest('The tester runs', function (assert) {

        QUnit.expect(6);

        fingerprintMock.fails = false;
        fingerprintMock.result = fingerprint;
        fingerprintMock.components = components;
        storeMock.setConfig('client-diagnostic', {});

        fingerprintTester({}).start(function (status, details, results) {

            assert.equal(typeof status, 'object', 'The status is a object');
            assert.equal(typeof details, 'object', 'The details is a object');
            assert.equal(typeof results, 'object', 'The details are provided inside an object');
            assert.equal(results.value, fingerprint.toUpperCase(), 'The fingerprint is provided inside the results');
            assert.equal(results.details, components, 'The fingerprint details are provided inside the results');
            assert.equal(typeof results.errors, 'undefined', 'No errors should be found');

            QUnit.start();
        });

    });

    QUnit.asyncTest('The tester runs, even if storage is not available', function (assert) {

        QUnit.expect(7);

        fingerprintMock.fails = false;
        fingerprintMock.result = fingerprint;
        fingerprintMock.components = components;
        storeMock.setConfig('client-diagnostic', {
            failedStore: true
        });

        fingerprintTester({}).start(function (status, details, results) {

            assert.equal(typeof status, 'object', 'The status is a object');
            assert.equal(typeof details, 'object', 'The details is a object');
            assert.equal(typeof results, 'object', 'The details are provided inside an object');
            assert.equal(results.value, fingerprint.toUpperCase(), 'The fingerprint is provided inside the results');
            assert.deepEqual(results.details.slice(0, -1), components, 'The fingerprint details are provided inside the results');
            assert.equal(results.details.pop().key, 'error', 'The fingerprint error is provided inside the results');
            assert.equal(results.errors, 1, 'An error should be found');

            QUnit.start();
        });

    });

    QUnit.asyncTest('The tester runs, even if storage is not writable', function (assert) {

        QUnit.expect(7);

        fingerprintMock.fails = false;
        fingerprintMock.result = fingerprint;
        fingerprintMock.components = components;
        storeMock.setConfig('client-diagnostic', {
            failedSet: true
        });

        fingerprintTester({}).start(function (status, details, results) {

            assert.equal(typeof status, 'object', 'The status is a object');
            assert.equal(typeof details, 'object', 'The details is a object');
            assert.equal(typeof results, 'object', 'The details are provided inside an object');
            assert.equal(results.value, fingerprint.toUpperCase(), 'The fingerprint is provided inside the results');
            assert.deepEqual(results.details.slice(0, -1), components, 'The fingerprint details are provided inside the results');
            assert.equal(results.details.pop().key, 'error', 'The fingerprint error is provided inside the results');
            assert.equal(results.errors, 1, 'An error should be found');

            QUnit.start();
        });

    });

    QUnit.asyncTest('The tester runs, even if an error occurs', function (assert) {

        QUnit.expect(7);

        fingerprintMock.fails = true;
        fingerprintMock.result = fingerprint;
        fingerprintMock.components = components;
        storeMock.setConfig('client-diagnostic', {});

        fingerprintTester({}).start(function (status, details, results) {

            assert.equal(typeof status, 'object', 'The status is a object');
            assert.equal(typeof details, 'object', 'The details is a object');
            assert.equal(typeof results, 'object', 'The details are provided inside an object');
            assert.equal(typeof results.value, 'undefined', 'The fingerprint is not provided inside the results');
            assert.equal(results.details.length, 1, 'The fingerprint details are provided inside the results');
            assert.equal(results.details.pop().key, 'error', 'The fingerprint error is provided inside the results');
            assert.equal(results.errors, 1, 'An error should be found');

            QUnit.start();
        });

    });

});
