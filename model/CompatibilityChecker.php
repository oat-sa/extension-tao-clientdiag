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
 * Copyright (c) 2015-2021 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoClientDiagnostic\model;

use oat\oatbox\service\ConfigurableService;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticServiceInterface;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedBrowserClassService;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedOsClassService;
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
    protected $excludedBrowsers;
    protected $excludedOS;

    /**
     * Extract compatibility file
     * @throws tao_models_classes_FileNotFoundException
     */
    public function getCompatibilityList(): array
    {
        if (!$this->compatibility) {
            $compatibilityFile = __DIR__ . '/../include/compatibility.json';

            if (!file_exists($compatibilityFile)) {
                throw new tao_models_classes_FileNotFoundException('Unable to find the compatibility file');
            }
            $this->compatibility = json_decode(file_get_contents($compatibilityFile), true);
        }
        return $this->compatibility;
    }

    /**
     * Fetch the support list
     * @throws tao_models_classes_FileNotFoundException
     */
    public function getSupportedList(): array
    {
        if (!$this->supported) {
            $service = $this->getServiceLocator()->get(DiagnosticServiceInterface::SERVICE_ID);
            $config = $service->getDiagnosticJsConfig();
            $supportListUrl = $config['diagnostic']['testers']['browser']['browserslistUrl'];

            if (!$supportListUrl) {
                throw new tao_models_classes_FileNotFoundException('The URL to the list of supported browser is not configured');
            }
            $supportedList = json_decode(file_get_contents($supportListUrl), true);

            if (!$supportedList) {
                throw new tao_models_classes_FileNotFoundException('Unable to fetch the list of supported browsers');
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

    protected function filterVersion($version): string
    {
        return preg_replace('#(\.0+)+($|-)#', '', $version);
    }

    /**
     * Standard version_compare threats that  5.2 < 5.2.0, 5.2 < 5.2.1, ...
     */
    protected function versionCompare($ver1, $ver2): int
    {
        return version_compare($this->filterVersion($ver1), $this->filterVersion($ver2));
    }

    /**
     * Check if a version is greater or equal to the listed ones
     */
    protected function checkVersion($testedVersion, $versionList): bool
    {
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
     * Checks if a version is excluded
     */
    protected function isExcluded($name, $version, $exclusionsList): bool
    {
        $name = strtolower($name);
        if (count($exclusionsList) && array_key_exists($name, $exclusionsList)) {
            $explodedVersion = explode('.', $version);
            $excludedVersions = $exclusionsList[$name];
            foreach ($excludedVersions as $excludedVersion) {
                if (empty($excludedVersion)) {
                    // any version is excluded
                    return true;
                }
                $explodedExcludedVersion = explode('.', $excludedVersion);
                if (array_slice($explodedVersion, 0, count($explodedExcludedVersion)) == $explodedExcludedVersion) {
                    // greedy or exact version is excluded
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if a browser is excluded
     */
    public function isBrowserExcluded($name, $version): bool
    {
        if (!$this->excludedBrowsers) {
            $service = $this->getServiceLocator()->get(ExcludedBrowserClassService::SERVICE_ID);
            $this->excludedBrowsers = $service->getExclusionsList();
        }
        return $this->isExcluded($name, $version, $this->excludedBrowsers);
    }

    /**
     * Checks if an OS is excluded
     */
    public function isOsExcluded($name, $version): bool
    {
        if (!$this->excludedOS) {
            $service = $this->getServiceLocator()->get(ExcludedOsClassService::SERVICE_ID);
            $this->excludedOS = $service->getExclusionsList();
        }
        return $this->isExcluded($name, $version, $this->excludedOS);
    }

    /**
     * Checks if the client browser, and the OS, meet the requirements supplied in a validation list.
     * Returns a value corresponding to the COMPATIBILITY_* constants.
     * @throws tao_models_classes_FileNotFoundException
     */
    public function isCompatibleConfig(): int
    {
        $clientDevice = $this->getOsDetector()->isMobile() ? 'mobile' : 'desktop';
        $clientOS = strtolower($this->getOsDetector()->getName());
        $clientOSVersion = $this->getOsDetector()->getVersion();
        $clientBrowser = strtolower($this->getBrowserDetector()->getName());
        $clientBrowserVersion = $this->getBrowserDetector()->getVersion();

        if ($this->isOsExcluded($clientOS, $clientOSVersion) ||
            $this->isBrowserExcluded($clientBrowser, $clientBrowserVersion)) {
            return self::COMPATIBILITY_NOT_SUPPORTED;
        }

        $validationList = array_merge($this->getSupportedList(), $this->getCompatibilityList());

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
     * Get the browser detector
     */
    protected function getBrowserDetector(): Browser
    {
        return new Browser();
    }

    /**
     * Get the operating system detector
     */
    protected function getOsDetector(): Os
    {
        return new Os();
    }
}
