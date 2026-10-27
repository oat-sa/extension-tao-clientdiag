/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['taoClientDiagnostic/tools/audioPlayback/tester'], function (audioPlaybackTester) {
    'use strict';

    var audioContextBackup;
    var webkitAudioContextBackup;

    function createRunningAudioContext() {
        var oscillator = {
            type: 'sine',
            frequency: { value: 0 },
            connect: function () {},
            start: function () {},
            stop: function () {
                if (typeof this.onended === 'function') {
                    this.onended();
                }
            },
            onended: null
        };

        return {
            state: 'running',
            currentTime: 0,
            destination: {},
            createOscillator: function () {
                return oscillator;
            },
            createGain: function () {
                return {
                    gain: { value: 0 },
                    connect: function () {}
                };
            },
            close: function () {
                return Promise.resolve();
            }
        };
    }

    function createSuspendedAudioContext() {
        return {
            state: 'suspended',
            resume: function () {
                return new Promise(function () {});
            },
            close: function () {
                return Promise.resolve();
            }
        };
    }

    QUnit.testStart(function () {
        audioContextBackup = window.AudioContext;
        webkitAudioContextBackup = window.webkitAudioContext;
    });

    QUnit.testDone(function () {
        window.AudioContext = audioContextBackup;
        window.webkitAudioContext = webkitAudioContextBackup;
    });

    QUnit.module('API');

    QUnit.test('The tester has the right form', function (assert) {
        assert.expect(6);
        assert.ok(typeof audioPlaybackTester === 'function', 'The module exposes a function');
        assert.ok(typeof audioPlaybackTester() === 'object', 'audioPlaybackTester is a factory');
        assert.ok(typeof audioPlaybackTester().start === 'function', 'the test has a start method');
        assert.ok(typeof audioPlaybackTester().getSummary === 'function', 'the test has a getSummary method');
        assert.ok(typeof audioPlaybackTester().getFeedback === 'function', 'the test has a getFeedback method');
        assert.ok(typeof audioPlaybackTester().labels === 'object', 'the test has a labels objects');
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
            var labels = audioPlaybackTester({ level: data.level }).labels;
            var labelKeys = ['title', 'status', 'result'];

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
                result: { ok: true },
                expectedType: 'string'
            },
            {
                title: 'hard failure',
                result: { ok: false, softFail: false },
                expectedType: 'string'
            },
            {
                title: 'soft failure',
                result: { ok: false, softFail: true },
                expectedType: 'string'
            }
        ])
        .test('getSummary', function (data, assert) {
            var tester = audioPlaybackTester({});
            var summary = tester.getSummary(data.result);

            assert.expect(3);

            assert.equal(typeof summary, 'object', 'The method has returned the summary');
            assert.equal(typeof summary.playback, 'object', 'The summary contains a playback entry');
            assert.equal(typeof summary.playback.value, data.expectedType, 'The summary contains a value');
        });

    QUnit.cases
        .init([
            {
                title: 'error',
                percentage: 0,
                type: 'error'
            },
            {
                title: 'warning',
                percentage: 33,
                type: 'warning'
            },
            {
                title: 'success',
                percentage: 100,
                type: 'success'
            }
        ])
        .test('getFeedback', function (data, assert) {
            var tester = audioPlaybackTester({});
            var status = tester.getFeedback(data.percentage);

            assert.expect(6);

            assert.equal(typeof status, 'object', 'The method has returned the status');
            assert.equal(status.id, 'audio_playback', 'The status contains the tester id');
            assert.equal(status.percentage, data.percentage, 'The status contains the expected percentage');
            assert.equal(typeof status.title, 'string', 'The status contains a title');
            assert.equal(typeof status.feedback, 'object', 'The status contains a feedback descriptor');
            assert.equal(status.feedback.type, data.type, 'The status contains the expected feedback type');
        });

    QUnit.module('Test');

    QUnit.test('start fails when AudioContext is not supported', function (assert) {
        var ready = assert.async();

        assert.expect(3);

        window.AudioContext = undefined;
        window.webkitAudioContext = undefined;

        audioPlaybackTester({}).start(function (status, summary, result) {
            assert.strictEqual(result.ok, false, 'The check failed');
            assert.strictEqual(result.softFail, false, 'The failure is not a soft fail');
            assert.strictEqual(status.percentage, 0, 'The status percentage is 0');

            ready();
        });
    });

    QUnit.test('start succeeds when playback completes', function (assert) {
        var ready = assert.async();

        assert.expect(3);

        window.AudioContext = function () {
            return createRunningAudioContext();
        };
        window.webkitAudioContext = undefined;

        audioPlaybackTester({}).start(function (status, summary, result) {
            assert.strictEqual(result.ok, true, 'The check succeeded');
            assert.strictEqual(status.percentage, 100, 'The status percentage is 100');
            assert.strictEqual(typeof summary.playback.value, 'string', 'The summary contains playback text');

            ready();
        });
    });

    QUnit.test('start soft-fails when AudioContext resume times out', function (assert) {
        var ready = assert.async();

        assert.expect(4);

        window.AudioContext = function () {
            return createSuspendedAudioContext();
        };
        window.webkitAudioContext = undefined;

        audioPlaybackTester({ resumeTimeoutMs: 20 }).start(function (status, summary, result) {
            assert.strictEqual(result.ok, false, 'The check failed');
            assert.strictEqual(result.softFail, true, 'The failure is a soft fail');
            assert.strictEqual(result.errorName, 'NotAllowedError', 'The error name is reported');
            assert.strictEqual(status.percentage, 33, 'The status percentage is 33');

            ready();
        });
    });
});
