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
namespace oat\taoClientDiagnostic\model\browserDetector;

use core_kernel_classes_Class;
use core_kernel_classes_Resource;

/**
 * Service to manage the authoring of deliveries
 */
abstract class Base extends \tao_models_classes_ClassService
{

    /** @var core_kernel_classes_Class */
    protected $makeClass;

    /**
     * @var core_kernel_classes_Class
     */
    protected $rootClass;

    /**
     * WebBrowserService constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->rootClass = new core_kernel_classes_Class(static::ROOT_CLASS);
        $this->makeClass = new core_kernel_classes_Class(static::MAKE_CLASS);
    }

    /**
     * @return core_kernel_classes_Class
     */
    public function getRootClass()
    {
        return $this->rootClass;
    }

    /**
     * @return core_kernel_classes_Resource|null
     */
    public function getClientNameResource()
    {
        $detectedName = $this->getClientName();

        $results = $this->makeClass->searchInstances(
        [ RDFS_LABEL => $detectedName ],
        [ 'like' => false ]);

        $result = array_pop($results);

        return $result;
    }

    /**
     * @return string
     */
    abstract public function getClientName();

    /**
     * @return string
     */
    abstract public function getClientVersion();

}
