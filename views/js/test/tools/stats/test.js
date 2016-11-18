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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define(['taoClientDiagnostic/tools/stats'], function(stats){
    'use strict';

    var listValuesArray;
    var listValuesCollectionDataProvider;
    var listValuesObject;
    var listValuesObjectDataProvider;
    var listValuesCollectionCallbackDataProvider;
    var listValuesObjectCallbackDataProvider;

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert){
        assert.ok(typeof stats === 'function', 'The module exposes a function');
    });


    QUnit.module('Test');

    /** stats from a collection **/
    listValuesArray = [{
        "totalDuration": 64,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 62
    }, {
        "totalDuration": 75,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 73
    }, {
        "totalDuration": 58,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 56
    }, {
        "totalDuration": 64,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 62
    }, {
        "totalDuration": 73,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 71
    }, {
        "totalDuration": 72,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 70
    }, {
        "totalDuration": 52,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 50
    }, {
        "totalDuration": 71,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 69
    }, {
        "totalDuration": 74,
        "networkDuration": 1,
        "requestDuration": 1,
        "displayDuration": 72
    }];

    listValuesCollectionDataProvider = [{
        title : 'min',
        name : 'min',
        input : listValuesArray,
        field : 'displayDuration',
        expected : 50
    }, {
        title : 'max',
        name : 'max',
        input : listValuesArray,
        field : 'displayDuration',
        expected : 73
    }, {
        title : 'sum',
        name : 'sum',
        input : listValuesArray,
        field : 'displayDuration',
        expected : 585
    }, {
        title : 'count',
        name : 'count',
        input : listValuesArray,
        field : 'displayDuration',
        expected : listValuesArray.length
    }, {
        title : 'average',
        name : 'average',
        input : listValuesArray,
        field : 'displayDuration',
        expected : 65
    }, {
        title : 'median',
        name : 'median',
        input : listValuesArray,
        field : 'displayDuration',
        expected : 69.5
    }, {
        title : 'variance',
        name : 'variance',
        input : listValuesArray,
        field : 'displayDuration',
        expected : 8.02
    }, {
        title : 'values',
        name : 'values',
        input : listValuesArray,
        field : 'displayDuration',
        expected : listValuesArray
    }];

    QUnit
        .cases(listValuesCollectionDataProvider)
        .test('Stats on a collection', function(data, assert) {
            var results = stats(data.input, data.field);
            var value = results[data.name];
            if ('number' === typeof value) {
                value = Math.round(value * 100) / 100;
            }
            QUnit.expect(1);
            assert.strictEqual(value, data.expected, 'The value of the result field ' + data.name + ' must be equal to expected value!');
        });

    /** stats from an object **/
    listValuesObject = {
         "sample0": {
             "totalDuration": 64,
             "networkDuration": 1,
             "requestDuration": 1,
             "displayDuration": 62
         },
        "sample1": {
            "totalDuration": 75,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 73
        },
        "sample2": {
            "totalDuration": 58,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 56
        },
        "sample3": {
            "totalDuration": 64,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 62
        },
        "sample4": {
            "totalDuration": 73,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 71
        },
        "sample5": {
            "totalDuration": 72,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 70
        },
        "sample6": {
            "totalDuration": 52,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 50
        },
        "sample7": {
            "totalDuration": 71,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 69
        },
        "sample8": {
            "totalDuration": 74,
            "networkDuration": 1,
            "requestDuration": 1,
            "displayDuration": 72
        }
    };

    listValuesObjectDataProvider = [{
        title : 'min',
        name : 'min',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 50
    }, {
        title : 'max',
        name : 'max',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 73
    }, {
        title : 'sum',
        name : 'sum',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 585
    }, {
        title : 'count',
        name : 'count',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 9
    }, {
        title : 'average',
        name : 'average',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 65
    }, {
        title : 'median',
        name : 'median',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 69.5
    }, {
        title : 'variance',
        name : 'variance',
        input : listValuesObject,
        field : 'displayDuration',
        expected : 8.02
    }, {
        title : 'values',
        name : 'values',
        input : listValuesObject,
        field : 'displayDuration',
        expected : listValuesObject
    }];

    QUnit
        .cases(listValuesObjectDataProvider)
        .test('Stats on an object', function(data, assert) {
            var results = stats(data.input, data.field);
            var value = results[data.name];
            if ('number' === typeof value) {
                value = Math.round(value * 100) / 100;
            }
            QUnit.expect(1);
            assert.strictEqual(value, data.expected, 'The value of the result field ' + data.name + ' must be equal to expected value!');
        });

    function getValue(value) {
        return value.displayDuration;
    }

    /** stats from a collection using a callback **/
    listValuesCollectionCallbackDataProvider = [{
        title : 'min',
        name : 'min',
        input : listValuesArray,
        field : getValue,
        expected : 50
    }, {
        title : 'max',
        name : 'max',
        input : listValuesArray,
        field : getValue,
        expected : 73
    }, {
        title : 'sum',
        name : 'sum',
        input : listValuesArray,
        field : getValue,
        expected : 585
    }, {
        title : 'count',
        name : 'count',
        input : listValuesArray,
        field : getValue,
        expected : listValuesArray.length
    }, {
        title : 'average',
        name : 'average',
        input : listValuesArray,
        field : getValue,
        expected : 65
    }, {
        title : 'median',
        name : 'median',
        input : listValuesArray,
        field : getValue,
        expected : 69.5
    }, {
        title : 'variance',
        name : 'variance',
        input : listValuesArray,
        field : getValue,
        expected : 8.02
    }, {
        title : 'values',
        name : 'values',
        input : listValuesArray,
        field : getValue,
        expected : listValuesArray
    }];

    QUnit
        .cases(listValuesCollectionCallbackDataProvider)
        .test('Stats on a collection using a callback', function(data, assert) {
            var results = stats(data.input, data.field);
            var value = results[data.name];
            if ('number' === typeof value) {
                value = Math.round(value * 100) / 100;
            }
            QUnit.expect(1);
            assert.strictEqual(value, data.expected, 'The value of the result field ' + data.name + ' must be equal to expected value!');
        });

    /** stats from an object **/
    listValuesObjectCallbackDataProvider = [{
        title : 'min',
        name : 'min',
        input : listValuesObject,
        field : getValue,
        expected : 50
    }, {
        title : 'max',
        name : 'max',
        input : listValuesObject,
        field : getValue,
        expected : 73
    }, {
        title : 'sum',
        name : 'sum',
        input : listValuesObject,
        field : getValue,
        expected : 585
    }, {
        title : 'count',
        name : 'count',
        input : listValuesObject,
        field : getValue,
        expected : 9
    }, {
        title : 'average',
        name : 'average',
        input : listValuesObject,
        field : getValue,
        expected : 65
    }, {
        title : 'median',
        name : 'median',
        input : listValuesObject,
        field : getValue,
        expected : 69.5
    }, {
        title : 'variance',
        name : 'variance',
        input : listValuesObject,
        field : getValue,
        expected : 8.02
    }, {
        title : 'values',
        name : 'values',
        input : listValuesObject,
        field : getValue,
        expected : listValuesObject
    }];

    QUnit
        .cases(listValuesObjectCallbackDataProvider)
        .test('Stats on an object using a callback', function(data, assert) {
            var results = stats(data.input, data.field);
            var value = results[data.name];
            if ('number' === typeof value) {
                value = Math.round(value * 100) / 100;
            }
            QUnit.expect(1);
            assert.strictEqual(value, data.expected, 'The value of the result field ' + data.name + ' must be equal to expected value!');
        });

});
