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
define(['taoClientDiagnostic/tools/getConfig'], function(getConfig){
    'use strict';

    QUnit.module('Module');

    QUnit.test('The helper has the right form', function(assert){
        QUnit.expect(1);
        assert.ok(typeof getConfig === 'function', 'The module exposes a function');
    });


    QUnit.module('API');

    QUnit.cases([{
        title: 'no config, no defaults',
        expected: {}
    }, {
        title: 'no config, defaults',
        defaults: {
            foo: 'bar'
        },
        expected: {
            foo: 'bar'
        }
    }, {
        title: 'simple config, defaults',
        config: {
            name: 'test'
        },
        defaults: {
            foo: 'bar'
        },
        expected: {
            name: 'test',
            foo: 'bar'
        }
    }, {
        title: 'config with values, defaults with other value',
        config: {
            foo: 'test'
        },
        defaults: {
            foo: 'bar'
        },
        expected: {
            foo: 'test'
        }
    }, {
        title: 'config with empty values, defaults',
        config: {
            discarded: null,
            undef: undefined,
            value: 0,
            foo: 'test',
            name: null
        },
        defaults: {
            foo: 'bar',
            value: 10,
            name: 'foo'
        },
        expected: {
            value: 0,
            foo: 'test',
            name: 'foo'
        }
    }]).test('getConfig ', function(data, assert){
        var config = getConfig(data.config, data.defaults);
        QUnit.expect(1);
        assert.deepEqual(config, data.expected, 'The helper has returned the expected data');
    });

});
