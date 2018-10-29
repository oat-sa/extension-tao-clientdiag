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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoClientDiagnostic\scripts\install;

use oat\oatbox\extension\InstallAction;

/**
 * Class ActivateMediaIntensiveCheck
 * @package oat\taoClientDiagnostic\scripts\install
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class ActivateMediaIntensiveCheck extends InstallAction
{
    /**
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        try {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $config = $extension->getConfig('clientDiag');

            if (!isset($config['testers']) || !isset($config['testers']['intensive_bandwidth'])) {
                $config['testers']['intensive_bandwidth'] = [
                    'enabled' => false,
                    'level' => 2,
                    'tester' => 'taoClientDiagnostic/tools/bandwidth/tester',
                    'unit' => 1.2,
                    'ideal' => 45,
                    'max' => 100
                ];
            }

            $config['testers']['intensive_bandwidth']['enabled'] = true;
            $config['testers']['intensive_bandwidth']['fallbackThreshold'] = 0.2;
            $extension->setConfig('clientDiag', $config);

            return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, "The Media Intensive check has been activated!");
        } catch (\Exception $e) {
            return new \common_report_Report(\common_report_Report::TYPE_ERROR, $e->getMessage());
        }
    }
}
