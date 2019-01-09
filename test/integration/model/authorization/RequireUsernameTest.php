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

namespace oat\taoClientDiagnostic\test\integration\model\authorization;

use oat\generis\test\TestCase;
use oat\taoClientDiagnostic\exception\InvalidLoginException;
use oat\taoClientDiagnostic\model\authorization\RequireUsername;

class RequireUsernameTest extends TestCase
{
    /** @var RequireUsername */
    private $instance;

    public function setUp()
    {
        $this->instance = new RequireUsername();
        $aclMock = $this->getMockBuilder('\tao_models_classes_UserService')
            ->disableOriginalConstructor()
            ->getMock();
        $aclMock->method('loginExists')
            ->willReturn(false);
        $this->instance->setServiceLocator($this->getServiceLocatorMock([
            \tao_models_classes_UserService::SERVICE_ID => $aclMock
        ]));

    }

    public function tearDown()
    {
        $this->instance = null;
    }

    public function testIsAuthorized()
    {
        $_COOKIE['login'] = 'loginFixture';
        $this->assertTrue($this->instance->isAuthorized());

        unset($_COOKIE['login']);
        $this->assertFalse($this->instance->isAuthorized());
    }

    public function testGetAuthorizationUrl()
    {
        $urlFixture = 'fakeUrl';
        $expectedResult = _url('login', 'Authenticator', 'taoClientDiagnostic', array('successCallback' => $urlFixture));
        $this->assertEquals($this->instance->getAuthorizationUrl($urlFixture), $expectedResult);
    }

    public function getLoginData()
    {
        return [
            ['', true, InvalidLoginException::class],
            ['loginFixture', true, InvalidLoginException::class],
            ['loginFixture', false, '', true, true],
            ['loginFixture', true, InvalidLoginException::class, true],
        ];
    }

    /**
     * @dataProvider getLoginData
     */
    public function testValidateLogin($loginFixture, $hasException, $exception, $useACLService = false, $returnACL = false)
    {
        if ($useACLService) {
            $aclFixture = $this->getMockBuilder('\tao_models_classes_UserService')
                ->disableOriginalConstructor()
                ->getMock();
            $aclFixture->method('loginExists')
                ->willReturn($returnACL);

            $this->instance->setServiceLocator($this->getServiceLocatorMock([
                \tao_models_classes_UserService::SERVICE_ID => $aclFixture
            ]));
        }

        if ($hasException) {
            $this->expectException($exception);
        }

        $result = $this->instance->validateLogin($loginFixture);

        if (!$hasException) {
            $this->assertTrue($result);
        }
    }
}