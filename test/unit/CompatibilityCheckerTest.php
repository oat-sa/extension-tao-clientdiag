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
 * Copyright (c) 2015-2023 Open Assessment Technologies SA
 */

declare(strict_types=1);

namespace oat\taoClientDiagnostic\test\unit;

use GuzzleHttp\Psr7\ServerRequest;
use oat\generis\test\TestCase;
use oat\tao\model\browser\Entity\Browser as DetectedBrowser;
use oat\tao\model\browser\Service\HttpRequestBrowserDetector;
use oat\taoClientDiagnostic\model\CompatibilityChecker;
use Sinergi\BrowserDetector\Os;

class CompatibilityCheckerTest extends TestCase
{
    public function versionsProvider()
    {
        return [
            ['Chrome', '33', 'Windows', '8.1', CompatibilityChecker::COMPATIBILITY_COMPATIBLE],
            ['Chrome', '38', 'Windows', '8.1', CompatibilityChecker::COMPATIBILITY_COMPATIBLE],
            ['Chrome', '41', 'Windows', '8.1', CompatibilityChecker::COMPATIBILITY_SUPPORTED],
            ['Chrome', '45', 'Windows', '8.1', CompatibilityChecker::COMPATIBILITY_SUPPORTED],
            ['Chrome', '15', 'Windows', '', CompatibilityChecker::COMPATIBILITY_NOT_TESTED],
            ['Internet Explorer', '9', 'Windows', '7', CompatibilityChecker::COMPATIBILITY_NONE],
            ['Chrome', '43', 'Windows', '8.1', CompatibilityChecker::COMPATIBILITY_NOT_SUPPORTED],
            ['Chrome', '42', 'Windows', '10', CompatibilityChecker::COMPATIBILITY_NOT_SUPPORTED],
        ];
    }

    /**
     * @dataProvider versionsProvider
     */
    public function testIsCompatibleConfig($browserName, $browserVersion, $osName, $osVersion, $expectedResult)
    {
        $compatibility = [
            [
                'compatible' => CompatibilityChecker::COMPATIBILITY_NONE,
                'os' => 'Windows',
                'osVersion' => '7',
                'device' => 'desktop',
                'browser' => 'Internet Explorer',
                'versions' => [9]
            ],
            [
                'compatible' => CompatibilityChecker::COMPATIBILITY_COMPATIBLE,
                'os' => 'Windows',
                'osVersion' => '8.1',
                'device' => 'desktop',
                'browser' => 'Chrome',
                'versions' => [33, 34, 35]
            ],
        ];
        $supported = [
            [
                'compatible' => CompatibilityChecker::COMPATIBILITY_SUPPORTED,
                'os' => 'Windows',
                'osVersion' => '8.1',
                'device' => 'desktop',
                'browser' => 'Chrome',
                'versions' => [40, 41, 42]
            ],
        ];
        $excludedBrowsers = [
            'chrome' => ['43']
        ];
        $excludedOS = [
            'windows' => ['10']
        ];

        $checker = new CompatibilityCheckerDummy(
            $compatibility,
            $supported,
            $excludedBrowsers,
            $excludedOS,
            $this->getOsDetectorMock($osName, $osVersion, false),
            $this->getBrowserDetectorMock($browserName, $browserVersion)
        );

        $request = new ServerRequest('GET', '/');

        $this->assertEquals($checker->isCompatibleConfig($request), $expectedResult);
    }

    protected function getBrowserDetectorMock(string $name, string $version): HttpRequestBrowserDetector
    {
        $detector = $this->createMock(HttpRequestBrowserDetector::class);
        $detector->method('detect')->willReturn(new DetectedBrowser($name, $version));

        return $detector;
    }

    protected function getOsDetectorMock($name, $version, $mobile)
    {
        $detector = $this->getMockBuilder(Os::class)
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

    public function __construct(
        $compatibility,
        $supported,
        $excludedBrowsers,
        $excludedOS,
        $osDetector,
        $browserDetector
    ) {
        $this->compatibility = $compatibility;
        $this->supported = $supported;
        $this->excludedBrowsers = $excludedBrowsers;
        $this->excludedOS = $excludedOS;
        $this->osDetector = $osDetector;
        $this->browserDetector = $browserDetector;
    }

    public function getOsDetector(): Os
    {
        return $this->osDetector;
    }

    protected function getBrowserDetector(): HttpRequestBrowserDetector
    {
        return $this->browserDetector;
    }
}
