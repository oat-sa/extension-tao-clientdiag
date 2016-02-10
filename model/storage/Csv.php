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
use oat\taoClientDiagnostic\model\Entity\DiagnosticReport;

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
     * Check if csv file exists
     * If id already exists, merge old data to current & remove old one
     * Create new entry in csv file
     *
     * @param Entity $entity
     * @return $this
     */
    public function store(Entity $entity)
    {
        $id      = $entity->getId();
        $columns = array_merge(['id'], $entity->getColumnsName());
        $data    = array_merge(['id' => $id], $entity->toArray());

        $this->openFile($columns);
        $this->update($id, $data);

        return $this;
    }

    /**
     * Handle csv file, create it if not exists (with column name)
     * @param array $columns
     * @throws StorageException
     * @return string
     */
    private function openFile($columns = array())
    {
        $file = $this->getOption('filename');
        $fileExists = file_exists($file);
        if (($this->handle = fopen($file, 'a+')) !== false) {
            if (!$fileExists) {
                fputcsv($this->handle, $columns,';');
                fseek($this->handle, 0);
            }
            return;
        }
        throw new StorageException('Unable to read csv file');
    }

    /**
     * Copy csv data into tmp file with updated line referenced by $id
     * Copy tmp file to csv && remove tmp file
     * @param $id
     * @param $entityData
     * @return bool|string|void
     * @throws StorageException
     */
    private function update($id, $entityData) {

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
                    if (!empty($value)) {
                        $entityData[$keys[$index]] = $value;
                    } elseif (!empty($entityData[$keys[$index]])) {
                        continue;
                    } else {
                        $entityData[$keys[$index]] = '';
                    }
                }
            }
            else {
                fputcsv($tmpHandle, $data, ';');
            }
            $line++;
        }
        fputcsv($tmpHandle, $entityData, ';');
        fclose($tmpHandle);
        fclose($this->handle);
        \tao_helpers_File::copy($tmpFile, $this->getOption('filename')) && unlink($tmpFile);
        return;
    }
}