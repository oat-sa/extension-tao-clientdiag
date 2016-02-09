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

use oat\taoClientDiagnostic\exception\InvalidEntityException;

/**
 * Abstract entity to manage the entity storage process
 * Class Entity
 * @package oat\taoClientDiagnostic\model\entity
 */
abstract class Entity
{
    /**
     * Return child $property if exists
     * Throw exception if not
     * @param $property
     * @return $this
     * @throws InvalidEntityException
     */
    public function get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
            return $this;
        }
        throw new InvalidEntityException('Properties ' . $property . 'doesn\'t exist');
    }

    /**
     * Set child $property with $value if exists
     * Throw exception if not
     * @param $property
     * @param $value
     * @return $this
     * @throws InvalidEntityException
     */
    public function set($property, $value)
    {
        if (property_exists($this, $property)) {
            $this->$property = $value;
            return $this;
        }
        throw new InvalidEntityException('Properties ' . $property . 'doesn\'t exist');
    }

    /**
     * Get all none null properties as array
     * @return array
     */
    public function getPopulatedColumns()
    {
        $columns = [];
        foreach (get_object_vars($this) as $property => $value) {
            if (isset($value)) {
                $columns[$property] = $value;
            }
        }
        return $columns;
    }

    /**
     * Get all properties name as array
     * @return array
     */
    public function getColumnsName()
    {
        $columns = [];
        foreach (get_object_vars($this) as $property => $value) {
            $columns[] = $property;
        }
        return $columns;
    }

    /**
     * Get name of inherit class
     * @return string
     */
    public function getName()
    {
        $function = new \ReflectionClass($this);
        return strtolower($function->getShortName());
    }
}