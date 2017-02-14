<?php
/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoClientDiagnostic\controller;

use oat\generis\model\OntologyAwareTrait;
use oat\ltiDeliveryProvider\model\LTIDeliveryTool;
use oat\oatbox\service\ServiceNotFoundException;
use oat\taoProctoring\helpers\BreadcrumbsHelper;
use oat\taoProctoring\model\implementation\DeliveryService;
use DateTime;
use oat\taoProctoring\helpers\DataTableHelper;
use common_session_SessionManager as SessionManager;

use oat\taoClientDiagnostic\model\diagnostic\DiagnosticDataTable;

require_once __DIR__.'/../../tao/lib/oauth/OAuth.php';

/**
 * Proctoring Diagnostic controller for the readiness check screen
 *
 * @author Open Assessment Technologies SA
 * @package taoProctoring
 * @license GPL-2.0
 *
 */
class Diagnostic extends \tao_actions_CommonModule
{
    use OntologyAwareTrait;

    const DEFAULT_SORT_COLUMN = 'firstname';
    const DEFAULT_SORT_ORDER = 'asc';
    protected $currentTestCenter = null;
    protected $currentDelivery   = null;

//http://tao.dev/taoClientDiagnostic/Diagnostic/index?testCenter=http%3A%2F%2Ftao.local%2Fmytao.rdf%23i1486562301521295
    /**
     * Display the list of all readiness checks performed on the given test center
     * It also allows launching new ones.
     */
    public function index()
    {
//        if (! $this->hasRequestParameter('testCenter')) {
//            throw new \common_Exception('no current test center');
//        }
//        $testCenter = $this->getResource($this->getRequestParameter('testCenter'));

        $requestOptions = $this->getRequestOptions();

        $diagnosticDataTable = new DiagnosticDataTable();

//        $title             = __('Readiness Check for test site %s', _dh($testCenter->getLabel()));
        $title             = __('Readiness diagnostics');
        $cssClass          = 'diagnostic-index';
//        $diagnostics       = $diagnosticDataTable->getDiagnostics($testCenter, $requestOptions);
        $diagnostics       = $diagnosticDataTable->getDiagnostics($requestOptions);
//        $diagnosticsConfig = $diagnosticDataTable->getDiagnosticConfig($testCenter);
        $diagnosticsConfig = $diagnosticDataTable->getDiagnosticConfig();
        $ltiInstalled      = \common_ext_ExtensionsManager::singleton()->isInstalled('ltiDeliveryProvider');

        $data = array(
            'title'              => $title,
//            'testCenter'         => $testCenter->getUri(),
            'set'                => $diagnostics,
            'config'             => $diagnosticsConfig,
            'installedextension' => $ltiInstalled,
        );

        foreach($data as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $data[$key] = json_encode($value);
            }
        }

        $userLabel = SessionManager::getSession()->getUserLabel();

        $this->setData('cls', $cssClass);
        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setData('userLabel', $userLabel);

