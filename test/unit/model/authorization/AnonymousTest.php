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

namespace oat\taoClientDiagnostic\test\unit\model\authorization;

use oat\taoClientDiagnostic\exception\InvalidCallException;
use oat\taoClientDiagnostic\model\authorization\Anonymous;
use oat\generis\test\TestCase;

class AnonymousTest extends TestCase
{
    /**
     * @var oat\taoClientDiagnostic\model\authorization\Anonymous
     */
    private $instance;

    public function setUp(): void
    {
           $this->instance = new Anonymous();
    }

    public function tearDown(): void
    {
        $this->instance = null;
    }

    public function testIsAuthorized()
    {
        $this->assertTrue($this->instance->isAuthorized());
    }

    public function testGetAuthorizationUrl()
    {
        $this->expectException(InvalidCallException::class);
        $this->instance->getAuthorizationUrl('urlFixture');
    }
}
