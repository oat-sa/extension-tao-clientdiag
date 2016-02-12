<?php
/**
 * This configuration is for set storage processus
 *
 * By default, the storage is Sql
 *     return new oat\taoClientDiagnostic\model\storage\Sql();
 *
 * If you want to change to Csv, be aware of add csv filename as parameters
 *     return new oat\taoClientDiagnostic\model\storage\Csv(array(
 *          'filename' => FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'store.csv'
 *     )
 */