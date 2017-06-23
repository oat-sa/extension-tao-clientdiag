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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * This helper performs a server request to gather information about the user browser and os
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash',
    'jquery',
    'util/url'
], function (_, $, url) {
    'use strict';

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var defaultConfig = {
        browserVersionAction: 'whichBrowser',
        browserVersionController: 'CompatibilityChecker',
        browserVersionExtension: 'taoClientDiagnostic'
    };

    /**
     * Gets the URL of the platform tester
     * @returns {String}
     */
    function getTesterUrl(window, action, controller, extension) {
        var document = window.document;
        var navigator = window.navigator;
        var screen = window.screen;
        var params = {};
        var e = 0;
        var f = 0;

        // append the browser user agent
        params.ua = navigator.userAgent;

        // detect browser family
        e |= window.ActiveXObject ? 1 : 0;
        e |= window.opera ? 2 : 0;
        e |= window.chrome ? 4 : 0;
        e |= 'getBoxObjectFor' in document || 'mozInnerScreenX' in window ? 8 : 0;
        e |= ('WebKitCSSMatrix' in window || 'WebKitPoint' in window || 'webkitStorageInfo' in window || 'webkitURL' in window) ? 16 : 0;
        e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
        params.e = e;

        // gather info about browser functionality
        f |= 'sandbox' in document.createElement('iframe') ? 1 : 0;
        f |= 'WebSocket' in window ? 2 : 0;
        f |= window.Worker ? 4 : 0;
        f |= window.applicationCache ? 8 : 0;
        f |= window.history && window.history.pushState ? 16 : 0;
        f |= document.documentElement.webkitRequestFullScreen ? 32 : 0;
        f |= 'FileReader' in window ? 64 : 0;
        params.f = f;

        // append a unique ID
        params.r = Math.random().toString(36).substring(7);

        // get the screen size
        params.w = screen.width;
        params.h = screen.height;

        return url.route(action, controller, extension, params);
    }

    /**
     * Check the user browser and os
     * @param {Window} window - Need an access to the window object
     * @param {Object} config
     * @param {String} config.browserVersionAction - The name of the action to call to get the browser checker
     * @param {String} config.browserVersionController - The name of the controller to call to get the browser checker
     * @param {String} config.browserVersionExtension - The name of the extension containing the controller to call to get the browser checker
     * @returns {Promise}
     */
    return function getPlatformInfo(window, config) {
        var testerUrl;

        config = _.defaults((config || {}), defaultConfig);

        testerUrl = getTesterUrl(
            window,
            config.browserVersionAction,
            config.browserVersionController,
            config.browserVersionExtension
        );

        return new Promise(function (resolve, reject) {
            $.ajax({
                url: testerUrl,
                success: function (platformInfo) {
                    resolve(platformInfo);
                },
                error: reject
            });
        });
    };
});
