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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * This helper performs a server request to gather information about the user browser and os
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'util/url',
    'core/promise',
    'taoClientDiagnostic/tools/getConfig'
], function ($, url, Promise, getConfig) {
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
     * @param {Window} win
     * @param {String} action
     * @param {String} controller
     * @param {String} extension
     * @returns {String}
     */
    function getTesterUrl(win, action, controller, extension) {
        var document = win.document;
        var navigator = win.navigator;
        var screen = win.screen;
        var params = {};
        var e = 0;
        var f = 0;

        // append the browser user agent
        params.ua = navigator.userAgent;

        // detect browser family
        e |= win.ActiveXObject ? 1 : 0;
        e |= win.opera ? 2 : 0;
        e |= win.chrome ? 4 : 0;
        e |= 'getBoxObjectFor' in document || 'mozInnerScreenX' in win ? 8 : 0;
        e |= ('WebKitCSSMatrix' in win || 'WebKitPoint' in win || 'webkitStorageInfo' in win || 'webkitURL' in win) ? 16 : 0;
        e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
        params.e = e;

        // gather info about browser functionality
        f |= 'sandbox' in document.createElement('iframe') ? 1 : 0;
        f |= 'WebSocket' in win ? 2 : 0;
        f |= win.Worker ? 4 : 0;
        f |= win.applicationCache ? 8 : 0;
        f |= win.history && win.history.pushState ? 16 : 0;
        f |= document.documentElement.webkitRequestFullScreen ? 32 : 0;
        f |= 'FileReader' in win ? 64 : 0;
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
    return function getPlatformInfo(win, config) {
        var testerUrl;

        config = getConfig(config, defaultConfig);

        testerUrl = getTesterUrl(
            win,
            config.browserVersionAction,
            config.browserVersionController,
            config.browserVersionExtension
        );

        return new Promise(function (resolve, reject) {
            $.ajax({url: testerUrl})
                .done(resolve)
                .fail(reject);
        });
    };
});
