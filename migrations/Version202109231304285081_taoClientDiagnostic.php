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
