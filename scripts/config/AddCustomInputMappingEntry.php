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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoClientDiagnostic\scripts\config;

use oat\oatbox\extension\InstallAction;
use \common_report_Report as Report;

/**
 * Class AddCustomInputMappingEntry
 * @package oat\taoClientDiagnostic\scripts\config
 */
class AddCustomInputMappingEntry extends InstallAction
{
    /**
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        if (empty($params[0])) {
            return new Report(Report::TYPE_ERROR, "Missing argument 'key'.");
        } elseif (empty($params[1])) {
            return new Report(Report::TYPE_ERROR, "Missing argument 'mapping'");
        }

        $key = $params[0];
        $mapping = $params[1];

        $extension = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoClientDiagnostic');
        $config = $extension->getConfig('clientDiag');

        $config['customInput'][$key] = $mapping;

        $extension->setConfig('clientDiag', $config);

        return new Report(Report::TYPE_SUCCESS, "Mapping '${key}':'${mapping}' successfully registered.");
    }
}
