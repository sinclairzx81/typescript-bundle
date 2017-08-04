/*--------------------------------------------------------------------------

typescript-bundle - bundle modular typescript projects for the browser

The MIT License (MIT)

Copyright (c) 2016-2017 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

// used for mapping UMD imports to modules
export type ImportAs = {
  moduleName: string
  globalName: string
}

// the amd module shim header.
const header = (ns: string, importas: ImportAs[]) => `${ns !== undefined ? `var ${ns} = ` : ""}(function () {
  var main = null;
  var modules = {
      "require": {
          factory: undefined,
          dependencies: [],
          exports: function (args, callback) { return require(args, callback); },
          resolved: true
      }
  };
  function define(id, dependencies, factory) {
      return main = modules[id] = {
          dependencies: dependencies,
          factory: factory,
          exports: {},
          resolved: false
      };
  }
  function resolve(definition) {
      if (definition.resolved === true)
          return;
      definition.resolved = true;
      var dependencies = definition.dependencies.map(function (id) {
          return (id === "exports")
              ? definition.exports
              : (function () {
                  if(modules[id] !== undefined) {
                    resolve(modules[id]);
                    return modules[id].exports;
                  }${importas.map(mapping => {
                    return ` else if(id === "${mapping.moduleName}") {
                    return window["${mapping.globalName}"];
                  }`
                  }).join('')} else {
                    try {
                      return require(id);
                    } catch(e) {
                      throw Error("module '" + id + "' not found.");
                    }
                  }
              })();
      });
      definition.factory.apply(null, dependencies);
  }
  function collect() {
      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);
      return (main !== null) 
        ? main.exports
        : undefined
  }\n`

// the amd module shim footer.
const footer = () => `  return collect(); \n})();`

/**
 * reads the given filePath
 * @param {string} filePath the file to read.
 * @return {Promise<string>}
 */
const read = (filePath: string) => new Promise<string>((resolve, reject )=> {
    fs.readFile(filePath, "utf8", (error, content) => {
        if(error) return reject(error)
        resolve(content)
    })
})
/**
 * writes the given filePath with the given content.
 * @param {string} filePath the file to write.
 * @param {string} content the content to write.
 * @returns {Promise<string>}
 */
const write = (filePath: string, content: string) => new Promise<string>((resolve, reject) => {
    fs.truncate(filePath, (error) => {
        if(error) return error
        fs.writeFile(filePath, content, {encoding: "utf8"}, (error) => {
            if(error) return error
            resolve(null)
        })
    })
})
/**
 * shims the given amd+outFile typescript output with a small module loader.
 * @param {string} filePath the path of the file to shim.
 * @param {string} ns the global namespace.
 * @returns {void}
 */
export const shim = async (filePath: string, ns: string | undefined, importas: ImportAs[]): Promise<any> => {
    
    // read input file
    const input = await read(filePath)
    // prevent double shimming by testing for header section.
    if (input.indexOf(header(ns, importas)) !== -1 ) return
    // indent the contents of the file.
    const indented = input.split("\n").map(line => "  " + line).join("\n")
    // shim the output.
    const output   = [header(ns, importas), indented, footer()].join('\n')
    // overwrite the file.
    await write(filePath, output)
}

