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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoClientDiagnostic\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\tao\model\ClientLibConfigRegistry;

class RegisterDiagnosticComponent extends InstallAction
{
    /**
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        ClientLibConfigRegistry::getRegistry()
            ->register('taoClientDiagnostic/component/diagnostic/diagnosticLoader', [
                'diagnostics' => [
                    'diagnostic' => [
                        'id' => 'default',
                        'module' => 'taoClientDiagnostic/tools/diagnostic/diagnostic',
                        'bundle' => 'taoClientDiagnostic/loader/diagnostic.min',
                        'position' => null,
                        'name' => 'diagnostic',
                        'description' => 'default diagnostic',
                        'category' => 'diagnostic',
                        'active' => true,
                        'tags' => []
                    ]
                ]
            ]);

        return \common_report_Report::createSuccess('Diagnostic component registered');
    }
}