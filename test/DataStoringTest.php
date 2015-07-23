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

    private $sentData, $sampleFilePath;

    public function setUp(){
        $this->sentData = array(
            'browser'           => 'Chrome',
            'browserVersion'    => '33',
            'ip'                => '10.9.8.7',
            'key'               => '1234567',
            'login'             => 'test',
            'os'                => 'Windows',
            'osVersion'         => '8.1',
        );

    }

    public function testStoreData(){

        $store = new DataStorage($this->sentData);
        $this->sampleFilePath = \tao_helpers_File::createTempDir() . 'stored.csv';
        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\DataStorage', 'filePath');
        $ref->setAccessible(true);
        $ref->setValue($store, $this->sampleFilePath);

        $store->setIsCompatible(true)->storeData();

        $this->assertFileExists($this->sampleFilePath);

        $row = 0;
        if (($handle = fopen($this->sampleFilePath, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
                $num = count($data);

                $this->assertEquals(24, $num);
                $row ++;
                if($row === 2){
                    $this->assertEquals($this->sentData['key'],$data[0]);
                    $this->assertEquals($this->sentData['login'],$data[1]);
                    $this->assertEquals($this->sentData['ip'],$data[2]);
                    $this->assertEquals($this->sentData['browser'],$data[3]);
                    $this->assertEquals($this->sentData['browserVersion'],$data[4]);
                    $this->assertEquals($this->sentData['os'],$data[5]);
                    $this->assertEquals($this->sentData['osVersion'],$data[6]);
                    $this->assertEquals(1,$data[23]);
                }
            }
            fclose($handle);
            $this->assertEquals(2, $row);
        }

        $store->setIsCompatible(false)->storeData();

        $row = 0;
        if (($handle = fopen($this->sampleFilePath, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
                $num = count($data);
                $this->assertEquals(24, $num);
                $row ++;
                if($row === 2){
                    $this->assertEquals($this->sentData['key'],$data[0]);
                    $this->assertEquals($this->sentData['login'],$data[1]);
                    $this->assertEquals($this->sentData['ip'],$data[2]);
                    $this->assertEquals($this->sentData['browser'],$data[3]);
                    $this->assertEquals($this->sentData['browserVersion'],$data[4]);
                    $this->assertEquals($this->sentData['os'],$data[5]);
                    $this->assertEquals($this->sentData['osVersion'],$data[6]);
                    $this->assertEquals(0,$data[23]);
                }
            }
            fclose($handle);
            $this->assertEquals(2, $row);
        }
        return $store;
    }

    /**
     * @depends testStoreData
     */
    public function testGetData($store){

        $data = $store->getStoredData();
        $num = count($data);

        $this->assertEquals(24, $num);

        $this->assertEquals($this->sentData['browser'],$data['browser']);
        $this->assertEquals($this->sentData['browserVersion'],$data['browserVersion']);
        $this->assertEquals($this->sentData['ip'],$data['ip']);
        $this->assertEquals($this->sentData['key'],$data['key']);
        $this->assertEquals($this->sentData['login'],$data['login']);
        $this->assertEquals($this->sentData['os'],$data['os']);
        $this->assertEquals($this->sentData['osVersion'],$data['osVersion']);
        $this->assertEquals(0,$data['compatible']);
    }

}
 