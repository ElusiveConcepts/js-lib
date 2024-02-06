module.exports = function(grunt)
{
	// Task Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			all:   {
				options: {
					beautify: { beautify: false, comments: 'some' }
				},
				files: [{ 
					expand: true, 
					cwd: 'modules', 
					src: ['**/*.js', '**/*.mjs', '!**/*.min.js', '!**/*.min.mjs'], 
					dest: 'modules',
					rename: function (dst, src) {
						// To keep the source js files and make new files as `*.min.js`:
						return dst + '/' + src.replace(/(.js|.mjs)$/, '.min$1');
					}
				}]
			}
		}
	});

	// Task Loading
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Task Definitions
	grunt.registerTask('compress', 'Creates minified files', [ 'uglify:all' ] );
};
