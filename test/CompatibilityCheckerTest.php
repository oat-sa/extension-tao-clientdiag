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
 * Copyright (c) 2015 Open Assessment Technologies SA
 */



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
