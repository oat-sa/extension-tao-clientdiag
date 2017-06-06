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
    'taoClientDiagnostic/tools/diagnostic/status',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/bandwidth/tester',
    'taoClientDiagnostic/tools/upload/tester',
    'taoClientDiagnostic/tools/browser/tester',
    'taoClientDiagnostic/tools/getconfig',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/main',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/result',
    'css!taoClientDiagnosticCss/diagnostics'
], function ($, _, __, async, helpers, feedback, component, statusFactory, performancesTester, bandwidthTester, uploadTester, browserTester,getConfig,  mainTpl, resultTpl) {
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
        controller: 'DiagnosticChecker',
        extension: 'taoClientDiagnostic',
        configurableText: {}
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
     * Placeholders for text replacement in custom messages
     * @type {Object}
     * @private
     */
    var _placeholders = {
        CURRENT_BROWSER: '%CURRENT_BROWSER%'
    };

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
                helpers._url(config.actionStore, config.controller, config.extension, config.storeParams),
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
                    helpers._url(config.actionCheck, config.controller, config.extension, config.storeParams),
                    information,
                    function (data) {
                        var percentage = ('success' === data.type) ? 100 : (('warning' === data.type) ? 33 : 0);
                        var status = self.status.getStatus(percentage, data);
                        var currentBrowser = information.browser + ' ' + information.browserVersion;
                        var currentOs = information.os + ' ' + information.osVersion;
                        var summary = {
                            browser: {
                                message: __('Web browser'),
                                value: currentBrowser
                            },
                            os: {
                                message: __('Operating system'),
                                value: currentOs
                            }
                        };
                        var customMsg = config.configurableText.diagBrowserCheckResult;

                        status.id = 'browser';
                        status.title = __('Operating system and web browser');
                        if (self.hasFailed(status)) {
                            status.customMsg = customMsg.replace(_placeholders.CURRENT_BROWSER, currentBrowser);
                        }

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
            var config = this.config;
            var perfsConfig = getConfig(this.config.performances, _defaultsPerformances);
            var optimal = perfsConfig.optimal;
            var range = Math.abs(optimal - (perfsConfig.threshold));

            this.changeStatus(__('Checking the performances...'));
            performancesTester(perfsConfig.samples, perfsConfig.occurrences, perfsConfig.timeout * 1000).start(function (average, details) {
                var cursor = range - average + optimal;
                var status = self.status.getStatus(cursor / range * 100, 'performances');
                var summary = {
                    performancesMin: {message: __('Minimum rendering time'), value: details.min + ' s'},
                    performancesMax: {message: __('Maximum rendering time'), value: details.max + ' s'},
                    performancesAverage: {message: __('Average rendering time'), value: details.average + ' s'}
                };

                self.store('performance', details, function () {
                    status.id = 'performance';
                    status.title = __('Workstation performances');
                    if (self.hasFailed(status)) {
                        status.customMsg = config.configurableText.diagPerformancesCheckResult;
                    }

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
            var config = this.config;
            var bandwithConfig = getConfig(this.config.bandwidth, _defaultsBandwidth);

            this.changeStatus(__('Checking the bandwidth...'));
            bandwidthTester().start(function (average, details) {
                var summary = {
                    bandwidthMin: {message: __('Minimum bandwidth'), value: details.min + ' Mbps'},
                    bandwidthMax: {message: __('Maximum bandwidth'), value: details.max + ' Mbps'},
                    bandwidthAverage: {message: __('Average bandwidth'), value: details.average + ' Mbps'}
                };

                self.store('bandwidth', details, function () {
                    var status = [];

                    var bandwidthUnit = bandwithConfig.unit;
                    var testTakers = bandwithConfig.ideal;
                    var maxTestTakers = bandwithConfig.max;

                    if (!_.isArray(testTakers)) {
                        testTakers = [testTakers];
                    }

                    _.forEach(testTakers, function (threshold, i) {
                        var max = threshold * bandwidthUnit;
                        var st = self.status.getStatus(details.max / max * 100, 'bandwidth');
                        var nb = Math.floor(details.max / bandwidthUnit);

                        if (nb > maxTestTakers) {
                            nb = '>' + maxTestTakers;
                        }

                        st.id = 'bandwidth-' + i;
                        st.title = __('Bandwidth');
                        st.feedback.legend = __('Number of simultaneous test takers the connection can handle');

                        if (self.hasFailed(st)) {
                            st.customMsg = config.configurableText.diagBandwithCheckResult;
                        }

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
         * Check upload speed
         * @param {Function} done
         */
        checkUpload: function checkUpload(done) {
            var self = this;
            var config = this.config;
            var uploadConfig = this.config.upload;

            this.changeStatus(__('Checking upload speed...'));
            uploadTester(uploadConfig).start(function (data) {
                var totalSpeed = 0;
                var avgSpeed;
                var maxSpeed = 0;
                var optimal = uploadConfig.optimal / 1024 / 1024;
                var status;
                var summary;

                _.forEach(data, function (val) {
                    totalSpeed += val.speed;
                    if (maxSpeed < val.speed) {
                        maxSpeed = Math.round(val.speed * 100) / 100;
                    }
                });
                avgSpeed = Math.round(totalSpeed / data.length * 100) / 100;

                status = self.status.getStatus((100 / optimal) * avgSpeed, 'upload');
                summary = {
                    uploadAvg: {message: __('Average upload speed'), value: avgSpeed + ' Mbps'},
                    uploadMax: {message: __('Max upload speed'), value: maxSpeed + ' Mbps'}
                };

                self.store('upload', {
                    max: maxSpeed,
                    avg: avgSpeed,
                    type: 'upload'
                }, function () {
                    status.id = 'upload';
                    status.title = __('Upload speed');

                    if (self.hasFailed(status)) {
                        status.customMsg = config.configurableText.diagUploadCheckResult;
                    }

                    self.addResult(status);

                    done(status, summary);
                });
            });
        },

        /**
         * Check if a result is considered as failed
         * @param {Object} result
         * @returns {boolean}
         */
        hasFailed: function hasFailed(result) {
            return !(
                   result
                && result.feedback
                && result.feedback.type === "success"
            );
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
                }, function (cb) {
                    doCheck('checkUpload', cb);
                }], function () {
                    // pick the lowest percentage as the main score
                    var total = _.min(scores, 'percentage');

                    // get a status according to the main score
                    var status = self.status.getStatus(total.percentage, 'summary');

                    // display the result
                    status.title = __('Total');
                    status.id = 'total';
                    status.customMsg = self.config.configurableText.diagTotalCheckResult;

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
     * @param {Object} [config.storeParams] - A list of additional parameters to send with diagnostic results
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
        // fix the translations for content loaded from config files
        if (config) {
            _.forEach(['title', 'header', 'footer', 'info', 'button'], function(name) {
                if (config[name]) {
                    config[name] = __(config[name]);
                }
            });
        }

        return component(diagnostic, _defaults)
            .setTemplate(mainTpl)

            // uninstalls the component
            .on('destroy', function () {
                this.controls = null;
                this.status = null;
            })

            // renders the component
            .on('render', function () {
                var self = this;

                // use an external component to handle the thresholds and status
                this.status = statusFactory();

                // get access to all needed placeholders
                this.controls = {
                    $start: this.$component.find('[data-action="test-launcher"]'),
                    $status: this.$component.find('.status h2'),
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
