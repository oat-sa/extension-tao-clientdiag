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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
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
    const DIAGNOSTIC_CONTEXT_ID           = 'context_id';
    const DIAGNOSTIC_USER_ID              = 'user_id';
    const DIAGNOSTIC_LOGIN                = 'login';
    const DIAGNOSTIC_IP                   = 'ip';
    const DIAGNOSTIC_WORKSTATION          = 'workstation';
    const DIAGNOSTIC_SCHOOL_NAME          = 'school_name';
    const DIAGNOSTIC_SCHOOL_NUMBER        = 'school_number';
    const DIAGNOSTIC_FINGERPRINT_UUID     = 'fingerprint_uuid';
    const DIAGNOSTIC_FINGERPRINT_VALUE    = 'fingerprint_value';
    const DIAGNOSTIC_FINGERPRINT_DETAILS  = 'fingerprint_details';
    const DIAGNOSTIC_FINGERPRINT_ERRORS   = 'fingerprint_errors';
    const DIAGNOSTIC_FINGERPRINT_CHANGED  = 'fingerprint_changed';
    const DIAGNOSTIC_BROWSER              = 'browser';
    const DIAGNOSTIC_BROWSERVERSION       = 'browser_version';
    const DIAGNOSTIC_OS                   = 'os';
    const DIAGNOSTIC_OSVERSION            = 'os_version';
    const DIAGNOSTIC_COMPATIBLE           = 'compatible';
    const DIAGNOSTIC_VERSION              = 'version';
    const DIAGNOSTIC_SCREEN_WIDTH         = 'screen_width';
    const DIAGNOSTIC_SCREEN_HEIGHT        = 'screen_height';
    const DIAGNOSTIC_BANDWIDTH_MIN        = 'bandwidth_min';
    const DIAGNOSTIC_BANDWIDTH_MAX        = 'bandwidth_max';
    const DIAGNOSTIC_BANDWIDTH_SUM        = 'bandwidth_sum';
    const DIAGNOSTIC_BANDWIDTH_COUNT      = 'bandwidth_count';
    const DIAGNOSTIC_BANDWIDTH_AVERAGE    = 'bandwidth_average';
    const DIAGNOSTIC_BANDWIDTH_MEDIAN     = 'bandwidth_median';
    const DIAGNOSTIC_BANDWIDTH_VARIANCE   = 'bandwidth_variance';
    const DIAGNOSTIC_BANDWIDTH_DURATION   = 'bandwidth_duration';
    const DIAGNOSTIC_BANDWIDTH_SIZE       = 'bandwidth_size';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_MIN        = 'intensive_bandwidth_min';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_MAX        = 'intensive_bandwidth_max';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_SUM        = 'intensive_bandwidth_sum';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_COUNT      = 'intensive_bandwidth_count';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_AVERAGE    = 'intensive_bandwidth_average';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_MEDIAN     = 'intensive_bandwidth_median';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_VARIANCE   = 'intensive_bandwidth_variance';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_DURATION   = 'intensive_bandwidth_duration';
    const DIAGNOSTIC_INTENSIVE_BANDWIDTH_SIZE       = 'intensive_bandwidth_size';
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

    /**
     * Flush the diagnostic records
     * @return bool whether the flush goes well or not
     */
    public function flush();
}
