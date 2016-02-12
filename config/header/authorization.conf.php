<?php

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