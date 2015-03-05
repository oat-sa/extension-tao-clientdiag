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

namespace oat\taoClientDiagnostic\controller;

use oat\taoClientDiagnostic\model\DataStorage;
use \oat\taoClientDiagnostic\model\CompatibilityChecker as CompatibilityCheckerModel;

class CompatibilityChecker extends \tao_actions_CommonModule{

    private $ip;
    private $os;
    private $osVersion;
    private $browser;
    private $browserVersion;


    public function index(){
        $this->setData('clientConfigUrl',$this->getClientConfigUrl());
        $this->setView('CompatibilityChecker/index.tpl');

    }

    public function check(){
        if(!empty($this->getRequest()->getParameters())){
            $this->getData();
            $store = new DataStorage($this->browser, $this->browserVersion, $this->ip, $this->os, $this->osVersion);
            $checker = new CompatibilityCheckerModel($this->browser, $this->browserVersion, $this->os, $this->osVersion);
            $isCompatible = $checker->isCompatibleConfig();
            if($store->storeData($isCompatible)){
                if($isCompatible){
                    $this->returnJson(array('success' => true, 'image' => '../views/img/tick.svg'));
                    return;
                }
            }

        }

        $this->returnJson(array('success' => false, 'image' => '../views/img/cross.svg'));
    }

    private function getData(){
        if(!$this->hasRequestParameter('os')){
            throw new \common_exception_MissingParameter('os');
        }
        if(!$this->hasRequestParameter('osVersion')){
            throw new \common_exception_MissingParameter('osVersion');
        }
        if(!$this->hasRequestParameter('browser')){
            throw new \common_exception_MissingParameter('browser');
        }
        if(!$this->hasRequestParameter('browserVersion')){
            throw new \common_exception_MissingParameter('browserVersion');
        }

        $this->ip = $_SERVER['REMOTE_ADDR'];
        $this->os = $this->getRequestParameter('os');
        $this->osVersion = preg_replace('/[^\w\.]/','',$this->getRequestParameter('osVersion'));
        $this->browser = $this->getRequestParameter('browser');
        $this->browserVersion = preg_replace('/[^\w\.]/','',$this->getRequestParameter('browserVersion'));
    }

} 