module.exports = function(grunt) {
    grunt.option('prod', false);
    var isDev = grunt.option('no-prod');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            options: {
                spawn: false,
                livereload: true
            },
            js: {
                files: ['src/js/**/*'],
                tasks: ['js']
            },
            sass: {
                files: ['src/css/**/*'],
                tasks: ['sass']
            },
            html: {
                files: ['src/*.html'],
                tasks: ['copy:html']
            },
            views: {
                files: ['src/html/*.mustache'],
                tasks: ['mustache']
            }
        },

        sass: {
            dist: {
                options: {
                    outputStyle: 'compact'
                },
                files: {
                    'dist/css/main.css': 'src/css/main.scss'
                }
            }
        },

        copy: {
            html: {
                src: 'src/*.html',
                dest: 'dist/',
                flatten: true,
                expand: true
            },

            imgs: {
                src: 'src/imgs/*',
                dest: 'dist/imgs/',
                flatten: true,
                expand: true
            }
        },

        jshint: {
            all: ['Gruntfile.js', 'src/js/*.js', 'src/js/app/**/*.js']
        },

        mustache: {
            files : {
                src: 'src/html/',
                dest: 'src/js/app/html.js',
                options: {
                    prefix: 'var JOURNEY = JOURNEY || {}; JOURNEY.html = ',
                    postfix: ';',
                    verbose: true
                }
            }
        },

        replace: {
            options: {
                patterns: [{
                    match: 'path',
                    replacement: (isDev) ? '' : '<%= pkg.remotePath %>',
                    expression: false   // simple variable lookup
                }]
            },
            code: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['src/js/boot.js'],
                    dest: 'dist/'
                }]
            }
        },

        connect: {
            server: {
                options: {
                    port: 9999,
                    base: 'dist',
                    hostname: '*',
                    open: true
                }
            }
        },

        useminPrepare: {
            html: 'src/index.html'
        },
        usemin: {
            html: 'dist/index.html'
        },

        clean: ['dist']
    });

    // Loads
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-mustache');

    // Tasks
    grunt.registerTask('js', [ 'mustache', 'jshint', 'useminPrepare', 'concat', 'uglify', 'replace']);
    grunt.registerTask('build', ['clean', 'jshint', 'sass', 'copy', 'js', 'usemin']);
    grunt.registerTask('default', ['build', 'connect', 'watch']);
};
