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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 * @author dieter <dieter@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'async',
    'ui/feedback',
    'ui/component',
    'core/logger',
    'core/store',
    'core/promise',
    'core/dataProvider/request',
    'ui/dialog/alert',
    'util/url',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/bandwidth/tester',
    'taoClientDiagnostic/tools/upload/tester',
    'taoClientDiagnostic/tools/browser/tester',
    'taoClientDiagnostic/tools/getStatus',
    'taoClientDiagnostic/tools/getConfig',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/main',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/result',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/details',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/feedback',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/quality-bar',
    'css!taoClientDiagnosticCss/diagnostics'
], function ($,
             _,
             __,
             async,
             feedback,
             component,
             loggerFactory,
             store,
             Promise,
             request,
             dialogAlert,
             urlUtil,
             performancesTester,
             bandwidthTester,
             uploadTester,
             browserTester,
             getStatus,
             getConfig,
             mainTpl,
             resultTpl,
             detailsTpl,
             feedbackTpl,
             qualityBarTpl) {
    'use strict';

    /**
     * @type {logger}
     */
    var logger = loggerFactory('taoClientDiagnostic/diagnostic');

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
        actionSchool: 'schoolName',
        controller: 'DiagnosticChecker',
        extension: 'taoClientDiagnostic',
        actionDropId: 'deleteId',
        storeAllRuns: false,
        configurableText: {}
    };

    /**
     * A list of thresholds for summary
     * @type {Array}
     * @private
     */
    var _thresholds = [{
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
                urlUtil.route(config.actionStore, config.controller, config.extension, config.storeParams),
                details,
                done,
                "json"
            );
        },

        /**
         * Retrieve a custom message from the config
         * @param key
         * @returns {*}
         */
        getCustomMsg: function getCustomMsg(key) {
            return this.config.configurableText[key];
        },

        /**
         * Enrich the feeback object with a custom message if the test has failed
         * @param {Object} status - the test result
         * @param {String} msg - the custom message
         */
        addCustomFeedbackMsg: function addCustomFeedbackMsg(status, msg) {
            if (this.hasFailed(status) && msg) {
                if (_.isFunction(status.customMsgRenderer)) {
                    msg = status.customMsgRenderer(msg);
                }
                status.feedback = status.feedback || {};
                status.feedback.customMsg = msg;
            }
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
            var $main, $indicator, $result;

            if (this.is('rendered')) {
                // adjust the width of the displayed label, if any, to the text length
                if (result.quality && result.quality.label && result.quality.label.toString().length > 2) {
                    result.quality.wide = true;
                }

                // create and append the result to the displayed list
                $main = $(resultTpl(result));
                $result = $main.find('.result');
                if (result.feedback) {
                    $result.append($(feedbackTpl(result.feedback)));
                }
                if (result.quality) {
                    $result.append($(qualityBarTpl(result.quality)));
                }
                if (result.details) {
                    $main.find('.details').append($(detailsTpl(result.details)));
                }

                $indicator = $main.find('.quality-indicator');
                this.controls.$results.append($main);

                // the result is hidden by default, show it with a little animation
                $main.fadeIn(function () {
                    if ($indicator.length) {
                        $indicator.animate({
                            left: (result.percentage * $main.outerWidth() / 100) - ($indicator.outerWidth() / 2)
                        });
                    }
                });
            }

            return this;
        },

        /**
         * Removes the last results if any
         * @returns {diagnostic}
         */
        cleanUp: function cleanUp() {
            this.controls.$results.empty();
            return this;
        },

        /**
         * Enables the start button
         * @returns {diagnostic}
         */
        enable: function enable() {
            this.controls.$start.removeClass('hidden');
            return this;
        },

        /**
         * Disables the start button
         * @returns {diagnostic}
         */
        disable: function disable() {
            this.controls.$start.addClass('hidden');
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
            this.cleanUp();

            // remove the start button during the diagnostic
            this.disable();

            return this;
        },

        /**
         * Does some post process after ending the diagnostics
         * @returns {diagnostic}
         * @private
         */
        finish: function finish() {
            var config = this.config;

            // restore the start button to allow a new diagnostic run
            this.enable();

            if (config.storeAllRuns) {
                this.deleteIdentifier();
            }

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
         * delete unique id for this test session (next test will generate new one)
         */
        deleteIdentifier: function deleteIdentifier() {
            var url = urlUtil.route(this.config.actionDropId, this.config.controller, this.config.extension);
            return request(url, null, 'POST');
        },

        /**
         * Runs the diagnostics
         * @returns {diagnostic}
         */
        run: function run() {
            var self = this;
            var information = [];
            var scores = {};
            var testers = [];
            var customInput = self.getCustomInput();

            var doRun = function() {
                // common handling for testers
                function doCheck(testerConfig, cb) {
                    var testerId = testerConfig.id;

                    /**
                     * Notifies the start of a tester operation
                     * @event diagnostic#starttester
                     * @param {String} name - The name of the tester
                     */
                    self.trigger('starttester', testerId);
                    self.setState(testerId, true);

                    require([testerConfig.tester], function (testerFactory){
                        var tester = testerFactory(getConfig(testerConfig, self.config), self);
                        self.changeStatus(tester.labels.status);
                        tester.start(function (status, details, results) {
                            var customMsg;
                            if (testerConfig.customMsgKey) {
                                customMsg = self.getCustomMsg(testerConfig.customMsgKey);
                                self.addCustomFeedbackMsg(status, customMsg);
                            }

                            // the returned details must be ingested into the main details list
                            _.forEach(details, function(info) {
                                information.push(info);
                            });
                            scores[status.id] = status;

                            /**
                             * Notifies the end of a tester operation
                             * @event diagnostic#endtester
                             * @param {String} id - The identifier of the tester
                             * @param {Array} results - The results of the test
                             */
                            self.trigger('endtester', testerId, status);
                            self.setState(testerId, false);

                            // results should be filtered in order to encode complex data
                            results = _.mapValues(results, function(value) {
                                switch(typeof(value)) {
                                    case 'boolean': return value ? 1 : 0;
                                    case 'object': return JSON.stringify(value);
                                }
                                return value;
                            });

                            // send the data to store
                            self.store(testerId, results, function () {
                                self.addResult(status);
                                cb();
                            });
                        });
                    });
                }

                if (self.is('rendered')) {
                    // set up the component to a new run
                    self.prepare();

                    _.forEach(self.config.testers, function(testerConfig, testerId) {
                        testerConfig.id = testerConfig.id || testerId;
                        if (testerConfig.enabled) {
                            testers.push(function (cb) {
                                doCheck(testerConfig, cb);
                            });
                        }
                    });

                    // launch each testers in series, then display the results
                    async.series(testers, function () {
                        // pick the lowest percentage as the main score
                        var total = _.min(scores, 'globalPercentage');

                        // get a status according to the main score
                        var status = getStatus(total.globalPercentage, _thresholds);

                        // display the result
                        status.title = __('Total');
                        status.id = 'total';
                        self.addCustomFeedbackMsg(status, self.config.configurableText.diagTotalCheckResult);

                        status.details = information;
                        self.addResult(status);

                        // done !
                        self.finish();
                    });
                }
            };

            if (_.size(customInput) > 0) {
                self.store('custom_input', customInput, doRun);
            } else {
                doRun();
            }

            return self;
        },

        getCustomInput: function() {
            var vars = {};
            var self = this;

            window.location.href.replace(location.hash, '').replace(
                /[?&]+([^=&]+)=?([^&]*)?/gi,
                function (m, key, value) {
                    if (_.has(self.config['customInput'], key)) {
                        vars[key] = typeof value !== 'undefined' ? value : '';
                    }
                }
            );

            return vars;
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
     * @param {String} [config.actionSchool] - The name of the action to call to get the school name
     * @param {String} [config.controller] - The name of the controller to call
     * @param {String} [config.extension] - The name of the extension containing the controller
     * @param {Object} [config.storeParams] - A list of additional parameters to send with diagnostic results
     * @param {Boolean} [config.requireSchoolName] - If `true` require a school name to allow the tests to start
     * @param {Boolean} [config.validateSchoolName] - If `true` require a school number and a PIN to get the school name and to allow the tests to start
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
            })

            // renders the component
            .on('render', function () {
                var self = this;

                /**
                 * Default launcher
                 */
                var launch = function launch() {
                    runDiagnostics();
                };

                /**
                 * Starts the tests
                 * @param {Object} [data]
                 */
                function runDiagnostics(data) {
                    // append the school name to the queries
                    if (data && _.isPlainObject(data)) {
                        self.config.storeParams = _.assign(self.config.storeParams || {}, data);
                    }

                    self.run();
                }

                /**
                 * Gets a control by its registered name
                 * @param {String} name - the name registered in the collection of controls
                 */
                function getControl(name) {
                    return self.controls['$' + name];
                }

                /**
                 * Gets the value of an input field
                 * @param {String} name - the name registered in the collection of controls
                 * @returns {String}
                 */
                function getInputValue(name) {
                    var $control = getControl(name);
                    return ($control && $control.val() || '').trim();
                }

                /**
                 * Sets the value of an input field
                 * @param {String} name - the name registered in the collection of controls
                 * @param {String} value
                 */
                function setInputValue(name, value) {
                    var $control = getControl(name);
                    $control && $control.val(value);
                }

                /**
                 * Enable/Disable a control
                 * @param {String} name - the name registered in the collection of controls
                 * @param {Boolean} [state]
                 */
                function toggleControl(name, state) {
                    var $control = getControl(name);
                    if ($control) {
                        if (typeof state === 'undefined') {
                            state = !$control.is(':enabled');
                        }
                        if (state) {
                            $control.removeProp('disabled');
                        } else {
                            $control.prop('disabled', true);
                        }
                    }
                }

                /**
                 * Requests the server to get the school name
                 * @param {Object} values
                 */
                function requestSchoolName(values) {
                    var config = self.config;
                    return request(urlUtil.route(config.actionSchool, config.controller, config.extension), values, 'POST')
                        .then(function(data) {
                            return {
                                school_name: data,
                                school_number: values.school_number
                            };
                        });
                }

                /**
                 * Install the school name manager.
                 * @todo: improve this by moving it into a plugin, and obviously implement the plugin handling
                 */
                function manageSchoolName(fields, validate) {
                    /**
                     * Checks if the start button can be enabled
                     * @returns
                     */
                    function toggleStart() {
                        var allow = _.every(fields, getInputValue);
                        toggleControl('start', allow);
                        return allow;
                    }

                    /**
                     * Enables/Disables the fields
                     * @param {Boolean} state
                     */
                    function toggleFields(state) {
                        _.forEach(fields, function(fieldName) {
                            toggleControl(fieldName, state);
                        });
                    }

                    // ensure the diagnostic cannot start without all fields properly input
                    _.forEach(fields, function(fieldName) {
                        self.controls['$' + fieldName] = self.getElement().find('[data-control="' + fieldName + '"]')
                            .on('keypress', function(e) {
                                var shouldStart = e.which === 13;
                                if (shouldStart) {
                                    e.preventDefault();
                                }
                                _.defer(function() {
                                    if (toggleStart() && shouldStart) {
                                        self.controls.$start.click();
                                    }
                                });
                            });
                    });

                    toggleStart();

                    // will store the school name in the browser storage, that will allow to restore it next time
                    toggleFields(false);
                    store('client-diagnostic')
                        .then(function (storage) {
                            // store the school name on test start, to ensure consistency
                            self.on('start.school', function() {
                                _.forEach(fields, function(fieldName) {
                                    storage
                                        .setItem(fieldName, getInputValue(fieldName))
                                        .catch(function(error) {
                                            logger.error(error);
                                        });
                                });
                            });

                            // restore the school name on load
                            return Promise.all(_.map(fields, function(fieldName) {
                                return storage.getItem(fieldName).then(function (value) {
                                    setInputValue(fieldName, value);
                                });
                            }));
                        })
                        .catch(function(error) {
                            logger.error(error);
                        })
                        .then(function() {
                            toggleFields(true);
                            toggleStart();
                        });

                    // ensure the fields are validated and the school name is properly sent before allowing to launch the test
                    launch = function schoolNameLaunch() {
                        var values = _.reduce(fields, function(result, fieldName) {
                            result[fieldName] = getInputValue(fieldName);
                            return result;
                        }, {});

                        self.changeStatus(__('Getting school name...'))
                            .cleanUp()
                            .disable();

                        if (_.isFunction(validate)) {
                            validate(values)
                                .then(runDiagnostics)
                                .catch(function(error) {
                                    var response = error.response || {};
                                    var message = response.errorMsg || response.errorMessage || __('An error occurred! Please verify your input!');
                                    dialogAlert(message);
                                    logger.error(error);
                                    self.changeStatus(__('Failed to get school name'))
                                        .enable();
                                });
                        } else {
                            runDiagnostics(values);
                        }
                    };

                    // ensure the fields are not writable while the test is running
                    self
                        .on('start.school', function() {
                            toggleFields(false);
                        })
                        .on('end.school', function() {
                            toggleFields(true);
                        });
                }

                // get access to all needed placeholders
                this.controls = {
                    $start: this.$component.find('[data-action="test-launcher"]'),
                    $status: this.$component.find('.status h2'),
                    $results: this.$component.find('.results')
                };

                // start the diagnostic
                this.controls.$start.on('click', function () {
                    self.controls.$start.is(':enabled') && launch();
                });

                if (this.config.requireSchoolName) {
                    if (this.config.validateSchoolName) {
                        manageSchoolName(['school_number', 'school_pin'], requestSchoolName);
                    } else {
                        manageSchoolName(['school_name']);
                    }
                }

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
