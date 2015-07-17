define(['taoClientDiagnostic/tools/bandwith/tester'], function(bandWithTester){
    'use strict';

    QUnit.module('API');

    QUnit.test('The tester has the right form', function(assert){
        assert.ok(typeof bandWithTester === 'function', 'The module exposes a function');
        assert.ok(typeof bandWithTester() === 'object', 'bandWithTester is a factory');
        assert.ok(typeof bandWithTester().start === 'function', 'the test has a start method');
    });


    QUnit.module('Test');

    QUnit.asyncTest('The tester runs', function(assert){

        QUnit.expect(2);

        bandWithTester().start(function(speed){

            console.log(speed);

            assert.ok(typeof speed === 'number', 'The result is a number');
            assert.ok(speed > 0, 'The result is a positive number');

            QUnit.start();
        });

    });

});
