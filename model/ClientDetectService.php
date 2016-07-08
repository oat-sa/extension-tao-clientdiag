<?php
namespace oat\taoClientDiagnostic\model;

use oat\oatbox\service\ConfigurableService;

include_once(ROOT_PATH . '/taoClientDiagnostic/lib/whichbrowser/libraries/utilities.php');
include_once(ROOT_PATH . '/taoClientDiagnostic/lib/whichbrowser/libraries/whichbrowser.php');

class ClientDetectService extends ConfigurableService
{
    const SERVICE_ID = 'taoClientDiagnostic/detectService';

    /**
     * @param array $options
     * @return \WhichBrowser
     */
    public function getClientInfo(array $options = [])
    {
        return new \WhichBrowser(array_merge(['headers' => getallheaders()], $options));
    }
}