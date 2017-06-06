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
define(['jquery', 'lodash', 'taoClientDiagnostic/tools/upload/tester'], function($, _, uploadTester){
    'use strict';

    // backup/restore ajax method between each test
    var ajaxBackup;
    var diagnosticTool = {
        changeStatus : function changeStatus() {}
    };

    QUnit.testStart(function () {
        ajaxBackup = $.ajax;
    });
    QUnit.testDone(function () {
        $.ajax = ajaxBackup;
    });

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert) {
        assert.ok(typeof uploadTester === 'function', 'The module exposes a function');
        assert.ok(typeof uploadTester() === 'object', 'uploadTester is a factory');
        assert.ok(typeof uploadTester().start === 'function', 'the test has a start method');
    });


    QUnit.module('Test');

    QUnit.asyncTest('The tester runs', function(assert) {
        var expectedSize = 100;
        var $ajax = $.ajax;

        QUnit.expect(4);

        $.ajax = function (config) {
            config.url = window.location.href.replace('test.html', 'test.json');
            return $ajax(config);
        };

        uploadTester({size : expectedSize}, diagnosticTool).start(function(status, details, result) {
            assert.ok(typeof result.avg === 'number', 'Speed is a number');
            assert.ok(result.avg > 0, 'Speed is a positive number');
            assert.ok(typeof result.avg === 'number', 'Loaded is a number');
            assert.ok(result.avg > 0, 'Loaded is a positive number');

            QUnit.start();
        });

    });

});
