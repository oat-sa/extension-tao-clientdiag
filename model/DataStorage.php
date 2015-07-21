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

namespace oat\taoClientDiagnostic\model;


class DataStorage {

    private $data, $dataList, $filePath;

    function __construct($data)
    {
        $this->dataList = array_keys($data);
        $this->data = array_values($data);

        $dataPath = FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR. 'storage' . DIRECTORY_SEPARATOR;
        $this->filePath = $dataPath.'store.csv';
    }

    public function storeData($isCompatible = false){
        if(!file_exists($this->filePath)){
            $handle = fopen($this->filePath, 'w');
            fputcsv($handle, array_merge($this->dataList, array('compatible')),';');
            fclose($handle);
        }
        $handle = fopen($this->filePath, 'a');
        fputcsv($handle, array_merge($this->data, array((int) $isCompatible)) ,';');
        return fclose($handle);
    }
}