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

/**
 * Interface AnonymousAuthentificationInterface
 * @package oat\taoClientDiagnostic\model\authorization
 */
interface Authorization
{
    const SERVICE_ID = 'taoClientDiagnostic/authorization';

    /**
     * Check if user is allowed
     * @return boolean
     */
    public function isAuthorized();

    /**
     * Algorithm to redirect to login process
     * @param $url URL to redirect after authorization
     * @return mixed
     */
    public function getAuthorizationUrl($url);
}