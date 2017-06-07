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

namespace oat\taoClientDiagnostic\model;

use oat\taoClientDiagnostic\model\browserDetector\WebBrowserService;
use oat\taoClientDiagnostic\model\browserDetector\OSService;
use oat\oatbox\service\ConfigurableService;

class CompatibilityCheckerService extends ConfigurableService
{

    const SERVICE_ID = 'taoClientDiagnostic/CompatibilityCheckerService';

    const OPTION_COMPATIBILITY_FILE = 'compatibility_file';

    const CHECK_BROWSER = 1;
    const CHECK_OS = 2;

    protected $os, $osVersion, $browser, $browserVersion, $compatibility;

    /**
     * CompatibilityChecker constructor
     * Check parameter required
     * Extract compatibility file
     * @throws \common_exception_MissingParameter
     * @throws \tao_models_classes_FileNotFoundException
     */
    function __construct($options = [])
    {
        parent::__construct($options);
        $osService = OSService::singleton();
        $browserService = WebBrowserService::singleton();

        $this->browser        = $browserService->getClientName();
        $this->browserVersion = $browserService->getClientVersion();
        $this->os             = $osService->getClientName();
        $this->osVersion      = $osService->getClientVersion();

        $compatibilityFile = $this->getOption(self::OPTION_COMPATIBILITY_FILE);

        if (!file_exists($compatibilityFile)) {
            throw new \tao_models_classes_FileNotFoundException("Unable to find the compatibility file");
        }
        $this->compatibility = json_decode(file_get_contents($compatibilityFile));
    }

    /**
     * Check if couple of client os & browser are compatible
     * Based on json file
     * If couple is found on file:
     *  - return compatibility key (1=ok, 0=not ok)
     *  - return 2 if not tested
     * @return int
     */
    public function isCompatibleConfig($check = 3)
    {
        $browserVersion = explode('.', $this->browserVersion);
        $rules = array_filter($this->compatibility, function ($val) {
            return $val->os === $this->os;
        });

        foreach ($rules as $rule) {
            $validOs = true;
            $validBrowser = false;

            if ($rule->osVersion !== "") {
                $validOs = $this->versionCompare($this->osVersion, $rule->osVersion) === 0;
            }

            if ($check === self::CHECK_OS && $validOs && $rule->compatible) {
                return 1;
            }

            //browser validation
            if ($rule->browser == $this->browser && empty($rule->versions)) {
                // all versions work
                $validBrowser = true;
            } elseif($rule->browser == $this->browser) {
                // it is valid if the version is in the array
                // OR if the browser is chrome or firefox and it is a newer version than those in the array
                $validBrowser = in_array($browserVersion[0], $rule->versions)
                    || (in_array($rule->browser, ['Chrome', 'Firefox']) && $browserVersion[0] > max($rule->versions));
            } else {
                $validBrowser = false;
            }

            if ($validOs && $validBrowser) {
                return $rule->compatible;
            }
        }

        return 2;
    }

    /**
     * Standard version_compare threats that  5.2 < 5.2.0, 5.2 < 5.2.1, ...
     *
     * @param $ver1
     * @param $ver2
     * @param null|string @see http://php.net/manual/en/function.version-compare.php
     * @return mixed
     */
    public function versionCompare($ver1, $ver2, $operator = null)
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
}