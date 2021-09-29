<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */
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
