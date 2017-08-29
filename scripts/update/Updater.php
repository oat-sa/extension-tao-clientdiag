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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoClientDiagnostic\scripts\update;

use Doctrine\DBAL\Types\Type;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\user\TaoRoles;
use oat\tao\scripts\update\OntologyUpdater;
use oat\taoClientDiagnostic\controller\Diagnostic;
use oat\taoClientDiagnostic\controller\DiagnosticChecker;
use oat\taoClientDiagnostic\model\authorization\Authorization;
use oat\taoClientDiagnostic\model\authorization\RequireUsername;
use oat\taoClientDiagnostic\model\ClientDiagnosticRoles;
use oat\taoClientDiagnostic\model\storage\Csv;
use oat\taoClientDiagnostic\model\storage\PaginatedSqlStorage;
use oat\taoClientDiagnostic\model\storage\PaginatedStorage;
use oat\taoClientDiagnostic\model\storage\Sql;
use oat\taoClientDiagnostic\model\storage\Storage;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticService;

class Updater extends \common_ext_ExtensionUpdater
{

    /**
     * Update platform at version jump
     *
     * @param string $initialVersion
     * @return string $versionUpdatedTo
     */
    public function update($initialVersion)
    {

        $currentVersion = $initialVersion;
        if ($currentVersion == '1.0') {
            $currentVersion = '1.0.1';
        }

        if ($currentVersion == '1.0.1') {

            $currentVersion = '1.1.0';
        }

        if ($currentVersion == '1.1.0') {
            AclProxy::applyRule(new AccessRule(
                AccessRule::GRANT,
                TaoRoles::ANONYMOUS,
                ['ext' => 'taoClientDiagnostic' , 'mod' => 'CompatibilityChecker']
            ));

            $currentVersion = '1.1.1';
        }

        if ($currentVersion == '1.1.1') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $extension->setConfig('clientDiag', array(
                'footer' => '',
            ));

            $currentVersion = '1.2.0';
        }

        if ($currentVersion == '1.2.0') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $config = $extension->getConfig('clientDiag');
            $extension->setConfig('clientDiag', array_merge($config, array(
                'performances' => array(
                    'samples' => array(
                        'taoClientDiagnostic/tools/performances/data/sample1/',
                        'taoClientDiagnostic/tools/performances/data/sample2/',
                        'taoClientDiagnostic/tools/performances/data/sample3/'
                    ),
                    'occurrences' => 10,
                    'timeout' => 30,
                    'optimal' => 0.025,
                    'threshold' => 0.25,
                ),
                'bandwidth' => array(
                    'unit' => 0.16,
                    'ideal' => 45,
                    'max' => 100,
                ),
            )));

