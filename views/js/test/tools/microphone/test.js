/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['taoClientDiagnostic/tools/microphone/tester'], function (microphoneTester) {
    'use strict';

    var mediaDevicesBackup;

    function fakeStream(label) {
        var track = {
            label: label || 'Test mic',
            stop: function () {}
        };

        return {
            getAudioTracks: function () {
                return [track];
            },
            getTracks: function () {
                return [track];
            }
        };
    }

    QUnit.testStart(function () {
        mediaDevicesBackup = navigator.mediaDevices;
    });

    QUnit.testDone(function () {
        navigator.mediaDevices = mediaDevicesBackup;
    });

    QUnit.module('API');

    QUnit.test('The tester has the right form', function (assert) {
        assert.expect(6);
        assert.ok(typeof microphoneTester === 'function', 'The module exposes a function');
        assert.ok(typeof microphoneTester() === 'object', 'microphoneTester is a factory');
        assert.ok(typeof microphoneTester().start === 'function', 'the test has a start method');
        assert.ok(typeof microphoneTester().getSummary === 'function', 'the test has a getSummary method');
        assert.ok(typeof microphoneTester().getFeedback === 'function', 'the test has a getFeedback method');
        assert.ok(typeof microphoneTester().labels === 'object', 'the test has a labels objects');
    });

    QUnit.cases
        .init([
            {
                title: 'no level'
            },
            {
                title: 'level 0',
                level: 0
            },
            {
                title: 'level 1',
                level: 1
            },
            {
                title: 'level 2',
                level: 2
            },
            {
                title: 'level 3',
                level: 3
            }
        ])
        .test('labels', function (data, assert) {
            var labels = microphoneTester({ level: data.level }).labels;
            var labelKeys = ['title', 'status', 'device'];

            assert.expect(labelKeys.length + 1);

            assert.equal(typeof labels, 'object', 'A set of labels is returned');
            labelKeys.forEach(function (key) {
                assert.equal(typeof labels[key], 'string', 'The label ' + key + ' exists');
            });
        });

    QUnit.cases
        .init([
            {
                title: 'success',
                result: {
                    ok: true,
                    label: 'Built-in Microphone'
                }
            },
            {
                title: 'failure',
                result: {
                    ok: false,
                    label: 'Denied or unavailable'
                }
            }
        ])
        .test('getSummary', function (data, assert) {
            var tester = microphoneTester({});
            var summary = tester.getSummary(data.result);

            assert.expect(4);

            assert.equal(typeof summary, 'object', 'The method has returned the summary');
            assert.equal(typeof summary.microphone, 'object', 'The summary contains a microphone entry');
            assert.equal(typeof summary.microphone.message, 'string', 'The summary contains a label');
            assert.equal(summary.microphone.value, data.result.label, 'The summary contains the expected value');
        });

    QUnit.cases
        .init([
            {
                title: 'error',
                percentage: 0,
                type: 'error'
            },
            {
                title: 'success',
                percentage: 100,
                type: 'success'
            }
        ])
        .test('getFeedback', function (data, assert) {
            var tester = microphoneTester({});
            var status = tester.getFeedback(data.percentage);

            assert.expect(6);

            assert.equal(typeof status, 'object', 'The method has returned the status');
            assert.equal(status.id, 'microphone', 'The status contains the tester id');
            assert.equal(status.percentage, data.percentage, 'The status contains the expected percentage');
            assert.equal(typeof status.title, 'string', 'The status contains a title');
            assert.equal(typeof status.feedback, 'object', 'The status contains a feedback descriptor');
            assert.equal(status.feedback.type, data.type, 'The status contains the expected feedback type');
        });

    QUnit.module('Test');

    QUnit.test('start reports not supported when getUserMedia is unavailable', function (assert) {
        var ready = assert.async();

        assert.expect(3);

        navigator.mediaDevices = undefined;

        microphoneTester({}).start(function (status, summary, result) {
            assert.strictEqual(result.ok, false, 'The check failed');
            assert.strictEqual(result.errorName, 'NotSupportedError', 'The error name is reported');
            assert.strictEqual(status.percentage, 0, 'The status percentage is 0');

            ready();
        });
    });

    QUnit.test('start succeeds when microphone access is granted', function (assert) {
        var ready = assert.async();

        assert.expect(4);

        navigator.mediaDevices = {
            getUserMedia: function () {
                return Promise.resolve(fakeStream('USB Mic'));
            }
        };

        microphoneTester({}).start(function (status, summary, result) {
            assert.strictEqual(result.ok, true, 'The check succeeded');
            assert.strictEqual(result.label, 'USB Mic', 'The device label is reported');
            assert.strictEqual(summary.microphone.value, 'USB Mic', 'The summary contains the device label');
            assert.strictEqual(status.percentage, 100, 'The status percentage is 100');

            ready();
        });
    });

    QUnit.test('start fails when permission is denied', function (assert) {
        var ready = assert.async();

        assert.expect(2);

        navigator.mediaDevices = {
            getUserMedia: function () {
                return Promise.reject({ name: 'NotAllowedError' });
            }
        };

        microphoneTester({}).start(function (status, summary, result) {
            assert.strictEqual(result.ok, false, 'The check failed');
            assert.strictEqual(status.percentage, 0, 'The status percentage is 0');

            ready();
        });
    });

    QUnit.test('start fails when no microphone is detected', function (assert) {
        var ready = assert.async();

        assert.expect(2);

        navigator.mediaDevices = {
            getUserMedia: function () {
                return Promise.reject({ name: 'NotFoundError' });
            }
        };

        microphoneTester({}).start(function (status, summary, result) {
            assert.strictEqual(result.ok, false, 'The check failed');
            assert.strictEqual(result.errorName, 'NotFoundError', 'The error name is reported');

            ready();
        });
    });

    QUnit.test('start completes when the permission prompt times out', function (assert) {
        var ready = assert.async();

        assert.expect(3);

        navigator.mediaDevices = {
            getUserMedia: function () {
                return new Promise(function () {});
            }
        };

        microphoneTester({ permissionTimeoutMs: 20 }).start(function (status, summary, result) {
            assert.strictEqual(result.ok, false, 'The check failed');
            assert.strictEqual(result.errorName, 'TimeoutError', 'The error name is reported');
            assert.strictEqual(status.percentage, 0, 'The status percentage is 0');

            ready();
        });
    });
});
