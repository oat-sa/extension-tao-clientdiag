module.exports = function(grunt) { 

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/taoClientDiagnostic/views/';

    sass.taoclientdiagnostic = { };
    sass.taoclientdiagnostic.files = { };
    sass.taoclientdiagnostic.files[root + 'css/diagnostics.css'] = root + 'scss/diagnostics.scss';

    watch.taoclientdiagnosticsass = {
        files : [root + 'views/scss/**/*.scss'],
        tasks : ['sass:taoclientdiagnostic', 'notify:taoclientdiagnosticsass'],
        options : {
            debounceDelay : 1000
        }
    };

    notify.taoclientdiagnosticsass = {
        options: {
            title: 'Grunt SASS', 
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    //register an alias for main build
    grunt.registerTask('taoclientdiagnosticsass', ['sass:taoclientdiagnostic']);
};
