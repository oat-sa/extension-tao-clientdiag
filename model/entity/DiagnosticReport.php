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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoClientDiagnostic\model\entity;


/**
 * Class DiagnosticReport
 * @package oat\taoClientDiagnostic\model\entity
 */
class DiagnosticReport extends Entity
{
    /**
     * Identifier parameters
     * Leave private to avoid parent::entity fetching
     * @var string
     */
    private $id;

    /**
     * All properties needed by diagnostic report
     * They correspond to storage columns
     */
    protected $login;
    protected $ip;
    protected $browser;
    protected $browserVersion;
    protected $os;
    protected $osVersion;
    protected $compatible;
    protected $version;
    protected $bandwidth_min;
    protected $bandwidth_max;
    protected $bandwidth_sum;
    protected $bandwidth_count;
    protected $bandwidth_average;
    protected $bandwidth_median;
    protected $bandwidth_variance;
    protected $bandwidth_duration;
    protected $bandwidth_size;
    protected $performance_min;
    protected $performance_max;
    protected $performance_sum;
    protected $performance_count;
    protected $performance_average;
    protected $performance_median;
    protected $performance_variance;

    /**
     * DiagnosticReport constructor.
     * @param $id
     * @param array $data
     * @throws \common_exception_MissingParameter
     * @return $this
     */
    public function __construct($id, array $data)
    {
        if (empty($id)) {
            throw new \common_exception_MissingParameter('Diagnostic id is mandatory');
        }
        if (empty($data)) {
            throw new \common_exception_MissingParameter('Diagnostic data are mandatories');
        }
        $this->id      = $id;
        $this->version = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic')->getVersion();
        $this->setData($data);
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Hydrate all properties of Diagnostic class corresponding to the $data key by $data value
     * @param array $data
     * @return $this
     * @throws \Exception
     */
    private function setData(array $data)
    {
        foreach ($data as $key => $value) {
            $this->set($key, $value);
        }
        return $this;
    }
}