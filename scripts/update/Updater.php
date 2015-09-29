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

namespace oat\taoClientDiagnostic\scripts\update;


class Updater extends \common_ext_ExtensionUpdater 
{

	/**
     * 
     * @param string $currentVersion
     * @return string $versionUpdatedTo
     */
    public function update($initialVersion) {
        
        $currentVersion = $initialVersion;
		if ($currentVersion == '1.0') {
			$currentVersion = '1.0.1';
		}

        if ($currentVersion == '1.0.1') {

            $currentVersion = '1.1.0';
        }

        if ($currentVersion == '1.1.0') {
            $accessService = \funcAcl_models_classes_AccessService::singleton();
            $anonymous = new \core_kernel_classes_Resource('http://www.tao.lu/Ontologies/generis.rdf#AnonymousRole');
            $accessService->grantModuleAccess($anonymous, 'taoClientDiagnostic', 'CompatibilityChecker');

            $currentVersion = '1.1.1';
        }

        if ($currentVersion == '1.1.1') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $extension->setConfig('clientDiag', array(
                'footer' => '',
            ));

            $currentVersion = '1.2.0';
        }

        if ($currentVersion == '1.2.0') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
            $config = $extension->getConfig('clientDiag');
            $extension->setConfig('clientDiag', array_merge($config, array(
                'performances' => array(
                    'samples' => array(
                        'taoClientDiagnostic/tools/performances/data/sample1/',
                        'taoClientDiagnostic/tools/performances/data/sample2/',
                        'taoClientDiagnostic/tools/performances/data/sample3/'
                    ),
                    'occurrences' => 10,
                    'timeout' => 30,
                    'optimal' => 0.025,
                    'threshold' => 0.25,
                ),
                'bandwidth' => array(
                    'unit' => 0.16,
                    'ideal' => 45,
                    'max' => 100,
                ),
            )));

            $currentVersion = '1.3.0';
        }

		return $currentVersion;
	}
}