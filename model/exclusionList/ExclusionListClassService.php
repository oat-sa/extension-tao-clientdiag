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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoClientDiagnostic\model\exclusionList;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\OntologyRdfs;
use oat\tao\model\OntologyClassService;

/**
 * Class exclusionListClassService
 *
 * @package oat\taoClientDiagnostic\model\exclusionList
 */
abstract class ExclusionListClassService extends OntologyClassService
{
    /** @var array */
    private $names = [];

    /**
     * Get the name property
     *
     * @return core_kernel_classes_Property
     */
    abstract public function getNameProperty();

    /**
     * @return string
     */
    abstract public function getNamePropertyUri(): string;

    /**
     * Get the version property
     *
     * @return core_kernel_classes_Property
     */
    abstract public function getVersionProperty();

    /**
     * @return string
     */
    abstract public function getVersionPropertyUri(): string;

    /**
     * Get the parent class
     *
     * @return core_kernel_classes_Class
     */
    abstract protected function getMakeClass();

    /**
     * @return array
     */
    public function getExcludedNames(): array
    {
        if (!$this->names) {
            $nameInstances = $this->getNameProperty()->getRange()->getInstances();

            /** @var \core_kernel_classes_Resource $nameInstance */
            foreach ($nameInstances as $nameInstance) {
                $this->names[strtolower($nameInstance->getLabel())] = $nameInstance->getUri();
            }
        }

        return $this->names;
    }

    /**
     * @param string $name
     * @return core_kernel_classes_Resource|null
     */
    public function getResourceByName($name)
    {
        $results = $this->getMakeClass()->searchInstances(
            [OntologyRdfs::RDFS_LABEL => $name],
            ['like' => false]
        );

        return array_pop($results);
    }
}
