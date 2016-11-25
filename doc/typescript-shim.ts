declare var require: any

var [gns] = (function () {
  //-----------------------------------
  // module loader
  //-----------------------------------
  
  interface Module {
    dependencies: Array<string>,
    factory     : Function
    exports     : any
    resolved    : boolean
  }

  let main    : Module = null
  let modules : {[id: string]: Module} = {
    "require" : {
      factory      : undefined,
      dependencies : [],
      exports      : (args, callback) => require(args, callback),
      resolved     : true
    }
  }
  function define (id: string, dependencies: Array<string>, factory: Function) {
      return main = modules[id] = {
        dependencies: dependencies, 
        factory     : factory,
        exports     : {},
        resolved    : false
      }
  }
  function resolve(definition: Module) {
    if(definition.resolved === true) return
    definition.resolved = true
    let dependencies = definition.dependencies.map(id => 
      (id === "exports") 
      ? definition.exports 
      : (() => {
        resolve(modules[id])
        return modules[id].exports
      })()
    )
    definition.factory.apply(null, dependencies)
  }
  function collect () {
      Object.keys(modules).map(key => modules[key]).forEach(resolve)
      return main.exports
  }

  //-----------------------------------
  // module bundle
  //-----------------------------------

  return collect(); 
})();