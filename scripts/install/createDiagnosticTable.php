<?php

namespace oat\taoClientDiagnostic\scripts\install;

use oat\taoClientDiagnostic\model\storage\Sql;
use Doctrine\DBAL\Schema\SchemaException;

class createDiagnosticTable extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $SqlService = new Sql();
        $persistence = $SqlService->getPersistence();

        $schemaManager = $persistence->getDriver()->getSchemaManager();
        $schema = $schemaManager->createSchema();
        $fromSchema = clone $schema;

        try {
            $tableResults = $schema->createtable(Sql::DIAGNOSTIC_TABLE);
            $tableResults->addOption('engine', 'MyISAM');

            $tableResults->addColumn(Sql::DIAGNOSTIC_ID, 'string', ['length' => 16]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_LOGIN, 'string', ['length' => 32]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_IP, 'string', ['length' => 32]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_BROWSER, 'string', ['length' => 32]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_BROWSERVERSION, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_OS, 'string', ['length' => 32]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_OSVERSION, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_COMPATIBLE, 'boolean');
            $tableResults->addColumn(Sql::DIAGNOSTIC_VERSION, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_MIN, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_MAX, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_SUM, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_COUNT, 'integer', ['length' => 16]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_AVERAGE, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_MEDIAN, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_VARIANCE, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_DURATION, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_BANDWIDTH_SIZE, 'integer', ['length' => 16]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_MIN, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_MAX, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_SUM, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_COUNT, 'integer', ['length' => 16]);
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_AVERAGE, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_MEDIAN, 'float');
            $tableResults->addColumn(Sql::DIAGNOSTIC_PERFORMANCE_VARIANCE, 'float');
            $tableResults->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP']);

            $tableResults->setPrimaryKey(array(Sql::DIAGNOSTIC_ID));

            $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
            foreach ($queries as $query) {
                $persistence->exec($query);
            }

        } catch(SchemaException $e) {
            \common_Logger::i('Database Schema already up to date.');
        }
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Diagnostic successfully created');
    }
}