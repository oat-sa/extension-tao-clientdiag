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

use oat\taoClientDiagnostic\model\authorization\Authorization;
use oat\taoClientDiagnostic\model\DataStorage;
use oat\taoClientDiagnostic\model\CompatibilityChecker as CompatibilityCheckerModel;
use oat\taoClientDiagnostic\model\storage\Storage;

/**
 * Class CompatibilityChecker
 * @package oat\taoClientDiagnostic\controller
 */
class CompatibilityChecker extends \tao_actions_CommonModule
{
    /**
     * Get config parameters for compatibility check
     * @return mixed
     * @throws \common_ext_ExtensionException
     */
    private function loadConfig()
    {
        return \common_ext_ExtensionsManager::singleton()
            ->getExtensionById('taoClientDiagnostic')
            ->getConfig('clientDiag');
    }

    /**
     * If logged in, display index view with config data
     * If not, forward to login
     */
    public function index()
    {
        $authorizationService = $this->getServiceManager()->get(Authorization::SERVICE_ID);
        if ($authorizationService->isAuthorized()) {
            $this->setData('clientDiagConfig', $this->loadConfig());
            $this->setData('clientConfigUrl', $this->getClientConfigUrl());
            $this->setView('CompatibilityChecker/index.tpl');
        } else {
            $this->redirect($authorizationService->getAuthorizationUrl(_url('index')));
        }
    }

    public function whichBrowser()
    {
        $this->setView('CompatibilityChecker/browserDetection.php');
    }

    public function check()
    {
        try {
            $data = $this->getData(true);

            $checker            = new CompatibilityCheckerModel($data);
            $isCompatible       = (int) $checker->isCompatibleConfig();
            $data['compatible'] = $isCompatible;

            try {
                $storageService = $this->getServiceManager()->get(Storage::SERVICE_ID);
                $storageService->setData($data);
                $storageService->store();
            } catch (\Exception $e) {
                \common_Logger::w($e->getMessage());
            }

            $compatibilityMessage = [
                //Not compatible
                '0' => [
                    'success' => true,
                    'type'    => 'error',
                    'message' => __('Your system requires a compatibility update, please contact your system administrator.')
                ],
                //Compatible
                '1' => [
                    'success' => true,
                    'type'    => 'success',
                    'message' => __('Compatible')
                ],
                //Not tested
            ];

            $this->returnJson($compatibilityMessage[$isCompatible]);

        } catch (\common_exception_MissingParameter $e) {
            $this->returnJson(array('success' => false, 'type' => 'error', 'message' => $e->getUserMessage()));
        }
    }

    public function storeData()
    {
        $data = $this->getData();

        try {
            $storageService = $this->getServiceManager()->get(Storage::SERVICE_ID);
            $storageService->setData($data);
            $storageService->store();
            $this->returnJson(array('success' => true, 'type' => 'success'));
        } catch (\Exception $e) {
            \common_Logger::w($e->getMessage());
            $this->returnJson(array('success' => false, 'type' => 'error'));
        }
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

        if ($check) {
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
            $data['login'] = 'Anonymous';
        }

        if (!isset($_COOKIE['id'])) {
            $data['id'] = uniqid();
            setcookie('id', $data['id']);
        } else {
            $data['id'] = $_COOKIE['id'];
        }

        $data['ip'] = (!empty($_SERVER['HTTP_X_REAL_IP'])) ? $_SERVER['HTTP_X_REAL_IP'] : ((!empty($_SERVER['REMOTE_ADDR'])) ? $_SERVER['REMOTE_ADDR'] : 'unknown');
        return $data;
    }
}