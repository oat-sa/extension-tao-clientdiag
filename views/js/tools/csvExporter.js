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
define(['jquery', 'lodash', 'i18n', 'core/request', 'layout/loading-bar', 'helpers'], function(
    $,
    _,
    __,
    request,
    loadingBar,
    helpers
) {
    'use strict';

    /**
     * The CSS scope
     * @type {string}
     * @private
     */
    const cssScope = '.diagnostic-index';

    /**
     * Export diagnostics to CSV
     * @type {object}
     */
    return {
        /**
         * Exports all diagnostics to CSV
         * @param {Array} model - data presentation model
         */
        exportCsv(model) {
            const $container = $(cssScope);
            const extension = $container.data('extension') || 'taoClientDiagnostic';
            const serviceUrl = helpers._url('diagnosticData', 'Diagnostic', extension);

            // filtering and transforming diagnostic data according to the model
            function mappingDiagnosticsData(diagnostics) {
                return diagnostics.map(diagnostic => {
                    const result = {};
                    _.forEach(model, field => {
                        result[field.id] = field.transform
                            ? field.transform(diagnostic[field.id], diagnostic)
                            : diagnostic[field.id];
                    });
                    return result;
                });
            }

            // a string variable is created containing the contents of the csv file
            function arrayToCsv(data, columnDelimiter = ',', lineDelimiter = '\n') {
                const keys = Object.keys(data[0]);
                let result = `${keys.join(columnDelimiter)}${lineDelimiter}`;
                data.forEach(item => {
                    let ctr = 0;
                    keys.forEach(key => {
                        if (ctr > 0) {
                            result += columnDelimiter;
                        }
                        result +=
                            typeof item[key] === 'string' && item[key].includes(columnDelimiter)
                                ? `"${item[key]}"`
                                : item[key];
                        ctr++;
                    });
                    result += lineDelimiter;
                });
                return result;
            }

            // file download from content
            function downloadFile(content, filename, type) {
                const blob = new Blob([content], { type: type });
                const url = URL.createObjectURL(blob);
                let link = $('<a></a>');
                link.attr('download', filename)
                    .attr('href', url)
                    .get(0)
                    .click();

                URL.revokeObjectURL(url);

                link = null;
            }

            loadingBar.start();

            request({
                url: serviceUrl,
                data: { rows: Number.MAX_SAFE_INTEGER },
                noToken: true
            })
                .then(response => {
                    const mappedData = mappingDiagnosticsData(response.data);
                    let csvContent = arrayToCsv(mappedData);
                    downloadFile(csvContent, __('diagnostics.csv'), 'text/csv');
                    loadingBar.stop();
                })
                .catch(() => {
                    loadingBar.stop();
                });
        }
    };
});
