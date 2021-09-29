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
 * Copyright (c) 2019-2021 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'ui/component',
    'core/moduleLoader',
    'context',
    'module',
    'tpl!taoClientDiagnostic/component/diagnostic/tpl/component',
    'layout/loading-bar'
], function(_, componentFactory, moduleLoader, context, module, componentTpl, loadingBar) {
    'use strict';

    /*
     * This component factory is loading diagnostic tool modules and initialising with their configuration.
     * @param {object} container - Container in which the module will render diagnostic check
     * @param {object} config - Some config options.
     */
    return function diagnosticLoaderFactory(container, config) {
        const component = componentFactory()
            // set the component's layout
            .setTemplate(componentTpl)

            // auto render on init
            .on('init', function onDiagnosticLoaderInit() {
                this.render(container);
            })
            // renders the component
            .on('render', function onDiagnosticLoaderRender() {
                const moduleConfig = module.config();
                const identifiers = Object.keys(moduleConfig.diagnostics);
                /*
                 * This loads all the modules from module configuration, which are in the `diagnostics` array.
                 */
                moduleLoader({}, _.isFunction)
                    .addList(moduleConfig.diagnostics)
                    .load(context.bundle)
                    .then(factories => {
                        const componentConfig = this.getConfig();

                        /*
                         * Read all factories and initialise them with their config from component.
                         */
                        factories.forEach((factory, index) => {
                            const factoryName = identifiers[index];
                            const factoryConfig = componentConfig[factoryName];
                            factoryConfig.controller = componentConfig.controller;

                            factory(this.getElement(), factoryConfig)
                                .on('render', function onRender() {
                                    if (factoryConfig.autoStart) {
                                        this.run();
                                    }
                                })
                                .on('start', () => loadingBar.start())
                                .on('end', () => loadingBar.stop());
                        });

                        /**
                         * @event ready
                         */
                        this.trigger('ready');
                    });
            });

        _.defer(() => component.init(config));

        return component;
    };
});
