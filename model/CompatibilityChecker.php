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

    private $os, $osVersion, $browser, $browserVersion, $compatibility, $data, $dataList;

    function __construct($data)
    {
        $this->dataList = array_keys($data);

        //compatibility data aren't there
        if(!isset($data['browser']) || !isset($data['browserVersion']) || !isset($data['os']) || !isset($data['osVersion'])){
            throw new \common_exception_MissingParameter('browser / browserVersion / os / osVersion');
        }

        $this->browser = $data['browser'];
        $this->browserVersion = $data['browserVersion'];
        $this->os = $data['os'];
        $this->osVersion = $data['osVersion'];

        $this->data = array_values($data);

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
                        || (in_array($rule->browser, array('Chrome','Firefox')) && $browserVersion[0] > max($rule->versions));
                }

                if ($validOs && ($rule->browser === ""
                    || $rule->browser === $this->browser && $isValid)
                ) {
                    return true;
                }
            }
        }

        return false;
    }


} 