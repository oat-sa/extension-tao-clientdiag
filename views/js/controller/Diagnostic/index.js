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
    'helpers',
    'moment',
    'core/request',
    'layout/loading-bar',
    'util/encode',
    'ui/feedback',
    'ui/dialog',
    'taoClientDiagnostic/tools/getStatus',
    'taoClientDiagnostic/tools/performances/tester',
    'taoClientDiagnostic/tools/fingerprint/tester',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/fingerprint',
    'tpl!taoClientDiagnostic/tools/diagnostic/tpl/details',
    'taoClientDiagnostic/tools/csvExporter',
    'ui/datatable',
    'lib/moment-timezone.min'
], function(
    $,
    _,
    __,
    helpers,
    moment,
    request,
    loadingBar,
    encode,
    feedback,
    dialog,
    getStatus,
    performancesTesterFactory,
    fingerprintTesterFactory,
    fingerprintTpl,
    detailsTpl,
    csvExporter
) {
    'use strict';

    /**
     * The CSS scope
     * @type {string}
     * @private
     */
    const cssScope = '.diagnostic-index';

    /**
     * Default Time Zone for date
     * @type {string}
     * @private
     */
    const defaultDateTimeZone = 'UTC';

    /**
     * Default date format
     * @type {string}
     * @private
     */
    const defaultDateFormat = 'Y/MM/DD HH:mm:ss';

    /**
     * Format a number with decimals
     * @param {number} value - The number to format
     * @param {number|string} [digits] - The number of decimals
     * @returns {number}
     * @private
     */
    function formatNumber(value, digits) {
        const nb = 'undefined' === typeof digits ? 2 : Math.max(0, parseInt(digits, 10));
        const factor = Math.pow(10, nb) || 1;
        return Math.round(value * factor) / factor;
    }

    /**
     * Format a bandwidth value
     * @param {number} value
     * @returns {number|string}
     * @private
     */
    function formatBandwidth(value) {
        if (value > 100) {
            return '> 100';
        }

        return formatNumber(value);
    }

    /**
     * Transform date to local timezone
     * @param {string} date
     * @returns {string}
     * @private
     */
    function transformDateToLocal(date) {
        let time;

        if (_.isFinite(date)) {
            if (!_.isNumber(date)) {
                date = _.parseInt(date, 10);
            }
            const d = new Date(date * 1000);
            time = moment.utc(d);
        } else {
            time = moment.tz(date, defaultDateTimeZone);
        }

        return time.tz(moment.tz.guess()).format(defaultDateFormat);
    }

    // the page is always loading data when starting
    loadingBar.start();

    /**
     * Controls the readiness check page
     */
    return {
        /**
         * Entry point of the page
         */
        start() {
            const $container = $(cssScope);
            const extension = $container.data('extension') || 'taoClientDiagnostic';
            const $list = $container.find('.list');
            let dataset = $container.data('set');
            const extensionConfig = $container.data('config') || {};
            const config = extensionConfig.diagnostic || extensionConfig;
            const installedExtension = $container.data('installedextension') || false;
            const diagnosticUrl = helpers._url('diagnostic', 'Diagnostic', extension);
            const removeUrl = helpers._url('remove', 'Diagnostic', extension);
            const serviceUrl = helpers._url('diagnosticData', 'Diagnostic', extension);
            const performancesTester = performancesTesterFactory(config.testers.performance || {});
            const fingerprintTester = fingerprintTesterFactory(config.testers.fingerprint || {});

            const tools = [];
            const actions = [];
            const model = [];

            // request the server with a selection of readiness check results
            function requestData(url, selection, message) {
                if (selection && selection.length) {
                    loadingBar.start();

                    request({
                        url,
                        data: {
                            id: selection
                        },
                        method: 'POST'
                    })
                        .then(response => {
                            loadingBar.stop();

                            if (response && response.success) {
                                if (message) {
                                    feedback().success(message);
                                }
                                $list.datatable('refresh');
                            } else {
                                feedback().error(
                                    `${__('Something went wrong ...')}<br>${encode.html(response.error)}`,
                                    {
                                        encodeHtml: false
                                    }
                                );
                            }
                        })
                        .catch(() => loadingBar.stop());
                }
            }

            // request the server to remove the selected diagnostic-index
            function remove(selection) {
                requestData(removeUrl, selection, __('The readiness check result have been removed'));
            }

            // tool: page refresh
            tools.push({
                id: 'refresh',
                icon: 'reset',
                title: __('Refresh the page'),
                label: __('Refresh'),
                action() {
                    $list.datatable('refresh');
                }
            });

            // tool: readiness check
            tools.push({
                id: 'launch',
                icon: 'play',
                title: __('Launch another readiness check'),
                label: __('Launch readiness check'),
                action() {
                    window.location.href = diagnosticUrl;
                }
            });

            if (config.export) {
                // tool: export csv
                tools.push({
                    id: 'csvExport',
                    icon: 'export',
                    title: __('Export CSV'),
                    label: __('Export CSV'),
                    action() {
                        csvExporter.exportCsv(model);
                    }
                });
            }

            if (installedExtension) {
                // tool: compatibility via lti
                tools.push({
                    id: 'lti',
                    icon: 'play',
                    title: __('Try a test delivery'),
                    label: __('Try a test delivery'),
                    action() {
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
                action(selection) {
                    dialog({
                        message: __('The selected readiness check results will be removed. Continue ?'),
                        autoRender: true,
                        autoDestroy: true,
                        onOkBtn() {
                            remove(selection);
                        }
                    });
                }
            });

            // tool: close tab, this won't be present in an LTI iframe
            // button should always be right most
            if (window.self === window.top) {
                tools.push({
                    id: 'exitButton',
                    icon: 'close',
                    title: __('Exit'),
                    label: __('Exit'),
                    action() {
                        window.self.close();
                    }
                });
            }

            // action: remove the result
            actions.push({
                id: 'remove',
                icon: 'remove',
                title: __('Remove the readiness check result?'),
                action(id) {
                    dialog({
                        autoRender: true,
                        autoDestroy: true,
                        message: __('The readiness check result will be removed. Continue ?'),
                        onOkBtn() {
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

            // column: School id
            if (config.requireSchoolId) {
                model.push({
                    id: 'school_id',
                    label: __('School id')
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
                    transform(v, row) {
                        return fingerprintTpl(row.fingerprint);
                    }
                });

                $list.on('click.fingerprint', '.fingerprint-cell span.details', function(e) {
                    const id = $(e.target)
                        .closest('tr')
                        .data('itemIdentifier');
                    const row = _.find(dataset.data, { id: id });
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
                    transform(value, row) {
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
                    transform(value) {
                        const status = performancesTester.getFeedback(value);
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
                transform: transformDateToLocal
            });

            $list
                .on('query.datatable', () => loadingBar.start())
                .on('load.datatable', (e, data) => {
                    dataset = data;
                    loadingBar.stop();
                })
                .datatable(
                    {
                        url: serviceUrl,
                        status: {
                            empty: __('No readiness checks have been done!'),
                            available: __('Readiness checks already done'),
                            loading: __('Loading')
                        },
                        selectable: true,
                        tools,
                        actions,
                        model
                    },
                    dataset
                );
        }
    };
});
