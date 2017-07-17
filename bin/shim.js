"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var header = function (ns) { return (ns !== undefined ? "var " + ns + " = " : "") + "(function () {\n  var main = null;\n  var modules = {\n      \"require\": {\n          factory: undefined,\n          dependencies: [],\n          exports: function (args, callback) { return require(args, callback); },\n          resolved: true\n      }\n  };\n  function define(id, dependencies, factory) {\n      return main = modules[id] = {\n          dependencies: dependencies,\n          factory: factory,\n          exports: {},\n          resolved: false\n      };\n  }\n  function resolve(definition) {\n      if (definition.resolved === true)\n          return;\n      definition.resolved = true;\n      var dependencies = definition.dependencies.map(function (id) {\n          return (id === \"exports\")\n              ? definition.exports\n              : (function () {\n                  if(modules[id] !== undefined) {\n                    resolve(modules[id]);\n                    return modules[id].exports;\n                  } else return require(id)\n              })();\n      });\n      definition.factory.apply(null, dependencies);\n  }\n  function collect() {\n      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);\n      return (main !== null) \n        ? main.exports\n        : undefined\n  }\n"; };
var footer = function () { return "  return collect(); \n})();"; };
var read = function (filePath) { return new Promise(function (resolve, reject) {
    fs.readFile(filePath, "utf8", function (error, content) {
        if (error)
            return reject(error);
        resolve(content);
    });
}); };
var write = function (filePath, content) { return new Promise(function (resolve, reject) {
    fs.truncate(filePath, function (error) {
        if (error)
            return error;
        fs.writeFile(filePath, content, { encoding: "utf8" }, function (error) {
            if (error)
                return error;
            resolve(null);
        });
    });
}); };
exports.shim = function (filePath, ns) { return __awaiter(_this, void 0, void 0, function () {
    var input, indented, output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, read(filePath)];
            case 1:
                input = _a.sent();
                if (input.indexOf(header(ns)) !== -1)
                    return [2];
                indented = input.split("\n").map(function (line) { return "  " + line; }).join("\n");
                output = [header(ns), indented, footer()].join('\n');
                return [4, write(filePath, output)];
            case 2:
                _a.sent();
                return [2];
        }
    });
}); };
