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
 * Copyright (c) 2017-2021 (original work) Open Assessment Technologies SA;
 */
define([
    'module',
    'jquery',
    'i18n',
    'helpers',
    'layout/loading-bar',
    'ui/actionbar',
    'ui/feedback',
    'taoClientDiagnostic/tools/diagnostic/diagnostic',
    'tpl!taoClientDiagnostic/templates/diagnostic/main'
], function(module, $, __, helpers, loadingBar, actionbar, feedback, diagnosticFactory, diagnosticTpl) {
    'use strict';

    /**
     * The CSS scope
     * @type {string}
     * @private
     */
    const cssScope = '.diagnostic-runner';

    // the page is always loading data when starting
    loadingBar.start();

    /**
     * Controls the readiness check page
     * @type {object}
     */
    return {
        /**
         * Entry point of the page
         */
        start() {
            const $container = $(cssScope);
            const extension = $container.data('extension') || 'taoClientDiagnostic';
            const $list = $container.find('.list');
            const $panel = $('.panel');
            const extensionConfig = $container.data('config') || {};
            const config = extensionConfig.diagnostic || extensionConfig;
            const indexUrl = helpers._url('index', 'Diagnostic', extension);
            const workstationUrl = helpers._url('workstation', 'DiagnosticChecker', extension);
            const buttons = [];
            const moduleConfig = module.config() || {};

            config.configurableText = moduleConfig.configurableText || {};

            /**
             * Installs the diagnostic tool GUI
             * @param {string} [workstation]
             */
            function installTester(workstation) {
                diagnosticFactory($list, config)
                    .setTemplate(diagnosticTpl)
                    .on('render', function onDiagnosticRender() {
                        // get access to the input
                        this.controls.$workstation = this.getElement()
                            .find('[data-control="workstation"]')
                            .on('keypress', e => {
                                if (e.which === 13) {
                                    e.preventDefault();
                                    this.run();
                                }
                            })
                            .val(workstation);

                        loadingBar.stop();
                        if (config.autoStart) {
                            this.run();
                        }
                    })
                    .on('start', function onDiagnosticStart() {
                        // append the workstation name to the queries
                        this.config.storeParams = this.config.storeParams || {};
                        this.config.storeParams.workstation = this.controls.$workstation.val();

                        // disable the input when running the test
                        this.controls.$workstation.prop('disabled', true);
                        loadingBar.start();
                    })
                    .on('end', function onDiagnosticEnd() {
                        // enable the input when the test is complete
                        this.controls.$workstation.prop('disabled', false);
                        loadingBar.stop();
                    });
            }

            buttons.push({
                id: 'back',
                icon: 'step-backward',
                title: __('Return to the list'),
                label: __('List of readiness checks'),
                action() {
                    window.location.href = indexUrl;
                }
            });

            // tool: close tab, this won't be present in an LTI iframe
            // button should always be right most
            if (window.self === window.top) {
                buttons.push({
                    id: 'exitButton',
                    icon: 'close',
                    title: __('Exit'),
                    label: __('Exit'),
                    action() {
                        window.self.close();
                    }
                });
            }

            actionbar({
                renderTo: $panel,
                buttons
            });

            // need to know the workstation name to display it
            $.get(workstationUrl, 'json')
                .done(data => installTester(data && data.workstation))
                .fail(() => {
                    feedback().error(__('Unable to get the workstation name!'));
                    installTester();
                });
        }
    };
});
