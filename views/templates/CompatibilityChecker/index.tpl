<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;

?>

<!doctype html>
<html class="no-js no-version-warning">
<head>
    <script src="<?= Template::js('lib/modernizr-2.8/modernizr.js', 'tao') ?>"></script>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Layout::getTitle() ?></title>
    <link rel="shortcut icon" href="<?= Template::img('img/favicon.ico') ?>"/>

    <script
        id="amd-loader"
        src="<?= Template::js('lib/require.js', 'tao') ?>"
        data-controller="<?= \tao_helpers_Uri::getBaseUrl() ?>views/js/controller/CompatibilityChecker/"
        data-main="<?= \tao_helpers_Uri::getBaseUrl() ?>views/js/index"
        data-config="<?= get_data('clientConfigUrl') ?>">
    </script>
    <script>
        (function () {
            var p = [], w = window, d = document, e = f = 0;
            p.push('ua=' + encodeURIComponent(navigator.userAgent));
            e |= w.ActiveXObject ? 1 : 0;
            e |= w.opera ? 2 : 0;
            e |= w.chrome ? 4 : 0;
            e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0;
            e |=
                ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
            e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
            p.push('e=' + e);
            f |= 'sandbox' in d.createElement('iframe') ? 1 : 0;
            f |= 'WebSocket' in w ? 2 : 0;
            f |= w.Worker ? 4 : 0;
            f |= w.applicationCache ? 8 : 0;
            f |= w.history && history.pushState ? 16 : 0;
            f |= d.documentElement.webkitRequestFullScreen ? 32 : 0;
            f |= 'FileReader' in w ? 64 : 0;
            p.push('f=' + f);
            p.push('r=' + Math.random().toString(36).substring(7));
            p.push('w=' + screen.width);
            p.push('h=' + screen.height);
            var s = d.createElement('script');
            s.src = '<?= \tao_helpers_Uri::url("whichBrowser","CompatibilityChecker","taoClientDiagnostic") ?>?' + p.join('&');
            d.getElementsByTagName('head')[0].appendChild(s);
        })();
    </script>
    <link rel='stylesheet' type='text/css' href="<?= Template::css('diagnostics.css') ?>"/>
    <?= tao_helpers_Scriptloader::render() ?>
    <?php if (($themeUrl = Layout::getThemeUrl()) !== null): ?>
        <link rel="stylesheet" href="<?= $themeUrl ?>"/>
    <?php endif; ?>

</head>

<body>
<div id="requirement-check" class="feedback-error js-hide">
    <span class="icon-error"></span>
    <span id="requirement-msg-area"><?=
        __('You must activate JavaScript in your browser to run this application.') ?></span>
</div>
<script src="<?= Template::js('layout/requirement-check.js', 'tao')?>"></script>

<div class="content-wrap">

    <?php Template::inc('blocks/header.tpl', 'tao'); ?>

    <div class="diagnostics-main-area">

        <h1><?= __('Diagnostic tool') ?></h1>

        <div class="intro">
            <p><?= __('This tool will run a number of tests in order to establish how well your current environment is suitable to run the TAO platform.') ?></p>
            <p><?= __('Be aware that these tests will take up to several minutes.') ?></p>
        </div>
        <div class="clearfix">
            <button data-action="test-launcher" class="btn-info small rgt"><?= __('Begin diagnostics') ?></button>
        </div>

        <ul class="plain">
            <li data-result="browser">
                <h2><?= __('Operating system and web browser') ?></h2>
                <div class="small feedback">
                    <span class="icon"></span>
                    <span class="msg"></span>
                </div>
            </li>
            <li data-result="performance">
                <h2><?= __('Workstation performance') ?></h2>
                <div>
                    <div class="small feedback">
                        <span class="icon"></span>
                        <span class="msg"></span>
                    </div>
                    <div class="quality-bar">
                        <div class="quality-indicator"></div>
                    </div>
                </div>
            </li>
            <li data-result="bandwidth-0">
                <h2><?= __('Bandwidth'); ?></h2>
                <div>
                    <div class="legend"><?= __('Number of simultaneous test takers the connection can handle'); ?></div>
                    <div class="small feedback">
                        <span class="icon"></span>
                        <span class="msg"></span>
                    </div>
                    <div class="quality-bar">
                        <div class="quality-indicator"></div>
                    </div>
                </div>
            </li>
            <li data-result="total">
                <h2><?= __('Total') ?></h2>
                <div>
                    <div class="small feedback">
                        <span class="icon"></span>
                        <span class="msg"></span>
                    </div>
                    <div class="quality-bar" data-result="total">
                        <div class="quality-indicator"></div>
                    </div>
                </div>
                <div class="clearfix">
                    <button data-action="display-details" class="rgt btn-info small"><?=
                        __('Show Details') ?></button>
                </div>
            </li>
            <li data-result="details">
                <h2><?= __('Details') ?></h2>
                <div>
                    <table class="matrix" id="details">
                        <tbody>
                        </tbody>
                    </table>
                </div>

            </li>
        </ul>

    </div>

</div>

<footer class="dark-bar">
    <?php
    if (!$val = Layout::getCopyrightNotice()):
        ?>
        © 2013 - <?= date('Y') ?> · <span class="tao-version"><?= TAO_VERSION_NAME ?></span> ·
        <a href="http://taotesting.com" target="_blank">Open Assessment Technologies S.A.</a>
        · <?= __('All rights reserved.') ?>
    <?php else: ?>
        <?= $val ?>
    <?php endif; ?>
    <?php $releaseMsgData = Layout::getReleaseMsgData();
    if ($releaseMsgData['is-unstable'] || $releaseMsgData['is-sandbox']): ?>
        <span class="rgt">
            <?php if ($releaseMsgData['is-unstable']): ?>
                <span class="icon-warning"></span>

            <?php endif; ?>
            <?= $releaseMsgData['version-type'] ?> ·
        <a href="<?= $releaseMsgData['link'] ?>" target="_blank"><?= $releaseMsgData['msg'] ?></a></span>

    <?php endif; ?>
</footer>
<div class="loading-bar"></div>
</body>
</html>
