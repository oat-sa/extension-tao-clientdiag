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

use Doctrine\DBAL\DBALException;
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

    private const FIELDS_INT = [
        self::DIAGNOSTIC_BANDWIDTH_SIZE,
        self::DIAGNOSTIC_INTENSIVE_BANDWIDTH_SIZE,
        self::DIAGNOSTIC_PERFORMANCE_COUNT,
        self::DIAGNOSTIC_BANDWIDTH_COUNT,
        self::DIAGNOSTIC_FINGERPRINT_ERRORS,
        self::DIAGNOSTIC_FINGERPRINT_CHANGED,
        self::DIAGNOSTIC_INTENSIVE_BANDWIDTH_COUNT
    ];

    private const FIELDS_STRING = [
        self::DIAGNOSTIC_BROWSERVERSION,
        self::DIAGNOSTIC_SCHOOL_NUMBER,
        self::DIAGNOSTIC_OSVERSION,
    ];

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
     * @return boolean
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

        } catch (DBALException $e) {
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
                $data[constant($const)] = $this->castValue(constant($const), $value);
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

        $query = 'INSERT INTO ' . self::DIAGNOSTIC_TABLE . '(' . implode(', ', array_map([$this, 'tableize'], array_keys($columns))) . ')' .
                 ' VALUES (' . str_repeat("?,", count($columns) - 1) . '? )';

        return $this->persistence->exec($query, array_values($columns));
    }

    /**
     * @param $word
     * @return string
     * @throws StorageException
     */
    private function tableize($word)
    {
        $tableized = preg_replace('~(?<=\\w)([A-Z])~u', '_$1', $word);
        if ($tableized === null) {
            throw new StorageException(sprintf(
                'Invalid column name "%s"',
                $word
            ));
        }
        return mb_strtolower($tableized);
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
        } catch (DBALException $e){
            return false;
        }
        return true;
    }

    /**
     * @param string $field
     * @param mixed $value
     * @return float|int|string
     */
    private function castValue($field, $value)
    {
        if (in_array($field, self::FIELDS_STRING)) {
            return (string)$value;
        }

        if (is_string($value)) {
            if (in_array($field, self::FIELDS_INT)) {
                return (int)$value;
            }
            return is_numeric($value) ? (float)$value : $value;
        }
        return $value;
    }
}
