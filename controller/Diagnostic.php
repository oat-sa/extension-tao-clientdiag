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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoClientDiagnostic\controller;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\theme\ThemeService;
use oat\taoClientDiagnostic\model\diagnostic\Paginator;
use DateTime;
use common_session_SessionManager as SessionManager;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticServiceInterface;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticDataTable;

/**
 * Diagnostic controller for the readiness check list screen
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
    protected $dataTable;

    /**
     * Display the list of all readiness checks performed on the given test center
     * It also allows launching new ones.
     */
    public function index()
    {
        $diagnostics = $this->getDiagnosticDataTable()->getDiagnostics($this->getRequestOptions());

        $config = $this->loadConfig();
        $data = array(
            'title'  => __('Readiness diagnostics'),
            'set'    => json_encode($diagnostics),
            'config' => json_encode($config),
        );

        $userLabel = SessionManager::getSession()->getUserLabel();

        $this->defaultData();

        if (!empty($config['pageTitle'])) {
            $this->setData('title', $config['pageTitle']);
        }

        $this->setData('cls', 'diagnostic-index');
        $this->setData('userLabel', $userLabel);
        $this->setData('data', $data);
        $this->setData('content-template', 'pages/index.tpl');
        $this->setView('layout.tpl');
    }

    /**
     * Display the diagnostic runner
     */
    public function diagnostic()
    {
        $config = $this->loadConfig();
        $data = array(
            'title'  => __('Readiness Check'),
            'config' => json_encode($config),
        );

        $this->defaultData();
        $this->setData('userLabel', SessionManager::getSession()->getUserLabel());
        $this->setData('cls', 'diagnostic-runner');
        $this->setData('data', $data);
        $this->setData('content-template', 'pages/index.tpl');

        if (!empty($config['pageTitle'])) {
            $this->setData('title', $config['pageTitle']);
        }

        /** @var \oat\tao\model\theme\ThemeService $themeService */
        $themeService = $this->getServiceLocator()->get(ThemeService::SERVICE_ID);
        $theme = $themeService->getTheme();
        $configurableText = $theme->getAllTexts();
        $this->setData('configurableText', json_encode($configurableText));

        $this->setView('layout.tpl');
    }

    /**
     * Gets the list of diagnostic results
     *
     * @throws \common_Exception
     */
    public function diagnosticData()
    {
        try {
            $this->returnJson($this->getDiagnosticDataTable()->getDiagnostics($this->getRequestOptions()));
        } catch (ServiceNotFoundException $e) {
            \common_Logger::w(__('No diagnostic service defined'));
            $this->returnError(__('Interface not available'));
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
        $this->returnJson([
            'success' => $this->getDiagnosticDataTable()->removeDiagnostic($id)
        ]);
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
            'page'        => Paginator::DEFAULT_PAGE,
            'rows'        => Paginator::DEFAULT_ROWS,
            'sortby'      => self::DEFAULT_SORT_COLUMN,
            'sortorder'   => self::DEFAULT_SORT_ORDER,
            'filter'      => null,
            'periodStart' => $today->format('Y-m-d'),
            'periodEnd'   => $today->format('Y-m-d')
        ];
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
        return $service->getDiagnosticJsConfig();
    }

    /**
     * Get the model to access diagnostic storage through dataTable
     *
     * @return DiagnosticDataTable
     */
    protected function getDiagnosticDataTable()
    {
        if (! $this->dataTable) {
            $diagnosticDatatable = new DiagnosticDataTable();
            $diagnosticDatatable->setServiceLocator($this->getServiceLocator());
            $this->dataTable = $diagnosticDatatable;
        }
        return $this->dataTable;
    }
}