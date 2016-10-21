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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoClientDiagnostic\model\browserDetector;

use Sinergi\BrowserDetector\Os;

/**
 * Service to manage the authoring of deliveries
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoDelivery
 */
class OSService extends Base
{
    const ROOT_CLASS = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#OS';
    const PROPERTY_NAME = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#OSName';
    const PROPERTY_VERSION = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#OSVersion';
    const MAKE_CLASS = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#OSMake';

    /**
     * Get Text interpretation of detected OS name
     * @return string
     */
    public function getClientName()
    {
        return (new Os())->getName();
    }

    /**
     * @return string
     */
    public function getClientVersion()
    {
        return (new Os())->getVersion();
    }

}