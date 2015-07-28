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
     * - url : location of the folder of the sample
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
            nb : 10
        },
        'sample2' : {
            id : 'sample2',
            url : 'taoClientDiagnostic/tools/performances/data/sample2/',
            timeout : 30 * _second,
            nb : 10
        },
        'sample3' : {
            id : 'sample3',
            url : 'taoClientDiagnostic/tools/performances/data/sample3/',
            timeout : 30 * _second,
            nb : 10
        }
    };
    
    /**
     * Loads a page inside a div and compute the time to load
     * @param {Object} data The descriptor of the page to load
     * @param {Function} done A callback function called to provide the result
     */
    function loadItem(data, done){
        
        //perf variables
        var totalDuration,
            displayDuration,
            start,
            end,
            result;
        
        //item location config
        var loader = new Loader();
        var renderer = new Renderer();
        var $container = $('<div>').appendTo('body');
        var qtiJsonFile = data.url+'qti.json';
        var urlTokens = data.url.split('/');
        var extension = urlTokens[0];
        var fullpath = require.s.contexts._.config.paths[extension];
        var baseUrl = data.url.replace(extension, fullpath);
        renderer.getAssetManager().setData('baseUrl', baseUrl);
        
        require(['json!'+qtiJsonFile], function(itemData){
            
            loader.loadItemData(itemData, function(item){
                renderer.load(function(){
                    
                    //start right before rendering
                    start = window.performance.now();
                    
                    //set renderer
                    item.setRenderer(this);

                    //render markup
                    $container.append(item.render());

                    //execute javascript
                    item.postRender();

                    //done
                    end = window.performance.now();
                    totalDuration = end - start;
                    displayDuration = totalDuration;

                    result = {
                        id : data.id,
                        url : data.url,
                        totalDuration: totalDuration,
                        displayDuration : displayDuration
                    };
                    
                    //remove item
                    $container.remove();
                    done(null, result);

                }, this.getLoadedClasses());
            });
        
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
                    var cb = _.partial(loadItem, data);
                    var iterations = data.nb || 1;
                    while (iterations --) {
                        tests.push(cb);
                    }
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
