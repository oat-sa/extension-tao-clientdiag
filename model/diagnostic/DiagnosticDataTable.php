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

namespace oat\taoClientDiagnostic\model\diagnostic;

use DateTime;
use oat\taoClientDiagnostic\exception\StorageException;
use oat\taoClientDiagnostic\model\storage\PaginatedStorage;
use tao_helpers_Date as DateHelper;
use oat\taoClientDiagnostic\model\storage\Storage;
use oat\taoClientDiagnostic\model\storage\PaginatedSqlStorage;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * This temporary helpers is a temporary way to return data to the controller.
 * This helps isolating the mock code from the real controller one.
 * It will be replaced by a real service afterward.
 */
class DiagnosticDataTable implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    protected $storage;

    /**
     * Gets the results for a particular id
     *
     * @param $id
     * @return mixed
     * @throws \common_exception_NoImplementation
     */
    public function getDiagnostic($id)
    {
        return $this->getStorage()->find($id);
    }

    /**
     * Gets the list of readiness checks related to a test site
     *
     * @param array [$options]
     * @return array
     * @throws \common_exception_NoImplementation
     */
    public function getDiagnostics($options = array())
    {
        return $this->paginate($this->getStorage(), $options, function($data) {
            foreach($data as $idx => $row) {
                $rowData = [
                    'id'          => $row[PaginatedSqlStorage::DIAGNOSTIC_ID],
                    'school_name' => $row[PaginatedSqlStorage::DIAGNOSTIC_SCHOOL_NAME],
                    'school_number' => $row[PaginatedSqlStorage::DIAGNOSTIC_SCHOOL_NUMBER],
                    'fingerprint' => [
                        'uuid'    => $row[PaginatedSqlStorage::DIAGNOSTIC_FINGERPRINT_UUID],
                        'value'   => $row[PaginatedSqlStorage::DIAGNOSTIC_FINGERPRINT_VALUE],
                        'details' => json_decode(html_entity_decode($row[PaginatedSqlStorage::DIAGNOSTIC_FINGERPRINT_DETAILS]), true),
                        'errors'  => $row[PaginatedSqlStorage::DIAGNOSTIC_FINGERPRINT_ERRORS],
                        'changed' => $row[PaginatedSqlStorage::DIAGNOSTIC_FINGERPRINT_CHANGED],
                    ],
                    'screen'      => [
                        'width'   => $row[PaginatedSqlStorage::DIAGNOSTIC_SCREEN_WIDTH],
                        'height'  => $row[PaginatedSqlStorage::DIAGNOSTIC_SCREEN_HEIGHT]
                    ],
                    'os'          => $row[PaginatedSqlStorage::DIAGNOSTIC_OS] . ' (' . $row[PaginatedSqlStorage::DIAGNOSTIC_OSVERSION] . ')',
                    'browser'     => $row[PaginatedSqlStorage::DIAGNOSTIC_BROWSER] . ' (' . $row[PaginatedSqlStorage::DIAGNOSTIC_BROWSERVERSION] . ')',
                    'performance' => $row[PaginatedSqlStorage::DIAGNOSTIC_PERFORMANCE_AVERAGE],
                    'bandwidth'   => $row[PaginatedSqlStorage::DIAGNOSTIC_BANDWIDTH_MAX],
                    'intensive_bandwidth' => $row[PaginatedSqlStorage::DIAGNOSTIC_INTENSIVE_BANDWIDTH_MAX],
                    'upload' => $row[PaginatedSqlStorage::DIAGNOSTIC_UPLOAD_MAX],
                ];

                if (isset($row[PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION])) {
                    $rowData['workstation'] = $row[PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION] . ' (' . $row[PaginatedSqlStorage::DIAGNOSTIC_IP] . ')';
                } else {
                    $rowData['workstation'] = '(' . $row[PaginatedSqlStorage::DIAGNOSTIC_IP] . ')';
                }

                if (isset($row[PaginatedSqlStorage::DIAGNOSTIC_CREATED_AT])) {
                    $dt = new DateTime($row[PaginatedSqlStorage::DIAGNOSTIC_CREATED_AT]);
                    $rowData['date'] = $dt->getTimestamp();
                }

                $data[$idx] = $rowData;
            }
            return $data;
        });
    }

    /**
     * Gets the list of readiness checks related to a test site
     *
     * @param $id
     * @return bool
     * @throws \common_exception_NoImplementation
     */
    public function removeDiagnostic($id)
    {
        $ids = $id ? $id : [];
        if (! is_array($ids)) {
            $ids = [$ids];
        }

        foreach($ids as $id) {
            $this->getStorage()->delete($id);
        }

        return true;
    }

    /**
     * Wrap a datatable action to paginator to have subset of data
     *
     * @param $collection
     * @param array $options
     * @param null $dataRenderer
     * @return array
     */
    protected function paginate($collection, $options = array(), $dataRenderer = null)
    {
        return (new Paginator())->paginate($collection, $options, $dataRenderer);
    }

    /**
     * Get diangostic storage
     *
     * @return PaginatedStorage
     * @throws StorageException
     */
    protected function getStorage()
    {
        if (! $this->storage) {
            $storage = $this->getServiceLocator()->get(Storage::SERVICE_ID);
            if (! $storage instanceof PaginatedStorage) {
                throw new StorageException(__('The storage service provided to store the diagnostic results must be upgraded to support reads!'));
            }
            $this->storage = $storage;
        }
        return $this->storage;
    }

}
