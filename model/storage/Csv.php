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
 * Class Csv
 * @package oat\taoClientDiagnostic\model\storage
 */
class Csv extends ConfigurableService implements Storage
{
    /**
     * Csv file handle
     * @var stream
     */
    private $handle;

    /**
     * Merge id and data array
     * Clean input data by adding empty column
     * Open csv and create new entry
     * @param $id
     * @param $data
     * @return $this
     */
    public function store($id, $data = array())
    {
        $data = array_merge(
            [self::DIAGNOSTIC_ID => $id],
            $data
        );

        $data = $this->cleanInputData($data);

        $this->openFile();
        $this->update($id, $data);

        return $this;
    }

    /**
     * Check if $input keys are constants of Storage
     * Set input keys as empty value if not exists
     * @param array $input
     * @return array
     */
    protected function cleanInputData(array $input)
    {
        $columns = $this->getColumns();
        foreach ($columns as $column) {
            if (!isset($input[$column])) {
                $input[$column] = '';
            }
        }
        return $input;
    }

    /**
     * Handle csv file, create it if not exists (with column name)
     * @throws StorageException
     * @return string
     */
    private function openFile()
    {
        $file = $this->getOption('filename');
        $fileExists = file_exists($file);
        if (($this->handle = fopen($file, 'a+')) !== false) {
            if (!$fileExists) {
                fputcsv($this->handle, $this->getColumns(),';');
                fseek($this->handle, 0);
            }
            return;
        }
        throw new StorageException('Unable to open csv file');
    }

    /**
     * Return an array of Storage constant var
     * @return array
     * @throws StorageException
     */
    private function getColumns()
    {
        $class = new \ReflectionClass(__CLASS__);
        $constants = $class->getConstants();
        $columns = [];
        foreach ($constants as $constant => $value) {
            if (strpos($constant, 'DIAGNOSTIC_') === 0) {
                array_push($columns, $value);
            }
        }
        if (empty($columns)) {
            throw new StorageException('No column to fill into CSV storage');
        }
        return $columns;
    }

    /**
     * Copy csv data into tmp file with updated line referenced by $id
     * Copy tmp file to csv && remove tmp file
     * @param $id
     * @param $entityData
     * @return bool|string|void
     * @throws StorageException
     */
    private function update($id, $entityData = []) {
        $tmpFile = \tao_helpers_File::createTempDir() . 'store.csv';
        $tmpHandle = fopen($tmpFile, 'w');
        $line = 1;
        $index = 0;

        while (($data = fgetcsv($this->handle, 1000, ";")) !== false) {

            if ($line === 1) {
                $keys = $data;
                if (($index = array_search('id', $keys, true)) === false) {
                    return false;
                }
            }

            if ($data[$index] == $id) {
                foreach($data as $index => $value){
                    if (empty($entityData[$keys[$index]])) {
                        $entityData[$keys[$index]] = $value;
                    }
                }
            }
            else {
                fputcsv($tmpHandle, $data, ';');
            }
            $line++;
        }
        $entityData = array_merge(array_flip($keys), $entityData);
        fputcsv($tmpHandle, $entityData, ';');
        fclose($tmpHandle);
        fclose($this->handle);
        \tao_helpers_File::copy($tmpFile, $this->getOption('filename')) && unlink($tmpFile);
        return;
    }

    public function flush()
    {
        $file = $this->getOption('filename');
        if(file_exists($file)){
            return unlink($file);
        }
        return true;
    }
}