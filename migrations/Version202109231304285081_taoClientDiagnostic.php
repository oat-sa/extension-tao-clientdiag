<?php

declare(strict_types=1);

namespace oat\taoClientDiagnostic\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoClientDiagnostic\model\CompatibilityChecker;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202109231304285081_taoClientDiagnostic extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register the service CompatibilityChecker';
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(CompatibilityChecker::SERVICE_ID, new CompatibilityChecker());
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(CompatibilityChecker::SERVICE_ID);
    }
}
