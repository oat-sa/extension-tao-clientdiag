define(['lodash', 'async', 'context', 'lib/polyfill/performance-now'], function(_, async, context){
    'use strict';


    //TODO  - update the thresholds timeout based on connection speed
    //      - be able to run each one multiple times
    //      - document
    //      - code clean up


    var downloadData = {
        "10KB" : {
            file : 'data/bin10KB.data',
            size : 10 * 1000,
            threshold : -1
        },
        "100KB" : {
            file : 'data/bin100KB.data',
            size : 100 * 1000,
            threshold : 5 * 1000
        },
        "1MB" : {
            file : 'data/bin1MB.data',
            size : 1000 * 1000,
            threshold : 30 * 1000
        },
        "10MB" : {
            file : 'data/bin10MB.data',
            size : 10 * 1000 * 1000,
            threshold : 60 * 1000
        },
        "100MB" : {
            file : 'data/bin100MB.data',
            size : 100 * 1000 * 1000,
            threshold : 2 * 60 * 1000
        },
    };

    var download = function download(data, cb){
        var start, end;
        var timeoutId;
        var url = context.root_url + '/taoClientDiagnostic/views/js/tools/bandwith/' + data.file + '?' + Date.now();
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader('Accept', 'application/octet-stream');

        request.onload = function onRequestLoad (){
            end = window.performance.now();
            clearTimeout(timeoutId);
            return cb(null, {
                file : data.file,
                size : data.size,
                duration : end - start
            });
        };
        request.onerror = function onRequestError (err){
            clearTimeout(timeoutId);
            cb(err);
        };

        if(data.threshold > 0){
            timeoutId = _.delay(cb, data.threshold, 'timeout');
        }
        start = window.performance.now();
        request.send();
    };

    var bandWithTester = function bandWithTester (){

        var results = {};


        return {

            start : function start(done){

                var tests = _.map(downloadData, function(data, name){
                    return _.partial(download, data);
                });

                async.series(tests, function(err, results){
                    var sum = 0;
                    var avg = 0;
                    if(err && !results.length){
                        //something went wrong
                        throw err;
                    }

                    sum = _.reduce(results, function(acc, result){

                        var bytes = result.size;
                        var seconds = result.duration / 1000;

                        //Speed in Mbps
                        var speed =  (bytes / seconds) / 1024 / 1024 * 8;
                        speed = Math.round( speed * 100) / 100;

                        return acc + speed;
                    }, 0);

                    done( sum / results.length );
                });
            }
        };
    };


    return bandWithTester;
});
