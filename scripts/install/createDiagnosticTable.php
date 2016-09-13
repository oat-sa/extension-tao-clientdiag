<?php

namespace oat\taoClientDiagnostic\scripts\install;

use oat\taoClientDiagnostic\model\storage\Sql;
use Doctrine\DBAL\Schema\SchemaException;

$persistence = \common_persistence_Manager::getPersistence('default');


$schemaManager = $persistence->getDriver()->getSchemaManager();
$schema = $schemaManager->createSchema();
$fromSchema = clone $schema;

try {
    $tableResults = $schema->createtable(Sql::DIAGNOSTIC_TABLE);
    $tableResults->addOption('engine', 'MyISAM');

    $tableResults->addColumn(Sql::DIAGNOSTIC_ID, 'string', ['length' => 16]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_LOGIN, 'string', ['length' => 32]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_IP, 'string', ['length' => 32]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BROWSER, 'string', ['length' => 32,'notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BROWSERVERSION, 'string', ['length' => 32]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_OS, 'string', ['length' => 32, 'notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_OSVERSION, 'string', ['length' => 32]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_COMPATIBLE, 'boolean', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_VERSION, 'string', ['length' => 16]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_MIN, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_MAX, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_SUM, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_COUNT, 'integer', ['length' => 16, 'notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_AVERAGE, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_MEDIAN, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_VARIANCE, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_DURATION, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_SIZE, 'integer', ['length' => 16, 'notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_MIN, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_MAX, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_SUM, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_COUNT, 'integer', ['length' => 16, 'notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_AVERAGE, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_MEDIAN, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_VARIANCE, 'float', ['notnull' => false]);
    $tableResults->addColumn(Sql::DIAGNOSTIC_CREATED_AT, 'datetime');

    $tableResults->setPrimaryKey(array(Sql::DIAGNOSTIC_ID));

    $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
    foreach ($queries as $query) {
        $persistence->exec($query);
    }

} catch(SchemaException $e) {
    \common_Logger::i('Database Schema already up to date.');
}
\common_Logger::i('Diagnostic successfully created');
    