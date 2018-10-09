<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
use oat\tao\model\theme\Theme;
?>

<!doctype html>
<html class="no-js no-version-warning">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Layout::getTitle() ?></title>
    <link rel="shortcut icon" href="<?= Template::img('img/favicon.ico', 'tao') ?>"/>

    <?= tao_helpers_Scriptloader::render() ?>

    <?= Layout::getAmdLoader(
        Template::js('loader/taoClientDiagnostic.min.js', 'taoClientDiagnostic'),
        get_data('content-controller'),
        get_data('content-config'),
        true
    ) ?>

    <link rel="stylesheet" href="<?= Layout::getThemeStylesheet(Theme::CONTEXT_FRONTOFFICE) ?>"/>
</head>

<body>

<?php Template::inc('blocks/requirement-check.tpl', 'tao'); ?>

<div class="content-wrap">

    <?php Template::inc('blocks/header.tpl', 'tao'); ?>

    <div id="feedback-box" data-error="<?= get_data('errorMessage') ?>" data-message="<?= get_data('message') ?>"></div>

    <?php Template::inc(get_data('content-template')); ?>

</div>

<?= Layout::renderThemeTemplate(Theme::CONTEXT_FRONTOFFICE, 'footer') ?>

<div class="loading-bar"></div>
</body>
</html>
