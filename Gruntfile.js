module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		jsdoc : {
			lib : {
				src: [ 'lib/*.js' ],
				options: {
					destination: 'doc'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('doc', ['jsdoc:lib']);


};