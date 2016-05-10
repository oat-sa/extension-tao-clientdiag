<?php
namespace oat\taoClientDiagnostic\test;

use oat\taoClientDiagnostic\model\CompatibilityChecker;

class CompatibilityCheckerTest extends \PHPUnit_Framework_TestCase
{

    public function testCompatibleConfigTrue()
    {
        $sentData = array(
            'os'                => 'Windows',
            'osVersion'         => '8.1',
            'browser'           => 'Chrome',
            'browserVersion'    => '33'
        );

        $checker = new CompatibilityChecker($sentData);

        $compatibility = array(
            (object) array("compatible" => 1, "os" => "Windows", "osVersion" => "8.1", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );
        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\CompatibilityChecker', 'compatibility');
        $ref->setAccessible(true);
        $ref->setValue($checker, $compatibility);

        $return = $checker->isCompatibleConfig();

        $this->assertEquals($return, 1);

    }

    public function testNotTestedCompatibleConfig()
    {
        $sentData = array(
            'os'                => 'Windows',
            'osVersion'         => '8.1',
            'browser'           => 'Chrome',
            'browserVersion'    => 'NotVerison'
        );

        $checker = new CompatibilityChecker($sentData);

        $compatibility = array(
            (object) array("compatible" => 1, "os" => "Windows", "osVersion" => "8.1", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );
        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\CompatibilityChecker', 'compatibility');
        $ref->setAccessible(true);
        $ref->setValue($checker, $compatibility);

        $return = $checker->isCompatibleConfig();

        $this->assertEquals($return, 2);
    }

    public function testNotCompatibleConfig()
    {
        $sentData = array(
            'os'                => 'Windows',
            'osVersion'         => '7',
            'browser'           => 'Internet Explorer',
            'browserVersion'    => '9'
        );

        $checker = new CompatibilityChecker($sentData);

        $compatibility = array(
            (object) array("compatible" => 0, "os" => "Windows", "osVersion" => "7", "browser" => "Internet Explorer", "versions" => array(9))
        );
        $ref = new \ReflectionProperty('oat\taoClientDiagnostic\model\CompatibilityChecker', 'compatibility');
        $ref->setAccessible(true);
        $ref->setValue($checker, $compatibility);

        $return = $checker->isCompatibleConfig();

        $this->assertEquals($return, 0);
    }

}
 