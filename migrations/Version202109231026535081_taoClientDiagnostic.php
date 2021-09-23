<?php

declare(strict_types=1);

namespace oat\taoClientDiagnostic\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedBrowserClassService;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedOsClassService;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202109231026535081_taoClientDiagnostic extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Registers exclusion list services';
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(ExcludedOsClassService::SERVICE_ID, new ExcludedOsClassService());
        $this->getServiceManager()->register(ExcludedBrowserClassService::SERVICE_ID, new ExcludedBrowserClassService());
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(ExcludedOsClassService::SERVICE_ID);
        $this->getServiceManager()->unregister(ExcludedBrowserClassService::SERVICE_ID);
    }
}