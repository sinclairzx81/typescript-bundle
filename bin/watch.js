"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Debounce = (function () {
    function Debounce(delay) {
        this.delay = delay;
        this.handle = undefined;
    }
    Debounce.prototype.emit = function (func) {
        var _this = this;
        if (this.handle !== undefined) {
            clearTimeout(this.handle);
        }
        this.handle = setTimeout(function () {
            _this.handle = undefined;
            func();
        }, this.delay);
    };
    return Debounce;
}());
var Watcher = (function () {
    function Watcher(watcher) {
        this.watcher = watcher;
    }
    Watcher.prototype.close = function () {
        this.watcher.close();
    };
    return Watcher;
}());
exports.Watcher = Watcher;
exports.watch = function (filePath, func) {
    var debounce = new Debounce(50);
    return new Watcher(fs.watch(filePath, function (_) { return debounce.emit(function (_) { return func(); }); }));
};
