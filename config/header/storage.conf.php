<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *  
 * Copyright (c) 2016 Open Assessment Technologies SA
 */



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
