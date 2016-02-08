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


class Sql extends Storage
{
    const TABLE_DIAGNOSTIC = "performance_diagnostic";

    private $persistence;

    public function __construct()
    {
        $this->persistence = \common_persistence_Manager::getPersistence('default');
    }

    public function store()
    {
        $id = $this->data['id'];

        if (!is_null($id)) {
            $isCreated = $this->get($id);
            if (empty($isCreated)) {
                $this->insert();
            } else {
                unset($this->data['id']);
                $this->update($id);
            }
          //  \common_Logger::i($this->data);
        }
        return true;
    }

    public function setData(array $data)
    {
        if(count(array_intersect(array_keys($this->columns), array_keys($data))) != count($data)){
            throw new \Exception('Data keys are not correctly set');
        }
        $this->data = $data;
    }

    private function get($id)
    {
        $query = "SELECT * FROM " . self::TABLE_DIAGNOSTIC . " WHERE id = ?";
        $statement = $this->persistence->query($query, array($id));
        return $statement->fetch(\PDO::FETCH_ASSOC);
    }

    private function insert() {
        $query = 'INSERT INTO ' . self::TABLE_DIAGNOSTIC . '(' . implode(' , ', array_keys($this->data)) . ')' .
                 ' VALUES (' . str_repeat("?,", count($this->data)-1) . '? )';
        $result = $this->persistence->exec($query, array_values($this->data));
        return $result;
    }

    private function update($id) {
        foreach ($this->data as $key => $value) {
            $fields[] = $key . ' = ?';
        }
        $this->data['id'] = $id;
        $query = 'UPDATE ' . self::TABLE_DIAGNOSTIC .
                 ' SET ' . implode(', ', $fields) .
                 ' WHERE id = ?';
        $result = $this->persistence->exec($query, array_values($this->data));
        return $result;
    }
}