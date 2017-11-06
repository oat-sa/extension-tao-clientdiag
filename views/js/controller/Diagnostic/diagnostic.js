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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

/**
 *
 * @author dieter <dieter@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
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
], function (module, $, __, helpers, loadingBar, actionbar, feedback, diagnosticFactory, diagnosticTpl) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.diagnostic-runner';

    /**
     * Controls the readiness check page
     *
     * @type {Object}
     */
    var taoDiagnosticRunnerCtlr = {
        /**
         * Entry point of the page
         */
        start : function start() {
            var $container = $(cssScope);
            var extension = $container.data('extension') || 'taoClientDiagnostic';
            var $list = $container.find('.list');
            var $panel = $('.panel');
            var config = $container.data('config');
            var indexUrl = helpers._url('index', 'Diagnostic', extension);
            var workstationUrl = helpers._url('workstation', 'DiagnosticChecker', extension);
            var buttons = [];
            var moduleConfig = module.config() || {};

            config.configurableText = moduleConfig.configurableText || {};

            /**
             * Installs the diagnostic tool GUI
             * @param {String} [workstation]
             */
            function installTester(workstation) {
                diagnosticFactory(config)
                    .setTemplate(diagnosticTpl)
                    .on('render', function() {
                        var self = this;

                        // get access to the input
                        this.controls.$workstation = this.getElement().find('[data-control="workstation"]')
                            .on('keypress', function (e) {
                                if (e.which === 13) {
                                    e.preventDefault();
                                    self.run();
                                }
                            })
                            .val(workstation);
                    })
                    .on('start', function() {
                        // append the workstation name to the queries
                        this.config.storeParams = this.config.storeParams || {};
                        this.config.storeParams.workstation = this.controls.$workstation.val();

                        // disable the input when running the test
                        this.controls.$workstation.prop('disabled', true);
                        loadingBar.start();
                    })
                    .on('end', function() {
                        // enable the input when the test is complete
                        this.controls.$workstation.removeProp('disabled');
                        loadingBar.stop();
                    })
                    .on('render', function() {
                        loadingBar.stop();
                        if (config.autoStart) {
                            this.run();
                        }
                    })
                    .render($list);
            }

            buttons.push({
                id: 'back',
                icon: 'step-backward',
                title: __('Return to the list'),
                label: __('List of readiness checks'),
                action: function() {
                    window.location.href = indexUrl;
                }
            });

            // tool: close tab, this won't be present in an LTI iframe
            // button should always be right most
            if(window.self === window.top) {
                buttons.push({
                    id: 'exitButton',
                    icon: 'close',
                    title: __('Exit'),
                    label: __('Exit'),
                    action: function() {
                        window.self.close();
                    }
                });
            }

            actionbar({
                renderTo: $panel,
                buttons: buttons
            });

            // need to known the workstation name to display it
            $.get(workstationUrl, 'json')
                .done(function(data) {
                    installTester(data && data.workstation);
                })
                .fail(function() {
                    feedback().error(__('Unable to get the workstation name!'));
                    installTester();
                });
        }
    };

    // the page is always loading data when starting
    loadingBar.start();

    return taoDiagnosticRunnerCtlr;
});
