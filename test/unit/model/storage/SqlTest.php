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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoClientDiagnostic\test\unit\model\model;

use oat\generis\test\integration\tools\InvokeMethodTrait;
use oat\generis\test\TestCase;
use oat\taoClientDiagnostic\model\storage\Sql;

class SqlTest extends TestCase
{
    use InvokeMethodTrait;

    /**
     * @var Sql
     */
    private $subject;

    public function setUp()
    {
        $this->subject = new Sql();
    }

    /**
     * @dataProvider valueProvider
     */
    public function testCastValue($fieldName, $value, $expectedType)
    {
        $this->assertInternalType(
            $expectedType,
            $this->invokeMethod($this->subject, 'castValue', [$fieldName, $value])
        );
    }


    /**
     * @return array
     */
    public function valueProvider()
    {
        return [
            ['size', 1, 'integer'],
            ['size', 't1', 'string'],
            [Sql::DIAGNOSTIC_BANDWIDTH_SIZE, '12', 'integer'],
            [Sql::DIAGNOSTIC_INTENSIVE_BANDWIDTH_SIZE, '12.00', 'integer'],
            [Sql::DIAGNOSTIC_PERFORMANCE_COUNT, '12.33', 'integer'],
            [Sql::DIAGNOSTIC_BANDWIDTH_COUNT, 22, 'integer'],
            [Sql::DIAGNOSTIC_INTENSIVE_BANDWIDTH_COUNT, '33.02', 'integer'],
            [Sql::DIAGNOSTIC_OSVERSION, 10.0, 'string'],
            [Sql::DIAGNOSTIC_OSVERSION, 8, 'string'],
            [Sql::DIAGNOSTIC_BROWSERVERSION, 33.02, 'string'],
            [Sql::DIAGNOSTIC_BROWSERVERSION, 73, 'string'],
            ['another', '33.02', 'float'],
            ['another3', 'omg', 'string'],
            ['another2', 33.02, 'float'],
        ];
    }
}
