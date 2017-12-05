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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'context',
    'util/url',
    'taoClientDiagnostic/tools/getPlatformInfo'
], function ($, context, url, getPlatformInfo) {
    'use strict';

    var ajaxBackup;

    // hotfix the URL to bring consistency between test platforms (browser and CLI)
    context['root_url'] = 'http://tao.lan';

    /**
     * A simple AJAX mock factory that fakes a successful ajax call.
     * To use it, just replace $.ajax with the returned value:
     * <pre>$.ajax = ajaxMockSuccess(mockData);</pre>
     * @param {*} response - The mock data used as response
     * @param {Function} [validator] - An optional function called instead of the ajax method
     * @returns {Function}
     */
    function ajaxMockSuccess(response, validator) {
        var deferred = $.Deferred().resolve(response);
        return function () {
            validator && validator.apply(this, arguments);
            return deferred.promise();
        };
    }


    /**
     * A simple AJAX mock factory that fakes a failing ajax call.
     * To use it, just replace $.ajax with the returned value:
     * <pre>$.ajax = ajaxMockError(mockData);</pre>
     * @param {*} response - The mock data used as response
     * @param {Function} [validator] - An optional function called instead of the ajax method
     * @returns {Function}
     */
    function ajaxMockError(response, validator) {
        var deferred = $.Deferred().reject(response);
        return function () {
            validator && validator.apply(this, arguments);
            return deferred.promise();
        };
    }

    QUnit.module('Module');

    QUnit.test('The helper has the right form', function (assert) {
        QUnit.expect(1);
        assert.ok(typeof getPlatformInfo === 'function', 'The module exposes a function');
    });


    QUnit.module('API');

    // backup/restore ajax method between each test
    QUnit.testStart(function () {
        ajaxBackup = $.ajax;
    });
    QUnit.testDone(function () {
        $.ajax = ajaxBackup;
    });

    QUnit.cases([{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        window: {
            document: {
                documentElement: {},
                createElement: function () {
                    return {};
                }
            },
            navigator: {
                userAgent: ''
            },
            screen: {}
        },
        config: {
            browserVersionAction: 'act',
            browserVersionController: 'ctrl',
            browserVersionExtension: 'ext'
        },
        response: {
            ok: true
        },
        failed: false,
        urlPath: '/ext/ctrl/act',
        urlParams: {
            ua: '',
            e: '0',
            f: '0',
            w: 'undefined',
            h: 'undefined'
        }
    }, {
        title: 'failure',
        ajaxMock: ajaxMockError,
        window: {
            document: {
                documentElement: {},
                createElement: function () {
                    return {};
                }
            },
            navigator: {
                userAgent: ''
            },
            screen: {}
        },
        config: {
            browserVersionAction: 'act',
            browserVersionController: 'ctrl',
            browserVersionExtension: 'ext'
        },
        response: {
            error: true
        },
        failed: true,
        urlPath: '/ext/ctrl/act',
        urlParams: {
            ua: '',
            e: '0',
            f: '0',
            w: 'undefined',
            h: 'undefined'
        }
    }]).asyncTest('getPlatformInfo ', function (data, assert) {
        $.ajax = data.ajaxMock(data.response, function (config) {
            var parsedUrl = url.parse(config.url);

            assert.equal(typeof parsedUrl.query.r, 'string', 'The helper has set a cache buster');
            delete parsedUrl.query.r;
            assert.equal(parsedUrl.path, data.urlPath, 'The helper has called the right service');
            assert.deepEqual(parsedUrl.query, data.urlParams, 'The helper has provided the expected params');
        });

        QUnit.expect(4);


        getPlatformInfo(data.window, data.config)
            .then(function (result) {
                if (data.failed) {
                    assert.ok(false, 'The helper should fail!');
                } else {
                    assert.deepEqual(result, data.response, 'The helper has returned the expected result');
                }
                QUnit.start();
            })
            .catch(function (err) {
                if (data.failed) {
                    assert.deepEqual(err, data.response, 'The helper has provided the expected error');
                } else {
                    console.error(err);
                    assert.ok(false, 'The helper should not fail!');
                }
                QUnit.start();
            });
    });

});
