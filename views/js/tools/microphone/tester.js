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

    const logger = loggerFactory('taoClientDiagnostic/microphone');

    const PERMISSION_TIMEOUT_MS = 30000;

    const _defaults = {
        id: 'microphone'
    };

    const _thresholds = [
        {
            threshold: 0,
            message: __('Microphone is not available or permission was denied.'),
            type: 'error'
        },
        {
            threshold: 100,
            message: __('Microphone access is working.'),
            type: 'success'
        }
    ];

    const _messages = [
        {
            title: __('Microphone'),
            status: __('Checking microphone access...'),
            device: __('Input device')
        }
    ];

    /**
     * @param {MediaStream} stream
     */
    function stopStream(stream) {
        if (!stream || !stream.getTracks) {
            return;
        }

        stream.getTracks().forEach(track => track.stop());
    }

    /**
     * @returns {Promise<{ ok: boolean, label: string, errorName?: string }>}
     */
    function probeMicrophone() {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
            return Promise.resolve({
                ok: false,
                label: __('Not supported'),
                errorName: 'NotSupportedError'
            });
        }

        return Promise.race([
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
                const track = stream.getAudioTracks()[0];
                const label = (track && track.label) || __('Default microphone');

                stopStream(stream);

                return { ok: true, label };
            }),
            new Promise((_, reject) => {
                window.setTimeout(() => {
                    reject(
                        Object.assign(new Error('getUserMedia timed out'), {
                            name: 'TimeoutError'
                        })
                    );
                }, PERMISSION_TIMEOUT_MS);
            })
        ]).catch(err => {
            logger.error(err);

            return {
                ok: false,
                label: err && err.name === 'NotFoundError' ? __('No microphone detected') : __('Denied or unavailable'),
                errorName: err && err.name
            };
        });
    }

    return function microphoneTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);

        return {
            start(done) {
                probeMicrophone().then(result => {
                    const percentage = result.ok ? 100 : 0;
                    const status = this.getFeedback(percentage);
                    const summary = this.getSummary(result);

                    done(status, summary, {
                        ok: result.ok,
                        label: result.label,
                        errorName: result.errorName || ''
                    });
                });
            },

            get labels() {
                return labels;
            },

            getSummary(result) {
                return {
                    microphone: {
                        message: labels.device,
                        value: result.label
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
