<?php
/**
 * This configuration is for set storage processus
 *
 *
 *  ### SQL ###
 *
 * By default, the storage is Sql. It accepts one optional parameter: the persistence driver
 *     return new oat\taoClientDiagnostic\model\storage\Sql(array(
 *          'persistence' => 'default'
 *     ));
 *
 * WARNING: in case of install to SQL you need to update manifest in install section:
 * [...]
 *      'install' => array(
 *          'php' => array(
 *              [...]
 *              'oat\taoClientDiagnostic\scripts\install\createDiagnosticTable',
 *          )
 *      ),
 * [...]
 * For update, add this script to updater:
 *     $script = new oat\taoClientDiagnostic\scripts\install\createDiagnosticTable();
 *     $script();
 *
 *
 *
 *
 *  ### CSV ###
 *
 * If you want to change to Csv, be aware of add csv filename as parameters
 *     return new oat\taoClientDiagnostic\model\storage\Csv(array(
 *          'filename' => FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'store.csv'
 *     ))
 *
 * WARNING: in case of install to CSV you need to update manifest in install section:
 * [...]
 *      'install' => array(
 *          'php' => array(
 *              [...]
 *              dirname(__FILE__) . '/scripts/install/createSaveDirectory.php',
 *          )
 *      ),
 * [...]
 * For update, add this script to updater
 */