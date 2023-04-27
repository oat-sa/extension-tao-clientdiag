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
 * Copyright (c) 2016-2023 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT).
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
    public const DIAGNOSTIC_ID                   = 'id';
    public const DIAGNOSTIC_CONTEXT_ID           = 'context_id';
    public const DIAGNOSTIC_USER_ID              = 'user_id';
    public const DIAGNOSTIC_LOGIN                = 'login';
    public const DIAGNOSTIC_IP                   = 'ip';
    public const DIAGNOSTIC_WORKSTATION          = 'workstation';
    public const DIAGNOSTIC_SCHOOL_NAME          = 'school_name';
    public const DIAGNOSTIC_SCHOOL_ID            = 'school_id';
    public const DIAGNOSTIC_SCHOOL_NUMBER        = 'school_number';
    public const DIAGNOSTIC_FINGERPRINT_UUID     = 'fingerprint_uuid';
    public const DIAGNOSTIC_FINGERPRINT_VALUE    = 'fingerprint_value';
    public const DIAGNOSTIC_FINGERPRINT_DETAILS  = 'fingerprint_details';
    public const DIAGNOSTIC_FINGERPRINT_ERRORS   = 'fingerprint_errors';
    public const DIAGNOSTIC_FINGERPRINT_CHANGED  = 'fingerprint_changed';
    public const DIAGNOSTIC_BROWSER              = 'browser';
    public const DIAGNOSTIC_BROWSERVERSION       = 'browser_version';
    public const DIAGNOSTIC_OS                   = 'os';
    public const DIAGNOSTIC_OSVERSION            = 'os_version';
    public const DIAGNOSTIC_COMPATIBLE           = 'compatible';
    public const DIAGNOSTIC_VERSION              = 'version';
    public const DIAGNOSTIC_SCREEN_WIDTH         = 'screen_width';
    public const DIAGNOSTIC_SCREEN_HEIGHT        = 'screen_height';
    public const DIAGNOSTIC_BANDWIDTH_MIN        = 'bandwidth_min';
    public const DIAGNOSTIC_BANDWIDTH_MAX        = 'bandwidth_max';
    public const DIAGNOSTIC_BANDWIDTH_SUM        = 'bandwidth_sum';
    public const DIAGNOSTIC_BANDWIDTH_COUNT      = 'bandwidth_count';
    public const DIAGNOSTIC_BANDWIDTH_AVERAGE    = 'bandwidth_average';
    public const DIAGNOSTIC_BANDWIDTH_MEDIAN     = 'bandwidth_median';
    public const DIAGNOSTIC_BANDWIDTH_VARIANCE   = 'bandwidth_variance';
    public const DIAGNOSTIC_BANDWIDTH_DURATION   = 'bandwidth_duration';
    public const DIAGNOSTIC_BANDWIDTH_SIZE       = 'bandwidth_size';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_MIN        = 'intensive_bandwidth_min';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_MAX        = 'intensive_bandwidth_max';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_SUM        = 'intensive_bandwidth_sum';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_COUNT      = 'intensive_bandwidth_count';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_AVERAGE    = 'intensive_bandwidth_average';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_MEDIAN     = 'intensive_bandwidth_median';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_VARIANCE   = 'intensive_bandwidth_variance';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_DURATION   = 'intensive_bandwidth_duration';
    public const DIAGNOSTIC_INTENSIVE_BANDWIDTH_SIZE       = 'intensive_bandwidth_size';
    public const DIAGNOSTIC_PERFORMANCE_MIN      = 'performance_min';
    public const DIAGNOSTIC_PERFORMANCE_MAX      = 'performance_max';
    public const DIAGNOSTIC_PERFORMANCE_SUM      = 'performance_sum';
    public const DIAGNOSTIC_PERFORMANCE_COUNT    = 'performance_count';
    public const DIAGNOSTIC_PERFORMANCE_AVERAGE  = 'performance_average';
    public const DIAGNOSTIC_PERFORMANCE_MEDIAN   = 'performance_median';
    public const DIAGNOSTIC_PERFORMANCE_VARIANCE = 'performance_variance';
    public const DIAGNOSTIC_CREATED_AT           = 'created_at';
    public const DIAGNOSTIC_UPLOAD_MAX           = 'upload_max';
    public const DIAGNOSTIC_UPLOAD_AVG           = 'upload_avg';

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
