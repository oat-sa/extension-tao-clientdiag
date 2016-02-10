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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 *
 */
require __DIR__ . '/../../../vendor/autoload.php';
//namespace oat\taoClientDiagnostic\scripts\install;

use oat\taoClientDiagnostic\model\storage\Sql;
use oat\oatbox\action\Action;

class createDiagnosticTable implements Action
{
    public function __invoke($params)
    {
        // create Table now
        self::createTable();
        // and after every newly installed extension
        $this->registerEvent('common_ext_event_ExtensionInstalled', array(__CLASS__, 'createTable'));
    }

    public static function createTable()
    {

        $persistence = \common_persistence_Manager::getPersistence('default');

        $schemaManager = $persistence->getDriver()->getSchemaManager();
        $schema = $schemaManager->createSchema();
        $fromSchema = clone $schema;

        try {
            $tableDiagnosticReport = $schema->createtable(Sql::STORAGE_TABLE);
            $tableDiagnosticReport->addOption('engine', 'MyISAM');

            $tableDiagnosticReport->addColumn('id', 'string', array('length' => 16));
            $tableDiagnosticReport->addColumn('login', 'string', array('length' => 32));
            $tableDiagnosticReport->addColumn('ip', 'string', array('length' => 32));
            $tableDiagnosticReport->addColumn('browser', 'string', array('length' => 32));
            $tableDiagnosticReport->addColumn('browserVersion', 'float');
            $tableDiagnosticReport->addColumn('os', 'string', array('length' => 32));
            $tableDiagnosticReport->addColumn('osVersion', 'float');
            $tableDiagnosticReport->addColumn('compatible', 'boolean');
            $tableDiagnosticReport->addColumn('version', 'float');

            $tableDiagnosticReport->addColumn('bandwidth_min', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_max', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_sum', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_count', 'integer', array('length' => 16));
            $tableDiagnosticReport->addColumn('bandwidth_average', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_median', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_variance', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_duration', 'float');
            $tableDiagnosticReport->addColumn('bandwidth_size', 'integer', array('length' => 16));

            $tableDiagnosticReport->addColumn('performance_min', 'float');
            $tableDiagnosticReport->addColumn('performance_max', 'float');
            $tableDiagnosticReport->addColumn('performance_sum', 'float');
            $tableDiagnosticReport->addColumn('performance_count', 'integer', array('length' => 16));
            $tableDiagnosticReport->addColumn('performance_average', 'float');
            $tableDiagnosticReport->addColumn('performance_median', 'float');
            $tableDiagnosticReport->addColumn('performance_variance', 'float');

            $tableDiagnosticReport->addColumn('created_at', 'time', array('default' => 'CURRENT_TIMESTAMP'));

            $tableDiagnosticReport->setPrimaryKey(array('id'));

        } catch (SchemaException $e) {
            \common_Logger::i('Database Schema already up to date.');
        }

        $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
        foreach ($queries as $query) {
            $persistence->exec($query);
        }
    }
}

$test = new createDiagnosticTable();
$test(array());