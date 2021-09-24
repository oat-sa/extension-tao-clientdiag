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

namespace oat\taoClientDiagnostic\test\unit\exclusionList;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\OntologyRdfs;
use oat\generis\test\TestCase;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedBrowserClassService;
use \oat\generis\model\data\Ontology;

class ExcludedExcludedBrowserClassServiceTest extends TestCase
{
    public function testGetRootClass(): void
    {
        $class = $this->createMock(core_kernel_classes_Class::class);
        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getClass')
            ->with(ExcludedBrowserClassService::ROOT_CLASS)
            ->willReturn($class);

        $service = new ExcludedBrowserClassService();
        $service->setModel($model);
        $this->assertEquals($class, $service->getRootClass());
    }

    public function testGetListClass(): void
    {
        $name = 'fixture-browser-name';
        $resource = $this->createMock(core_kernel_classes_Resource::class);

        $class = $this->createMock(core_kernel_classes_Class::class);
        $class->expects($this->once())
            ->method('searchInstances')
            ->with(
                [OntologyRdfs::RDFS_LABEL => $name],
                ['like' => false]
            )
            ->willReturn([$resource]);

        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getClass')
            ->with(ExcludedBrowserClassService::LIST_CLASS)
            ->willReturn($class);

        $service = new ExcludedBrowserClassService();
        $service->setModel($model);

        $this->assertEquals($resource, $service->getListDefinitionByName($name));
    }

    public function testGetNameProperty(): void
    {
        $property = $this->createMock(core_kernel_classes_Property::class);
        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getProperty')
            ->with(ExcludedBrowserClassService::EXCLUDED_NAME)
            ->willReturn($property);

        $service = new ExcludedBrowserClassService();
        $service->setModel($model);
        $this->assertEquals($property, $service->getNameProperty());
    }

    public function testGetVersionProperty()
    {
        $property = $this->createMock(core_kernel_classes_Property::class);
        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getProperty')
            ->with(ExcludedBrowserClassService::EXCLUDED_VERSION)
            ->willReturn($property);

        $service = new ExcludedBrowserClassService();
        $service->setModel($model);
        $this->assertEquals($property, $service->getVersionProperty());
    }

}
