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

namespace oat\taoClientDiagnostic\model\SupportedList;

use oat\oatbox\cache\SimpleCache;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceManager;

class CachedListDecorator extends ConfigurableService implements SupportedListInterface
{
    /** @var string class name or SERVICE_ID */
    public const OPTION_ORIGINAL_IMPLEMENTATION = 'OPTION_ORIGINAL_IMPLEMENTATION';

    /** @var string value should be in seconds */
    public const OPTION_TTL_CACHE = 'OPTION_TTL_CACHE';

    /** @var int seconds */
    private const DEFAULT_TTL_CACHE = 3600;

    /** @var string */
    private const CACHE_KEY = 'supported_browser_list';

    /** @var SupportedListInterface */
    private $implementation;

    private function getImplementation(): SupportedListInterface
    {
        if ($this->implementation === null) {
            $implementationKey = $this->getOption(self::OPTION_ORIGINAL_IMPLEMENTATION);

            if (!$this->getServiceLocator()->has($implementationKey)) {
                throw new \common_exception_NoImplementation('No implementation setup for ' . __CLASS__);
            }

            $implementation = $this->getServiceLocator()->get($implementationKey);

            if ($implementation instanceof SupportedListInterface) {
                throw new \common_exception_NoImplementation(sprintf(
                    'Implementation for %s should be of class SupportedListInterface' .
                    __CLASS__
                ));
            }

            if ($implementation instanceof self) {
                throw new \common_exception_NoImplementation('CachedListDecorator can\'t be set as implementation for itself ' . __CLASS__);
            }

            $this->implementation = $implementation;
        }
        return $this->implementation;
    }

    public function getList(): ?array
    {
        if ($this->getCache()->has(self::CACHE_KEY)) {
            return $this->getCache()->get(self::CACHE_KEY);
        }
        $list = $this->getImplementation()->getList();

        $ttl = self::DEFAULT_TTL_CACHE;
        if ($this->hasOption(self::OPTION_TTL_CACHE)) {
            $ttl = (int)$this->getOption(self::OPTION_TTL_CACHE);
        }

        $this->getCache()->set(self::CACHE_KEY, $list, new \DateInterval('PT' . $ttl . 'S'));
        return $list;
    }

    /**
     * @return SimpleCache
     * @throws \oat\oatbox\service\ServiceNotFoundException
     */
    public function getCache()
    {
        return $this->getServiceLocator()->get(SimpleCache::SERVICE_ID);
    }
}
