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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoClientDiagnostic\controller;

use oat\tao\model\mvc\DefaultUrlService;
use oat\taoClientDiagnostic\exception\StorageException;
use oat\taoClientDiagnostic\model\authorization\Authorization;
use oat\taoClientDiagnostic\model\CompatibilityChecker as CompatibilityCheckerModel;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticServiceInterface;
use oat\taoClientDiagnostic\model\schoolName\SchoolNameService;
use oat\taoClientDiagnostic\model\storage\Storage;
use Sinergi\BrowserDetector\Browser;
use Sinergi\BrowserDetector\Os;

/**
 * Class CompatibilityChecker
 * @package oat\taoClientDiagnostic\controller
 */
class CompatibilityChecker extends \tao_actions_CommonModule
{

    const COOKIE_ID = 'compatibility_checker_id';

    /**
     * If logged in, display index view with config data
     * If not, forward to login
     */
    public function index()
    {
        $authorizationService = $this->getServiceLocator()->get(Authorization::SERVICE_ID);
        if ($authorizationService->isAuthorized()) {

            $config = $this->loadConfig();
            if (isset($config['diagHeader'])) {
                $config['header'] = $config['diagHeader'];
                unset($config['diagHeader']);
            }

            if (!empty($config['pageTitle'])) {
                $this->setData('title', $config['pageTitle']);
            }

            $this->setData('client_config_url', $this->getClientConfigUrl());
            $this->setData('content-config', $config);
            $this->setData('logout', $this->getServiceLocator()->get(DefaultUrlService::SERVICE_ID)->getLogoutUrl());
            $this->setData('content-controller', 'taoClientDiagnostic/controller/CompatibilityChecker/diagnostics');
            $this->setData('content-template', 'CompatibilityChecker' . DIRECTORY_SEPARATOR . 'diagnostics.tpl');
            $this->setView('index.tpl');
        } else {
            $this->redirect($authorizationService->getAuthorizationUrl(_url('index')));
        }
    }

    /**
     * Render browser detection view
     */
    public function whichBrowser()
    {
        $result = [
            'browser' =>  $this->getBrowserDetector()->getName(),
            'browserVersion' => $this->getBrowserDetector()->getVersion(),
            'os' => $this->getOsDetector()->getName(),
            'osVersion' => $this->getOsDetector()->getVersion()
        ];
        $this->returnJson($result);
    }

    /**
     * Check if requester is compatible (os+browser)
     * Register compatibility
     * return json message
     */
    public function check()
    {
        try {
            $data = $this->getData(true);
            $id   = $this->getId();

            $checker            = new CompatibilityCheckerModel($data);
            $isCompatible       = (int)$checker->isCompatibleConfig();
            $data['compatible'] = $isCompatible;

            try {
                $storageService = $this->getServiceLocator()->get(Storage::SERVICE_ID);
                $storageService->store($id, $data);
            } catch (StorageException $e) {
                $this->logInfo($e->getMessage());
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
                '2' => [
                    'success' => true,
                    'type'    => 'warning',
                    'message' => __('This browser is not tested.')
                ],
            ];

            $this->returnJson($compatibilityMessage[$isCompatible]);

        } catch (\common_exception_MissingParameter $e) {
            $this->returnJson(array('success' => false, 'type' => 'error', 'message' => $e->getUserMessage()));
        }
    }

    /**
     * Action is used to check upload speed from client side.
     */
    public function upload()
    {
        try {
            if ($this->getRequestMethod() !== \Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted.');
            }
            if (!isset($_POST['upload']) || !is_string($_POST['upload'])) {
                throw new \common_exception_InconsistentData("'upload' POST variable is missed.");
            }
            $size = mb_strlen($_POST['upload'], '8bit');
            $result = ['success' => true, 'size' => $size];
        } catch (\common_exception_NotImplemented $e) {
            $result = ['success' => false, 'error' => $e->getMessage()];
            $this->logWarning($e->getMessage());
        } catch (\common_exception_InconsistentData $e) {
            $result = ['success' => false, 'error' => $e->getMessage()];
            $this->logWarning($e->getMessage());
        } catch (\Exception $e) {
            $result = ['success' => false, 'type' => 'error', 'message' => 'Please contact administrator'];
            $this->logWarning($e->getMessage());
        }
        $this->returnJson($result);
    }

