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
    'helpers',
    'moment',
    'layout/loading-bar',
    'util/encode',
    'ui/feedback',
    'ui/dialog',
    'taoClientDiagnostic/tools/getStatus',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/fingerprint/tester',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/fingerprint',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/details',
    'ui/datatable',
    'lib/moment-timezone.min'
], function ($, _, __, helpers, moment, loadingBar, encode, feedback, dialog, getStatus, performancesTesterFactory, fingerprintTesterFactory, fingerprintTpl, detailsTpl) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.diagnostic-index';

    /**
     * Default Time Zone for date
     * @type {string}
     */
    var defaultDateTimeZone = 'UTC';

    /**
     * Default date format
     * @type {string}
     */
    var defaultDateFormat = 'Y/MM/DD HH:mm:ss';

    /**
     * Format a number with decimals
     * @param {Number} number - The number to format
     * @param {Number} [digits] - The number of decimals
     * @returns {Number}
     */
    var formatNumber = function formatNumber(number, digits) {
        var nb = 'undefined' === typeof digits ? 2 : Math.max(0, parseInt(digits, 10));
        var factor = Math.pow(10, nb) || 1;
        return Math.round(number * factor) / factor;
    };

    /**
     * Format a bandwidth value
     * @param {Number} value
     * @returns {Number}
     */
    var formatBandwidth = function formatBandwidth(value) {
        var bandwidth = formatNumber(value);

        if (value > 100) {
            bandwidth = '> 100';
        }

        return bandwidth;
    };

    /**
     * Transform date to local timezone
     * @param {String} date
     * @returns {String}
     */
    var transformDateToLocal = function transformDateToLocal(date) {
        var d, time;

        if (_.isFinite(date)) {
            if (!_.isNumber(date)) {
                date = _.parseInt(date, 10);
            }
            d = new Date(date * 1000);
            time = moment.utc(d);
        } else {
            time = moment.tz(date, defaultDateTimeZone);
        }

        return time.tz(moment.tz.guess()).format(defaultDateFormat);
    };

    /**
     * Controls the readiness check page
     *
     * @type {Object}
     */
    var taoDiagnosticCtlr = {
        /**
         * Entry point of the page
         */
        start : function start() {
            var $container = $(cssScope);
            var extension = $container.data('extension') || 'taoClientDiagnostic';
            var $list = $container.find('.list');
            var dataset = $container.data('set');
            var config = $container.data('config') || {};
            var installedExtension = $container.data('installedextension') || false;
            var diagnosticUrl = helpers._url('diagnostic', 'Diagnostic', extension);
            var removeUrl = helpers._url('remove', 'Diagnostic', extension);
            var serviceUrl = helpers._url('diagnosticData', 'Diagnostic', extension);
            var performancesTester = performancesTesterFactory(config.testers.performance || {});
            var fingerprintTester = fingerprintTesterFactory(config.testers.fingerprint || {});

            var tools = [];
            var actions = [];
            var model = [];

            // request the server with a selection of readiness check results
            function request(url, selection, message) {
                if (selection && selection.length) {
                    loadingBar.start();

                    $.ajax({
                        url: url,
                        data: {
                            id: selection
                        },
                        dataType : 'json',
                        type: 'POST',
                        error: function() {
                            loadingBar.stop();
                        }
                    }).done(function(response) {
                        loadingBar.stop();

                        if (response && response.success) {
                            if (message) {
                                feedback().success(message);
                            }
                            $list.datatable('refresh');
                        } else {
                            feedback().error(__('Something went wrong ...') + '<br>' + encode.html(response.error), {encodeHtml: false});
                        }
                    });
                }
            }

            // request the server to remove the selected diagnostic-index
            function remove(selection) {
                request(removeUrl, selection, __('The readiness check result have been removed'));
            }


            // tool: page refresh
            tools.push({
                id: 'refresh',
                icon: 'reset',
                title: __('Refresh the page'),
                label: __('Refresh'),
                action: function() {
                    $list.datatable('refresh');
                }
            });

            // tool: readiness check
            tools.push({
                id: 'launch',
                icon: 'play',
                title: __('Launch another readiness check'),
                label: __('Launch readiness check'),
                action: function() {
                    window.location.href = diagnosticUrl;
                }
            });

            if(installedExtension){
                // tool: compatibilty via lti
                tools.push({
                    id: 'lti',
                    icon: 'play',
                    title: __('Try a test delivery'),
                    label: __('Try a test delivery'),
                    action: function() {
                        window.location.href = deliveryUrl;
                    }
                });
            }

            // tool: remove selected results
            tools.push({
                id: 'remove',
                icon: 'remove',
                title: __('Remove the selected readiness check results'),
                label: __('Remove'),
                massAction: true,
                action: function(selection) {
                    dialog({
                        message: __('The selected readiness check results will be removed. Continue ?'),
                        autoRender: true,
                        autoDestroy: true,
                        onOkBtn: function() {
                            remove(selection);
                        }
                    });
                }
            });


            // tool: close tab, this won't be present in an LTI iframe
            // button should always be right most
            if(window.self === window.top) {
                tools.push({
                    id: 'exitButton',
                    icon: 'close',
                    title: __('Exit'),
                    label: __('Exit'),
                    action: function() {
                        window.self.close();
                    }
                });
            }

            // action: remove the result
            actions.push({
                id: 'remove',
                icon: 'remove',
                title: __('Remove the readiness check result?'),
                action: function(id) {
                    dialog({
                        autoRender: true,
                        autoDestroy: true,
                        message: __('The readiness check result will be removed. Continue ?'),
                        onOkBtn: function() {
                            remove([id]);
                        }
                    });
                }
            });

            // column: Workstation identifier
            model.push({
                id: 'workstation',
                label: __('Workstation')
            });

            // column: School name
            if (config.requireSchoolName) {
                model.push({
                    id: 'school_name',
                    label: __('School name')
                });
            }

            // column: School number
            if (config.validateSchoolName) {
                model.push({
                    id: 'school_number',
                    label: __('School number')
                });
            }

            // results of fingerprinting
            if (config.testers.fingerprint && config.testers.fingerprint.enabled) {
                // column: Fingerprint of the workstation
                model.push({
                    id: 'fingerprint-cell',
                    label: __('Fingerprint'),
                    transform: function(v, row) {
                        return fingerprintTpl(row.fingerprint);
                    }
                });

                $list.on('click.fingerprint', '.fingerprint-cell span.details', function(e) {
                    var id = $(e.target).closest('tr').data('itemIdentifier');
                    var row = _.find(dataset.data, {id: id});
                    if (row) {
                        dialog({
                            content: detailsTpl(fingerprintTester.getSummary(row.fingerprint)),
                            buttons: 'ok',
                            autoRender: true,
                            autoDestroy: true
                        });
                    }
                });
            }

            // results of screen test
            if (config.testers.screen && config.testers.screen.enabled) {
                // column: Screen Width and Height
                model.push({
                    id: 'screen_size',
                    label: __('Screen resolution'),
                    transform: function(value, row) {
                        if (row.screen && row.screen.width && row.screen.height) {
                            return row.screen.width + 'x' + row.screen.height;
                        }
                    }
                });
            }

            // results of browser test
            if (config.testers.browser && config.testers.browser.enabled) {
                // column: Operating system information
                model.push({
                    id: 'os',
                    label: __('OS')
                });

                // column: Browser information
                model.push({
                    id: 'browser',
                    label: __('Browser')
                });
            }

            // results of performances test
            if (config.testers.performance && config.testers.performance.enabled) {
                // column: Performances of the workstation
                model.push({
                    id: 'performance',
                    label: __('Performances'),
                    transform: function (value) {
                        var status = performancesTester.getFeedback(value);
                        return status.feedback && status.feedback.message;
                    }
                });
            }

            // results of bandwidth test
            if (config.testers.bandwidth && config.testers.bandwidth.enabled) {
                // column: Available bandwidth
                model.push({
                    id: 'bandwidth',
                    label: __('Bandwidth'),
                    transform: formatBandwidth
                });
            }

            // results of intensive bandwidth test
            if (config.testers.intensive_bandwidth && config.testers.intensive_bandwidth.enabled) {
                // column: Available bandwidth
                model.push({
                    id: 'intensive_bandwidth',
                    label: __('Intensive bandwidth'),
                    transform: formatBandwidth
                });
            }

            // results of upload speed test
            if (config.testers.upload && config.testers.upload.enabled) {
                // column: Available upload speed
                model.push({
                    id: 'upload',
                    label: __('Upload speed'),
                    transform: formatBandwidth
                });
            }

            // column: Date of diagnostic
            model.push({
                id: 'date',
                label: __('Date'),
                transform: function(value) {
                    return transformDateToLocal(value);
                }
            });

            $list
                .on('query.datatable', function() {
                    loadingBar.start();
                })
                .on('load.datatable', function(e, data) {
                    dataset = data;
                    loadingBar.stop();
                })
                .datatable({
                    url: serviceUrl,
                    status: {
                        empty: __('No readiness checks have been done!'),
                        available: __('Readiness checks already done'),
                        loading: __('Loading')
                    },
                    tools: tools,
                    actions: actions,
                    selectable: true,
                    model: model
                }, dataset);
        }
    };

    // the page is always loading data when starting
    loadingBar.start();

    return taoDiagnosticCtlr;
});
