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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'async',
    'context',
    'helpers',
    'taoClientDiagnostic/tools/stats',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoClientDiagnostic/tools/getConfig',
    'taoClientDiagnostic/tools/getLabels',
    'taoClientDiagnostic/tools/getStatus'
], function($, _, __, async, context, helpers, stats, Loader, Renderer, getConfig, getLabels, getStatus) {
    'use strict';

    /**
     * Duration of one second (in milliseconds)
     * @type {number}
     * @private
     */
    const _second = 1000;

    /**
     * Default timeout duration
     * @type {number}
     * @private
     */
    const _defaultTimeout = 30 * _second;

    /**
     * Default number of renderings by samples
     * @type {number}
     * @private
     */
    const _defaultOccurrencesCount = 10;

    /**
     * List of default samples
     * @type {Array}
     * @private
     */
    const _defaultSamples = [
        'taoClientDiagnostic/tools/performances/data/sample1/',
        'taoClientDiagnostic/tools/performances/data/sample2/',
        'taoClientDiagnostic/tools/performances/data/sample3/'
    ];

    /**
     * Default values for the performances tester
     * @type {object}
     * @private
     */
    const _defaults = {
        id: 'performances',

        // The threshold for optimal performances
        optimal: 0.025,

        // The threshold for minimal performances
        threshold: 0.25
    };

    /**
     * A list of thresholds for performances check
     * @type {Array}
     * @private
     */
    const _thresholds = [
        {
            threshold: 0,
            message: __('Very slow performances'),
            type: 'error'
        },
        {
            threshold: 33,
            message: __('Average performances'),
            type: 'warning'
        },
        {
            threshold: 66,
            message: __('Good performances'),
            type: 'success'
        }
    ];

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {object}
     * @private
     */
    const _messages = [
        // level 1
        {
            title: __('Workstation performances'),
            status: __('Checking the performances...'),
            performancesMin: __('Minimum rendering time'),
            performancesMax: __('Maximum rendering time'),
            performancesAverage: __('Average rendering time')
        }
    ];

    /**
     * Base text used to build sample identifiers
     * @type {string}
     * @private
     */
    const _sampleBaseId = 'sample';

    /**
     * Loads a page inside a div and compute the time to load
     * @param {object} data The descriptor of the page to load
     * @param {Function} done A callback function called to provide the result
     * @private
     */
    function loadItem(data, done) {
        //item location config
        const qtiJsonFile = `${data.url}qti.json`;
        const urlTokens = data.url.split('/');
        const extension = urlTokens[0];
        const fullpath = require.s.contexts._.config.paths[extension];
        const baseUrl = data.url.replace(extension, fullpath);
        const loader = new Loader();
        const renderer = new Renderer({
            baseUrl: baseUrl // compatibility mode for legacy installations
        });

        // check needed by compatibility mode for legacy installations
        if (renderer.getAssetManager) {
            renderer.getAssetManager().setData('baseUrl', baseUrl);
        }

        require([`json!${qtiJsonFile}`], function(itemData) {
            loader.loadItemData(itemData, function(item) {
                renderer.load(function() {
                    //start right before rendering
                    const start = window.performance.now();

                    //set renderer
                    item.setRenderer(this);

                    //render markup
                    const $container = $('<div>').appendTo('body');
                    $container.append(item.render());

                    //execute javascript
                    item.postRender();

                    //remove item
                    $container.remove();

                    //done
                    const end = window.performance.now();

                    const duration = (end - start) / _second;

                    const result = {
                        id: data.id,
                        url: data.url,
                        duration: duration
                    };

                    done(null, result);
                }, this.getLoadedClasses());
            });
        });
    }

    /**
     * Performs a browser performances test by running a heavy page
     *
     * @param {object} config - Some optional configs
     * @param {string} [config.id] - The identifier of the test
     * @param {number} [config.optimal] - The threshold for optimal performances
     * @param {number} [config.threshold] - The threshold for minimal performances
     * @param {string} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {object}
     */
    return function performancesTester(config) {
        const initConfig = getConfig(config, _defaults);
        const labels = getLabels(_messages, initConfig.level);
        let idx = 0;
        const _samples = _.map((!_.isEmpty(initConfig.samples) && initConfig.samples) || _defaultSamples, sample => {
            idx++;
            return {
                id: _sampleBaseId + idx,
                url: sample,
                timeout: initConfig.timeout * 1000 || _defaultTimeout,
                nb: initConfig.occurrences || _defaultOccurrencesCount
            };
        });

        // add one occurrence on the first sample to obfuscate the time needed to load the runner
        _samples[0].nb++;

        return {
            /**
             * Performs a performances test, then call a function to provide the result
             * @param {Function} done
             */
            start(done) {
                const tests = [];

                _.forEach(_samples, data => {
                    const cb = _.partial(loadItem, data);
                    let iterations = data.nb || 1;
                    while (iterations--) {
                        tests.push(cb);
                    }
                });

                async.series(tests, (err, measures) => {
                    const decimals = 2;

                    if (err && !measures.length) {
                        //something went wrong
                        throw err;
                    }

                    // remove the first result to obfuscate the time needed to load the runner
                    measures.shift();

                    const results = stats(measures, 'duration', decimals);
                    const status = this.getFeedback(results.average);
                    const summary = this.getSummary(results);

                    done(status, summary, results);
                });
            },

            /**
             * Gets the labels loaded for the tester
             * @returns {object}
             */
            get labels() {
                return labels;
            },

            /**
             * Builds the results summary
             * @param {object} results
             * @returns {object}
             */
            getSummary(results) {
                return {
                    performancesMin: { message: labels.performancesMin, value: `${results.min} s` },
                    performancesMax: { message: labels.performancesMax, value: `${results.max} s` },
                    performancesAverage: { message: labels.performancesAverage, value: `${results.average} s` }
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {Number} result
             * @returns {object}
             */
            getFeedback(result) {
                const optimal = initConfig.optimal;
                const range = Math.abs(optimal - initConfig.threshold);
                const status = getStatus(((range + optimal - result) / range) * 100, _thresholds);

                status.title = labels.title;
                status.id = initConfig.id;
                return status;
            }
        };
    };
});
