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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 * @author dieter <dieter@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'async',
    'helpers',
    'ui/feedback',
    'ui/component',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/bandwidth/tester',
    'taoClientDiagnostic/tools/browser/tester',
    'taoClientDiagnostic/tools/getconfig',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/main',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/result',
    'css!taoClientDiagnosticCss/diagnostics'
], function ($, _, __, async, helpers, feedback, component, performancesTester, bandwidthTester, browserTester,getConfig,  mainTpl, resultTpl) {
    'use strict';

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var _defaults = {
        title: __('Diagnostic Tool'),
        header: __('This tool will run a number of tests in order to establish how well your current environment is suitable to run the TAO platform.'),
        info: __('Be aware that these tests will take up to several minutes.'),
        button: __('Begin diagnostics'),
        actionStore: 'storeData',
        actionCheck: 'check',
        controller: 'CompatibilityChecker',
        extension: 'taoClientDiagnostic'
    };

    /**
     * Default values for the browser tester
     * @type {Object}
     * @private
     */
    var _defaultsBrowser = {
        action: 'whichBrowser',
        controller: 'CompatibilityChecker',
        extension: 'taoClientDiagnostic'
    };

    /**
     * Default values for the bandwidth tester
     * @type {Object}
     * @private
     */
    var _defaultsBandwidth = {
        // The typical bandwidth needed for a test taker (Mbps)
        unit: 0.16,

        // The thresholds for optimal bandwidth
        ideal: 45,

        // Maximum number of test takers to display
        max: 100
    };

    /**
     * Default values for the performances tester
     * @type {Object}
     * @private
     */
    var _defaultsPerformances = {
        // The threshold for optimal performances
        optimal: 0.025,

        // The threshold for minimal performances
        threshold: 0.25
    };

    /**
     * A list of thresholds for performances check
     * @type {Array}
     */
    var performancesThresholds = [{
        threshold: 0,
        message: __('Very slow performance'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average performance'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good performance'),
        type: 'success'
    }];

    /**
     * A list of thresholds for bandwidth check
     * @type {Array}
     */
    var bandwidthThresholds = [{
        threshold: 0,
        message: __('Low bandwidth'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Average bandwidth'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Good bandwidth'),
        type: 'success'
    }];

    /**
     * A list of thresholds for summary
     * @type {Array}
     */
    var summaryThresholds = [{
        threshold: 0,
        message: __('Your system requires a compatibility update, please contact your system administrator.'),
        type: 'error'
    }, {
        threshold: 33,
        message: __('Your system is not optimal, please contact your system administrator.'),
        type: 'warning'
    }, {
        threshold: 66,
        message: __('Your system is fully compliant.'),
        type: 'success'
    }];

    /**
     * Defines a diagnostic tool
     * @type {Object}
     */
    var diagnostic = {
        /**
         * Updates the displayed status
         * @param {String} status
         * @returns {diagnostic}
         * @private
         */
        changeStatus: function changeStatus(status) {
            if (this.is('rendered')) {
                this.controls.$status.html(status);
            }
            return this;
        },

        /**
         * Sends the detailed stats to the server
         * @param {String} type The type of stats
         * @param {Object} details The stats details
         * @param {Function} done A callback method called once server has responded
         */
        store: function store(type, details, done) {
            var config = this.config;

            details = _.omit(details, 'values');
            details.type = type;

            $.post(
                helpers._url(config.actionStore, config.controller, config.extension),
                details,
                done,
                "json"
            );
        },

        /**
         * Performs a browser checks
         * @param {Function} done
         */
        checkBrowser: function checkBrowser(done) {
            var self = this;
            var config = this.config;

            this.changeStatus(__('Checking the browser...'));

            browserTester(window, getConfig(this.config.browser, _defaultsBrowser)).start(function (information) {
                // which browser
                $.post(
                    helpers._url(config.actionCheck, config.controller, config.extension),
                    information,
                    function (data) {
                        var percentage = 'success' === data.type ? 100 : 0;
                        var status = getStatus(percentage, data);
                        var summary = {
                            browser: {
                                message: __('Web browser'),
                                value: information.browser + ' ' + information.browserVersion
                            },
                            os: {
                                message: __('Operating system'),
                                value: information.os + ' ' + information.osVersion
                            }
                        };

                        status.id = 'browser';
                        status.title = __('Operating system and web browser');

                        self.addResult(status);

                        done(status, summary);
                    },
                    'json'
                );
            });
        },

        /**
         * Performs a browser performances check
         * @param {Function} done
         */
        checkPerformances: function checkPerformances(done) {
            var self = this;
            var config = getConfig(this.config.performances, _defaultsPerformances);
            var optimal = config.optimal;
            var range = Math.abs(optimal - (config.threshold));

            this.changeStatus(__('Checking the performances...'));
            performancesTester(config.samples, config.occurrences, config.timeout * 1000).start(function (average, details) {
                var cursor = range - average + optimal;
                var status = getStatus(cursor / range * 100, performancesThresholds);
                var summary = {
                    performancesMin: {message: __('Minimum rendering time'), value: details.min + ' s'},
                    performancesMax: {message: __('Maximum rendering time'), value: details.max + ' s'},
                    performancesAverage: {message: __('Average rendering time'), value: details.average + ' s'}
                };

                self.store('performance', details, function () {
                    status.id = 'performance';
                    status.title = __('Workstation performance');

                    self.addResult(status);

                    done(status, summary);
                });
            });
        },

        /**
         * Performs a browser bandwidth check
         * @param {Function} done
         */
        checkBandwidth: function checkBandwidth(done) {
            var self = this;
            var config = getConfig(this.config.bandwidth, _defaultsBandwidth);

            this.changeStatus(__('Checking the bandwidth...'));
            bandwidthTester().start(function (average, details) {
                var summary = {
                    bandwidthMin: {message: __('Minimum bandwidth'), value: details.min + ' Mbps'},
                    bandwidthMax: {message: __('Maximum bandwidth'), value: details.max + ' Mbps'},
                    bandwidthAverage: {message: __('Average bandwidth'), value: details.average + ' Mbps'}
                };

                self.store('bandwidth', details, function () {
                    var status = [];

                    var bandwidthUnit = config.unit;
                    var testTakers = config.ideal;
                    var maxTestTakers = config.max;

                    if (!_.isArray(testTakers)) {
                        testTakers = [testTakers];
                    }

                    _.forEach(testTakers, function (threshold, i) {
                        var max = threshold * bandwidthUnit;
                        var st = getStatus(details.max / max * 100, bandwidthThresholds);
                        var nb = Math.floor(details.max / bandwidthUnit);

                        if (nb > maxTestTakers) {
                            nb = '>' + maxTestTakers;
                        }

                        st.id = 'bandwidth-' + i;
                        st.title = __('Bandwidth');
                        st.feedback.legend = __('Number of simultaneous test takers the connection can handle');

                        st.quality.label = nb;

                        if (nb.toString().length > 2) {
                            st.quality.wide = true;
                        }

                        status.push(st);

                        self.addResult(st);
                    });

                    done(status, summary);
                });
            });
        },

        /**
         * Add a result row
         * @param {Object} result
         * @returns {diagnostic}
         */
        addResult: function addResult(result) {
            var $result, $indicator;

            if (this.is('rendered')) {
                // adjust the width of the displayed label, if any, to the text length
                if (result.quality && result.quality.label && result.quality.label.toString().length > 2) {
                    result.quality.wide = true;
                }

                // create and append the result to the displayed list
                $result = $(resultTpl(result));
                $indicator = $result.find('.quality-indicator');
                this.controls.$results.append($result);

                // the result is hidden by default, show it with a little animation
                $result.fadeIn(function () {
                    if ($indicator.length) {
                        $indicator.animate({
                            left: (result.percentage * $result.outerWidth() / 100) - ($indicator.outerWidth() / 2)
                        });
                    }
                });
            }

            return this;
        },

        /**
         * Does some preparations before starting the diagnostics
         * @returns {diagnostic}
         * @private
         */
        prepare: function prepare() {
            /**
             * Notifies the diagnostic start
             * @event diagnostic#start
             */
            this.trigger('start');
            this.changeStatus(__('Starting...'));
            this.setState('running', true);
            this.setState('done', false);

            // first we need a clean space to display the results, so remove the last results if any
            this.controls.$results.empty();

            // remove the start button during the diagnostic
            this.controls.$start.addClass('hidden');

            return this;
        },

        /**
         * Does some post process after ending the diagnostics
         * @returns {diagnostic}
         * @private
         */
        finish: function finish() {
            // restore the start button to allow a new diagnostic run
            this.controls.$start.removeClass('hidden');

            /**
             * Notifies the diagnostic end
             * @event diagnostic#end
             */
            this.trigger('end');
            this.changeStatus(__('Done!'));
            this.setState('running', false);
            this.setState('done', true);

            return this;
        },

        /**
         * Runs the diagnostics
         * @returns {diagnostic}
         */
        run: function run() {
            var self = this;
            var information = {};
            var scores = {};

            // common handling for testers
            function doCheck(method, cb) {
                /**
                 * Notifies the start of a tester operation
                 * @event diagnostic#starttester
                 * @param {String} name - The name of the tester
                 */
                self.trigger('starttester', method);
                self.setState(method, true);

                self[method](function (status, details) {
                    // the returned details must be ingested into the main details list
                    _.assign(information, details);

                    // sometimes it is an array, sometimes not...
                    // simplify all by only supporting arrays
                    if (!_.isArray(status)) {
                        status = [status];
                    }
                    _.forEach(status, function (st) {
                        scores[st.id] = st;
                    });

                    /**
                     * Notifies the end of a tester operation
                     * @event diagnostic#endtester
                     * @param {String} name - The name of the tester
                     * @param {Array} results - The results of the test
                     */
                    self.trigger('endtester', method, status);
                    self.setState(method, false);

                    // do not forget to notify the end of the operation to the manager
                    cb();
                });
            }

            if (this.is('rendered')) {
                // set up the component to a new run
                this.prepare();

                // launch each testers in series, then display the results
                async.series([function (cb) {
                    doCheck('checkBrowser', cb);
                }, function (cb) {
                    doCheck('checkPerformances', cb);
                }, function (cb) {
                    doCheck('checkBandwidth', cb);
                }], function () {
                    // pick the lowest percentage as the main score
                    var total = _.min(scores, 'percentage');

                    // get a status according to the main score
                    var status = getStatus(total.percentage, summaryThresholds);

                    // display the result
                    status.title = __('Total');
                    status.id = 'total';
                    status.details = information;
                    self.addResult(status);

                    // done !
                    self.finish();
                });
            }

            return this;
        }
    };

    /**
     * Gets the correct status message for a given percentage
     * @param {Number} percentage
     * @param {Array} thresholds
     * @returns {Object}
     */
    function getStatus(percentage, thresholds) {
        var len, feedback, i, step, status;

        // the percentage is between 0 and 100 and obviously must be a number
        percentage = Math.max(0, Math.min(100, Math.round(parseInt(percentage, 10))));

        // grab a feedback related to the percentage in the thresholds list
        if (thresholds) {
            if (!_.isArray(thresholds)) {
                thresholds = [thresholds];
            }

            len = thresholds.length;
            feedback = thresholds[0];
            for (i = 1; i < len; i++) {
                step = thresholds[i];
                if (step && percentage >= step.threshold) {
                    feedback = step;
                } else {
                    break;
                }
            }
        }

        // need a structure compatible with the handlebars template
        status = {
            percentage: percentage,
            quality: {}
        };

        if (feedback) {
            status.feedback = _.clone(feedback);
        }

        return status;
    }

    /**
     * Builds an instance of the diagnostic tool
     * @param {Object} config
     * @param {String} [config.title] - The displayed title
     * @param {String} [config.header] - A header text displayed to describe the component
     * @param {String} [config.info] - An information text displayed to warn about run duration
     * @param {String} [config.button] - The caption of the start button
     * @param {String} [config.actionStore] - The name of the action to call to store the results
     * @param {String} [config.actionCheck] - The name of the action to call to check the browser results
     * @param {String} [config.controller] - The name of the controller to call
     * @param {String} [config.extension] - The name of the extension containing the controller
     *
     * @param {String} [config.browser.action] - The name of the action to call to get the browser checker
     * @param {String} [config.browser.controller] - The name of the controller to call to get the browser checker
     * @param {String} [config.browser.extension] - The name of the extension containing the controller to call to get the browser checker
     *
     * @param {Number} [config.bandwidth.unit] - The typical bandwidth needed for a test taker (Mbps)
     * @param {Array} [config.bandwidth.ideal] - The thresholds for optimal bandwidth, one by bar
     * @param {Number} [config.bandwidth.max] - Maximum number of test takers to display
     *
     * @param {Array} [config.performances.samples] - A list of samples to render in order to compute the rendering performances
     * @param {Number} [config.performances.occurrences] - The number of renderings by samples
     * @param {Number} [config.performances.timeout] - Max allowed duration for a sample rendering
     * @param {Number} [config.performances.optimal] - The threshold for optimal performances
     * @param {Number} [config.performances.threshold] - The threshold for minimal performances
     * @returns {diagnostic}
     */
    function diagnosticFactory(config) {
        return component(diagnostic, _defaults)
            .setTemplate(mainTpl)

            // uninstalls the component
            .on('destroy', function () {
                this.controls = null;
            })

            // renders the component
            .on('render', function () {
                var self = this;

                // get access to all needed placeholders
                this.controls = {
                    $start: this.$component.find('[data-action="test-launcher"]'),
                    $status: this.$component.find('.status'),
                    $results: this.$component.find('.results')
                };

                // start the diagnostic
                this.controls.$start.on('click', function () {
                    self.run();
                });

                // show result details
                this.controls.$results.on('click', 'button[data-action="show-details"]', function () {
                    var $btn = $(this).closest('button');
                    var $result = $btn.closest('[data-result]');
                    var $details = $result.find('.details');
                    $details.removeClass('hidden');
                    $btn.addClass('hidden');
                    $result.find('[data-action="hide-details"]').removeClass('hidden');
                });

                // hide result details
                this.controls.$results.on('click', 'button[data-action="hide-details"]', function () {
                    var $btn = $(this).closest('button');
                    var $result = $btn.closest('[data-result]');
                    var $details = $result.find('.details');
                    $details.addClass('hidden');
                    $btn.addClass('hidden');
                    $result.find('[data-action="show-details"]').removeClass('hidden');
                });
            })
            .init(config);
    }

    return diagnosticFactory;
});
