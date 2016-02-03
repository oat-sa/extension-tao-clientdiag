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

class CompatibilityChecker extends \tao_actions_CommonModule
{

    private function loadConfig()
    {
        $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoClientDiagnostic');
        $config = $extension->getConfig('clientDiag');
        $this->setData('clientDiagConfig', $config);
    }

    public function index()
    {
        $this->loadConfig();

        $login = '';
        if ($this->hasRequestParameter('login')) {
            $login = $this->getRequestParameter('login');
        } else {
            if (isset($_COOKIE['login'])) {
                $login = $_COOKIE['login'];
            }
        }

        if ($login === '') {
            $this->forward('login', null, null, array('message' => __('No login found')));
            return;
        }
        if (!$this->isLoginValid($login)) {
            $this->forward('login', null, null, array('errorMessage' => __('This login does not exist')));
            return;
        }
        setcookie('login', $login);
        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setView('CompatibilityChecker/index.tpl');
    }

    public function login()
    {
        $this->loadConfig();

        if ($this->hasRequestParameter('errorMessage')) {
            $this->setData('errorMessage', $this->getRequestParameter('errorMessage'));
        }
        if ($this->hasRequestParameter('message')) {
            $this->setData('message', $this->getRequestParameter('message'));
        }
        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setView('CompatibilityChecker/login.tpl');
    }

    public function whichBrowser()
    {
        $this->setView('CompatibilityChecker/browserDetection.php');
    }

    public function check()
    {
        try {
            $data = $this->getData(true);
            if (!isset($_COOKIE['key'])) {
                $data['key'] = uniqid();
                setcookie('key', $data['key']);
            } else {
                $data['key'] = $_COOKIE['key'];
            }

            $checker = new CompatibilityCheckerModel($data);
            $store = new DataStorage($data);
            $isCompatible = $checker->isCompatibleConfig();
            if ($store->setIsCompatible($isCompatible)->storeData($isCompatible)) {
                if ($isCompatible) {
                    $this->returnJson(array('success' => true, 'type' => 'success', 'message' => __('Compatible')));
                    return;
                }
            }
            $this->returnJson(array('success' => true, 'type' => 'error', 'message' => __('Your system requires a compatibility update, please contact your system administrator.')));
        }catch(\common_exception_MissingParameter $e){
            $this->returnJson(array('success' => false, 'type' => 'error', 'message' => $e->getUserMessage()));
        }
    }

    public function storeData()
    {
        $data = $this->getData();

        if (!isset($_COOKIE['key'])) {
            setcookie('key', uniqid());
        }
        $data['key'] = $_COOKIE['key'];

        $store = new DataStorage($data);
        if ($store->storeData()) {
            $this->returnJson(array('success' => true, 'type' => 'success'));
            return;
        }
        $this->returnJson(array('success' => false, 'type' => 'error'));
    }

    private function getData($check = false)
    {
        $data = $this->getRequestParameters();

        if ($this->hasRequestParameter('type')) {
            $type = $this->getRequestParameter('type');
            foreach ($data as $key => $value) {
                $data[$type . '_' . $key] = $value;
                unset($data[$key]);
            }
            unset($data[$type . '_type']);
        }

        if($check){
            if (!$this->hasRequestParameter('os')) {
                throw new \common_exception_MissingParameter('os');
            }
            if (!$this->hasRequestParameter('osVersion')) {
                throw new \common_exception_MissingParameter('osVersion');
            }
            if (!$this->hasRequestParameter('browser')) {
                throw new \common_exception_MissingParameter('browser');
            }
            if (!$this->hasRequestParameter('browserVersion')) {
                throw new \common_exception_MissingParameter('browserVersion');
            }
            $data['osVersion'] = preg_replace('/[^\w\.]/', '', $data['osVersion']);
            $data['browserVersion'] = preg_replace('/[^\w\.]/', '', $data['browserVersion']);
        }

        if (isset($_COOKIE['login'])) {
            $data['login'] = $_COOKIE['login'];
        } else {
            $data['login'] = '';
        }
        $data['ip'] = (!empty($_SERVER['HTTP_X_REAL_IP'])) ? $_SERVER['HTTP_X_REAL_IP'] : ((!empty($_SERVER['REMOTE_ADDR'])) ? $_SERVER['REMOTE_ADDR'] : 'unknown');

        return $data;
    }

    /**
     * Check if the login is valid or not
     * @param $login
     * @return bool
     */
    private function isLoginValid($login)
    {
        // For now there is no simple loginExists method for RDF, redis ...
        // We just use a regex to see if it match a pattern
        $pattern = '/^[0-9]{7}[A-Z]$/';

        return (\tao_models_classes_UserService::singleton()->loginExists($login)
            || preg_match($pattern, $login) === 1) ? true : false;

    }

} 
