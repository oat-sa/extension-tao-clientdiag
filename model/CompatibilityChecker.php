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


class CompatibilityChecker
{

    private $os;
    private $osVersion;
    private $browser;
    private $browserVersion;
    private $compatibility;

    function __construct($browser, $browserVersion, $os, $osVersion)
    {
        $this->browser = $browser;
        $this->browserVersion = $browserVersion;
        $this->os = $os;
        $this->osVersion = $osVersion;

        $compatibilityFile = __DIR__ . '/../include/compatibility.json';
        if (!file_exists($compatibilityFile)) {
            throw new \tao_models_classes_FileNotFoundException("Unable to find the compatibility file");
        }
        $this->compatibility = json_decode(file_get_contents($compatibilityFile));
    }

    public function isCompatibleConfig()
    {
        $browserVersion = explode('.', $this->browserVersion);

        $osVersion = explode('.', $this->osVersion);
        foreach ($this->compatibility as $rule) {
            //os name
            if ($rule->os === $this->os) {
                //os Version
                if ($rule->osVersion !== "") {
                    foreach (explode('.', $rule->osVersion) as $key => $version) {
                        if ($osVersion[$key] !== $version) {
                            return false;
                        }
                    }
                }

                //browser validation
                if (empty($rule->versions)) {
                    $isValid = true;
                } else {
                    $isValid = in_array($browserVersion[0], $rule->versions) || $browserVersion[0] > max($rule->versions);
                }

                if ($rule->browser === ""
                    || $rule->browser === $this->browser && $isValid
                ) {
                    return true;
                }
            }
        }

        return false;
    }


} 