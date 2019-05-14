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

namespace oat\taoClientDiagnostic\model\authorization;

use oat\oatbox\service\ConfigurableService;
use oat\taoClientDiagnostic\exception\InvalidLoginException;

/**
 * Class RequireAnonymousLogin
 * @package oat\taoClientDiagnostic\model\authorization
 */
class RequireUsername extends ConfigurableService implements Authorization
{
    /**
     * Check if login cookie is set
     * @return bool
     */
    public function isAuthorized()
    {
        return empty($_COOKIE['login']) ? false : true;
    }

    /**
     * Redirect to authentifier controller to process login
     * @param $url
     * @return string to oat\taoClientDiagnostic\controller\Authenticator:login
     */
    public function getAuthorizationUrl($url)
    {
        return _url('login', 'Authenticator', 'taoClientDiagnostic', array('successCallback' => $url));
    }

    /**
     * Check if login is valid
     *  - not empty
     *  - exists in TAO ACL -OR- match with regex
     * @param $login
     * @return bool
     *
     * @throws InvalidLoginException
     */
    public function validateLogin($login = null)
    {
        if (empty($login)) {
            throw new InvalidLoginException('No login found');
        }

        if ($this->getServiceLocator()->get(\tao_models_classes_UserService::SERVICE_ID)->loginExists($login)
            || ($this->hasOption('regexValidator') &&  preg_match($this->getOption('regexValidator'), $login) === 1)
        ) {
            return true;
        }

        throw new InvalidLoginException('This login does not exist');
    }
}