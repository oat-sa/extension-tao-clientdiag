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

use oat\oatbox\service\ServiceManager;
use core_kernel_classes_Resource;
use DateTime;
use oat\taoClientDiagnostic\exception\StorageException;
use oat\taoClientDiagnostic\model\storage\PaginatedStorage;
use tao_helpers_Date as DateHelper;
use oat\tao\helpers\UserHelper;

use oat\taoDelivery\models\classes\execution\DeliveryExecution;

use oat\taoClientDiagnostic\model\storage\Storage;
use oat\taoClientDiagnostic\model\storage\PaginatedSqlStorage;

use oat\taoProctoring\helpers\DataTableHelper;
use oat\taoProctoring\model\implementation\TestSessionHistoryService;
use oat\taoProctoring\model\DeliveryExecutionStateService;
use oat\taoProctoring\model\deliveryLog\DeliveryLog;
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
                    'workstation' => $row[PaginatedSqlStorage::DIAGNOSTIC_WORKSTATION] . ' (' . $row[PaginatedSqlStorage::DIAGNOSTIC_IP] . ')',
                    'os'          => $row[PaginatedSqlStorage::DIAGNOSTIC_OS] . ' (' . $row[PaginatedSqlStorage::DIAGNOSTIC_OSVERSION] . ')',
                    'browser'     => $row[PaginatedSqlStorage::DIAGNOSTIC_BROWSER] . ' (' . $row[PaginatedSqlStorage::DIAGNOSTIC_BROWSERVERSION] . ')',
                    'performance' => $row[PaginatedSqlStorage::DIAGNOSTIC_PERFORMANCE_AVERAGE],
                    'bandwidth'   => $row[PaginatedSqlStorage::DIAGNOSTIC_BANDWIDTH_MAX],
                ];

                if (isset($row[PaginatedSqlStorage::DIAGNOSTIC_CREATED_AT])) {
                    $dt = new DateTime($row[PaginatedSqlStorage::DIAGNOSTIC_CREATED_AT]);
                    $rowData['date'] = DateHelper::displayeDate($dt);
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
     * Gets the list of session history
     *
     * @param $sessions
     * @param bool $logHistory
     * @param array [$options]
     * @return array
     */
//    public function getSessionHistory($sessions, $logHistory = false, $options = array())
//    {
//        if ($logHistory) {
//            foreach ($sessions as $sessionUri) {
//                $deliveryLog = ServiceManager::getServiceManager()->get(DeliveryLog::SERVICE_ID);
//                $deliveryLog->log($sessionUri, 'HISTORY', []);
//            }
//        }
//        /** @var TestSessionHistoryService $historyService */
//        $historyService = ServiceManager::getServiceManager()->get(TestSessionHistoryService::SERVICE_ID);
//        return DataTableHelper::paginate($historyService->getSessionsHistory($sessions, $options), $options);
//
//    }

    /**
     * Gets the list of assessment reports related to a test site
     *
     * @param $testCenter
     * @param array [$options]
     * @return array
     */
//    public static function getReports($testCenter, $options = array())
//    {
//        $periodStart = null;
//        $periodEnd = null;
//
//        if (isset($options['periodStart'])) {
//            $periodStart = new DateTime($options['periodStart']);
//            $periodStart->setTime(0, 0, 0);
//            $periodStart = DateHelper::getTimeStamp($periodStart->getTimestamp());
//        }
//        if (isset($options['periodEnd'])) {
//            $periodEnd = new DateTime($options['periodEnd']);
//            $periodEnd->setTime(23, 59, 59);
//            $periodEnd = DateHelper::getTimeStamp($periodEnd->getTimestamp());
//        }
//
//        $deliveryService = ServiceManager::getServiceManager()->get(DeliveryService::CONFIG_ID);
//        $deliveries      = ServiceManager::getServiceManager()->get(EligibilityService::SERVICE_ID)->getEligibleDeliveries($testCenter);
//        $filteredExecutions = array();
//        foreach($deliveries as $delivery) {
//            if ($delivery->exists()) {
//                $deliveryExecutions = $deliveryService->getDeliveryExecutions($delivery->getUri());
//                foreach ($deliveryExecutions as $deliveryExecution) {
//                    $startTime = $deliveryExecution->getStartTime();
//                    $finishTime = $deliveryExecution->getFinishTime();
//
//                    if ($finishTime && $periodStart && $periodStart > DateHelper::getTimeStamp($finishTime)) {
//                        continue;
//                    }
//                    if(!$finishTime && $periodStart && $periodEnd && ( DateHelper::getTimeStamp($startTime) > $periodEnd ||  DateHelper::getTimeStamp($startTime) < $periodStart )) {
//                        continue;
//                    }
//                    if ($startTime && $periodEnd && $periodEnd < DateHelper::getTimeStamp($startTime)) {
//                        continue;
//                    }
//
//                    $filteredExecutions[] = $deliveryExecution;
//                }
//            }
//        }
//
//        $deliveryExecutionStateService = ServiceManager::getServiceManager()->get(DeliveryExecutionStateService::SERVICE_ID);
//
//        return DataTableHelper::paginate($filteredExecutions, $options, function($deliveryExecutions) use ($deliveryExecutionStateService) {
//            $reports = [];
//
//            foreach($deliveryExecutions as $deliveryExecution) {
//                /* @var $deliveryExecution DeliveryExecution */
//                $startTime = $deliveryExecution->getStartTime();
//                $finishTime = $deliveryExecution->getFinishTime();
//
//                $userId = $deliveryExecution->getUserIdentifier();
//                $user = UserHelper::getUser($userId);
//
//                $authorizationData = self::getDeliveryLog()->get($deliveryExecution->getIdentifier(), 'TEST_AUTHORISE');
//                $proctor = empty($authorizationData) ? '' : UserHelper::getUser($authorizationData[0][DeliveryLog::DATA]['proctorUri']);
//
//                $procActions = self::getProctorActions($deliveryExecution);
//                $reports[] = array(
//                    'id' => $deliveryExecution->getIdentifier(),
//                    'delivery' => $deliveryExecution->getDelivery()->getLabel(),
//                    'testtaker' => $user ? UserHelper::getUserName($user, true) : '',
//                    'proctor' => $proctor ? UserHelper::getUserName($proctor, true) : '',
//                    'status' => $deliveryExecutionStateService->getState($deliveryExecution),
//                    'start' => $startTime ? DateHelper::displayeDate($startTime) : '',
//                    'end' => $finishTime ? DateHelper::displayeDate($finishTime) : '',
//                    'pause' => $procActions['pause'],
//                    'resume' => $procActions['resume'],
//                    'irregularities' => $procActions['irregularities'],
//                );
//            }
//
//            return $reports;
//        });
//    }

//    /**
//     * @param $deliveryExecution
//     * @return array
//     */
//    protected static function getProctorActions($deliveryExecution)
//    {
//        $actions = [];
//
//        $irregularityReports = self::getActions($deliveryExecution->getIdentifier(), 'TEST_IRREGULARITY');
//        $pausesReports = self::getActions($deliveryExecution->getIdentifier(), 'TEST_PAUSE', 'pause');
//        $authorizeReports = self::getActions($deliveryExecution->getIdentifier(), 'TEST_AUTHORISE', 'resume');
//        $terminateReports = self::getActions($deliveryExecution->getIdentifier(), 'TEST_TERMINATE', 'terminate');
//
//        $actions['pause'] = strval(count($pausesReports));
//        $actions['resume'] = strval(count($authorizeReports));
//        $actions['irregularities'] = array_merge($irregularityReports, $pausesReports, $authorizeReports, $terminateReports);
//        usort($actions['irregularities'], function ($a, $b) {
//            if ($a['timestamp'] == $b['timestamp']) {
//                return 0;
//            }
//            return ($a < $b) ? -1 : 1;
//        });
//
//        return $actions;
//    }

    /**
     * @param string $deliveryExecutionId
     * @param string $event
     * @param string $type
     * @return array
     */
//    protected static function getActions($deliveryExecutionId, $event, $type = 'irregularity')
//    {
//        $irregularities = self::getDeliveryLog()->get($deliveryExecutionId, $event);
//        $result = [];
//        foreach($irregularities as $irregularityReport) {
//            $data = $irregularityReport[DeliveryLog::DATA];
//            $result[] = [
//                'timestamp' => $irregularityReport[DeliveryLog::CREATED_AT],
//                'type' => $type,
//                'comment' => isset($data['comment']) ? $data['comment'] : '',
//                'reasons' => isset($data['reasons']) ? $data['reasons'] : '',
//            ];
//        }
//        return $result;
//    }

    /**
     * @return DeliveryLog
     */
//    protected static function getDeliveryLog()
//    {
//        return ServiceManager::getServiceManager()->get(DeliveryLog::SERVICE_ID);
//    }

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
