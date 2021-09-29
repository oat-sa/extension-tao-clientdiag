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

namespace oat\taoClientDiagnostic\test\unit\exclusionList;

use core_kernel_classes_Class;
use core_kernel_classes_Literal;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\OntologyRdfs;
use oat\generis\test\TestCase;
use oat\taoClientDiagnostic\model\exclusionList\ExcludedBrowserService;
use \oat\generis\model\data\Ontology;

class ExcludedBrowserServiceTest extends TestCase
{
    public function testGetRootClass(): void
    {
        $class = $this->createMock(core_kernel_classes_Class::class);
        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getClass')
            ->with(ExcludedBrowserService::ROOT_CLASS)
            ->willReturn($class);

        $service = new ExcludedBrowserService();
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
            ->with(ExcludedBrowserService::LIST_CLASS)
            ->willReturn($class);

        $service = new ExcludedBrowserService();
        $service->setModel($model);

        $this->assertEquals($resource, $service->getListDefinitionByName($name));
    }

    public function testGetNameProperty(): void
    {
        $property = $this->createMock(core_kernel_classes_Property::class);
        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getProperty')
            ->with(ExcludedBrowserService::EXCLUDED_NAME)
            ->willReturn($property);

        $service = new ExcludedBrowserService();
        $service->setModel($model);
        $this->assertEquals($property, $service->getNameProperty());
    }

    public function testGetVersionProperty()
    {
        $property = $this->createMock(core_kernel_classes_Property::class);
        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getProperty')
            ->with(ExcludedBrowserService::EXCLUDED_VERSION)
            ->willReturn($property);

        $service = new ExcludedBrowserService();
        $service->setModel($model);
        $this->assertEquals($property, $service->getVersionProperty());
    }

    public function testGetExclusionsByName()
    {
        $name = 'fixture-browser-name';
        $resource1 = $this->createMock(core_kernel_classes_Resource::class);
        $resource2 = $this->createMock(core_kernel_classes_Resource::class);
        $class = $this->createMock(core_kernel_classes_Class::class);
        $class->expects($this->once())
            ->method('searchInstances')
            ->with(
                [OntologyRdfs::RDFS_LABEL => $name],
                ['like' => false]
            )
            ->willReturn([$resource1, $resource2]);

        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getClass')
            ->with(ExcludedBrowserService::ROOT_CLASS)
            ->willReturn($class);

        $service = new ExcludedBrowserService();
        $service->setModel($model);

        $this->assertEquals([$resource1, $resource2], $service->getExclusionsByName($name));
    }

    public function testGetExclusionsList()
    {
        $name = 'fixture-browser-name';
        $version = 'fixture-browser-version';

        $nameProperty = $this->createMock(core_kernel_classes_Property::class);
        $nameProperty->expects($this->once())
            ->method('getLabel')
            ->willReturn($name);

        $versionProperty = $this->createMock(core_kernel_classes_Literal::class);
        $versionProperty->expects($this->once())
            ->method('__toString')
            ->willReturn($version);

        $resource = $this->createMock(core_kernel_classes_Resource::class);
        $resource->expects($this->once())
            ->method('getPropertiesValues')
            ->willReturn([
                ExcludedBrowserService::EXCLUDED_NAME => [$nameProperty],
                ExcludedBrowserService::EXCLUDED_VERSION => [$versionProperty]
            ]);

        $class = $this->createMock(core_kernel_classes_Class::class);
        $class->expects($this->once())
            ->method('getInstances')
            ->with(true)
            ->willReturn([$resource]);

        $model = $this->createMock(Ontology::class);
        $model->expects($this->once())
            ->method('getClass')
            ->with(ExcludedBrowserService::ROOT_CLASS)
            ->willReturn($class);
        $model->expects($this->any())
            ->method('getProperty')
            ->willReturn($this->createMock(core_kernel_classes_Property::class));

        $service = new ExcludedBrowserService();
        $service->setModel($model);

        $this->assertEquals([$name => [$version]], $service->getExclusionsList());
    }
}
