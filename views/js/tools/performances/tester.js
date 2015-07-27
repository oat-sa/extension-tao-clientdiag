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
    'async',
    'context',
    'helpers',
    'taoClientDiagnostic/tools/stats',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'lib/polyfill/performance-now'
], function($, _, async, context, helpers, stats, Loader, Renderer) {
    'use strict';

    /**
     * Duration of one second (in milliseconds)
     * @type {Number}
     * @private
     */
    var _second = 1000;

    /**
     * List of descriptors defining the pages to load.
     * - url : path of the page
     * - timeout : the timeout for the run
     * - nb : number of tests iterations
     * @type {Object}
     * @private
     */
    var _samples = {
        'sample1' : {
            id : 'sample1',
            url : 'taoClientDiagnostic/tools/performances/data/sample1/',
            timeout : 30 * _second,
            nb : 3
        },
        'sample2' : {
            id : 'sample2',
            url : 'taoClientDiagnostic/tools/performances/data/sample2/',
            timeout : 30 * _second,
            nb : 3
        },
        'sample3' : {
            id : 'sample3',
            url : 'taoClientDiagnostic/tools/performances/data/sample3/',
            timeout : 30 * _second,
            nb : 3
        }
    };

    /**
     * Loads a page inside a frame and compute the time to load
     * @param {Object} data The descriptor of the page to load
     * @param {Function} done A callback function called to provide the result
     */
    var loadFrame = function loadFrame(data, done) {
        var clientConfigUrl = helpers._url('config', 'ClientConfig', 'tao', {extension: 'taoQtiItem', module: 'QtiPreview', action: 'index'});
        var url = context.root_url + '/taoClientDiagnostic/views/js/tools/performances/' + data.url + '?clientConfigUrl=' + encodeURIComponent(clientConfigUrl) + '&' + Date.now();
        var $frame = $('<iframe name="performancesCheck" style="position: absolute; left: -100000px;" />');
        var frameEl = $frame.get(0);
        var frameWindow;
        var framePerf;
        var framePerfData;
        var totalDuration;
        var networkDuration;
        var requestDuration;
        var displayDuration;
        var start;
        var end;
        var requestStart;
        var responseEnd;

        $frame.on('load', function() {
            // use a deferred call to be sure the function is executed after load
            setTimeout(function() {
                end = Date.now();
                frameWindow = frameEl.contentWindow;
                framePerf = frameWindow && frameWindow.performance;

                framePerfData = framePerf && framePerf.timing;
                if (framePerfData) {
                    totalDuration = Math.round(framePerf.now());
                    start = framePerfData.navigationStart;
                    responseEnd = framePerfData.responseEnd;
                    requestStart = framePerfData.requestStart;

                    displayDuration = end - responseEnd;
                    networkDuration = responseEnd - start;
                    requestDuration = responseEnd - requestStart;
                } else {
                    totalDuration = end - start;
                    displayDuration = totalDuration;
                    networkDuration = 0;
                    requestDuration = 0;
                }

                done(null, {
                    id : data.id,
                    url : data.url,
                    totalDuration: totalDuration,
                    networkDuration : networkDuration,
                    requestDuration : requestDuration,
                    displayDuration : displayDuration,
                    performance: framePerfData
                });

                $frame.remove();
            }, 0);
        }).appendTo('body');

        start = Date.now();
        $frame.attr('src', url);
    };
    
    function loadFrame2(data, done){
        
        //perf variables
        var totalDuration;
        var networkDuration;
        var requestDuration;
        var displayDuration;
        var start;
        var end;
        var requestStart;
        var responseEnd;
        var framePerfData;
        
        //item location config
        var qtiJsonFile = data.url+'qti.json';
        var urlTokens = data.url.split('/');
        var extension = urlTokens[0];
        var requireConfig = require.s.contexts._.config;
        var fullpath = requireConfig.baseUrl + requireConfig.paths[extension];
        var baseUrl = data.url.replace(extension, fullpath);
        
        require(['json!'+qtiJsonFile], function(itemData){
            start = Date.now();
            console.log(itemData);
            renderQtiItem(itemData, $('#items'), {baseUrl : baseUrl}, function(){
                
                end = Date.now();

                if (framePerfData) {
                    totalDuration = Math.round(framePerf.now());
                    start = framePerfData.navigationStart;
                    responseEnd = framePerfData.responseEnd;
                    requestStart = framePerfData.requestStart;

                    displayDuration = end - responseEnd;
                    networkDuration = responseEnd - start;
                    requestDuration = responseEnd - requestStart;
                } else {
                    totalDuration = end - start;
                    displayDuration = totalDuration;
                    networkDuration = 0;
                    requestDuration = 0;
                }
                
                var result = {
                    id : data.id,
                    url : data.url,
                    totalDuration: totalDuration,
                    networkDuration : networkDuration,
                    requestDuration : requestDuration,
                    displayDuration : displayDuration,
                    performance: framePerfData
                };
                
                console.log('loaded', result);
            });
        });
        
    }
    
    function renderQtiItem(itemData, $container, config, done){
        
        var loader = new Loader();
        var renderer = new Renderer();
        renderer.getAssetManager().setData('baseUrl', config.baseUrl);

        //allow specifying the runtimeLocation (useful in debug mode)
        if(config.runtimeLocations){
            renderer.setOption('runtimeLocations', config.runtimeLocations);
        }
            
        loader.loadItemData(itemData, function(item){
            renderer.load(function(){

                //set renderer
                item.setRenderer(this);

                //render markup
                $container.append(item.render());

                //execute javascript
                item.postRender();
                
                //done
                done();
                
                //remove item
                item.getContainer().remove();
                
            }, this.getLoadedClasses());
        });
    }
    
    /**
     * Performs a browser performances test by running a heavy page
     *
     * @returns {{start: Function}}
     */
    var performancesTester = function performancesTester() {
        return {
            /**
             * Performs a performances test, then call a function to provide the result
             * @param {Function} done
             */
            start: function start(done) {
                var tests = [];
                _.forEach(_samples, function(data) {
                    var cb = _.partial(loadFrame, data);
                    var iterations = data.nb || 1;
                    while (iterations --) {
                        tests.push(cb);
                    }
                    loadFrame2(data);
                });

                async.series(tests, function(err, measures) {
                    var decimals = 2;
                    var results;

                    if(err && !measures.length){
                        //something went wrong
                        throw err;
                    }

                    results = stats(measures, 'displayDuration', decimals);

                    done(results.average, results);
                });
            }
        };
    };

    return performancesTester;
});
