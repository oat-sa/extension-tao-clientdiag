/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define([
    'i18n',
    'core/logger',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getStatus'
], function (__, loggerFactory, getConfig, getLabels, getStatus) {
    'use strict';

    const logger = loggerFactory('taoClientDiagnostic/audioPlayback');

    const RESUME_TIMEOUT_MS = 3000;

    const _defaults = {
        id: 'audio_playback',
        toneDurationMs: 250,
        toneFrequencyHz: 440,
        resumeTimeoutMs: RESUME_TIMEOUT_MS
    };

    const _thresholds = [
        {
            threshold: 0,
            message: __('Audio output test failed. Check volume and system audio settings.'),
            type: 'error'
        },
        {
            threshold: 33,
            message: __('Audio output could not be verified automatically; confirm you hear sound.'),
            type: 'warning'
        },
        {
            threshold: 100,
            message: __('Audio output test completed.'),
            type: 'success'
        }
    ];

    const _messages = [
        {
            title: __('Audio output'),
            status: __('Testing audio playback...'),
            result: __('Playback')
        }
    ];

    /**
     * @param {number} durationMs
     * @param {number} frequencyHz
     * @returns {Promise<'ok'|'soft-fail'>}
     */
    function playTestTone(durationMs, frequencyHz, resumeTimeoutMs) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return Promise.reject(new Error('AudioContext not supported'));
        }

        const ctx = new AudioContext();

        const run = () =>
            new Promise((resolve, reject) => {
                const oscillator = ctx.createOscillator();
                const gain = ctx.createGain();
                let timeoutId;

                oscillator.type = 'sine';
                oscillator.frequency.value = frequencyHz;
                gain.gain.value = 0.15;
                oscillator.connect(gain);
                gain.connect(ctx.destination);

                oscillator.onended = () => {
                    window.clearTimeout(timeoutId);
                    ctx.close().catch(() => {});
                    resolve('ok');
                };

                timeoutId = window.setTimeout(() => {
                    reject(new Error('Audio playback timed out'));
                }, durationMs + 2000);

                oscillator.start(0);
                oscillator.stop(ctx.currentTime + durationMs / 1000);
            });

        const afterResume =
            ctx.state === 'suspended'
                ? Promise.race([
                      ctx.resume(),
                      new Promise((_, reject) => {
                          window.setTimeout(() => {
                              reject(
                                  Object.assign(new Error('AudioContext resume timed out'), {
                                      name: 'NotAllowedError'
                                  })
                              );
                          }, resumeTimeoutMs);
                      })
                  ])
                : Promise.resolve();

        return afterResume.then(run).catch(err => {
            ctx.close().catch(() => {});
            return Promise.reject(err);
        });
    }

    return function audioPlaybackTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        return {
            start(done) {
                playTestTone(
                    initConfig.toneDurationMs,
                    initConfig.toneFrequencyHz,
                    initConfig.resumeTimeoutMs
                )
                    .then(() => {
                        const status = this.getFeedback(100);
                        const summary = this.getSummary({ ok: true });

                        done(status, summary, { ok: true });
                    })
                    .catch(err => {
                        logger.error(err);

                        const softFail = err && err.name === 'NotAllowedError';
                        const percentage = softFail ? 33 : 0;
                        const status = this.getFeedback(percentage);
                        const summary = this.getSummary({
                            ok: false,
                            softFail
                        });

                        done(status, summary, {
                            ok: false,
                            softFail,
                            errorName: (err && err.name) || 'Error'
                        });
                    });
            },

            get labels() {
                return labels;
            },

            getSummary(result) {
                let value = __('Playback verified');

                if (!result.ok) {
                    value = result.softFail
                        ? __('Confirm audio manually')
                        : __('Playback failed');
                }

                return {
                    playback: {
                        message: labels.result,
                        value
                    }
                };
            },

            getFeedback(result) {
                const status = getStatus(result, _thresholds);

                status.id = initConfig.id;
                status.title = labels.title;

                return status;
            }
        };
    };
});
