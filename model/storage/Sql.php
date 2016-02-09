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

namespace oat\taoClientDiagnostic\model\storage;

use oat\oatbox\service\ConfigurableService;
use oat\taoClientDiagnostic\exception\StorageException;
use oat\taoClientDiagnostic\model\entity\Entity;

/**
 * Class Sql
 * @package oat\taoClientDiagnostic\model\storage
 */
class Sql extends ConfigurableService implements Storage
{
    /**
     * @var string
     */
    private $tableName;
    /**
     * @var \common_persistence_Persistence
     */
    private $persistence;

    /**
     * Sql constructor, set the persistence object
     */
    public function __construct()
    {
        $this->persistence = \common_persistence_Manager::getPersistence('default');
    }

    /**
     * If id already exists, update it by new values
     * Else insert new entry
     * @param Entity $entity
     * @return bool
     * @throws StorageException
     */
    public function store(Entity $entity)
    {
        $this->tableName = $entity->getName();
        $id = $entity->getId();

        try {
            $isCreated = $this->exists($id);
            if (empty($isCreated)) {
                $this->insert($entity);
            } else {
                $this->update($entity);
            }
        } catch (\PDOException $e) {
            throw new StorageException($e->getMessage());
        }
        return true;
    }

    /**
     * Check if id is already in database
     * @param $id
     * @return bool
     */
    private function exists($id)
    {
        $query = "SELECT id FROM " . $this->tableName . " WHERE id = ?";
        $statement = $this->persistence->query($query, array($id));
        return (boolean)$statement->rowCount();
    }

    /**
     * Create new entry in SQL table
     * @param $entity
     * @return mixed
     */
    private function insert($entity)
    {
        $columns = array_merge($entity->getPopulatedColumns(), array('id' => $entity->getId()));
        $query = 'INSERT INTO ' . $this->tableName . '(' . implode(', ', array_keys($columns)) . ')' .
                 ' VALUES (' . str_repeat("?,", count($columns) - 1) . '? )';
        return $this->persistence->exec($query, array_values($columns));
    }

    /**
     * Update entity in SQL table
     * @param $entity
     * @return mixed
     */
    private function update($entity)
    {
        $columns = $entity->getPopulatedColumns();
        foreach ($columns as $key => $value) {
            $fields[] = $key . ' = ?';
        }
        $query = 'UPDATE ' . $this->tableName . ' SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $this->persistence->exec($query, array_merge(array_values($columns), array($entity->getId())));
    }
}