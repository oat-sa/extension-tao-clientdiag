    <div id="login-box" class="entry-point entry-point-container">
        <h1><?= __('Connect to the diagnostic tool')?></h1>
        <div class='xhtml_form'>
            <form method='post' id='loginForm' name='loginForm' action='<?= \tao_helpers_Uri::url("login","Authenticator","taoClientDiagnostic") ?>' >
                <div>
                    <label class='form_desc' for='login'><?= __('Login')?></label>
                    <input type='text' name='login' id='login'  autofocus='autofocus'  value="" />
                </div>
                <input type="hidden" name="successCallback" value="<?= get_data('successCallback') ?>" />
                <div class='form-toolbar' ><input type='submit' id='connect' name='connect'  value="<?= __('Log in')?>"  /></div>
            </form>
        </div>
    </div>
