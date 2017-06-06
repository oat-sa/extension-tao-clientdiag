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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
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
    'taoClientDiagnostic/tools/getconfig',
    'taoClientDiagnostic/tools/diagnostic/status',
    'lib/polyfill/performance-now'
], function($, _, __, async, context, helpers, stats, Loader, Renderer, getConfig, statusFactory) {
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
        // The threshold for optimal performances
        optimal: 0.025,

        // The threshold for minimal performances
        threshold: 0.25
    };

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
     * @param {Array} [samples]
     * @param {Number} [occurrences]
     * @param {Number} [timeout]
     * @returns {Object}
     */
    var performancesTester = function performancesTester(config, diagnosticTool) {
        var initConfig = getConfig(config, _defaults);
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


        var optimal = initConfig.optimal;
        var range = Math.abs(optimal - (initConfig.threshold));

        // add one occurrence on the first sample to obfuscate the time needed to load the runner
        _samples[0].nb ++;

        return {
            /**
             * Performs a performances test, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var tests = [];

                diagnosticTool.changeStatus(__('Checking the performances...'));

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
                    var cursor;
                    var status;
                    var summary;

                    if(err && !measures.length){
                        //something went wrong
                        throw err;
                    }

                    // remove the first result to obfuscate the time needed to load the runner
                    measures.shift();

                    results = stats(measures, 'duration', decimals);

                    cursor = range - results.average + optimal;
                    status = statusFactory().getStatus(cursor / range * 100, 'performances');
                    summary = {
                        performancesMin: {message: __('Minimum rendering time'), value: results.min + ' s'},
                        performancesMax: {message: __('Maximum rendering time'), value: results.max + ' s'},
                        performancesAverage: {message: __('Average rendering time'), value: results.average + ' s'}
                    };

                    status.title = __('Workstation performances');
                    status.id = 'performances';
                    diagnosticTool.addCustomFeedbackMsg(status, diagnosticTool.getCustomMsg('diagPerformancesCheckResult'));

                    done(status, summary, results);
                });
            }
        };
    };

    return performancesTester;
});
