define({
    'Authenticator' : {
        'actions' : {
            'login' : 'controller/Authenticator/login'
        }
    },
    'CompatibilityChecker' : {
        'actions' : {
            'index' : 'controller/CompatibilityChecker/diagnostics'
        }
    },
    'Diagnostic' : {
        'actions' : {
            'index' : 'controller/Diagnostic/index',
            'diagnostic' : 'controller/Diagnostic/diagnostic',
            'deliveriesByProctor' : 'controller/Diagnostic/deliveriesByProctor'
        }
    }
});
