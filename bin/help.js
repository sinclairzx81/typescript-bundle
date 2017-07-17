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
var shell_1 = require("./shell");
var VERSION = "0.8.3";
exports.help = function () { return "\n\u001B[34mtypescript-bundle\u001B[0m\n\n Version " + VERSION + "\n\n\u001B[34musage:\u001B[0m\n \n typescript-bundle [input] [output] [--exportAs] [... tsc compiler options]\n\n typescript-bundle --project [tsconfig] [--exportAs]\n\n typescript-bundle --help     \n\n typescript-bundle --version                  \n\n\u001B[34mexample:\u001B[0m\n\n tsc-bundle ./input.ts ./scripts/bundle.js --exportAs myapp\n\n"; };
exports.errors = function (option) {
    return "\n\u001B[34mtypescript-bundle\u001B[0m\n\n" + option.errors.map(function (error) { return " " + error; }).join('\n') + "\n\n";
};
exports.version = function () { return __awaiter(_this, void 0, void 0, function () {
    var tsc_version;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tsc_version = "";
                return [4, shell_1.shell("tsc -v", function (data) { return tsc_version = data; })];
            case 1:
                _a.sent();
                return [2, "\n\u001B[34mtypescript-bundle\u001B[0m\n\n Version " + VERSION + "\n\n\u001B[34mtypescript\u001B[0m\n\n " + tsc_version + "\n"];
        }
    });
}); };
exports.info = function (options) {
    return "\n\u001B[34mtypescript-bundle\u001B[0m  \n\n " + options.command + "\n\n\u001B[34mtypescript\u001B[0m\n\n";
};
exports.done = function () {
    return "\u001B[34mdone\u001B[0m\n\n";
};
