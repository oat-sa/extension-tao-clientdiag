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

/**
 * Class Sql
 * @package oat\taoClientDiagnostic\model\storage
 */
class Sql extends ConfigurableService implements Storage
{
    /**
     * Constant for diagnostic table name
     */
    const DIAGNOSTIC_TABLE = 'diagnostic_report';

    /**
     * Constant for persistence option
     */
    const DIAGNOSTIC_PERSISTENCE = 'persistence';

    /**
     * @var \common_persistence_Persistence
     */
    private $persistence;

    /**
     * Get persistence with configurable driver option of Sql Storage
     * Get default driver if option is not set
     * @return \common_persistence_Persistence
     */
    public function getPersistence()
    {
        $persistenceOption = $this->getOption(self::DIAGNOSTIC_PERSISTENCE);
        $persistence = (!empty($persistenceOption)) ? $persistenceOption : 'default';
        return \common_persistence_Manager::getPersistence($persistence);
    }


    /**
     * If record already exists, update it by new values
     * Else insert new entry
     * @param $id
     * @param array $data
     * @return mixed
     * @throws StorageException
     */
    public function store($id, $data = array())
    {
        try {

            if (empty($id)) {
                throw new StorageException('Invalid id parameter.');
            }
            $this->persistence = $this->getPersistence();

            $data = $this->cleanInputData($data);
            if (!$this->exists($id)) {
                $this->insert($id, $data);
            } else {
                $this->update($id, $data);
            }
            return true;

        } catch (\PDOException $e) {
            throw new StorageException($e->getMessage());
        }
    }

    /**
     * Check if $input keys are constants of Storage
     * @param array $input
     * @return array
     * @throws StorageException
     */
    protected function cleanInputData(array $input)
    {
        foreach ($input as $key => $value) {
            $const = get_called_class() . '::DIAGNOSTIC_' . strtoupper($key);
            if (defined($const)) {
                $data[constant($const)] = $value;
            }
        }
        if (empty($data)) {
            throw new StorageException('No data to insert into storage');
        }

        return $data;
    }

    /**
     * Check if record is already in database by $this->id
     * @param $id
     * @return bool
     */
    private function exists($id)
    {
        $query = 'SELECT ' . self::DIAGNOSTIC_ID . ' FROM ' . self::DIAGNOSTIC_TABLE . ' WHERE ' . self::DIAGNOSTIC_ID . ' = ?';
        $statement = $this->persistence->query($query, array($id));
        return (boolean)$statement->rowCount();
    }


    /**
     * Create new record in SQL table with $data & $this->id
     * @param $id
     * @param $data
     * @return mixed
     */
    private function insert($id, $data)
    {
        $platform = $this->persistence->getPlatform();
        $columns = array_merge(array(
            self::DIAGNOSTIC_ID => $id,
            self::DIAGNOSTIC_CREATED_AT => $platform->getNowExpression()
        ), $data);

        $query = 'INSERT INTO ' . self::DIAGNOSTIC_TABLE . '(' . implode(', ', array_map('Doctrine\Common\Inflector\Inflector::tableize',array_keys($columns))) . ')' .
                 ' VALUES (' . str_repeat("?,", count($columns) - 1) . '? )';

        return $this->persistence->exec($query, array_values($columns));
    }


    /**
     * Update record in SQL table with $data by $this->id
     * @param $id
     * @param $data
     * @return mixed
     */
    private function update($id, $data)
    {
        foreach ($data as $key => $value) {
            $fields[] = $key . ' = ?';
        }
        $query = 'UPDATE ' . self::DIAGNOSTIC_TABLE . ' SET ' . implode(', ', $fields) .
                 ' WHERE ' . self::DIAGNOSTIC_ID . ' = ?';
        return $this->persistence->exec($query, array_merge(array_values($data), array($id)));
    }


    public function flush()
    {
        $query = 'DELETE FROM ' . self::DIAGNOSTIC_TABLE;

        try{
            $this->getPersistence()->exec($query);
        } catch (\PDOException $e){
            return false;
        }
        return true;
    }
}