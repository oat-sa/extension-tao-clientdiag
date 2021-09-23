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

/*
 * Class ExcludedOsClassService
 *
 * @package oat\taoClientDiagnostic\model\exclusionList
 */
class ExcludedOsClassService extends ExclusionListClassService
{
    const SERVICE_ID = 'taoClientDiagnostic/ExcludedOsClassService';

    public const ROOT_CLASS = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ExcludedOS';
    public const MAKE_ENTRY = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#OSMake';
    public const EXCLUDED_NAME = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ExcludedOSName';
    public const EXCLUDED_VERSION = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ExcludedOSVersion';

    /**
     * Get the root class for excluded Operating system
     *
     * @return core_kernel_classes_Class
     */
    public function getRootClass()
    {
        return $this->getClass(self::ROOT_CLASS);
    }

    /**
     * Get the name property of excluded OS
     *
     * @return core_kernel_classes_Property
     */
    public function getNameProperty()
    {
        return $this->getProperty($this->getNamePropertyUri());
    }

    /**
     * @return string
     */
    public function getNamePropertyUri(): string
    {
        return self::EXCLUDED_NAME;
    }

    /**
     * Get the version property of excluded OS
     *
     * @return core_kernel_classes_Property
     */
    public function getVersionProperty()
    {
        return $this->getProperty($this->getVersionPropertyUri());
    }

    /**
     * @return string
     */
    public function getVersionPropertyUri(): string
    {
        return self::EXCLUDED_VERSION;
    }

    /**
     * Get the parent class of excluded OS
     *
     * @return core_kernel_classes_Class
     */
    protected function getMakeClass()
    {
        return $this->getClass(self::MAKE_ENTRY);
    }
}
