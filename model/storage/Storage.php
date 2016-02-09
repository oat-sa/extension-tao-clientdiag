<?php

namespace oat\taoClientDiagnostic\model\storage;

use oat\taoClientDiagnostic\model\entity\Entity;

/**
 * Interface Storage
 * @package oat\taoClientDiagnostic\model\storage
 */
interface Storage
{
    const SERVICE_ID = 'taoClientDiagnostic/storage';

    /**
     * Store data into storage model based on entity
     * It should support insert or update
     * @param Entity $entity
     * @return mixed
     */
    public function store(Entity $entity);
}