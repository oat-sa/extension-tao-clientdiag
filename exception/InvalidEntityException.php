<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 09-02-16
 * Time: 17:34
 */

namespace oat\taoClientDiagnostic\exception;


class InvalidEntityException extends \Exception implements \common_exception_UserReadableException
{
    /**
     * Return user compliant message
     * @return string
     */
    public function getUserMessage()
    {
        return _('Internal server error');
    }
}