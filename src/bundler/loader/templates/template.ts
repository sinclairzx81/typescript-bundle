/*--------------------------------------------------------------------------

typescript-bundle

The MIT License (MIT)

Copyright (c) 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

// --------------------------------------------------------------------------
//
// AMD Loader Template
//
// This is the base AMD loader template used in TypeScript-Bundle. This
// template is compiled for the various ES targets by running.
//
// $ npm run amd-loaders
//
// Which will generate the other files in this directory.
//
// future considerations with respect to multi module bundles here: 
//
// -- https://www.keithcirkel.co.uk/proposal-multi-module-files/
//
// --------------------------------------------------------------------------

type Factory = (...args: any[]) => void

interface Define {

  dependencies: string[],

  factory: Factory,
}

interface Instance {

  exports: any
}

(() => {

  // ------------------------------------------------------------
  //
  // section: define
  //
  // Implements the AMD define function and tracks an 'entry' point.
  //
  // ------------------------------------------------------------

  const defines: {[name: string]: Define} = {}

  const entry = [null]

  function define(name: string, dependencies: string[], factory: Factory) {

    defines[name] = { dependencies, factory }

    entry[0] = name
  }

  // ------------------------------------------------------------
  //
  // section: require
  //
  // Adds the default 'require' import for the module.
  //
  // ------------------------------------------------------------

  define("require", ["exports"], (exports: any) => {

    Object.defineProperty(exports, "__cjsModule", { value: true });

    Object.defineProperty(exports, "default", { value: require });
  })

  // ------------------------------------------------------------
  //
  // section: bundle
  //
  // A bundle marker.
  //
  // ------------------------------------------------------------

  'marker:bundle'

  // ------------------------------------------------------------
  //
  // section: get_define
  //
  // gets a module definition or builds a synthetic definition.
  //
  // ------------------------------------------------------------

  function get_define(name: string): Define {

    if(defines[name]) {

      // module
      return defines[name]

    } else if(defines[name + '/index']) {

      // module/index
      return defines[name + '/index']

    } else {

      // synthetic commonjs import
      const dependencies = ['exports']

      const factory = (exports: any) => {

          try {
              
            Object.defineProperty(exports, "__cjsModule", { value: true });

            Object.defineProperty(exports, "default", { value: require(name) });
          }
          catch {

            throw Error(['module ', name, ' not found.'].join(''));
          }
      };
      
      return { dependencies, factory }
    }
  }

  // ------------------------------------------------------------
  //
  // section: resolve
  //
  // Handles module instancing and caching.
  //
  // ------------------------------------------------------------

  const instances: {[name: string]: any } = {}

  function resolve(name: string): any {
    // if resolved, return...
    if(instances[name]) {

      return instances[name]
    }

    // if requesting 'exports' return a new export.
    if(name === 'exports') {

      return  {}
    }

    // resolve module definition.
    const define = get_define(name)

    // set instance (note: prevents stack overflow of cyclic import)
    instances[name] = {}

    // resolve module dependencies.
    const dependencies = define.dependencies.map(name => resolve(name))
    
    // execute module factory.
    define.factory(...dependencies)
    
    // read exports
    const exports = dependencies[ define.dependencies.indexOf('exports') ]
    
    // assign exports to instance
    instances[name] = (exports['__cjsModule']) ? exports.default : exports

    return instances[name]
  }

  // ------------------------------------------------------------
  //
  // section: export
  //
  // Exports the 'last' module in the bundle to the caller.
  //
  // ------------------------------------------------------------
  if (entry[0] !== null) {

    return resolve(entry[0])
  }

})();
