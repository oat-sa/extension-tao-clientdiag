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
 * Copyright (c) 2017-2021 (original work) Open Assessment Technologies SA ;
 */
define(['context', 'core/request', 'util/url', 'taoClientDiagnostic/tools/getPlatformInfo'], function(
    context,
    request,
    urlHelper,
    getPlatformInfo
) {
    'use strict';

    // Hotfix the URL to bring consistency between test platforms (browser and CLI)
    context['root_url'] = 'http://tao.lan';

    QUnit.module('Module');

    QUnit.test('The helper has the right form', assert => {
        assert.expect(1);
        assert.ok(typeof getPlatformInfo === 'function', 'The module exposes a function');
    });

    QUnit.module('API');

    QUnit.cases
        .init([
            {
                title: 'success',
                window: {
                    document: {
                        documentElement: {},
                        createElement: function() {
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
            },
            {
                title: 'failure',
                window: {
                    document: {
                        documentElement: {},
                        createElement: function() {
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
            }
        ])
        .test('getPlatformInfo ', (data, assert) => {
            const ready = assert.async();
            request.mock(options => {
                const parsedUrl = urlHelper.parse(options.url);

                assert.equal(typeof parsedUrl.query.r, 'string', 'The helper has set a cache buster');
                delete parsedUrl.query.r;
                assert.equal(parsedUrl.path, data.urlPath, 'The helper has called the right service');
                assert.deepEqual(parsedUrl.query, data.urlParams, 'The helper has provided the expected params');

                return data.failed ? Promise.reject(data.response) : Promise.resolve(data.response);
            });

            assert.expect(4);

            getPlatformInfo(data.window, data.config)
                .then(result => {
                    if (data.failed) {
                        assert.ok(false, 'The helper should fail!');
                    } else {
                        assert.deepEqual(result, data.response, 'The helper has returned the expected result');
                    }
                    ready();
                })
                .catch(err => {
                    if (data.failed) {
                        assert.deepEqual(err, data.response, 'The helper has provided the expected error');
                    } else {
                        console.error(err);
                        assert.ok(false, 'The helper should not fail!');
                    }
                    ready();
                });
        });
});
