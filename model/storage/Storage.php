<?php

namespace oat\taoClientDiagnostic\model\storage;

use oat\oatbox\service\ConfigurableService;

abstract class Storage extends ConfigurableService
{
    const SERVICE_ID = 'taoClientDiagnostic/storage';

    protected $data;

    protected $columns = array(
        'id'                   => '',
        'login'                => '',
        'ip'                   => '',
        'browser'              => '',
        'browserVersion'       => '',
        'os'                   => '',
        'osVersion'            => '',
        'bandwidth_min'        => '',
        'bandwidth_max'        => '',
        'bandwidth_sum'        => '',
        'bandwidth_count'      => '',
        'bandwidth_average'    => '',
        'bandwidth_median'     => '',
        'bandwidth_variance'   => '',
        'bandwidth_duration'   => '',
        'bandwidth_size'       => '',
        'performance_min'      => '',
        'performance_max'      => '',
        'performance_sum'      => '',
        'performance_count'    => '',
        'performance_average'  => '',
        'performance_median'   => '',
        'performance_variance' => '',
        'compatible'           => '',
    );

    public abstract function store();

    public function setData(array $data)
    {
        $this->data = $data;
    }
}