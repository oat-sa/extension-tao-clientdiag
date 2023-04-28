<?php

declare(strict_types=1);

namespace oat\taoClientDiagnostic\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\model\search\SearchProxy;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedBrowserService;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedOSService;

final class Version202209261151585081_taoClientDiagnostic extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add taoClientDiagnostic to OPTION_GENERIS_SEARCH_WHITELIST';
    }

    public function up(Schema $schema): void
    {
        /** @var SearchProxy $searchProxy */
        $searchProxy = $this->getServiceManager()->get(SearchProxy::SERVICE_ID);

        $searchProxy->extendGenerisSearchWhiteList([
            ExcludedBrowserService::ROOT_CLASS,
            ExcludedOSService::ROOT_CLASS,
        ]);

        $this->registerService(SearchProxy::SERVICE_ID, $searchProxy);
    }

    public function down(Schema $schema): void
    {
        /** @var SearchProxy $searchProxy */
        $searchProxy = $this->getServiceManager()->get(SearchProxy::SERVICE_ID);

        $searchProxy->removeFromGenerisSearchWhiteList([
            ExcludedBrowserService::ROOT_CLASS,
            ExcludedOSService::ROOT_CLASS,
        ]);

        $this->registerService(SearchProxy::SERVICE_ID, $searchProxy);
    }
}
