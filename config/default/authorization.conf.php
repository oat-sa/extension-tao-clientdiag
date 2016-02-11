<?php

/**
 * For anonymous login
 */
return new oat\taoClientDiagnostic\model\authorization\Anonymous();

/**
 * To display username field to authenticate (in ACL or matching with pattern)
 */
//return new oat\taoClientDiagnostic\model\authorization\RequireUsername(array(
//    'regexValidator' => '/^[0-9]{7}[A-Z]$/'
//));