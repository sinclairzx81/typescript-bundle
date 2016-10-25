/*--------------------------------------------------------------------------

typescript-bundle - compiles modular typescript projects into bundle consumable with a html script tag.

The MIT License (MIT)

Copyright (c) 2016 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import * as fs from "fs"

export interface Shim {
    shim(filename: string, ns: string)
}

/**
 * TypeScriptAmdOutFileShim:
 * 
 * Provides a single script shim for the typescript compilers
 * AMD "outfile" option. Relevant to TypeScript v 2.0.3.
 * Note: this shim is highly reliant on the TypeScript 
 * AMD outfile option. If the behaviour and output generated
 * by this option changes, then this shim will cease to work.
 */
export class TypeScriptAmdOutFileShim implements Shim {

    constructor() { }

    private pre = (ns: string) => `${ns !== undefined ? `var ${ns} = ` : ""}(function () {
  var defs = [];
  var resolve = function (id, cache) {
      if (id === "exports")
          return {};
      if (cache[id] !== undefined)
          return cache[id];
      var def = (defs.some(function (def) { return def.id === id; }))
          ? defs.filter(function (def) { return def.id === id; })[0]
          : ({ id: id, deps: [], factory: function () { return require(id); } });
      var deps = def.deps.map(function (dep) { return resolve(dep, cache); });
      var exports = def.factory.apply({}, deps);
      if (def.deps.some(function (dep) { return dep === "exports"; }))
          exports = deps[def.deps.indexOf("exports")];
      return cache[id] = exports;
  };
  var collect = function () {
      return resolve(defs[defs.length - 1].id, {
          "require": function (arg, callback) { return callback(require(arg)); }
      });
  };
  var define = function (id, deps, factory) {
      return defs.push({ id: id, deps: deps, factory: factory });
  };\n`

    private post = () => `  return collect(); \n})();`

    /**
     * for the given filename and namespace, shim the file. If the
     * file has already been shimmed, no action is taken.
     * @param {string} the file to shim.
     * @param {string | undefined} namespace to emit.
     * @returns {void}
     */
    public shim(filename: string, ns: string | undefined): void {

        let input = fs.readFileSync(filename, "utf8")

        if (input.indexOf(this.pre(ns)) === -1) {

            input = input.split("\n").map(line => "  " + line).join("\n")

            let output = [this.pre(ns), input, this.post()].join('\n')

            fs.truncateSync(filename, 0)

            fs.writeFileSync(filename, output, "utf8")
        }
    }
}