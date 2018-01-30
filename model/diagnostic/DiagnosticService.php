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
        $config['testers']['performance']['samples'] = $this->getConfigByTheme($config['testers']['performance']['samples']);
        $config['testers']['screen']['threshold'] = $this->getConfigByTheme($config['testers']['screen']['threshold']);
        return $config;
    }

    /**
     * Returns the raw configuration of the diagtool
     * @return array
     */
    protected function getRawConfig()
    {
        return $this->getServiceLocator()->get('taoClientDiagnostic/clientDiag')->getConfig();
    }

    /**
     * Returns the current theme's related config
     * @param array $config
     * @param string $themeId
     * @return array|mixed
     */
    protected function getConfigByTheme(array $config, $themeId = null)
    {
        if (is_null($themeId)) {
            $themeService = $this->getServiceLocator()->get(ThemeService::SERVICE_ID);
            $themeId = $themeService->getCurrentThemeId();
        }
        if (is_array(reset($config))) {
            if (array_key_exists($themeId, $config)) {
                $config = $config[$themeId];
            } else {
                $config = array_shift($config);
            }
        }
        return $config;
    }

    /**
     * @deprecated please use getDiagnosticJsConfig()
     */
    public function getTesters()
    {
        return $this->getDiagnosticJsConfig();
    }
}