    /**
     * Register data from the front end
     */
    public function storeData()
    {
        $data = $this->getData();
        $id   = $this->getId();

        try {
            $storageService = $this->getServiceLocator()->get(Storage::SERVICE_ID);
            $storageService->store($id, $data);
            $this->returnJson(array('success' => true, 'type' => 'success'));
        } catch (StorageException $e) {
            $this->logInfo($e->getMessage());
            $this->returnJson(array('success' => false, 'type' => 'error'));
        }
    }

    /**
     * Retrieve a school name
     */
    public function schoolName()
    {
        // simple counter measure to slow down brute force attack
        sleep(1);

        $data = $this->getParameters();

        $required = ['school_number', 'school_pin'];

        $response = [];
        $success = true;

        foreach($required as $fieldName) {
            if (!isset($data[$fieldName])) {
                $success = false;
                $response['errorCode'] = 400;
                $response['errorMessage'] = __('Missing field %s', $fieldName);
                break;
            }
        }

        if ($success) {
            try {
                $schoolNameProvider = $this->getServiceLocator()->get(SchoolNameService::SERVICE_ID);
                $response['data'] = $schoolNameProvider->getSchoolName($data['school_number'], $data['school_pin']);
            } catch(\Exception $e) {
                $success = false;
                $response['errorCode'] = 404;
                $response['errorMessage'] = __('Cannot retrieve the school name. Please verify your input');
            }
        }

        $response['success'] = $success;
        $this->returnJson($response);
    }

    /**
     * Fetch POST data
     * Get login by cookie
     * Get Ip
     * If check parameters is true, check mandatory parameters
     *
     * @param bool $check
     * @return array
     * @throws \common_exception_MissingParameter
     */
    protected function getData($check = false)
    {
        $data = $this->getParameters();

        if ($this->hasRequestParameter('type')) {
            $type = $this->getRequestParameter('type');
            unset($data['type']);

            if ($type !== 'custom_input') {
                foreach ($data as $key => $value) {
                    $data[$type . '_' . $key] = $value;
                    unset($data[$key]);
                }
            }
        }

        $data = $this->mapData($data);

        if ($this->hasRequestParameter('school_name')) {
            $data[Storage::DIAGNOSTIC_SCHOOL_NAME] = \tao_helpers_Display::sanitizeXssHtml(trim($this->getRequestParameter('school_name')));
        }
        if ($this->hasRequestParameter('school_number')) {
            $data[Storage::DIAGNOSTIC_SCHOOL_NUMBER] = \tao_helpers_Display::sanitizeXssHtml(trim($this->getRequestParameter('school_number')));
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

        $user = \common_session_SessionManager::getSession()->getUser();
        if ($user && $user->getIdentifier()) {
            $data['user_id'] = $user->getIdentifier();
        }

        $data['version'] = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoClientDiagnostic')->getVersion();

        $data['ip'] = (!empty($_SERVER['HTTP_X_REAL_IP'])) ? $_SERVER['HTTP_X_REAL_IP'] : ((!empty($_SERVER['REMOTE_ADDR'])) ? $_SERVER['REMOTE_ADDR'] : 'unknown');
        return $data;
    }

    /**
     * Get current http parameters
     *
     * @return array
     */
    protected function getParameters()
    {
        return $this->getRequestParameters();
    }

    /**
     * Get cookie id OR create it if doesnt exist
     * @return string
     */
    protected function getId()
    {
        if (! isset($_COOKIE[self::COOKIE_ID])) {
            $id = uniqid();
            setcookie(self::COOKIE_ID, $id);
        } else {
            $id = $_COOKIE[self::COOKIE_ID];
        }
        return $id;
    }

    /**
     * Delete cookie id
     */
    public function deleteId()
    {
        setcookie(self::COOKIE_ID, null);
        $this->returnJson(array('success' => true, 'type' => 'success'));
    }

    /**
     * Get config parameters for compatibility check
     *
     * @return mixed
     */
    protected function loadConfig()
    {
        /** @var DiagnosticServiceInterface $service */
        $service = $this->getServiceLocator()->get(DiagnosticServiceInterface::SERVICE_ID);
        $config = $service->getDiagnosticJsConfig();
        $config['controller'] = 'CompatibilityChecker';
        return $config;
    }

    /**
     * Map custom input data from the 'customInput' configuration.
     *
     * @param array $data
     * @return array
     */
    protected function mapData(array $data) {
        $config = $this->loadConfig();

        foreach ($data as $k => $d) {
            if (!empty($config['customInput'][$k])) {
                $data[$config['customInput'][$k]] = $d;
                unset($data[$k]);
            }
        }

        return $data;
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
