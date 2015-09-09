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

    private $filePath, $key, $isCompatible, $data;
    private $dataList = array(
        'key' => '',
        'login' => '',
        'ip' => '',
        'browser' => '',
        'browserVersion' => '',
        'os' => '',
        'osVersion' => '',
        'bandwidth_min' => '',
        'bandwidth_max' => '',
        'bandwidth_sum' => '',
        'bandwidth_count' => '',
        'bandwidth_average' => '',
        'bandwidth_median' => '',
        'bandwidth_variance' => '',
        'bandwidth_duration' => '',
        'bandwidth_size' => '',
        'performance_min' => '',
        'performance_max' => '',
        'performance_sum' => '',
        'performance_count' => '',
        'performance_average' => '',
        'performance_median' => '',
        'performance_variance' => '',
        'compatible' => '',
    );

    function __construct($data)
    {
        $this->key = 'anonymous';
        if(isset($data['key'])){
            $this->key = $data['key'];
        }
        $this->data = $data;

        $dataPath = FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR. 'storage' . DIRECTORY_SEPARATOR;
        $this->filePath = $dataPath.'store_atomic_'. $this->key .'.csv';
    }

    public function storeData(){

        if(!is_null($this->isCompatible)){
            $this->data['compatible'] = (int)$this->isCompatible;
        }

        $data = $this->getStoredData();
        if(is_array($data)){
            $this->data = array_merge($data, $this->data);
        }
        else{
            $this->data = array_merge($this->dataList, $this->data);
        }
        $handle = fopen($this->filePath, 'w');
        fputcsv($handle, $this->data ,';');
        return fclose($handle);
    }

    public function getStoredData(){
        if (file_exists($this->filePath) && ($handle = fopen($this->filePath, "r")) !== FALSE) {
            $keys = array_keys($this->dataList);
            $returnValue = array();
            while (($data = fgetcsv($handle, 0, ";")) !== FALSE) {
                foreach($data as $index => $value){
                    $returnValue[$keys[$index]] = $value;
                }
            }
            fclose($handle);
            return $returnValue;
        }
        return false;
    }

    /**
     * @param bool $isCompatible
     * @return $this
     */
    public function setIsCompatible($isCompatible)
    {
        $this->isCompatible = $isCompatible;

        return $this;
    }



}