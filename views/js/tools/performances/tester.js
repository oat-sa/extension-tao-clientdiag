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
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taoteting.com>
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
     * @type {Number}
     * @private
     */
    var _second = 1000;

    /**
     * Default timeout duration
     * @type {Number}
     * @private
     */
    var _defaultTimeout = 30 * _second;

    /**
     * Default number of renderings by samples
     * @type {Number}
     * @private
     */
    var _defaultOccurrencesCount = 10;

    /**
     * List of default samples
     * @type {Array}
     */
    var _defaultSamples = [
        'taoClientDiagnostic/tools/performances/data/sample1/',
        'taoClientDiagnostic/tools/performances/data/sample2/',
        'taoClientDiagnostic/tools/performances/data/sample3/'
    ];

    /**
     * Default values for the performances tester
     * @type {Object}
     * @private
     */
    var _defaults = {
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
    var _thresholds = [{
        threshold: 0,
        message: __('Very slow performances'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average performances'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good performances'),
        type: 'success'
    }];

    /**
     * List of translated texts per level.
     * The level is provided through the config as a numeric value, starting from 1.
     * @type {Object}
     * @private
     */
    var _messages = [
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
     * @type {String}
     * @private
     */
    var _sampleBaseId = 'sample';

    /**
     * Loads a page inside a div and compute the time to load
     * @param {Object} data The descriptor of the page to load
     * @param {Function} done A callback function called to provide the result
     */
    function loadItem(data, done){

        //item location config
        var qtiJsonFile = data.url + 'qti.json';
        var urlTokens = data.url.split('/');
        var extension = urlTokens[0];
        var fullpath = require.s.contexts._.config.paths[extension];
        var baseUrl = data.url.replace(extension, fullpath);
        var loader = new Loader();
        var renderer = new Renderer({
            baseUrl : baseUrl       // compatibility mode for legacy installations
        });

        // check needed by compatibility mode for legacy installations
        if (renderer.getAssetManager) {
            renderer.getAssetManager().setData('baseUrl', baseUrl);
        }

        require(['json!'+qtiJsonFile], function(itemData){

            loader.loadItemData(itemData, function(item){
                renderer.load(function(){

                    var $container,
                        duration,
                        start,
                        end,
                        result;

                    //start right before rendering
                    start = window.performance.now();

                    //set renderer
                    item.setRenderer(this);

                    //render markup
                    $container = $('<div>').appendTo('body');
                    $container.append(item.render());

                    //execute javascript
                    item.postRender();

                    //remove item
                    $container.remove();

                    //done
                    end = window.performance.now();

                    duration = (end - start) / _second;

                    result = {
                        id : data.id,
                        url : data.url,
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
     * @param {Object} config - Some optional configs
     * @param {String} [config.id] - The identifier of the test
     * @param {Number} [config.optimal] - The threshold for optimal performances
     * @param {Number} [config.threshold] - The threshold for minimal performances
     * @param {String} [config.level] - The intensity level of the test. It will aim which messages list to use.
     * @returns {Object}
     */
    function performancesTester(config) {
        var initConfig = getConfig(config, _defaults);
        var labels = getLabels(_messages, initConfig.level);
        var idx = 0;
        var _samples = _.map(!_.isEmpty(initConfig.samples) && initConfig.samples || _defaultSamples, function(sample) {
            idx ++;
            return {
                id : _sampleBaseId + idx,
                url : sample,
                timeout : initConfig.timeout * 1000 || _defaultTimeout,
                nb : initConfig.occurrences || _defaultOccurrencesCount
            };
        });

        // add one occurrence on the first sample to obfuscate the time needed to load the runner
        _samples[0].nb ++;

        return {
            /**
             * Performs a performances test, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var tests = [];
                var self = this;

                _.forEach(_samples, function(data) {
                    var cb = _.partial(loadItem, data);
                    var iterations = data.nb || 1;
                    while (iterations --) {
                        tests.push(cb);
                    }
                });

                async.series(tests, function(err, measures) {
                    var decimals = 2;
                    var results;
                    var status;
                    var summary;

                    if(err && !measures.length){
                        //something went wrong
                        throw err;
                    }

                    // remove the first result to obfuscate the time needed to load the runner
                    measures.shift();

                    results = stats(measures, 'duration', decimals);
                    status = self.getFeedback(results.average);
                    summary = self.getSummary(results);

                    done(status, summary, results);
                });
            },

            /**
             * Gets the labels loaded for the tester
             * @returns {Object}
             */
            get labels() {
                return labels;
            },

            /**
             * Builds the results summary
             * @param {Object} results
             * @returns {Object}
             */
            getSummary: function getSummary(results) {
                return {
                    performancesMin: {message: labels.performancesMin, value: results.min + ' s'},
                    performancesMax: {message: labels.performancesMax, value: results.max + ' s'},
                    performancesAverage: {message: labels.performancesAverage, value: results.average + ' s'}
                };
            },

            /**
             * Gets the feedback status for the provided result value
             * @param {Number} result
             * @returns {Object}
             */
            getFeedback: function getFeedback(result) {
                var optimal = initConfig.optimal;
                var range = Math.abs(optimal - (initConfig.threshold));
                var status = getStatus((range + optimal - result) / range * 100, _thresholds);

                status.title =  labels.title;
                status.id = initConfig.id;
                return status;
            }
        };
    }

    return performancesTester;
});
