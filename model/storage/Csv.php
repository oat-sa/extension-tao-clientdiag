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

/**
 * Class Csv
 * @package oat\taoClientDiagnostic\model\storage
 */
class Csv extends Storage
{
    /**
     * Path to csv file
     * @var string
     */
    private $filePath;

    /**
     * Csv constructor.
     * Create csv file if not exists
     */
    public function __construct()
    {
        $this->filePath = FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'store.csv';
        if (!file_exists($this->filePath)) {
            $handle = fopen($this->filePath, 'w');
            fputcsv($handle, array_keys($this->columns), ';');
            fclose($handle);
        }
        return $this;
    }

    /**
     * Store data into CSV file
     * - Insert column & data line
     * - OR Update line referenced by key
     * @return bool
     * @throws \Exception
     */
    public function store()
    {
        if (!is_readable($this->filePath)) {
            throw new \Exception('Unable to read csv file located at: ' . $this->filePath);
        }

        $id = $this->data['id'];
        if (!is_null($id)) {
            $data = $this->get($id);
            if (is_array($data)) {
                $this->data = array_merge($data, $this->data);
                $this->delete($id);
            } else {
                $this->data = array_merge($this->columns, $this->data);
            }
        }

        $handle = fopen($this->filePath, 'a');
        fputcsv($handle, $this->data, ';');
        return fclose($handle);
    }

    /**
     * Get data line refernced by the $id
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
                    if (($index = array_search('key', $keys, true)) === false) {
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
                    if (($index = array_search('key', $keys, true)) === false) {
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