<?php

declare(strict_types=1);

namespace oat\taoClientDiagnostic\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoClientDiagnostic\model\SupportedList\CachedListDecorator;
use oat\taoClientDiagnostic\model\SupportedList\RemoteList;
use oat\taoClientDiagnostic\model\SupportedList\SupportedListInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202109241806275152_taoClientDiagnostic extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register service SupportedListInterface';
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(SupportedListInterface::SERVICE_ID, new CachedListDecorator([
            CachedListDecorator::OPTION_ORIGINAL_IMPLEMENTATION => new RemoteList(),
            CachedListDecorator::OPTION_TTL_CACHE => 3600,
        ]));
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(SupportedListInterface::SERVICE_ID);
    }
}
