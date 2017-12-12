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
 * Copyright (c) 2016 Open Assessment Technologies SA
 */




/**
 * This configuration is for authorization access to diagnostic tool
 *
 * By default no authentication is needed, by anonymous access
 *     return new oat\taoClientDiagnostic\model\authorization\Anonymous()
 *
 * Require username is available by following setting that will check TAO ACL user
 *     return new oat\taoClientDiagnostic\model\authorization\RequireUsername();
 * This configuration accept an optional parameter, the regex pattern to valid input login.
 * Valid login will be ACL user OR login matching by regexp
 * Example:
 * return new oat\taoClientDiagnostic\model\authorization\RequireUsername(array(
 *    'regexValidator' => '/^[0-9]{7}[A-Z]$/'
 * ));
 */
