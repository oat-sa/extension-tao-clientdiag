<?php
namespace oat\taoClientDiagnostic\test;

use oat\taoClientDiagnostic\model\CompatibilityChecker;

class CompatibilityCheckerTest extends \PHPUnit_Framework_TestCase {

    public function testCompatibleConfigTrue(){
        $sentData = array(
            'os'                => 'Windows',
            'osVersion'         => '8.1',
            'browser'           => 'Chrome',
            'browserVersion'    => '33'
        );

        $checker = new CompatibilityChecker($sentData);

        
        $compatibility = json_decode(json_encode(array(
            array("os" => "Windows", "osVersion" => "8.1", "browser" => "Chrome", "versions" => array(33, 34, 35))
        )));
        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\CompatibilityChecker', 'compatibility');
        $ref->setAccessible(true);
        $ref->setValue($checker, $compatibility);

        $return = $checker->isCompatibleConfig();

        $this->assertTrue($return);

    }

    public function testCompatibleConfigFalse(){

        $sentData = array(
            'os'                => 'Windows',
            'osVersion'         => '8.1',
            'browser'           => 'Chrome',
            'browserVersion'    => 'NotVerison'
        );

        $checker = new CompatibilityChecker($sentData);

        $compatibility = json_decode(json_encode(array(
            array("os" => "Windows", "osVersion" => "8.1", "browser" => "Chrome", "versions" => array(33, 34, 35))
        )));
        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\CompatibilityChecker', 'compatibility');
        $ref->setAccessible(true);
        $ref->setValue($checker, $compatibility);

        $return = $checker->isCompatibleConfig();

        $this->assertFalse($return);


    }

}
 