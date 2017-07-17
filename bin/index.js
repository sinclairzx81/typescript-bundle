"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var options_1 = require("./options");
var bundle_1 = require("./bundle");
var log = function (data) { return process.stdout.write(data); };
var main = function (args) { return bundle_1.bundle(options_1.parse(args), log); };
main(process.argv).catch(function (error) { return log(error); });
