//Sass configuration
var gulp = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");

//Custom variables
var sourceFiles = "scss/*.scss";

//Prints the error that was found during the compilation, and makes sure that the task keeps running
function catchError(e) {
	console.log(e);
	this.emit("end");
}

//Converts the .scss files described in the sourceFiles variable into css
gulp.task("sass", function (cb) {
	gulp.src(sourceFiles)
		.pipe(sass({ errorLogToConsole: true }))
		.on("error", catchError)
		.pipe(
			header(
				"/* Automatically generated from .scss, do not directly edit */\n\n"
			)
		)
		.pipe(gulp.dest("./"));
	cb();
});

//Runs the sass task whenever files described in the sourceFiles variable change
gulp.task(
	"default",
	gulp.series("sass", function (cb) {
		gulp.watch(sourceFiles, gulp.series("sass"));
		cb();
	})
);
