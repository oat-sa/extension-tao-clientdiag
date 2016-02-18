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

namespace oat\taoClientDiagnostic\test\model\authorization;

use oat\taoClientDiagnostic\model\authorization\RequireUsername;

class RequireUsernameTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var oat\taoClientDiagnostic\model\authorization\RequireUsername
     */
    private $instance;

    public function setUp()
    {
        $this->instance = new RequireUsername();
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

    public  function getLoginData()
    {
        return [
            ['', true, '\oat\taoClientDiagnostic\exception\InvalidLoginException'],
            ['loginFixture', true, '\oat\taoClientDiagnostic\exception\InvalidLoginException'],
            ['loginFixture', false, '', true, true],
            ['loginFixture', true, '\oat\taoClientDiagnostic\exception\InvalidLoginException', true],

        ];
    }

    /**
     * @dataProvider getLoginData
     */
    public function testValidateLogin($loginFixture, $hasException, $exception, $useACLService = false, $returnACL = false)
    {
        if ($useACLService) {
            $AclFixture = $this->getMockBuilder('\tao_models_classes_UserService')
                ->disableOriginalConstructor()
                ->getMock();
            $AclFixture->method('loginExists')
                ->willReturn($returnACL);

            $ref = new \ReflectionProperty('\tao_models_classes_Service', 'instances');
            $ref->setAccessible(true);
            $ref->setValue(null, array('tao_models_classes_UserService' => $AclFixture));
        }

        if ($hasException) {
            $this->setExpectedException($exception);
        }

        $result = $this->instance->validateLogin($loginFixture);

        if (!$hasException) {
            $this->assertTrue($result);
        }

        if ($useACLService) {
            $ref = new \ReflectionProperty('tao_models_classes_Service', 'instances');
            $ref->setAccessible(true);
            $ref->setValue(null, array());
        }
    }
}