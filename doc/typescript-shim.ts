declare var require: any

var [gns] = (function () {

  /**
   * definition of a module. collected during a define pass, 
   * with the exports property populated during resolution.
   */
  interface Module {
    dependencies: Array<string>,
    factory     : Function
    exports     : any
    resolved    : boolean
  }

  /**
   * the main module.
   */
  let main    : Module = null

  /**
   * the module cache, with require module preset.
   */
  let modules : {[id: string]: Module} = {
    "require" : {
      factory      : undefined,
      dependencies : [],
      exports      : (args, callback) => require(args, callback),
      resolved     : true
    }
  }

  /**
   * implements the amd define function. internally sets the "main" module also,
   * with the knowledge that the "top module module" will be defined last in the
   * typescript compilers amd bundle.
   * @param {string} id the module identifier.
   * @param {Array<string>} dependencies an array of dependencies for the module.
   * @param {Function} factory the module factory.
   * @returns {any}
   */
  function define (id: string, dependencies: Array<string>, factory: Function) : any {
      return main = modules[id] = {
        dependencies: dependencies, 
        factory     : factory,
        exports     : {},
        resolved    : false
      }
  }
  /**
   * resolves the given module and recursively resolves its dependencies. 
   * The module will be written to the given modules exports.
   * @param {Module} definition the module to resolve.
   * @returns {void}
   */
  function resolve(definition: Module): void {
    if(definition.resolved === true) return
    definition.resolved = true
    let dependencies = definition.dependencies.map(id => 
      (id === "exports") 
      ? definition.exports 
      : (() => {
        // here we check for the existense of the
        // module with the given id. If the module
        // is not found within the bundle, we 
        // fallback to commonjs require. This
        // allows for node modules to be required()
        // external to the bundle, while may be
        // useful in some scenarios.
        if(modules[id] !== undefined) {
          resolve(modules[id]);
          return modules[id].exports;
        } 
        // note: we inject global mappings here 
        // as else if statements specified from the 
        // --globalmap option.
        //
        // this option provided to allow users to
        // bind in external libraries (like react,
        // immutablejs, etc) where the module is
        // UMD loaded.
        else {
          try {
            return require(id);
          } catch(e) {
            throw Error("module '" + id + "' not found.");
          }
        }
      })()
    )
    definition.factory.apply(null, dependencies)
  }

  /**
   * collects the modules contained in this bundle and returns the exports
   * on the top most module. If the module contains no exports, then collect
   * will return undefined.
   * @return {any}
   */
  function collect () : any {
      Object.keys(modules).map(key => modules[key]).forEach(resolve)
      // if main is null after resolution, 
      // this indicates that the compiled 
      // bundle contains no exports. In 
      // this scenario, return undefined.
      return (main !== null) 
        ? main.exports
        : undefined
  }

  // [TYPESCIRPT AMD OUTFILE BUNDLE HERE]
  
  return collect(); 
})();