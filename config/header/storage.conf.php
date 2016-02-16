<?php
/**
 * This configuration is for set storage processus
 *
 * By default, the storage is Sql. It accepts one optional parameter: the persistence driver
 *     return new oat\taoClientDiagnostic\model\storage\Sql(array(
            'persistence' => 'default'
 *     ));
 *
 * If you want to change to Csv, be aware of add csv filename as parameters
 *     return new oat\taoClientDiagnostic\model\storage\Csv(array(
 *          'filename' => FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'store.csv'
 *     ))
 */