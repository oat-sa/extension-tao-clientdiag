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
 * Copyright (c) 2015-2019 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoClientDiagnostic\model;

use oat\oatbox\service\ConfigurableService;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticServiceInterface;
use Sinergi\BrowserDetector\Browser;
use Sinergi\BrowserDetector\Os;
use tao_models_classes_FileNotFoundException;

class CompatibilityChecker extends ConfigurableService
{
    public const SERVICE_ID = 'taoClientDiagnostic/CompatibilityChecker';

    public const COMPATIBILITY_NONE = 0;
    public const COMPATIBILITY_COMPATIBLE = 1;
    public const COMPATIBILITY_NOT_TESTED = 2;
    public const COMPATIBILITY_SUPPORTED = 3;
    public const COMPATIBILITY_NOT_SUPPORTED = 4;

    protected $compatibility;
    protected $supported;

    /**
     * Extract compatibility file
     * @throws tao_models_classes_FileNotFoundException
     */
    public function getCompatibilityList()
    {
        if (!$this->compatibility) {
            $compatibilityFile = __DIR__ . '/../include/compatibility.json';

            if (!file_exists($compatibilityFile)) {
                throw new tao_models_classes_FileNotFoundException("Unable to find the compatibility file");
            }
            $this->compatibility = json_decode(file_get_contents($compatibilityFile), true);
        }
        return $this->compatibility;
    }

    /**
     * Fetch the support list
     * @throws tao_models_classes_FileNotFoundException
     */
    public function getSupportedList()
    {
        if (!$this->supported) {
            $service = $this->getServiceLocator()->get(DiagnosticServiceInterface::SERVICE_ID);
            $config = $service->getDiagnosticJsConfig();
            $supportListUrl = $config['diagnostic']['testers']['browser']['browserslistUrl'];

            if (!$supportListUrl) {
                throw new tao_models_classes_FileNotFoundException("The URL to the list of supported browser is configured");
            }
            $supportedList = json_decode(file_get_contents($supportListUrl), true);

            if (!$supportedList) {
                throw new tao_models_classes_FileNotFoundException("Unable to fetch the list of supported browsers");
            }

            $this->supported = array_map(function ($entry) {
                $entry['compatible'] = self::COMPATIBILITY_SUPPORTED;

                $entry['versions'] = array_reduce($entry['versions'], function ($versions, $version) {
                    return array_merge($versions, explode('-', $version));
                }, []);

                return $entry;
            }, $supportedList);
        }
        return $this->supported;
    }

    /**
     * Standard version_compare threats that  5.2 < 5.2.0, 5.2 < 5.2.1, ...
     *
     * @param $ver1
     * @param $ver2
     * @param null|string @see http://php.net/manual/en/function.version-compare.php
     * @return mixed
     */
    protected function versionCompare($ver1, $ver2, $operator = null)
    {
        $ver1 = preg_replace('#(\.0+)+($|-)#', '', $ver1);
        $ver2 = preg_replace('#(\.0+)+($|-)#', '', $ver2);
        if ($operator === null) {
            $result = version_compare($ver1, $ver2);
        } else {
            $result = version_compare($ver1, $ver2, $operator);
        }
        return $result;
    }

    /**
     * Check if a version is greater or equal to the listed ones
     * @param $testedVersion
     * @param $versionList
     * @return bool
     */
    protected function checkVersion($testedVersion, $versionList) {
        if (empty($versionList)) {
            return true;
        }

        foreach ($versionList as $version) {
            if ($this->versionCompare($testedVersion, $version) >= 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the client browser, and the OS, meet the requirements supplied in a validation list.
     * Returns a value corresponding to the COMPATIBILITY_* constants.
     * @param array $validationList
     * @return int
     */
    protected function checkSupport(array $validationList): int
    {
        $clientDevice = $this->getOsDetector()->isMobile() ? 'mobile' : 'desktop';
        $clientOS = strtolower($this->getOsDetector()->getName());
        $clientOSVersion = $this->getOsDetector()->getVersion();
        $clientBrowser = strtolower($this->getBrowserDetector()->getName());
        $clientBrowserVersion = $this->getBrowserDetector()->getVersion();

        foreach ($validationList as $entry) {
            if ($clientDevice !== $entry['device']) {
                continue;
            }

            if ($entry['os']) {
                if (strtolower($entry['os']) !== $clientOS) {
                    continue;
                }

                if ($entry['osVersion'] && $this->versionCompare($clientOSVersion, $entry['osVersion']) !== 0) {
                    continue;
                }
            }

            if (strtolower($entry['browser']) !== $clientBrowser) {
                continue;
            }

            if ($this->checkVersion($clientBrowserVersion, $entry['versions'])) {
                if (isset($entry['compatible'])) {
                    return $entry['compatible'];
                }
                return self::COMPATIBILITY_COMPATIBLE;
            }
        }

        return self::COMPATIBILITY_NOT_TESTED;
    }

    /**
     * Check if the detected browser is compatible.
     * It also pays attention to the operating system.
     * Based on json file
     * If couple is found on file:
     *  - return compatibility key, see the constants COMPATIBILITY_* (1=ok, 0=not ok)
     *  - return 2 if not tested
     * @return int
     * @throws tao_models_classes_FileNotFoundException
     */
    public function isCompatibleConfig()
    {
        $support = $this->checkSupport($this->getSupportedList());

        if ($support === self::COMPATIBILITY_NOT_TESTED) {
            $support = $this->checkSupport($this->getCompatibilityList());
        }

        return $support;
    }


    /**
     * Get the browser detector
     *
     * @return Browser
     */
    protected function getBrowserDetector()
    {
        return new Browser();
    }

    /**
     * Get the operating system detector
     *
     * @return Os
     */
    protected function getOsDetector()
    {
        return new Os();
    }
}
