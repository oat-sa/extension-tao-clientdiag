<?php

namespace oat\taoClientDiagnostic\controller;

/**
 * Class Authenticator
 * @package oat\taoClientDiagnostic\controller
 */
class Authenticator extends \tao_actions_CommonModule
{
    /**
     * Login process
     * Check if url successCallback is set
     * If login form is post valid, setcookie & redirect to successCallback
     * Else forward to createLoginForm with ?errorMessage
     */
    public function login()
    {
        try {
            if (!$this->hasRequestParameter('successCallback')) {
                throw new \Exception ('Internal error, please retry in few moment');
            }
            if ($this->isRequestPost()) {
                $this->validLoginForm();
                $this->setCookie('login', $this->getRequestParameter('login'), null, '/package-tao/taoClientDiagnostic');
                $this->redirect($this->getRequestParameter('successCallback'));
            }
        } catch (\Exception $e) {
            return $this->forward('createLoginForm', null, null, array('errorMessage' => __($e->getMessage())));
        }
        $this->forward('createLoginForm');
    }

    /**
     * Display login view
     * with errorMessage if exists
     * with succesCallback url
     */
    public function createLoginForm()
    {
        if($this->hasRequestParameter('errorMessage')){
            $this->setData('errorMessage', $this->getRequestParameter('errorMessage'));
        }
        $this->setData('clientConfigUrl', $this->getClientConfigUrl());
        $this->setData('successCallback', $this->getRequestParameter('successCallback'));
        $this->setView('Authenticator\login.tpl');
    }

    /**
     * Check if login is valid
     *  - not empty
     *  - exists in TAO ACL -OR- match with regex
     * @throws \Exception
     */
    private function validLoginForm()
    {
        $login = $this->getRequestParameter('login');
        if (empty($login)) {
            throw new \Exception('No login found');
        }
        if (\tao_models_classes_UserService::singleton()->loginExists($login)
            || preg_match('/^[0-9]{7}[A-Z]$/', $login) === 1
        ) {
            return;
        }
        throw new \Exception('This login does not exist');
    }
}