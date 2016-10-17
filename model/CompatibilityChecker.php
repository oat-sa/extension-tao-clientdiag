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


class CompatibilityChecker
{

    private $os, $osVersion, $browser, $browserVersion, $compatibility;

    /**
     * CompatibilityChecker constructor
     * Check parameter required
     * Extract compatibility file
     * @throws \common_exception_MissingParameter
     * @throws \tao_models_classes_FileNotFoundException
     */
    function __construct()
    {
        $osService = OSService::singleton();
        $browserService = WebBrowserService::singleton();

        $this->browser        = $browserService->getClientName();
        $this->browserVersion = $browserService->getClientVersion();
        $this->os             = $osService->getClientName();
        $this->osVersion      = $osService->getClientVersion();

        $compatibilityFile = __DIR__ . '/../include/compatibility.json';

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
    public function isCompatibleConfig()
    {
        $browserVersion = explode('.', $this->browserVersion);

        $osVersion = explode('.', $this->osVersion);
        foreach ($this->compatibility as $rule) {
            //os name
            if ($rule->os === $this->os) {
                //os Version
                $validOs = true;
                if ($rule->osVersion !== "") {
                    foreach (explode('.', $rule->osVersion) as $key => $version) {
                        if (!isset($osVersion[$key]) || $osVersion[$key] !== $version) {
                            $validOs = false;
                        }
                    }
                }

                //browser validation
                if (empty($rule->versions)) {
                    // all versions work
                    $isValid = true;
                } else {
                    // it is valid if the version is in the array
                    // OR if the browser is chrome or firefox and it is a newer version than those in the array
                    $isValid = in_array($browserVersion[0], $rule->versions)
                        || (in_array($rule->browser,
                                array('Chrome', 'Firefox')) && $browserVersion[0] > max($rule->versions));
                }

                if ($validOs && ($rule->browser === ""
                        || $rule->browser === $this->browser && $isValid)
                ) {
                    return $rule->compatible;
                }
            }
        }
        return 2;
    }
}