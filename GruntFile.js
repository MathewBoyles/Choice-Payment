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
    uglify: {
      options: {
        mangle: true
      },
      my_target: {
        files: [{
          expand: true,
          cwd: "src/js/",
          src: ["*.js"],
          dest: "src/js/",
          ext: ".min.js"
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
      uglify: {
        files: ["src/js/*.js", "!src/js/*.min.js"],
        tasks: ["uglify"]
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
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["all", "watch"]);
  grunt.registerTask("all", ["sass", "cssmin", "uglify"]);
};
