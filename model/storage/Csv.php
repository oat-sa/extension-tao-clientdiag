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
     * Path to csv file
     * @var string
     */
    private $filePath;

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
        $this->filePath = $this->getCsvPath($entity);

        $id         = $entity->getId();
        $data       = array_merge(['id' => $id], $entity->getPopulatedColumns());
        $csvContent = $this->get($id);

        if (is_array($csvContent)) {
            $data = array_merge($csvContent, $data);
            $this->delete($id);
        }

        $handle = fopen($this->filePath, 'a');
        fputcsv($handle, $data, ';');
        fclose($handle);

        return $this;
    }

    /**
     * Get csv file path, create it if not exists (with column name)
     * @param $entity
     * @return string
     */
    private function getCsvPath($entity)
    {
        $name = $entity->getName();
        $file = FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR  . $name . '.csv';

        if(!file_exists($file)){
            $handle = fopen($file, 'w');
            fputcsv($handle, array_merge(['id'], $entity->getColumnsName()),';');
            fclose($handle);
        }
        return $file;
    }

    /**
     * Get data line referenced by the $id
     * @param $id
     * @return array|bool
     */
    private function get($id)
    {
        if (($handle = fopen($this->filePath, "r")) !== false) {
            $line = 1;
            $index = 0;
            $keys = array();
            $returnValue = array();
            while (($data = fgetcsv($handle, 1000, ";")) !== false) {
                if ($line === 1) {
                    $keys = $data;
                    if (($index = array_search('id', $keys, true)) === false) {
                        return false;
                    }
                }
                if ($data[$index] === $id) {
                    foreach ($data as $index => $value) {
                        $returnValue[$keys[$index]] = $value;
                    }
                    fclose($handle);
                    return $returnValue;
                }
                $line++;
            }
            fclose($handle);
        }
        return false;
    }

    /**
     * Delete line referenced by the $id
     * @param $id
     * @return bool
     */
    private function delete($id)
    {
        if (($handle = fopen($this->filePath, "r")) !== false) {
            $tmpFile = \tao_helpers_File::createTempDir() . 'store.csv';
            $tmpHandle = fopen($tmpFile, 'w');
            $line = 1;
            $index = 0;
            while (($data = fgetcsv($handle, 1000, ";")) !== false) {
                if ($line === 1) {
                    $keys = $data;
                    if (($index = array_search('id', $keys, true)) === false) {
                        return false;
                    }
                }
                if ($data[$index] !== $id) {
                    fputcsv($tmpHandle, $data, ';');
                }
                $line++;
            }
            fclose($tmpHandle);
            fclose($handle);
            return \tao_helpers_File::copy($tmpFile, $this->filePath) && unlink($tmpFile);
        }
        return false;
    }

}