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
define(['taoClientDiagnostic/tools/getLabels'], function(getLabels){
    'use strict';

    QUnit.module('Module');

    QUnit.test('The helper has the right form', function(assert){
        QUnit.expect(1);
        assert.ok(typeof getLabels === 'function', 'The module exposes a function');
    });


    QUnit.module('API');

    QUnit.cases([{
        title: 'no messages, no level',
        expected: {}
    }, {
        title: 'no messages, level 1',
        level: 1,
        expected: {}
    }, {
        title: '1 message without array, no level',
        messages: {
            title: 'foo',
            status: 'bar'
        },
        expected: {
            title: 'foo',
            status: 'bar'
        }
    }, {
        title: '1 message without array, level 1',
        level: 1,
        messages: {
            title: 'foo',
            status: 'bar'
        },
        expected: {
            title: 'foo',
            status: 'bar'
        }
    }, {
        title: 'list with 1 message, level 1',
        level: 1,
        messages: [{
            title: 'foo',
            status: 'bar'
        }],
        expected: {
            title: 'foo',
            status: 'bar'
        }
    }, {
        title: 'list with 1 message, level 2',
        level: 2,
        messages: [{
            title: 'foo',
            status: 'bar'
        }],
        expected: {
            title: 'foo',
            status: 'bar'
        }
    }, {
        title: 'list with 1 message, level 0',
        level: 0,
        messages: [{
            title: 'foo',
            status: 'bar'
        }],
        expected: {
            title: 'foo',
            status: 'bar'
        }
    }, {
        title: 'list with 2 messages, level 0',
        level: 0,
        messages: [{
            title: 'level1',
            status: 'foo bar 1'
        }, {
            title: 'level2',
            status: 'foo bar 2'
        }],
        expected: {
            title: 'level1',
            status: 'foo bar 1'
        }
    }, {
        title: 'list with 2 messages, level 1',
        level: 1,
        messages: [{
            title: 'level1',
            status: 'foo bar 1'
        }, {
            title: 'level2',
            status: 'foo bar 2'
        }],
        expected: {
            title: 'level1',
            status: 'foo bar 1'
        }
    }, {
        title: 'list with 2 messages, level 2',
        level: 2,
        messages: [{
            title: 'level1',
            status: 'foo bar 1'
        }, {
            title: 'level2',
            status: 'foo bar 2'
        }],
        expected: {
            title: 'level2',
            status: 'foo bar 2'
        }
    }, {
        title: 'list with 2 messages, level 3',
        level: 3,
        messages: [{
            title: 'level1',
            status: 'foo bar 1'
        }, {
            title: 'level2',
            status: 'foo bar 2'
        }],
        expected: {
            title: 'level2',
            status: 'foo bar 2'
        }
    }]).test('getLabels ', function(data, assert){
        var labels = getLabels(data.messages, data.level);
        QUnit.expect(1);
        assert.deepEqual(labels, data.expected, 'The helper has returned the expected data');
    });

});
