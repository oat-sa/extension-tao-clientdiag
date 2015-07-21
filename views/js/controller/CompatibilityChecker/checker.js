/**
 * @author Antoine Robin <antoine.robin@vesperiagroup.com>
 */
define([
    'helpers'
],  function(helpers) {

    var Controller = {

        init : function(){
            var current = this;
            $("#proceed").on('click', function(){
                current._start();
            });

        },

        _start : function(){

            $('.index').remove();
            var $info = $('#checker-box');
            $info.append('<div class="loading"></div>');

            var info = new WhichBrowser();
            var osVersion = info.os.version.alias;
            if(osVersion === null){
                osVersion = info.os.version.original;
            }
            console.log(info);


            var information = {
                browser: info.browser.name,
                browserVersion: info.browser.version.original,
                os: info.os.name,
                osVersion: osVersion
            };


            $.post(
                helpers._url('check', 'CompatibilityChecker', 'taoClientDiagnostic'),
                information,
                function(data){
                    var $os = $('#os'),
                        $browser = $('#browser');
                    $info.find('.loading').remove();
                    $os.append(information.os + ' ' + information.osVersion);

                    $browser.append(information.browser + ' ' + information.browserVersion);
                    $os.removeClass('hidden');
                    $browser.removeClass('hidden');

                    $('#message').html('<img height="45" src="' + data.image +'"/>').removeClass('hidden');
                },
                "json"
            );

        }
    };

    return Controller.init();
});
