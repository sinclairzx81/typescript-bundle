"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
exports.shell = function (command, log) {
    if (log === void 0) { log = function () { }; }
    return new Promise(function (resolve, reject) {
        var encoding = "utf8";
        var windows = /^win/.test(process.platform);
        var proc = child_process_1.spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command]);
        proc.stdout.setEncoding(encoding);
        proc.stderr.setEncoding(encoding);
        proc.stdout.on("data", function (data) { return log(data); });
        proc.stderr.on("data", function (data) { return log(data); });
        proc.on("error", function (error) { return reject(error); });
        proc.on("close", function (exitcode) { return resolve(exitcode); });
    });
};
