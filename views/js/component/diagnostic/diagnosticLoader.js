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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'ui/component',
    'core/moduleLoader',
    'context',
    'module',
    'tpl!taoClientDiagnostic/component/diagnostic/tpl/component'
], function (_, componentFactory, moduleLoader, context, module, componentTpl) {
    'use strict';

    console.log(context, module.config() );
    /**
     * Some default values.
     * @type {Object}
     */
    var defaults = {};

    return function diagnosticLoaderFactory(container, config) {
        var api = {};
        var component = componentFactory(api, defaults)
        // set the component's layout
        .setTemplate(componentTpl)

        // auto render on init
            .on('init', function(){
                this.render(container);
            })
            // renders the component
            .on('render', function () {
                var self = this;
                var moduleConfig = module.config();
                moduleLoader()
                    .addList(moduleConfig.diagnostics)
                    .load(context.bundle)
                    .then(function(factories) {
                        _.forEach(factories, function (factory) {
                            var diagComponent = factory.init(self.getConfig());
                            diagComponent.render(self.getElement());
                        });

                        /**
                         * @event ready
                         */
                        self.trigger('ready');
                    });
            });

        _.defer(function() {
            component.init(config);
        });

        return component;
    };
});