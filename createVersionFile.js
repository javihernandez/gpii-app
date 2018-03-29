var fs = require("fs");
var package = require("./package.json");

fs.writeFile("version.txt", package.version, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("version.txt has been created!");
}); 