        $this->defaultData();
        $this->setData('data', $data);
        $this->setData('content-template', 'pages/index.tpl');
        $this->setView('layout.tpl');
    }


    public function deliveriesByProctor()
    {
        $deliveryData = array();
        if(\common_ext_ExtensionsManager::singleton()->isInstalled('ltiDeliveryProvider')){
            /** @var DeliveryService $service */
            $service = $this->getServiceManager()->get(DeliveryService::CONFIG_ID);
            $deliveries = $service->getAccessibleDeliveries();


            if(!empty($deliveries)){

                try{
                    $dataStore = new \tao_models_classes_oauth_DataStore();
                    $test_consumer = $dataStore->lookup_consumer('proctoring_key');
                } catch(\tao_models_classes_oauth_Exception $e){
                    $secret = uniqid('proctoring_');
                    \taoLti_models_classes_ConsumerService::singleton()->getRootClass()->createInstanceWithProperties(
                        array(
                            RDFS_LABEL => 'proctoring',
                            PROPERTY_OAUTH_KEY => 'proctoring_key',
                            PROPERTY_OAUTH_SECRET => $secret
                        )
                    );

                    $test_consumer = new \OAuthConsumer('proctoring_key', $secret);
                }
                $session = \common_session_SessionManager::getSession();

                $ltiData = array(
                    'lti_message_type' => 'basic-lti-launch-request',
                    'lti_version' => 'LTI-1p0',

                    'resource_link_id' => rand(0, 9999999),
                    'resource_link_title' => 'Launch Title',
                    'resource_link_label' => 'Launch label',

                    'context_title' => 'Launch Title',
                    'context_label' => 'Launch label',

                    'user_id' => $session->getUserUri(),
                    'roles' => 'Learner',
                    'lis_person_name_full' => $session->getUserLabel(),

                    'tool_consumer_info_product_family_code' => PRODUCT_NAME,
                    'tool_consumer_info_version' => TAO_VERSION,

                    'custom_skip_thankyou' => 'true',
                    'launch_presentation_return_url' => _url('logout', 'Main', 'tao')
                );



                $hmac_method = new \OAuthSignatureMethod_HMAC_SHA1();

                $test_token = new \OAuthToken($test_consumer, '');


                foreach($deliveries as $delivery){
                    $launchUrl =  LTIDeliveryTool::singleton()->getLaunchUrl(array('delivery' => $delivery->getUri()));

                    //replace https or other protocol by http
                    $parsedUrl = parse_url($launchUrl);
                    if(isset($parsedUrl['scheme']) && $parsedUrl['scheme'] !== 'http'){
                        $launchUrl = str_replace($parsedUrl['scheme'].'://', 'http://', $launchUrl);
                    }

                    $acc_req = \OAuthRequest::from_consumer_and_token($test_consumer, $test_token, 'GET', $launchUrl, $ltiData);
                    $acc_req->sign_request($hmac_method, $test_consumer, $test_token);

                    $deliveryData[] = array(
                        'id' => $delivery->getUri(),
                        'label' => $delivery->getLabel(),
                        'url' => $acc_req->to_url(),
                        'text' => __('Test')
                    );
                }
            }

        }

        $this->setData('title', __('Available Deliveries'));

        if (\tao_helpers_Request::isAjax()) {
            $this->returnJson(array('list' => $deliveryData));
        } else {
            try{
                $testCenter = $this->getCurrentTestCenter();
                $this->composeView(
                    'diagnostic-deliveries',
                    array('list' => $deliveryData),
                    array(
                        BreadcrumbsHelper::testCenters(),
                        BreadcrumbsHelper::testCenter($testCenter, TestCenterHelper::getTestCenters()),
                        BreadcrumbsHelper::diagnostics(
                            $testCenter,
                            array(
                                BreadcrumbsHelper::deliveries($testCenter),
                            )
                        ),
                        BreadcrumbsHelper::deliveriesByProctor($testCenter)
                    )
                );
            } catch(\common_Exception $e){
                $this->composeView(
                    'diagnostic-deliveries',
                    array('list' => $deliveryData),
                    array(
                        BreadcrumbsHelper::testCenters(),
                    )
                );
            }
        }
    }
    /**
     * Display the diagnostic runner
     */
    public function diagnostic()
    {
//        $testCenter = $this->getCurrentTestCenter();
//        $this->setData('title', __('Readiness Check for test site %s', $testCenter->getLabel()));


        $diagnosticDataTable = new DiagnosticDataTable();

        $diagnosticsConfig = $diagnosticDataTable->getDiagnosticConfig();
        $title             = __('Readiness Check');
        $cssClass          = 'diagnostic-runner';

        $data = array(
            'title'  => $title,
            'config' => $diagnosticsConfig,
//            'testCenter' => $testCenter->getUri(),
//            'config' => TestCenterHelper::getDiagnosticConfig($testCenter),
        );

        foreach($data as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $data[$key] = json_encode($value);
            }
        }

        $this->defaultData();
        $this->setData('userLabel', SessionManager::getSession()->getUserLabel());
        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setData('cls', $cssClass);
        $this->setData('data', $data);
        $this->setData('content-template', 'pages/index.tpl');
        $this->setView('layout.tpl');
    }

    /**
     * Gets the list of diagnostic results
     *
     * @throws \common_Exception
     * @throws \oat\oatbox\service\ServiceNotFoundException
     */
    public function diagnosticData()
    {
        try {
            $requestOptions = $this->getRequestOptions();
            $diagnosticDataTable = new DiagnosticDataTable();
            $this->returnJson($diagnosticDataTable->getDiagnostics($requestOptions));

        } catch (ServiceNotFoundException $e) {
            \common_Logger::w('No diagnostic service defined for proctoring');
            $this->returnError('Proctoring interface not available');
        }
    }

    /**
     * Removes diagnostic results
     *
     * @throws \common_Exception
     */
    public function remove()
    {
        $id = $this->getRequestParameter('id');
        $diagnosticDataTable = new DiagnosticDataTable();
        $this->returnJson([
            'success' => $diagnosticDataTable->removeDiagnostic($id)
        ]);
    }

    /**
     * Get the requested test center resource
     * Use this to identify which test center is currently being selected buy the proctor
     *
     * @return \core_kernel_classes_Resource
     * @throws \common_Exception
     */
    protected function getCurrentTestCenter()
    {
        if (is_null($this->currentTestCenter)) {
            if($this->hasRequestParameter('testCenter')) {
                $this->currentTestCenter = $this->getResource($this->getRequestParameter('testCenter'));
            } else {
                //@todo use a better exception
                throw new \common_Exception('no current test center');
            }
        }
        return $this->currentTestCenter;
    }

    /**
     * Gets the data table request options
     *
     * @param array $defaults
     * @return array
     */
    protected function getRequestOptions(array $defaults = []) {

        $defaults = array_merge($this->getDefaultOptions(), $defaults);

        $page = $this->hasRequestParameter('page') ? $this->getRequestParameter('page') : $defaults['page'];
        $rows = $this->hasRequestParameter('rows') ? $this->getRequestParameter('rows') : $defaults['rows'];
        $sortBy = $this->hasRequestParameter('sortby') ? $this->getRequestParameter('sortby') : $defaults['sortby'];
        $sortOrder = $this->hasRequestParameter('sortorder') ? $this->getRequestParameter('sortorder') : $defaults['sortorder'];
        $filter = $this->hasRequestParameter('filter') ? $this->getRequestParameter('filter') : $defaults['filter'];
        $filterquery = $this->hasRequestParameter('filterquery') ? $this->getRequestParameter('filterquery') : $defaults['filter'];
        $periodStart = $this->hasRequestParameter('periodStart') ? $this->getRequestParameter('periodStart') : $defaults['periodStart'];
        $periodEnd = $this->hasRequestParameter('periodEnd') ? $this->getRequestParameter('periodEnd') : $defaults['periodEnd'];
        $detailed = $this->hasRequestParameter('detailed') ? $this->getRequestParameter('detailed') : 'false';
        $detailed = filter_var($detailed, FILTER_VALIDATE_BOOLEAN);

        return array(
            'page' => $page,
            'rows' => $rows,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'filter' => $filter ? $filter : $filterquery,
            'periodStart' => $periodStart,
            'detailed' => $detailed,
            'periodEnd' => $periodEnd
        );

    }

    /**
     * @return array
     */
    private function getDefaultOptions()
    {
        $today = new DateTime();
        return [
            'page' => DataTableHelper::DEFAULT_PAGE,
            'rows' => DataTableHelper::DEFAULT_ROWS,
            'sortby' => self::DEFAULT_SORT_COLUMN,
            'sortorder' => self::DEFAULT_SORT_ORDER,
            'filter' => null,
            'periodStart' => $today->format('Y-m-d'),
            'periodEnd' => $today->format('Y-m-d')
        ];
    }

    /**
     * Main method to render a view for all proctoring related controller actions
     *
     * @param string $cssClass
     * @param array $data
     * @param array $breadcrumbs
     * @param String $template
     */
    protected function composeView($cssClass, $data = array(), $breadcrumbs = array(), $template = '')
    {
        $data['breadcrumbs'] = $breadcrumbs;

        foreach($data as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $data[$key] = json_encode($value);
            }
        }

        $this->defaultData();
        $this->setData('userLabel', SessionManager::getSession()->getUserLabel());
        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setData('cls', $cssClass);
        $this->setData('data', $data);
        $this->setData('content-template', 'pages/index.tpl');
        $this->setView('layout.tpl');
    }
}