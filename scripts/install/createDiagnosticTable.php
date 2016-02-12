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

namespace oat\taoClientDiagnostic\scripts\install;

class createDiagnosticTable
{
    public function __construct(array $params)
    {
        $persistenceName = $params['persistence'];
        $tables          = $params['tables'];

        $persistence = \common_persistence_Manager::getPersistence('default');
//        $schemaManager = $persistence->getSchemaManager();
//        $schema = $schemaManager->createSchema();
//        $fromSchema = clone $schema;
//
//        try {
//            foreach ($tables as $table) {
//                $tableSchema = $schema->createTable($table['name']);
//                $tableSchema->addOption('engine', 'MyISAM');
//                foreach($table['columns'] as $column) {
//                    if (empty($columns['options'])) {
//                        $tableSchema->addColumn($column['name'], $column['type']);
//                    } else {
//                        $tableSchema->addColumn($column['name'], $column['type'], $columns['options']);
//                    }
//                }
//                $tableSchema->setPrimaryKey($table['primaryKeys']);
//            }
//            $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
//            foreach ($queries as $query) {
//                $persistence->exec($query);
//            }
//        } catch (SchemaException $e) {
//            \common_Logger::w('Database Schema already up to date.');
//        }
    }
}