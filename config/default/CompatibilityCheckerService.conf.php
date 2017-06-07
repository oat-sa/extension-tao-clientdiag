<?php

use oat\taoClientDiagnostic\model\CompatibilityCheckerService;

return new CompatibilityCheckerService([
    CompatibilityCheckerService::OPTION_COMPATIBILITY_FILE => __DIR__ . '/../../taoClientDiagnostic/include/compatibility.json'
]);