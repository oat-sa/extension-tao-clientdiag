module.exports = function(grunt) { 

    var requirejs   = grunt.config('requirejs') || {};
    var clean       = grunt.config('clean') || {};
    var copy        = grunt.config('copy') || {};

    var root        = grunt.option('root');
    var libs        = grunt.option('mainlibs');
    var ext         = require(root + '/tao/views/build/tasks/helpers/extensions')(grunt, root);
    var out         = 'output';


    /**
     * Remove bundled and bundling files
     */
    clean.taoclientdiagnosticbundle = [out];
    
    /**
     * Compile tao files into a bundle 
     */
    requirejs.taoclientdiagnosticbundle = {
        options: {
            baseUrl : '../js',
            dir : out,
            mainConfigFile : './config/requirejs.build.js',
            paths : { 'taoClientDiagnostic' : root + '/taoClientDiagnostic/views/js' },
            modules : [{
                name: 'taoClientDiagnostic/controller/routes',
                include : ext.getExtensionsControllers(['taoClientDiagnostic']),
                exclude : ['mathJax', 'mediaElement'].concat(libs)
            }]
        }
    };

    /**
     * copy the bundles to the right place
     */
    copy.taoclientdiagnosticbundle = {
        files: [
            { src: [out + '/taoClientDiagnostic/controller/routes.js'],  dest: root + '/taoClientDiagnostic/views/js/controllers.min.js' },
            { src: [out + '/taoClientDiagnostic/controller/routes.js.map'],  dest: root + '/taoClientDiagnostic/views/js/controllers.min.js.map' }
        ]
    };

    grunt.config('clean', clean);
    grunt.config('requirejs', requirejs);
    grunt.config('copy', copy);

    // bundle task
    grunt.registerTask('taoclientdiagnosticbundle', ['clean:taoclientdiagnosticbundle', 'requirejs:taoclientdiagnosticbundle', 'copy:taoclientdiagnosticbundle']);
};
