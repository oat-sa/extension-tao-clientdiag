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
    'ui/feedback',
    'taoClientDiagnostic/tools/message'], function ($, feedbackMock, message) {
    'use strict';

    QUnit.module('Module');

    QUnit.test('The helper has the right form', function (assert) {
        QUnit.expect(1);
        assert.ok(typeof message === 'function', 'The module exposes a function');
    });


    QUnit.module('API');

    QUnit.cases([{
        title: 'message',
        data: 'message',
        text: 'This is a message'
    }, {
        title: 'error',
        data: 'error',
        text: 'This is an error'
    }, {
        title: 'nothing'
    }]).asyncTest('message ', function (data, assert) {
        var $container = $('#fixture');
        var delay = setTimeout(function() {
            assert.ok(!data.data, 'The feedback has not been displayed');
            QUnit.start();
        }, 250);

        feedbackMock.callback = function(text) {
            clearTimeout(delay);
            if (data.data) {
                assert.equal(text, data.text);
            } else {
                assert.ok(false, 'The feedback should not have been displayed');
            }
            QUnit.start();
        };

        QUnit.expect(1);

        if (data.data) {
            $container.data(data.data, data.text);
        }
        message($container);
    });

});
