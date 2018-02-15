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
define(['taoClientDiagnostic/tools/getStatus'], function(getStatus){
    'use strict';

    QUnit.module('Module');

    QUnit.test('The helper has the right form', function(assert){
        QUnit.expect(1);
        assert.ok(typeof getStatus === 'function', 'The module exposes a function');
    });


    QUnit.module('API');

    QUnit.cases([{
        title: 'no percentage, no thresholds',
        expected: {
            percentage: 0,
            globalPercentage: 0,
            quality: {}
        }
    }, {
        title: '100%, no thresholds',
        percentage: 100,
        expected: {
            percentage: 100,
            globalPercentage: 100,
            quality: {}
        }
    }, {
        title: '0%, empty thresholds',
        percentage: 0,
        thresholds: {},
        expected: {
            percentage: 0,
            globalPercentage: 0,
            feedback: {},
            quality: {}
        }
    }, {
        title: '50%, empty thresholds',
        percentage: 50,
        thresholds: {},
        expected: {
            percentage: 50,
            globalPercentage: 50,
            feedback: {},
            quality: {}
        }
    }, {
        title: '100%, empty thresholds',
        percentage: 100,
        thresholds: {},
        expected: {
            percentage: 100,
            globalPercentage: 100,
            feedback: {},
            quality: {}
        }
    }, {
        title: '10%, threshold 50%',
        percentage: 10,
        thresholds: {
            threshold: 50
        },
        expected: {
            percentage: 10,
            globalPercentage: 10,
            quality: {}
        }
    }, {
        title: '70%, threshold 50%',
        percentage: 70,
        thresholds: {
            threshold: 50
        },
        expected: {
            percentage: 70,
            globalPercentage: 70,
            feedback: {
                threshold: 50
            },
            quality: {}
        }
    }, {
        title: '20%, threshold 25%, 50%, 75%',
        percentage: 20,
        thresholds: [{
            threshold: 25
        }, {
            threshold: 50
        }, {
            threshold: 75
        }],
        expected: {
            percentage: 20,
            globalPercentage: 20,
            quality: {}
        }
    }, {
        title: '30%, threshold 25%, 50%, 75%',
        percentage: 30,
        thresholds: [{
            threshold: 25
        }, {
            threshold: 50
        }, {
            threshold: 75
        }],
        expected: {
            percentage: 30,
            globalPercentage: 30,
            feedback: {
                threshold: 25
            },
            quality: {}
        }
    }, {
        title: '60%, threshold 25%, 50%, 75%',
        percentage: 60,
        thresholds: [{
            threshold: 25
        }, {
            threshold: 50
        }, {
            threshold: 75
        }],
        expected: {
            percentage: 60,
            globalPercentage: 60,
            feedback: {
                threshold: 50
            },
            quality: {}
        }
    }, {
        title: '60%, threshold 25%, 50%, 75%',
        percentage: 80,
        thresholds: [{
            threshold: 25
        }, {
            threshold: 50
        }, {
            threshold: 75
        }],
        expected: {
            percentage: 80,
            globalPercentage: 80,
            feedback: {
                threshold: 75
            },
            quality: {}
        }
    }, {
        title: 'global percentage should never goes below minimumGlobalPercentage option',
        percentage: 10,
        thresholds: {
            threshold: 50
        },
        options: {
            minimumGlobalPercentage: 50
        },
        expected: {
            percentage: 10,
            globalPercentage: 50,
            quality: {}
        }
    }, {
        title: 'global percentage is false per default',
        percentage: 10,
        thresholds: {
            threshold: 50
        },
        options: {
            minimumGlobalPercentage: false
        },
        expected: {
            percentage: 10,
            globalPercentage: 10,
            quality: {}
        }
    }]).test('getStatus ', function(data, assert){
        var status = getStatus(data.percentage, data.thresholds, data.options);
        QUnit.expect(1);
        assert.deepEqual(status, data.expected, 'The helper has returned the expected data');
    });

});
