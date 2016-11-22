<?php

namespace oat\taoClientDiagnostic\model\storage;

/**
 * Interface Storage
 * @package oat\taoClientDiagnostic\model\storage
 */
interface Storage
{
    const SERVICE_ID = 'taoClientDiagnostic/storage';

    /**
     * All columns of diagnostic storage
     */
    const DIAGNOSTIC_ID                   = 'id';
    const DIAGNOSTIC_LOGIN                = 'login';
    const DIAGNOSTIC_IP                   = 'ip';
    const DIAGNOSTIC_BROWSER              = 'browser';
    const DIAGNOSTIC_BROWSERVERSION       = 'browser_version';
    const DIAGNOSTIC_OS                   = 'os';
    const DIAGNOSTIC_OSVERSION            = 'os_version';
    const DIAGNOSTIC_COMPATIBLE           = 'compatible';
    const DIAGNOSTIC_VERSION              = 'version';
    const DIAGNOSTIC_BANDWIDTH_MIN        = 'bandwidth_min';
    const DIAGNOSTIC_BANDWIDTH_MAX        = 'bandwidth_max';
    const DIAGNOSTIC_BANDWIDTH_SUM        = 'bandwidth_sum';
    const DIAGNOSTIC_BANDWIDTH_COUNT      = 'bandwidth_count';
    const DIAGNOSTIC_BANDWIDTH_AVERAGE    = 'bandwidth_average';
    const DIAGNOSTIC_BANDWIDTH_MEDIAN     = 'bandwidth_median';
    const DIAGNOSTIC_BANDWIDTH_VARIANCE   = 'bandwidth_variance';
    const DIAGNOSTIC_BANDWIDTH_DURATION   = 'bandwidth_duration';
    const DIAGNOSTIC_BANDWIDTH_SIZE       = 'bandwidth_size';
    const DIAGNOSTIC_PERFORMANCE_MIN      = 'performance_min';
    const DIAGNOSTIC_PERFORMANCE_MAX      = 'performance_max';
    const DIAGNOSTIC_PERFORMANCE_SUM      = 'performance_sum';
    const DIAGNOSTIC_PERFORMANCE_COUNT    = 'performance_count';
    const DIAGNOSTIC_PERFORMANCE_AVERAGE  = 'performance_average';
    const DIAGNOSTIC_PERFORMANCE_MEDIAN   = 'performance_median';
    const DIAGNOSTIC_PERFORMANCE_VARIANCE = 'performance_variance';
    const DIAGNOSTIC_CREATED_AT           = 'created_at';
    const DIAGNOSTIC_UPLOAD_MAX           = 'upload_max';
    const DIAGNOSTIC_UPLOAD_AVG           = 'upload_avg';

    /**
     * Store data into storage model based on entity
     * It should support insert or update
     * @param $id
     * @param $data
     * @return mixed
     */
    public function store($id, $data);
}