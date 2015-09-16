<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
$config = get_data('clientDiagConfig');
?>
<footer class="dark-bar">
    <?php if (!$val = Layout::getCopyrightNotice()): ?>
        <?php if (!empty($config['footer'])): ?>
            <?= $config['footer']; ?>
        <?php else: ?>
            © 2013 - <?= date('Y') ?> · <span class="tao-version"><?= TAO_VERSION_NAME ?></span>
        <?php endif; ?>
        · <a href="http://taotesting.com" target="_blank">Open Assessment Technologies S.A.</a>
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
