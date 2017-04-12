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
    'jquery',
    'i18n',
    'helpers',
    'layout/loading-bar',
    'ui/actionbar',
    'ui/listbox'
], function ($, __, helpers, loadingBar, actionbar, listBoxFactory) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.delivery-list';


    loadingBar.start();

    /**
     * Controls the readiness check page
     *
     * @type {Object}
     */
    var taoDeliveryListCtlr = {
        /**
         * Entry point of the page
         */
        start : function start() {
            var $container = $(cssScope);
            var extension = $container.data('extension') || 'taoClientDiagnostic';
            var deliveries = $container.data('deliveries') || [];
            var $list = $container.find('.list');
            var $panel = $('.panel');
            var indexUrl = helpers._url('index', 'Diagnostic', extension);


            actionbar({
                renderTo: $panel,
                buttons: [{
                    id: 'back',
                    icon: 'step-backward',
                    title: __('Return to the list'),
                    label: __('List of readiness checks'),
                    action: function() {
                        window.location.href = indexUrl;
                    }
                }]
            });

            listBoxFactory({
                title: __("Available Deliveries"),
                textEmpty: __("No delivery available"),
                textLoading: __("Loading"),
                renderTo: $list,
                replace: true,
                list: deliveries,
                width: 12
            });

            loadingBar.stop();

        }
    };

    return taoDeliveryListCtlr;
});
