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

namespace oat\taoClientDiagnostic\test;


use oat\taoClientDiagnostic\model\DataStorage;

class DataStoringTest extends \PHPUnit_Framework_TestCase {


    public function testStoreData(){
        $sampleFilePath = \tao_helpers_File::createTempDir() . 'stored.csv';
        $os = 'Windows';
        $osVersion = '8.1';
        $browser = 'Chrome';
        $browserVersion = '33';
        $ip = '10.9.8.7';

        $store = new DataStorage($browser, $browserVersion, $ip, $os, $osVersion);

        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\DataStorage', 'filePath');
        $ref->setAccessible(true);
        $ref->setValue($store, $sampleFilePath);

        $store->storeData(true);
        $store->storeData(false);

        $this->assertFileExists($sampleFilePath);

        $row = 0;
        if (($handle = fopen($sampleFilePath, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
                $num = count($data);
                $this->assertEquals(6, $num);
                $row ++;
                if($row === 2){
                    $this->assertEquals($ip,$data[0]);
                    $this->assertEquals($os,$data[1]);
                    $this->assertEquals($osVersion,$data[2]);
                    $this->assertEquals($browser,$data[3]);
                    $this->assertEquals($browserVersion,$data[4]);
                    $this->assertEquals(1,$data[5]);
                }
                if($row === 3){
                    $this->assertEquals(0,$data[5]);
                }
            }
            fclose($handle);
        }
        $this->assertEquals(3, $row);

        unlink($sampleFilePath);


    }

}
 