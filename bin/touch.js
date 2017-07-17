"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var shouldCreateDirectory = function (directoryPath) {
    try {
        var stat = fs.statSync(directoryPath);
        return stat.isDirectory() ? false : true;
    }
    catch (e) {
        return true;
    }
};
var shouldCreateFile = function (filePath) {
    try {
        var stat = fs.statSync(filePath);
        return stat.isFile() ? false : true;
    }
    catch (e) {
        return true;
    }
};
var provisionDirectory = function (directory) {
    var abs = path.resolve(process.cwd(), directory).replace(/\\/g, "/");
    var parts = abs.split("/");
    var current = "";
    while (parts.length > 0) {
        current = current + parts.shift() + "/";
        if (shouldCreateDirectory(current)) {
            fs.mkdirSync(current);
        }
    }
};
exports.touch = function (filePath) {
    provisionDirectory(path.dirname(filePath));
    if (shouldCreateFile(filePath) === true) {
        fs.writeFileSync(filePath, "", { encoding: "utf8" });
    }
};
