<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
?>
<!doctype html>
<html class="no-js no-version-warning">
<head>
    <script src="<?= Template::js('lib/modernizr-2.8/modernizr.js', 'tao')?>"></script>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Layout::getTitle() ?></title>
    <link rel="shortcut icon" href="<?= Template::img('img/favicon.ico') ?>"/>

    <link rel='stylesheet' type='text/css' href="<?= Template::css('diagnostics.css') ?>"/>
    <?= tao_helpers_Scriptloader::render() ?>
    <?php if (($themeUrl = Layout::getThemeUrl()) !== null): ?>
    <link rel="stylesheet" href="<?= $themeUrl ?>"/>
    <?php endif; ?>
    <script
            id="amd-loader"
            src="<?= Template::js('lib/require.js', 'tao') ?>"
            data-controller="<?= \tao_helpers_Uri::getBaseUrl() ?>views/js/controller/CompatibilityChecker/"
            data-main="<?= \tao_helpers_Uri::getBaseUrl() ?>views/js/index"
            data-config="<?= get_data('clientConfigUrl') ?>">
    </script>
</head>

<body>
<div id="requirement-check" class="feedback-error js-hide">
    <span class="icon-error"></span>
    <span id="requirement-msg-area"><?=__('You must activate JavaScript in your browser to run this application.')?></span>
</div>
<script src="<?= Template::js('layout/requirement-check.js', 'tao')?>"></script>

<div class="content-wrap">

    <?php Template::inc('blocks/header.tpl', 'tao'); ?>


    <div id="feedback-box" data-error="<?= get_data('errorMessage') ?>" data-message="<?= get_data('message') ?>"></div>

    <div id="login-box" class="entry-point entry-point-container">
        <h1><?= __('Connect to the diagnostic tool')?></h1>
        <div class='xhtml_form'>
            <form method='post' id='loginForm' name='loginForm' action='<?= \tao_helpers_Uri::url("index","CompatibilityChecker","taoClientDiagnostic") ?>' >
                <div><label class='form_desc' for='login'><?= __('Login')?></label><input type='text' name='login' id='login'  autofocus='autofocus'  value="" /></div><div class='form-toolbar' ><input type='submit' id='connect' name='connect'  value="<?= __('Log in')?>"  /></div></form>
        </div>
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
            <?=$releaseMsgData['version-type']?> ·
        <a href="<?=$releaseMsgData['link']?>" target="_blank"><?=$releaseMsgData['msg']?></a></span>

    <?php endif; ?>
</footer>
<div class="loading-bar"></div>
</body>
</html>