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



namespace oat\taoClientDiagnostic\test\unit;

use oat\taoClientDiagnostic\model\CompatibilityChecker;
use Sinergi\BrowserDetector\Browser;
use Sinergi\BrowserDetector\Os;

class CompatibilityCheckerTest extends \PHPUnit_Framework_TestCase
{
    public function testCompatibleConfigTrue()
    {
        $compatibility = array(
            (object) array("compatible" => 1, "os" => "Windows", "osVersion" => "8.1", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $this->getDetectorMock(Os::class, 'Windows', '8.1'),
            $this->getDetectorMock(Browser::class, 'Chrome', '33')
        );

        $this->assertEquals(1, $checker->isCompatibleConfig());
    }

    public function testNotTestedCompatibleConfig()
    {
        $compatibility = array(
            (object) array("compatible" => 1, "os" => "Windows", "osVersion" => "8.1", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $this->getDetectorMock(Os::class, 'Windows', '8.1'),
            $this->getDetectorMock(Browser::class, 'Chrome', 'NoVersion')
        );

        $this->assertEquals(2, $checker->isCompatibleConfig());
    }

    public function testNotCompatibleConfig()
    {
        $compatibility = array(
            (object) array("compatible" => 0, "os" => "Windows", "osVersion" => "7", "browser" => "Internet Explorer", "versions" => array(9))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $this->getDetectorMock(Os::class, 'Windows', '7'),
            $this->getDetectorMock(Browser::class, 'Internet Explorer', '9')
        );

        $this->assertEquals(0, $checker->isCompatibleConfig());
    }

    protected function getDetectorMock($class, $name, $version)
    {
        $detector = $this->getMockBuilder($class)
            ->disableOriginalConstructor()
            ->setMethods(['getName', 'getVersion'])
            ->getMock();

        $detector->expects($this->once())
            ->method('getName')
            ->willReturn($name);

        $detector->expects($this->once())
            ->method('getVersion')
            ->willReturn($version);

        return $detector;
    }

}

class CompatibilityCheckerDummy extends CompatibilityChecker
{
    private $osDetector;
    private $browserDetector;

    public function __construct($compatibility, $osDetector, $browserDetector)
    {
        $this->compatibility = $compatibility;
        $this->osDetector = $osDetector;
        $this->browserDetector = $browserDetector;
    }

    protected function getBrowserDetector()
    {
        return $this->browserDetector;
    }

    public function getOsDetector()
    {
        return $this->osDetector;
    }
}
