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
use oat\tao\helpers\Template;

class CompatibilityChecker extends \tao_actions_CommonModule{

    public function index(){
        $this->setData('clientConfigUrl',$this->getClientConfigUrl());
        $this->setView('CompatibilityChecker/index.tpl');
    }

    public function whichBrowser(){
        $this->setView('CompatibilityChecker/browserDetection.php');
    }

    public function check(){
        try{
            $data = $this->getData(true);
            if(!isset($_COOKIE['key'])){
                $data['key'] = uniqid();
                setcookie('key', $data['key']);
            }
            else{
                $data['key'] = $_COOKIE['key'];
            }

            $checker = new CompatibilityCheckerModel($data);
            $store = new DataStorage($data);
            $isCompatible = $checker->isCompatibleConfig();
            if($store->setIsCompatible($isCompatible)->storeData($isCompatible)){
                if($isCompatible){
                    $this->returnJson(array('success' => true, 'type' => 'success', 'message' => __('Conform')));
                    return;
                }
            }
            $this->returnJson(array('success' => true, 'type' => 'error', 'message' => __('Requires a compliance update (please contact your academic platform')));
        }catch(\common_exception_MissingParameter $e){
            $this->returnJson(array('success' => false, 'type' => 'error', 'message' => $e->getUserMessage()));
        }
    }

    public function storeData(){
        $data = $this->getData();

        if(!isset($_COOKIE['key'])){
            setcookie('key', uniqid());
        }
        $data['key'] = $_COOKIE['key'];

        $store = new DataStorage($data);
        if($store->storeData()){
                $this->returnJson(array('success' => true, 'type' => 'success'));
                return;
        }
        $this->returnJson(array('success' => false, 'type' => 'error'));
    }

    private function getData($check = false){
        $login = \common_session_SessionManager::getSession()->getUserLabel();
        $data['login'] = $login;
        $data['ip'] = $_SERVER['REMOTE_ADDR'];
        $data = array_merge($data,$this->getRequestParameters());

        if($check){
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
            $data['osVersion'] = preg_replace('/[^\w\.]/','',$data['osVersion']);
            $data['browserVersion'] = preg_replace('/[^\w\.]/','',$data['browserVersion']);
        }

        return $data;
    }

} 