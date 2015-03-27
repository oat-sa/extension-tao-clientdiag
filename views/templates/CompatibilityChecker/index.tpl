<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
?>
<!doctype html>
<html class="no-js">
<head>
    <script src="<?= Template::js('lib/modernizr-2.8/modernizr.js', 'tao')?>"></script>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Layout::getTitle() ?></title>
    <link rel="shortcut icon" href="<?= Template::img('img/favicon.ico') ?>"/>



    <script id="amd-loader" src="<?=Template::js('lib/require.js', 'tao')?>" data-controller="<?=BASE_WWW.'js/controller/CompatibilityChecker/'?>"
            data-main="<?=BASE_WWW.'js/index'?>" data-config="<?=get_data('clientConfigUrl')?>"></script>
    <link rel='stylesheet' type='text/css' href="<?=BASE_WWW?>css/check.css" />
    <?= tao_helpers_Scriptloader::render() ?>
</head>

<body>
<div id="requirement-check" class="feedback-error js-hide">
    <span class="icon-error"></span>
    <span class="requirement-msg-area"><?=__('You must activate JavaScript in your browser to run this application.')?></span>
</div>
<script src="<?= Template::js('layout/requirement-check.js', 'tao')?>"></script>

<div class="content-wrap">

    <?php /* alpha|beta|sandbox message */
        if(empty($_COOKIE['versionWarning'])) {
            Template::inc('blocks/version-warning.tpl', 'tao');
        }?>

    <?php Template::inc('blocks/header.tpl', 'tao'); ?>


        <div id="checker-box" class="entry-point entry-point-container">
            <h1>Outil de diagnostic</h1>
            <h1 class="index"><small>Syst&egrave;me d'exploitation et navigateur</small></h1>
            <button id="proceed" class="saver index btn btn-info small">Proc&eacute;der au diagnostic</button>
            <div id="os" class="col-6 hidden"><h1>Syst&egrave;me d'exploitation</h1></div>
            <div id="browser" class="col-6 hidden"><h1>Navigateur</h1></div>

            <p id="message" class="alert hidden"></p>
        </div>
</div>

<footer class="dark-bar">
    © 2013 - <?= date('Y') ?> · <span class="tao-version"><?= TAO_VERSION_NAME ?></span> ·
    <a href="http://taotesting.com" target="_blank">Open Assessment Technologies S.A.</a>
    · <?= __('All rights reserved.') ?>
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