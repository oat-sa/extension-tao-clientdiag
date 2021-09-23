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
use oat\generis\test\TestCase;

class CompatibilityCheckerTest extends TestCase
{
    public function testCompatibleConfigCompatible()
    {
        $compatibility = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_COMPATIBLE, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );
        $supported = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_SUPPORTED, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(40, 41, 42))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $supported,
            $this->getDetectorMock(Os::class, 'Windows', '8.1', false),
            $this->getDetectorMock(Browser::class, 'Chrome', '33', false)
        );

        $this->assertEquals(CompatibilityChecker::COMPATIBILITY_COMPATIBLE, $checker->isCompatibleConfig());
    }

    public function testCompatibleConfigSupported()
    {
        $compatibility = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_COMPATIBLE, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );
        $supported = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_SUPPORTED, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(40, 41, 42))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $supported,
            $this->getDetectorMock(Os::class, 'Windows', '8.1', false),
            $this->getDetectorMock(Browser::class, 'Chrome', '41', false)
        );

        $this->assertEquals(CompatibilityChecker::COMPATIBILITY_SUPPORTED, $checker->isCompatibleConfig());
    }

    public function testCompatibleConfigNotTested()
    {
        $compatibility = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_COMPATIBLE, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(33, 34, 35))
        );
        $supported = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_SUPPORTED, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(40, 41, 42))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $supported,
            $this->getDetectorMock(Os::class, 'Windows', '8.1', false),
            $this->getDetectorMock(Browser::class, 'Chrome', 'NoVersion', false)
        );

        $this->assertEquals(CompatibilityChecker::COMPATIBILITY_NOT_TESTED, $checker->isCompatibleConfig());
    }

    public function testCompatibleConfigNone()
    {
        $compatibility = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_NONE, "os" => "Windows", "osVersion" => "7", "device" => "desktop", "browser" => "Internet Explorer", "versions" => array(9))
        );
        $supported = array(
            array("compatible" => CompatibilityChecker::COMPATIBILITY_SUPPORTED, "os" => "Windows", "osVersion" => "8.1", "device" => "desktop", "browser" => "Chrome", "versions" => array(40, 41, 42))
        );

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $supported,
            $this->getDetectorMock(Os::class, 'Windows', '7', false),
            $this->getDetectorMock(Browser::class, 'Internet Explorer', '9', false)
        );

        $this->assertEquals(CompatibilityChecker::COMPATIBILITY_NONE, $checker->isCompatibleConfig());
    }

    protected function getDetectorMock($class, $name, $version, $mobile)
    {
        $detector = $this->getMockBuilder($class)
            ->disableOriginalConstructor()
            ->setMethods(['getName', 'getVersion', 'isMobile'])
            ->getMock();

        $detector->expects($this->any())
            ->method('getName')
            ->willReturn($name);

        $detector->expects($this->any())
            ->method('getVersion')
            ->willReturn($version);


        $detector->expects($this->any())
            ->method('isMobile')
            ->willReturn($mobile);

        return $detector;
    }

}

class CompatibilityCheckerDummy extends CompatibilityChecker
{
    private $osDetector;
    private $browserDetector;

    public function __construct($compatibility, $supported, $osDetector, $browserDetector)
    {
        $this->compatibility = $compatibility;
        $this->supported = $supported;
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
