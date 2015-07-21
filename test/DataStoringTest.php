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

        $sentData = array(
            'login'             => 'test',
            'ip'                => '10.9.8.7',
            'os'                => 'Windows',
            'osVersion'         => '8.1',
            'browser'           => 'Chrome',
            'browserVersion'    => '33'
        );

        $store = new DataStorage($sentData);

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
                $this->assertEquals(7, $num);
                $row ++;
                if($row === 2){
                    $this->assertEquals($sentData['login'],$data[0]);
                    $this->assertEquals($sentData['ip'],$data[1]);
                    $this->assertEquals($sentData['os'],$data[2]);
                    $this->assertEquals($sentData['osVersion'],$data[3]);
                    $this->assertEquals($sentData['browser'],$data[4]);
                    $this->assertEquals($sentData['browserVersion'],$data[5]);
                    $this->assertEquals(1,$data[6]);
                }
                if($row === 3){
                    $this->assertEquals(0,$data[6]);
                }
            }
            fclose($handle);
        }
        $this->assertEquals(3, $row);

        unlink($sampleFilePath);


    }

}
 