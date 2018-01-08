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

use oat\tao\helpers\UserHelper;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticDataTable;
use oat\taoClientDiagnostic\model\storage\PaginatedSqlStorage;

/**
 * Class DiagnosticChecker
 *
 * @package oat\taoClientDiagnostic\controller
 */
class DiagnosticChecker extends CompatibilityChecker
{
    /**
     * @var DiagnosticDataTable
     */
    protected $dataTable;

    /**
     * Fetch POST data
     * Get login by cookie
     * If check parameters is true, check mandatory parameters
     *
     * @param bool $check
     * @return array
     * @throws \common_exception_MissingParameter
     */
    protected function getData($check = false)
    {
        $data = parent::getData($check);
        $data['login'] = UserHelper::getUserLogin(\common_session_SessionManager::getSession()->getUser());

        if ($this->hasRequestParameter('workstation')) {
            $data[PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION] = \tao_helpers_Display::sanitizeXssHtml(trim($this->getRequestParameter('workstation')));
        }

        return $data;
    }

    /**
     * Get current http parameters
     * Unset workstation parameters to avoid cast it as type
     *
     * @return array
     */
    protected function getParameters()
    {
        $data =  parent::getParameters();
        if (isset($data['workstation'])) {
            unset($data['workstation']);
        }
        return $data;
    }

    /**
     * Gets the name of the workstation being tested
     * If current id is found on database, associated workstation is retrieve
     * Else an uniqid is generated
     */
    public function workstation()
    {
        $response = [
            'success'     => false,
            'workstation' => uniqid('workstation-')
        ];

        $diagnostic = $this->getDiagnosticDataTable()->getDiagnostic($this->getId());

        if (isset($diagnostic)) {
            $response['success'] = true;
            $workstation = trim($diagnostic[PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION]);
            if ($workstation) {
                $response['workstation'] = $workstation;
            }
        }

        $this->returnJson($response);
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
            $diagnosticDatatable->setServiceLocator($this->getServiceManager());
            $this->dataTable = $diagnosticDatatable;
        }
        return $this->dataTable;
    }

    /**
     * Get config parameters for compatibility check
     *
     * @return mixed
     * @throws \common_ext_ExtensionException
     */
    protected function loadConfig()
    {
        $config = parent::loadConfig();
        $config['controller'] = 'DiagnosticChecker';
        return $config;
    }
}