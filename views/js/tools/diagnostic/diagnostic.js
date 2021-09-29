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
 * Copyright (c) 2016-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'async',
    'ui/component',
    'core/logger',
    'core/store',
    'core/request',
    'core/dataProvider/request',
    'ui/dialog/alert',
    'ui/feedback',
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
], function(
    $,
    _,
    __,
    async,
    component,
    loggerFactory,
    store,
    request,
    requestData,
    dialogAlert,
    feedback,
    urlHelper,
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
    qualityBarTpl
) {
    'use strict';
    /**
     * @type {logger}
     * @private
     */
    const logger = loggerFactory('taoClientDiagnostic/diagnostic');

    /**
     * Some default values
     * @type {object}
     * @private
     */
    const _defaults = {
        title: __('System Compatibility'),
        header: __(
            'This tool will run a number of tests in order to establish how well your current environment is suitable to run the TAO platform.'
        ),
        info: __('Be aware that these tests will take up to several minutes.'),
        button: __('Test system compatibility'),
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
    const _thresholds = [
        {
            threshold: 0,
            message: __('Your system requires a compatibility update, please contact your system administrator.'),
            type: 'error'
        },
        {
            threshold: 33,
            message: __('Your system is not optimal, please contact your system administrator.'),
            type: 'warning'
        },
        {
            threshold: 66,
            message: __('Your system is fully compliant.'),
            type: 'success'
        }
    ];

    /**
     * Defines a diagnostic tool
     * @type {object}
     */
    const diagnostic = {
        /**
         * Updates the displayed status
         * @param {string} status
         * @returns {diagnostic}
         * @private
         */
        changeStatus(status) {
            if (this.is('rendered')) {
                this.controls.$status.html(status);
            }
            return this;
        },

        /**
         * Sends the detailed stats to the server
         * @param {string} type The type of stats
         * @param {object} data The stats details
         * @param {Function} done A callback method called once server has responded
         */
        store(type, data, done) {
            const config = this.config;
            const url = urlHelper.route(config.actionStore, config.controller, config.extension, config.storeParams);

            data = _.omit(data, 'values');
            data.type = type;

            request({ url, data, method: 'POST', noToken: true })
                .then(done)
                .catch(err => {
                    logger.error(err);
                    feedback().error(__('Unable to save the results! Please check your connection.'));
                    done();
                });
        },

        /**
         * Retrieve a custom message from the config
         * @param key
         * @returns {*}
         */
        getCustomMsg(key) {
            return this.config.configurableText[key];
        },

        /**
         * Enrich the feedback object with a custom message if the test has failed
         * @param {object} status - the test result
         * @param {string} msg - the custom message
         */
        addCustomFeedbackMsg(status, msg) {
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
         * @param {object} result
         * @returns {boolean}
         */
        hasFailed(result) {
            return !(result && result.feedback && result.feedback.type === 'success');
        },

        /**
         * Add a result row
         * @param {object} result
         * @returns {diagnostic}
         */
        addResult(result) {
            if (this.is('rendered')) {
                // adjust the width of the displayed label, if any, to the text length
                if (result.quality && result.quality.label && result.quality.label.toString().length > 2) {
                    result.quality.wide = true;
                }

                // create and append the result to the displayed list
                const $main = $(resultTpl(result));
                const $result = $main.find('.result');
                if (result.feedback) {
                    $result.append($(feedbackTpl(result.feedback)));
                }
                if (result.quality) {
                    $result.append($(qualityBarTpl(result.quality)));
                }
                if (result.details) {
                    $main.find('.details').append($(detailsTpl(result.details)));
                }

                const $indicator = $main.find('.quality-indicator');
                this.controls.$results.append($main);

                // the result is hidden by default, show it with a little animation
                $main.fadeIn(() => {
                    if ($indicator.length) {
                        $indicator.animate({
                            left: (result.percentage * $main.outerWidth()) / 100 - $indicator.outerWidth() / 2
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
        cleanUp() {
            this.controls.$results.empty();
            return this;
        },

        /**
         * Enables the start button
         * @returns {diagnostic}
         */
        enable() {
            this.controls.$start.removeClass('hidden');
            return this;
        },

        /**
         * Disables the start button
         * @returns {diagnostic}
         */
        disable() {
            this.controls.$start.addClass('hidden');
            return this;
        },

        /**
         * Does some preparations before starting the diagnostics
         * @returns {diagnostic}
         * @private
         */
        prepare() {
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
        finish() {
            const config = this.config;

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
        deleteIdentifier() {
            const url = urlHelper.route(this.config.actionDropId, this.config.controller, this.config.extension);
            return request({ url, method: 'POST', noToken: true });
        },

        /**
         * Runs the diagnostics
         * @returns {diagnostic}
         */
        run() {
            const information = [];
            const scores = {};
            const testers = [];
            const customInput = this.getCustomInput();

            const doRun = () => {
                // common handling for testers
                const doCheck = (testerConfig, cb) => {
                    const testerId = testerConfig.id;

                    /**
                     * Notifies the start of a tester operation
                     * @event diagnostic#starttester
                     * @param {string} name - The name of the tester
                     */
                    this.trigger('starttester', testerId);
                    this.setState(testerId, true);

                    /**
                     * Process the diagnostic from the loaded tester
                     * @param {Function} testerFactory
                     * @private
                     */
                    const processTester = testerFactory => {
                        const tester = testerFactory(getConfig(testerConfig, this.config), this);
                        this.changeStatus(tester.labels.status);
                        tester.start((status, details, results) => {
                            if (testerConfig.customMsgKey) {
                                const customMsg = this.getCustomMsg(testerConfig.customMsgKey);
                                this.addCustomFeedbackMsg(status, customMsg);
                            }

                            // the returned details must be ingested into the main details list
                            _.forEach(details, info => information.push(info));
                            scores[status.id] = status;

                            /**
                             * Notifies the end of a tester operation
                             * @event diagnostic#endtester
                             * @param {string} id - The identifier of the tester
                             * @param {Array} results - The results of the test
                             */
                            this.trigger('endtester', testerId, status);
                            this.setState(testerId, false);

                            // results should be filtered in order to encode complex data
                            results = _.mapValues(results, value => {
                                switch (typeof value) {
                                    case 'boolean':
                                        return value ? 1 : 0;
                                    case 'object':
                                        return JSON.stringify(value);
                                }
                                return value;
                            });

                            // send the data to store
                            this.store(testerId, results, () => {
                                this.addResult(status);
                                cb();
                            });
                        });
                    };

                    /**
                     * React to loading failure
                     * @param {Error} err
                     * @private
                     */
                    const processFailure = err => {
                        logger.error(err);
                        feedback().error(
                            __(
                                'Unable to process with the diagnostic tester %s. The tester module is unreachable.',
                                testerId
                            )
                        );
                        cb();
                    };

                    require([testerConfig.tester], processTester, processFailure);
                };

                if (this.is('rendered')) {
                    // set up the component to a new run
                    this.prepare();

                    _.forEach(this.config.testers, (testerConfig, testerId) => {
                        testerConfig.id = testerConfig.id || testerId;
                        if (testerConfig.enabled) {
                            testers.push(cb => doCheck(testerConfig, cb));
                        }
                    });

                    // launch each testers in series, then display the results
                    async.series(testers, () => {
                        // pick the lowest percentage as the main score
                        const total = _.min(scores, 'globalPercentage');

                        // get a status according to the main score
                        const status = getStatus(total.globalPercentage, _thresholds);

                        // display the result
                        status.title = __('Total');
                        status.id = 'total';
                        this.addCustomFeedbackMsg(status, this.config.configurableText.diagTotalCheckResult);

                        status.details = information;
                        this.addResult(status);

                        // done !
                        this.finish();
                    });
                }
            };

            if (_.size(customInput) > 0) {
                this.store('custom_input', customInput, doRun);
            } else {
                doRun();
            }

            return this;
        },

        getCustomInput() {
            const vars = {};

            window.location.href.replace(location.hash, '').replace(/[?&]+([^=&]+)=?([^&]*)?/gi, (m, key, value) => {
                if (_.has(this.config['customInput'], key)) {
                    vars[key] = typeof value !== 'undefined' ? value : '';
                }
            });

            return vars;
        }
    };

    /**
     * Builds an instance of the diagnostic tool
     * @param {object} container - Container in which the initialisation will render the diagnostic
     * @param {object} config
     * @param {string} [config.title] - The displayed title
     * @param {string} [config.header] - A header text displayed to describe the component
     * @param {string} [config.info] - An information text displayed to warn about run duration
     * @param {string} [config.button] - The caption of the start button
     * @param {string} [config.actionStore] - The name of the action to call to store the results
     * @param {string} [config.actionCheck] - The name of the action to call to check the browser results
     * @param {string} [config.actionSchool] - The name of the action to call to get the school name
     * @param {string} [config.controller] - The name of the controller to call
     * @param {string} [config.extension] - The name of the extension containing the controller
     * @param {object} [config.storeParams] - A list of additional parameters to send with diagnostic results
     * @param {boolean} [config.requireSchoolName] - If `true` require a school name to allow the tests to start
     * @param {boolean} [config.requireSchoolId] - If `true` require a school ID to allow the tests to start
     * @param {boolean} [config.validateSchoolName] - If `true` require a school number and a PIN to get the school name and to allow the tests to start
     *
     * @param {string} [config.browser.action] - The name of the action to call to get the browser checker
     * @param {string} [config.browser.controller] - The name of the controller to call to get the browser checker
     * @param {string} [config.browser.extension] - The name of the extension containing the controller to call to get the browser checker
     *
     * @param {number} [config.bandwidth.unit] - The typical bandwidth needed for a test taker (Mbps)
     * @param {Array} [config.bandwidth.ideal] - The thresholds for optimal bandwidth, one by bar
     * @param {number} [config.bandwidth.max] - Maximum number of test takers to display
     *
     * @param {Array} [config.performances.samples] - A list of samples to render in order to compute the rendering performances
     * @param {number} [config.performances.occurrences] - The number of renderings by samples
     * @param {number} [config.performances.timeout] - Max allowed duration for a sample rendering
     * @param {number} [config.performances.optimal] - The threshold for optimal performances
     * @param {number} [config.performances.threshold] - The threshold for minimal performances
     * @returns {diagnostic}
     */
    return function diagnosticFactory(container, config) {
        // fix the translations for content loaded from config files
        if (config) {
            _.forEach(['title', 'header', 'footer', 'info', 'button'], name => {
                if (config[name]) {
                    config[name] = __(config[name]);
                }
            });
        }

        const diagComponent = component(diagnostic, _defaults)
            .setTemplate(mainTpl)

            // uninstalls the component
            .on('destroy', function onDiagnosticDestroy() {
                this.controls = null;
            })

            // initialise component
            .on('init', function onDiagnosticInit() {
                this.render(container);
            })
            // renders the component
            .on('render', function onDiagnosticRender() {
                /**
                 * Starts the tests
                 * @param {object} [data]
                 * @private
                 */
                const runDiagnostics = data => {
                    // append the school name to the queries
                    if (data && _.isPlainObject(data)) {
                        this.config.storeParams = _.assign(this.config.storeParams || {}, data);
                    }

                    this.run();
                };

                /**
                 * Default launcher
                 * @private
                 */
                let launch = () => runDiagnostics();

                /**
                 * Gets a control by its registered name
                 * @param {string} name - the name registered in the collection of controls
                 * @private
                 */
                const getControl = name => this.controls[`\$${name}`];

                /**
                 * Gets the value of an input field
                 * @param {string} name - the name registered in the collection of controls
                 * @returns {string}
                 * @private
                 */
                function getInputValue(name) {
                    const $control = getControl(name);
                    return (($control && $control.val()) || '').trim();
                }

                /**
                 * Sets the value of an input field
                 * @param {string} name - the name registered in the collection of controls
                 * @param {string} value
                 * @private
                 */
                function setInputValue(name, value) {
                    const $control = getControl(name);
                    $control && $control.val(value);
                }

                /**
                 * Enable/Disable a control
                 * @param {string} name - the name registered in the collection of controls
                 * @param {boolean} [state]
                 * @private
                 */
                function toggleControl(name, state) {
                    const $control = getControl(name);
                    if ($control) {
                        if (typeof state === 'undefined') {
                            state = !$control.is(':enabled');
                        }
                        if (state) {
                            $control.prop('disabled', false);
                        } else {
                            $control.prop('disabled', true);
                        }
                    }
                }

                /**
                 * Requests the server to get the school name
                 * @param {object} values
                 * @private
                 */
                const requestSchoolName = values => {
                    const componentConfig = this.config;
                    return requestData(
                        urlHelper.route(
                            componentConfig.actionSchool,
                            componentConfig.controller,
                            componentConfig.extension
                        ),
                        values,
                        'POST'
                    ).then(data => {
                        return {
                            school_name: data,
                            school_number: values.school_number
                        };
                    });
                };

                /**
                 * Install the school name manager.
                 * @todo: improve this by moving it into a plugin, and obviously implement the plugin handling
                 * @private
                 */
                const manageSchoolProperties = (fields, validate) => {
                    /**
                     * Checks if the start button can be enabled
                     * @returns {boolean}
                     * @private
                     */
                    function toggleStart() {
                        const allow = _.every(fields, getInputValue);
                        toggleControl('start', allow);
                        return allow;
                    }

                    /**
                     * Enables/Disables the fields
                     * @param {boolean} state
                     * @private
                     */
                    function toggleFields(state) {
                        _.forEach(fields, function(fieldName) {
                            toggleControl(fieldName, state);
                        });
                    }

                    // ensure the diagnostic cannot start without all fields properly input
                    _.forEach(fields, fieldName => {
                        this.controls[`\$${fieldName}`] = this.getElement()
                            .find(`[data-control="${fieldName}"]`)
                            .on('keypress', e => {
                                const shouldStart = e.which === 13;
                                if (shouldStart) {
                                    e.preventDefault();
                                }
                                _.defer(() => {
                                    if (toggleStart() && shouldStart) {
                                        this.controls.$start.click();
                                    }
                                });
                            });
                    });

                    toggleStart();

                    // will store the school name in the browser storage, that will allow to restore it next time
                    toggleFields(false);
                    store('client-diagnostic')
                        .then(storage => {
                            // store the school name on test start, to ensure consistency
                            this.on('start.school', () => {
                                _.forEach(fields, fieldName => {
                                    storage.setItem(fieldName, getInputValue(fieldName)).catch(error => {
                                        logger.error(error);
                                    });
                                });
                            });

                            // restore the school name on load
                            return Promise.all(
                                _.map(fields, fieldName => {
                                    return storage.getItem(fieldName).then(value => {
                                        setInputValue(fieldName, value);
                                    });
                                })
                            );
                        })
                        .catch(error => {
                            logger.error(error);
                        })
                        .then(() => {
                            toggleFields(true);
                            toggleStart();
                        });

                    // ensure the fields are validated and the school name is properly sent before allowing to launch the test
                    launch = () => {
                        const values = _.reduce(
                            fields,
                            (result, fieldName) => {
                                result[fieldName] = getInputValue(fieldName);
                                return result;
                            },
                            {}
                        );

                        this.changeStatus(__('Getting school name...'))
                            .cleanUp()
                            .disable();

                        if (_.isFunction(validate)) {
                            validate(values)
                                .then(runDiagnostics)
                                .catch(error => {
                                    const response = error.response || {};
                                    const message =
                                        response.errorMsg ||
                                        response.errorMessage ||
                                        __('An error occurred! Please verify your input!');
                                    dialogAlert(message);
                                    logger.error(error);
                                    this.changeStatus(__('Failed to get school name')).enable();
                                });
                        } else {
                            runDiagnostics(values);
                        }
                    };

                    // ensure the fields are not writable while the test is running
                    this.on('start.school', () => {
                        toggleFields(false);
                    }).on('end.school', () => {
                        toggleFields(true);
                    });
                };

                // get access to all needed placeholders
                this.controls = {
                    $start: this.$component.find('[data-action="test-launcher"]'),
                    $status: this.$component.find('.status h2'),
                    $results: this.$component.find('.results')
                };

                // start the diagnostic
                this.controls.$start.on('click', () => {
                    this.controls.$start.is(':enabled') && launch();
                });

                if (this.config.requireSchoolName) {
                    if (this.config.validateSchoolName) {
                        manageSchoolProperties(['school_number', 'school_pin'], requestSchoolName);
                    } else {
                        manageSchoolProperties(['school_name']);
                    }
                }

                if (this.config.requireSchoolId) {
                    manageSchoolProperties(['school_id', 'workstation']);
                }

                // show result details
                this.controls.$results.on('click', 'button[data-action="show-details"]', function onShowDetails() {
                    const $btn = $(this).closest('button');
                    const $result = $btn.closest('[data-result]');
                    const $details = $result.find('.details');
                    $details.removeClass('hidden');
                    $btn.addClass('hidden');
                    $result.find('[data-action="hide-details"]').removeClass('hidden');
                });

                // hide result details
                this.controls.$results.on('click', 'button[data-action="hide-details"]', function onHideDetails() {
                    const $btn = $(this).closest('button');
                    const $result = $btn.closest('[data-result]');
                    const $details = $result.find('.details');
                    $details.addClass('hidden');
                    $btn.addClass('hidden');
                    $result.find('[data-action="show-details"]').removeClass('hidden');
                });
            });

        _.defer(() => diagComponent.init(config));

        return diagComponent;
    };
});
