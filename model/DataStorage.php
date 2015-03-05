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

    private $ip;
    private $os;
    private $osVersion;
    private $browser;
    private $browserVersion;
    private $filePath;

    function __construct($browser, $browserVersion, $ip, $os, $osVersion)
    {
        $this->browser = $browser;
        $this->browserVersion = $browserVersion;
        $this->ip = $ip;
        $this->os = $os;
        $this->osVersion = $osVersion;

        $dataPath = FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR. 'storage' . DIRECTORY_SEPARATOR;
        $this->filePath = $dataPath.'store.csv';
    }

    public function storeData($isCompatible = false){

        if(!file_exists($this->filePath)){
            $header = $this->formatData('ip', 'os', 'osVersion', 'browser', 'browserVersion', 'isCompatible');
            file_put_contents($this->filePath, $header);
        }

        $data = $this->formatData($this->ip, $this->os, $this->osVersion, $this->browser, $this->browserVersion, (int)$isCompatible);

        return (file_put_contents($this->filePath, $data, FILE_APPEND) !== false);
    }

    private function formatData($ip, $os, $osVersion, $browser, $browserVersion, $isCompatible){
        $data = '"' . $ip . '";"' . $os . '";"' . $osVersion . '";"' . $browser . '";"' . $browserVersion . '";"'.$isCompatible.'"'."\n";
        return $data;
    }
}