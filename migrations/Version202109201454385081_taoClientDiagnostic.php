<?php

declare(strict_types=1);

namespace oat\taoClientDiagnostic\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202109201454385081_taoClientDiagnostic extends AbstractMigration
{
    private $browserlistUrl = 'https://oat-sa.github.io/browserslist-app-tao/api.json';

    public function getDescription(): string
    {
        return 'Add the browserslistUrl option to the browser test configuration';
    }

    public function up(Schema $schema): void
    {
        $extension = $this->getExtension();
        $config = $extension->getConfig('clientDiag');

        $config['diagnostic']['testers']['browser']['browserslistUrl'] = $this->browserlistUrl;

        $extension->setConfig('clientDiag', $config);
    }

    public function down(Schema $schema): void
    {
        $extension = $this->getExtension();
        $config = $extension->getConfig('clientDiag');

        unset($config['diagnostic']['testers']['browser']['browserslistUrl']);

        $extension->setConfig('clientDiag', $config);
    }

    private function getExtension()
    {
        return $this->getServiceManager()
            ->get(\common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoClientDiagnostic');
    }
}
