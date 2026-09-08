<?php

declare(strict_types=1);

namespace oat\taoClientDiagnostic\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\model\mvc\DefaultUrlService;
use oat\tao\scripts\tools\migrations\AbstractMigration;

final class Version202306231451585081_taoClientDiagnostic extends AbstractMigration
{
    private const DIAG_LOGOUT_ENDPOINT = 'diagLogout';

    public function getDescription(): string
    {
        return 'Add taoClientDiagnostic specific logout endpoint to url route config';
    }

    public function up(Schema $schema): void
    {
        $routeService = $this->getServiceLocator()->get(DefaultUrlService::SERVICE_ID);
        $routeConfig = $routeService->getOptions();

        if (!array_key_exists(self::DIAG_LOGOUT_ENDPOINT, $routeConfig)) {
            $routeConfig[self::DIAG_LOGOUT_ENDPOINT] = [
                'ext' => 'taoClientDiagnostic',
                'controller' => 'Authenticator',
                'action' => 'logout'
            ];

            $routeService->setOptions($routeConfig);

            $this->registerService(DefaultUrlService::SERVICE_ID, $routeService);
        } else {
            $this->warnIf(true, 'Endpoint already exists in config, skipping');
        }
    }

    public function down(Schema $schema): void
    {
        $routeService = $this->getServiceLocator()->get(DefaultUrlService::SERVICE_ID);
        $routeConfig = $routeService->getOptions();

        if (array_key_exists(self::DIAG_LOGOUT_ENDPOINT, $routeConfig)) {
            unset($routeConfig[self::DIAG_LOGOUT_ENDPOINT]);

            $routeService->setOptions($routeConfig);

            $this->registerService(DefaultUrlService::SERVICE_ID, $routeService);
        } else {
            $this->warnIf(true, "Endpoint doesn't exist in config, skipping");
        }
    }
}
