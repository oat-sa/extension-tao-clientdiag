<?php

namespace oat\taoClientDiagnostic\scripts\install;

use oat\oatbox\service\ServiceManager;
use oat\taoClientDiagnostic\model\storage\Sql;
use oat\taoClientDiagnostic\model\storage\Storage;

class setPersistence extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $persistence = \common_persistence_Manager::getPersistence('default');

        $persistence = 'default';
        $tables      = [
            'DiagnosticReport' => [
                'name' => 'diagnostic_report',
                'primaryKeys' => ['id'],
                'columns' => [
                    ['name' => 'id', 'type' => 'string', 'options' => ['length' => 16]],
                    ['name' =>'login', 'type' => 'string', 'options' => ['length' => 32]],
                    ['name' =>'ip', 'type' => 'string', 'options' => ['length' => 32]],
                    ['name' =>'browser', 'type' => 'string', 'options' => ['length' => 32]],
                    ['name' =>'browserVersion', 'type' => 'float'],
                    ['name' =>'os', 'type' => 'string', 'options' => ['length' => 32]],
                    ['name' =>'osVersion', 'type' => 'float'],
                    ['name' =>'compatible', 'type' => 'boolean'],
                    ['name' =>'version', 'type' => 'float'],
                    ['name' =>'bandwidth_min', 'type' => 'float'],
                    ['name' =>'bandwidth_max', 'type' => 'float'],
                    ['name' =>'bandwidth_sum', 'type' => 'float'],
                    ['name' =>'bandwidth_count', 'type' => 'integer', 'options' => ['length' => 16]],
                    ['name' =>'bandwidth_average', 'type' => 'float'],
                    ['name' =>'bandwidth_median', 'type' => 'float'],
                    ['name' =>'bandwidth_variance', 'type' => 'float'],
                    ['name' =>'bandwidth_duration', 'type' => 'float'],
                    ['name' =>'bandwidth_size', 'type' => 'integer', 'options' => ['length' => 16]],
                    ['name' =>'performance_min', 'type' => 'float'],
                    ['name' =>'performance_max', 'type' => 'float'],
                    ['name' =>'performance_sum', 'type' => 'float'],
                    ['name' =>'performance_count', 'type' => 'integer', 'options' => ['length' => 16]],
                    ['name' =>'performance_average', 'type' => 'float'],
                    ['name' =>'performance_median', 'type' => 'float'],
                    ['name' =>'performance_variance', 'type' => 'float'],
                    ['name' =>'created_at', 'type' => 'datetime', 'options' => ['default' => 'CURRENT_TIMESTAMP']],
                ],
            ]
        ];

        new createDiagnosticTable([
            'persistence' => $persistence,
            'tables'      => $tables
        ]);

        foreach($tables as $entity => $table) {
            $settings[$entity] = $table['name'];
        }
        $serviceManager = ServiceManager::getServiceManager();
        $storage = new Sql($settings);
        $storage->setServiceManager($serviceManager);
        $serviceManager->register(Storage::SERVICE_ID, $storage);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'all ok');
    }
}