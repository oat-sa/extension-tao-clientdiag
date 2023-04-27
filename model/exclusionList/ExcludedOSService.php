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

declare(strict_types=1);

namespace oat\taoClientDiagnostic\model\exclusionList;

use core_kernel_classes_Class;
use core_kernel_classes_Property;

class ExcludedOSService extends ExclusionListService
{
    const SERVICE_ID = 'taoClientDiagnostic/ExcludedOSService';

    public const ROOT_CLASS = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ExcludedOS';
    public const LIST_CLASS = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#OSList';
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

    public function getNameProperty(): core_kernel_classes_Property
    {
        return $this->getProperty($this->getNamePropertyUri());
    }

    public function getNamePropertyUri(): string
    {
        return self::EXCLUDED_NAME;
    }

    public function getVersionProperty(): core_kernel_classes_Property
    {
        return $this->getProperty($this->getVersionPropertyUri());
    }

    public function getVersionPropertyUri(): string
    {
        return self::EXCLUDED_VERSION;
    }

    protected function getListClass(): core_kernel_classes_Class
    {
        return $this->getClass(self::LIST_CLASS);
    }
}
