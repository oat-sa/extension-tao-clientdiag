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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoClientDiagnostic\model\SupportedList;

use oat\oatbox\service\ConfigurableService;
use oat\taoClientDiagnostic\model\diagnostic\DiagnosticServiceInterface;

class RemoteList extends ConfigurableService implements SupportedListInterface
{
    public function getList(): ?array
    {
        $service = $this->getServiceLocator()->get(DiagnosticServiceInterface::SERVICE_ID);
        $config = $service->getDiagnosticJsConfig();
        $supportListUrl = $config['diagnostic']['testers']['browser']['browserslistUrl'];

        if (!$supportListUrl) {
            throw new \common_exception_MissingParameter('The URL to the list of supported browser is not configured');
        }

        $supportedListData = @file_get_contents($supportListUrl);
        if ($supportedListData === false) {
            $error = error_get_last();
            throw new \common_exception_FileSystemError(sprintf(
                'Unable to fetch the list of supported browsers due to error: %s',
                $error['message']
            ));
        }

        return json_decode($supportedListData, true);
    }
}
