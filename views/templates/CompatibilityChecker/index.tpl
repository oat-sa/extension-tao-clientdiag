<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
use oat\tao\model\theme\Theme;
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

    <script id="amd-loader"
        <?php if(\tao_helpers_Mode::is('production')): ?>
            src="<?= Template::js('loader/bootstrap.min.js', 'taoClientDiagnostic') ?>"
            data-bundle="taoClientDiagnostic/controllers.min"
        <?php else : ?>
            src="<?= Template::js('lib/require.js', 'tao') ?>"
            data-main="<?= Template::js('loader/bootstrap.js', 'taoClientDiagnostic'); ?>"
        <?php endif ?>
            data-config="<?= get_data('client-config-url') ?>"
            data-controller="<?= get_data('content-controller') ?>"
            data-params="<?= _dh(json_encode(get_data('content-config'))); ?>"
    ></script>

    <link rel='stylesheet' type='text/css' href="<?= Template::css('diagnostics.css') ?>"/>
    <?= tao_helpers_Scriptloader::render() ?>
    <link rel="stylesheet" href="<?= Layout::getThemeStylesheet(Theme::CONTEXT_FRONTOFFICE) ?>"/>

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

    <div id="feedback-box" data-error="<?= get_data('errorMessage') ?>" data-message="<?= get_data('message') ?>"></div>

    <?php Template::inc(get_data('content-template')); ?>

</div>

<?= Layout::renderThemeTemplate(Theme::CONTEXT_FRONTOFFICE, 'footer') ?>

<div class="loading-bar"></div>
</body>
</html>
