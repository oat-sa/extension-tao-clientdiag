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

use oat\taoClientDiagnostic\exception\InvalidLoginException;
use oat\taoClientDiagnostic\model\authorization\Authorization;

/**
 * Class Authenticator
 * @package oat\taoClientDiagnostic\controller
 */
class Authenticator extends \tao_actions_CommonModule
{
    /**
     * Login process
     * Check if url successCallback is set
     * If login form is post valid, setcookie & redirect to successCallback
     * Else create LoginForm with ?errorMessage
     */
    public function login()
    {
        try {

            if (!$this->hasRequestParameter('successCallback')) {
                throw new \common_exception_MissingParameter ('Internal error, please retry in few moment');
            }

            if ($this->isRequestPost()) {
                $authorizationService = $this->getServiceManager()->get(Authorization::SERVICE_ID);
                if ($authorizationService->validateLogin($this->getRequestParameter('login'))) {
                    $this->setCookie('login', $this->getRequestParameter('login'), null, '/package-tao/taoClientDiagnostic');
                    $this->redirect($this->getRequestParameter('successCallback'));
                }
            }

        } catch (InvalidLoginException $e) {
            $this->setData('errorMessage', $e->getUserMessage());
        }

        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setData('successCallback', $this->getRequestParameter('successCallback'));
        $this->setView('Authenticator\login.tpl');
    }
}