module.exports = function(grunt) {
  grunt.initConfig({
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: "src/css/",
          src: ["*.css", "!*.min.css"],
          dest: "src/css/",
          ext: ".min.css"
        }]
      }
    },
    jshint: {
      files: ["src/js/main.js"],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: "src/sass/",
          src: ["*.scss"],
          dest: "src/css/",
          ext: ".css"
        }]
      }
    },
    watch: {
      cssmin: {
        files: ["src/css/*.css", "!src/css/*.min.css"],
        tasks: ["cssmin"]
      },
      sass: {
        files: ["src/sass/*.scss"],
        tasks: ["sass"]
      },
      jshint: {
        files: ["src/js/main.js"],
        tasks: ["jshint"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["all", "watch"]);
  grunt.registerTask("all", ["sass", "cssmin"]);
};
