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

namespace oat\taoClientDiagnostic\controller;

use oat\taoClientDiagnostic\model\exclusionList\ExcludedBrowserService;

/**
 *
 * @package oat\taoClientDiagnostic\controller
 */
class ExcludedBrowsers extends \tao_actions_SaSModule
{
    public function editInstance(): void
    {
        $instance = $this->getCurrentInstance();
        $myFormContainer = new \tao_actions_form_Instance($this->getCurrentClass(), $instance);

        $myForm = $myFormContainer->getForm();
        $nameElement = $myForm->getElement(\tao_helpers_Uri::encode(ExcludedBrowserService::EXCLUDED_NAME));
        $versionElement = $myForm->getElement(\tao_helpers_Uri::encode(ExcludedBrowserService::EXCLUDED_VERSION));
        $nameElement->addClass('select2');
        $versionElement->setHelp(
            "<span class=\"icon-help tooltipstered\" data-tooltip=\".exclusion-list-form .excluded-version-tooltip-content\" data-tooltip-theme=\"info\"></span>"
        );
        if ($myForm->isSubmited() && $myForm->isValid()) {
            $values = $myForm->getValues();
            // save properties
            $binder = new \tao_models_classes_dataBinding_GenerisFormDataBinder($instance);
            $binder->bind($values);
            $message = __('Instance saved');

            $this->setData('message', $message);
            $this->setData('reload', true);
        }

        $this->setData('formTitle', __('Edit Excluded Browser'));
        $this->setData('myForm', $myForm->render());
        $this->setView('exclusionList/form.tpl');
    }

    protected function getClassService(): ExcludedBrowserService
    {
        if (is_null($this->service)) {
            $this->service = $this->getServiceLocator()->get(ExcludedBrowserService::SERVICE_ID);
        }
        return $this->service;
    }
}
