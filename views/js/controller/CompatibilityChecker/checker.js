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

            $('#proceed').remove();
            var $info = $('#checker-box');
            $info.append('<div class="loading"></div>');
            //browser
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;

            //browser
            var browser = this._browser(nAgt);
            // system
            var os = this._osName(nAgt);


            var osVersion = "-";
            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'Android':
                    osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;
            }


            osVersion = osVersion.replace(/_/g, '.')


            var information = {
                browser: browser.name,
                browserVersion: browser.version,
                os: os,
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

        },
        _browser : function(nAgt){
            var browser = {};
            var nameOffset, verOffset, ix;
            var found = false;

            browser.name = navigator.appName;
            browser.version = '' + parseFloat(navigator.appVersion);

            for (var id in navigatorName) {
                var nav = navigatorName[id];
                if ((verOffset = nAgt.indexOf(nav.name)) !== -1) {
                    browser.name = nav.string;
                    browser.version = nAgt.substring(verOffset + nav.name.length + 1);
                    if (nav.name === 'Trident/') {
                        browser.version = nAgt.substring(nAgt.indexOf('rv:') + 3);
                    }
                    if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                        browser.version = nAgt.substring(verOffset + 8);
                    }
                    found = true;
                    break;
                }
            }

            // Default
            if (!found && (nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser.name = nAgt.substring(nameOffset, verOffset);
                browser.version = nAgt.substring(verOffset + 1);
                if (browser.name.toLowerCase() === browser.name.toUpperCase()) {
                    browser.name = navigator.appName;
                }
            }
            // trim the version string
            if ((ix = browser.version.indexOf(';')) !== -1){browser.version = browser.version.substring(0, ix);}
            if ((ix = browser.version.indexOf(' ')) !== -1){browser.version = browser.version.substring(0, ix);}
            if ((ix = browser.version.indexOf(')')) !== -1){browser.version = browser.version.substring(0, ix);}

            majorVersion = parseInt('' + browser.version, 10);
            if (isNaN(majorVersion)) {
                browser.version = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            return browser;

        },

        _osName : function(nAgt){
            for (var id in operatingStrings) {
                var op = operatingStrings[id];
                if (op.regex.test(nAgt)) {
                    return op.name;
                }
            }
            return "-";
        }

    };

    return Controller.init();
});
