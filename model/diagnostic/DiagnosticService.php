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
 *
 */

namespace oat\taoClientDiagnostic\model\diagnostic;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\theme\ThemeService;
/**
 * Class DiagnosticService
 * @package oat\taoClientDiagnostic\model\diagnostic
 * @author Aleh Hutnikau, <hutnikau@apt.com>
 */
class DiagnosticService extends ConfigurableService implements DiagnosticServiceInterface
{
    /**
     * (non-PHPdoc)
     * @see \oat\taoClientDiagnostic\model\diagnostic\DiagnosticServiceInterface::getDiagnosticJsConfig()
     */
    public function getDiagnosticJsConfig()
    {
        $config = $this->getRawConfig();
        // override samples based on graphical theme, why not
        $config['testers']['performance']['samples'] = $this->getPerformanceSamples();
        return $config;
    }

    /**
     * Returns the raw configuration of the diagtool
     * @return array
     */
    protected function getRawConfig()
    {
        return $this->getServiceManager()->get('taoClientDiagnostic/clientDiag')->getConfig();
    }

    /**
     * Returns the correct samples to be used for the performance tests
     * @return array
     */
    protected function getPerformanceSamples()
    {
        $themeService = $this->getServiceManager()->get(ThemeService::SERVICE_ID);
        $themeId = $themeService->getCurrentThemeId();
        $config = $this->getRawConfig();
        $sampleConfig =  $config['testers']['performance']['samples'];
        if (is_array(reset($sampleConfig))) {
            if (array_key_exists($themeId, $sampleConfig)) {
                $sample = $sampleConfig[$themeId];
            } else {
                $sample = array_shift($sampleConfig);
            }
        } else {
            $sample = $sampleConfig;
        }
        return $sample;
    }

    /**
     * @deprecated please use getDiagnosticJsConfig()
     */
    public function getTesters()
    {
        return $this->getDiagnosticJsConfig();
    }
}