            $currentVersion = '1.3.0';
        }

        $this->setVersion($currentVersion);

        if($this->isVersion('1.3.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $config = $extension->getConfig('clientDiag');
            $extension->setConfig('clientDiag', array_merge($config, array(
                'diagHeader' => 'This tool will run a number of tests in order to establish how well your current environment is suitable to run the TAO platform.',
            )));

            $this->setVersion('1.3.1');
        }

        if($this->isVersion('1.3.1')) {
            AclProxy::applyRule(new AccessRule(
                AccessRule::GRANT,
                TaoRoles::ANONYMOUS,
                ['ext' => 'taoClientDiagnostic' , 'mod' => 'Authenticator']
            ));

            if (!$this->getServiceManager()->has(Authorization::SERVICE_ID)) {
                $service = new RequireUsername();
                $service->setServiceManager($this->getServiceManager());
                $this->getServiceManager()->register(Authorization::SERVICE_ID, $service);
            }

            $this->setVersion('1.4.0');
        }

        if($this->isVersion('1.4.0')) {
            $service = $this->getServiceManager()->get(Authorization::SERVICE_ID);

            if ($service instanceof RequireUsername) {
                $service = new RequireUsername(array(
                    'regexValidator' => '/^[0-9]{7}[A-Z]$/'
                ));
                $service->setServiceManager($this->getServiceManager());
                $this->getServiceManager()->register(Authorization::SERVICE_ID, $service);
            }

            $this->setVersion('1.4.1');
        }

        if($this->isVersion('1.4.1')) {
            if (!$this->getServiceManager()->has(Storage::SERVICE_ID)) {
                $service = new Csv(array(
                    'filename' => FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'store.csv'
                ));
                $service->setServiceManager($this->getServiceManager());
                $this->getServiceManager()->register(Storage::SERVICE_ID, $service);
            }

            $this->setVersion('1.5.0');
        }

        $this->skip('1.5.0', '1.6.0');

        if ($this->isVersion('1.6.0')) {
            $storageService  = $this->getServiceManager()->get(Storage::SERVICE_ID);

            if ($storageService instanceof Sql) {
                $persistence = $storageService->getPersistence();

                $schemaManager = $persistence->getDriver()->getSchemaManager();
                $schema = $schemaManager->createSchema();

                $fromSchema = clone $schema;

                /** @var \Doctrine\DBAL\Schema\Table $tableResults */
                $tableResults = $schema->getTable(Sql::DIAGNOSTIC_TABLE);

                $tableResults->dropColumn('browserVersion');
                $tableResults->dropColumn('osVersion');

                $tableResults->addColumn(Sql::DIAGNOSTIC_BROWSERVERSION, 'string', ['length' => 32]);
                $tableResults->addColumn(Sql::DIAGNOSTIC_OSVERSION, 'string', ['length' => 32]);

                $tableResults->changeColumn(Sql::DIAGNOSTIC_VERSION, ['type' => Type::getType('string'), 'length' => 16]);

                $tableResults->changeColumn(Sql::DIAGNOSTIC_BROWSER, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_OS, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_COMPATIBLE, ['notnull' => false]);


                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_MIN, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_MAX, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_SUM, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_COUNT, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_AVERAGE, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_MEDIAN, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_VARIANCE, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_DURATION, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BANDWIDTH_SIZE, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_MIN, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_MAX, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_SUM, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_COUNT, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_AVERAGE, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_MEDIAN, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_PERFORMANCE_VARIANCE, ['notnull' => false]);


                $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }
            }

            $this->setVersion('1.6.1');
        }

        $this->skip('1.6.1', '1.7.0');

        if ($this->isVersion('1.7.0')) {
            $storageService  = $this->getServiceManager()->get(Storage::SERVICE_ID);

            if ($storageService instanceof Sql) {
                $persistence = $storageService->getPersistence();

                $schemaManager = $persistence->getDriver()->getSchemaManager();
                $schema = $schemaManager->createSchema();

                /* create temp column && Nullable os,browser version */
                $addTempSchema = clone $schema;
                $tableResults = $addTempSchema->getTable(Sql::DIAGNOSTIC_TABLE);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_BROWSERVERSION, ['notnull' => false]);
                $tableResults->changeColumn(Sql::DIAGNOSTIC_OSVERSION   , ['notnull' => false]);
                $tableResults->addColumn('compatible_tmp', 'integer', ['length' => 1, 'notnull' => false]);
                $queries = $persistence->getPlatform()->getMigrateSchemaSql($schema, $addTempSchema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }

                /* Migrate data to temp column */
                $sql =  'SELECT ' . Sql::DIAGNOSTIC_ID . ', ' .Sql::DIAGNOSTIC_COMPATIBLE .
                        ' FROM ' . Sql::DIAGNOSTIC_TABLE;
                $stmt = $persistence->query($sql);
                $results = $stmt->fetchAll();

                foreach ($results as $result) {

                    if ($result['compatible']===true || $result['compatible']==1) {
                        $compatible = 1;
                    } elseif ($result['compatible']===false || $result['compatible']==0) {
                        $compatible = 0;
                    } else {
                        $compatible = (int) $result['compatible'];
                    }

                    $sql = 'UPDATE ' . Sql::DIAGNOSTIC_TABLE .
                           ' SET compatible_tmp = :compatible'.
                           ' WHERE ' . Sql::DIAGNOSTIC_ID . ' = :id';
                    $persistence->exec($sql, array(
                        'compatible' => $compatible,
                        'id' => $result['id']
                    ));
                }

                /* delete compatible boolean column */
                $deleteCompatibleSchema = clone $addTempSchema;
                $tableResults = $deleteCompatibleSchema->getTable(Sql::DIAGNOSTIC_TABLE);
                $tableResults->dropColumn(Sql::DIAGNOSTIC_COMPATIBLE);
                $queries = $persistence->getPlatform()->getMigrateSchemaSql($addTempSchema, $deleteCompatibleSchema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }

                /* create compatible integer column */
                $addCompatibleSchema = clone $deleteCompatibleSchema;
                $tableResults = $addCompatibleSchema->getTable(Sql::DIAGNOSTIC_TABLE);
                $tableResults->addColumn(Sql::DIAGNOSTIC_COMPATIBLE, 'integer', ['length' => 1, 'notnull' => false]);
                $queries = $persistence->getPlatform()->getMigrateSchemaSql($deleteCompatibleSchema, $addCompatibleSchema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }

                /* migrate date to compatible column */
                $sql = 'UPDATE ' . Sql::DIAGNOSTIC_TABLE .
                    ' SET ' . Sql::DIAGNOSTIC_COMPATIBLE . ' = compatible_tmp';
                $persistence->exec($sql);

                /* delete temp column */
                $deleteTempSchema = clone $addCompatibleSchema;
                $tableResults = $deleteTempSchema->getTable(Sql::DIAGNOSTIC_TABLE);
                $tableResults->dropColumn('compatible_tmp');
                $queries = $persistence->getPlatform()->getMigrateSchemaSql($addCompatibleSchema, $deleteTempSchema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }
            }

            $this->setVersion('1.7.1');
        }

        $this->skip('1.7.1', '1.9.1');

        if ($this->isVersion('1.9.1')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $config = $extension->getConfig('clientDiag');
            $config['upload'] =[
                'size' => 1 * 1024 * 1024,
                'optimal' => 1 * 1024 * 1024,
            ];
            $extension->setConfig('clientDiag', $config);
            $this->setVersion('1.10.0');
        }

        $this->skip('1.10.0', '1.10.1');

        if($this->isVersion('1.10.1')){

            $storageService  = $this->getServiceManager()->get(Storage::SERVICE_ID);

            if ($storageService instanceof Sql) {
                $persistence = $storageService->getPersistence();
                $schemaManager = $persistence->getDriver()->getSchemaManager();
                $schema = $schemaManager->createSchema();

                $fromSchema = clone $schema;

                /** @var \Doctrine\DBAL\Schema\Table $tableResults */
                $tableResults = $schema->getTable(Sql::DIAGNOSTIC_TABLE);

                $tableResults->addColumn(Sql::DIAGNOSTIC_UPLOAD_MAX, 'float', ['notnull' => false]);
                $tableResults->addColumn(Sql::DIAGNOSTIC_UPLOAD_AVG, 'float', ['notnull' => false]);

                $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }
            }

            $this->setVersion('1.10.2');
        }

        $this->skip('1.10.2', '1.13.2');

        if ($this->isBetween('1.11.0', '1.15.1')) {
            $service = $this->safeLoadService(Storage::SERVICE_ID);
            if (!$service instanceof Storage) {
                // invalid Service, replace with default
                $this->getServiceManager()->register(Storage::SERVICE_ID, new PaginatedSqlStorage($service->getOptions()));
            }
        }

        if ($this->isVersion('1.13.2')) {

            $storageService  = $this->getServiceManager()->get(Storage::SERVICE_ID);

            if ($storageService instanceof Sql) {

                if (! $storageService instanceof PaginatedStorage) {
                    $paginatedStorage = new PaginatedSqlStorage($storageService->getOptions());
                    $this->getServiceManager()->register(Storage::SERVICE_ID, $paginatedStorage);
                }

                $persistence   = $storageService->getPersistence();
                $schema        = $persistence->getDriver()->getSchemaManager()->createSchema();

                $fromSchema = clone $schema;
                $tableResults = $schema->getTable(Sql::DIAGNOSTIC_TABLE);

                if (! $tableResults->hasColumn(PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION)) {
                    $tableResults->addColumn(PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION, 'string', ['length' => 64, 'notnull' => false]);
                    $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
                    foreach ($queries as $query) {
                        $persistence->exec($query);
                    }
                }
            }

            $this->setVersion('1.14.0');
        }

        $this->skip('1.14.0', '1.14.1');

        if ($this->isVersion('1.14.1')) {
            OntologyUpdater::syncModels();
            AclProxy::applyRule(new AccessRule(AccessRule::GRANT, ClientDiagnosticRoles::READINESS_CHECKER_ROLE, Diagnostic::class));
            AclProxy::applyRule(new AccessRule(AccessRule::GRANT, ClientDiagnosticRoles::READINESS_CHECKER_ROLE, DiagnosticChecker::class));
            $this->setVersion('1.14.2');
        }

        $this->skip('1.14.2', '1.14.3');

        if ($this->isVersion('1.14.3')) {
            $storageService  = $this->getServiceManager()->get(Storage::SERVICE_ID);
            if ($storageService instanceof Sql) {
                $persistence   = $storageService->getPersistence();
                $schema        = $persistence->getDriver()->getSchemaManager()->createSchema();
                $fromSchema = clone $schema;
                $tableResults = $schema->getTable(Sql::DIAGNOSTIC_TABLE);

                if (! $tableResults->hasColumn(PaginatedSqlStorage::DIAGNOSTIC_CONTEXT_ID)) {
                    $tableResults->addColumn(PaginatedSqlStorage::DIAGNOSTIC_CONTEXT_ID, 'string', ['length' => 256, 'notnull' => false]);
                    $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
                    foreach ($queries as $query) {
                        $persistence->exec($query);
                    }
                }
            }

            $this->setVersion('1.15.0');
        }

        $this->skip('1.15.0', '2.0.1');

        if ($this->isVersion('2.0.1')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $config = $extension->getConfig('clientDiag');
            $newConfig = [
                'diagHeader' => $config['diagHeader'],
                'footer' => $config['footer'],
                'testers' => [],
            ];

            if (isset($config['performances'])) {
                $performance = $config['performances'];
                $performance['tester'] = 'taoClientDiagnostic/tools/performances/tester';
                $newConfig['testers']['performance'] = $performance;
            }
            if (isset($config['bandwidth'])) {
                $bandwidth = $config['bandwidth'];
                $bandwidth['tester'] = 'taoClientDiagnostic/tools/bandwidth/tester';
                $newConfig['testers']['bandwidth'] = $bandwidth;
            }
            if (isset($config['upload'])) {
                $upload = $config['upload'];
                $upload['tester'] = 'taoClientDiagnostic/tools/upload/tester';
                $newConfig['testers']['upload'] = $upload;
            }

            $newConfig['testers']['browser'] = [
                'tester' => 'taoClientDiagnostic/tools/browser/tester',
            ];

            $extension->setConfig('clientDiag', $newConfig);
            $this->setVersion('2.1.0');
        }

		if ($this->isVersion('2.1.0')) {
            $storageService  = $this->getServiceManager()->get(Storage::SERVICE_ID);

            if ($storageService instanceof Sql) {
                $persistence = $storageService->getPersistence();

                $schemaManager = $persistence->getDriver()->getSchemaManager();
                $schema = $schemaManager->createSchema();

                /* create temp column && Nullable os,browser version */
                $addTempSchema = clone $schema;
                $tableResults = $addTempSchema->getTable(Sql::DIAGNOSTIC_TABLE);
                $tableResults->addColumn(Sql::DIAGNOSTIC_USER_ID, 'string', ['length' => 255, 'notnull' => false]);
                $queries = $persistence->getPlatform()->getMigrateSchemaSql($schema, $addTempSchema);
                foreach ($queries as $query) {
                    $persistence->exec($query);
                }
            }

            $this->setVersion('2.2.0');
        }

        $this->skip('2.2.0', '2.3.0');

        if ($this->isVersion('2.3.0')) {
            $this->getServiceManager()->register(DiagnosticService::SERVICE_ID, new DiagnosticService());
            $this->setVersion('2.4.0');
        }

        $this->skip('2.4.0', '2.5.6');
    }
}
