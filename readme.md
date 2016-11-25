# typescript-bundle

## install
```
npm install typescript -g
npm install typescript-bundle -g 
```
## usage

```
tsc-bundle mylib.ts bundle.js --globalNamespace mylib
```

## overview

typescript-bundle compiles modular typescript projects that use import / export into a single 
output script that is directly consumable inside a web page with a simple html &lt;script&gt; 
tag. 

## command line options

typescript-bundle's cli works slightly different to tsc. The command line interface is as follows.

```
tsc-bundle input.ts bundle.js [...standard tsc compiler options]
```
additionally, typescript-bundle can also inherit the configurations in ```tsconfig.json``` if located
in the current working directory, otherwise a configuration can be specified with the following.

```
tsc-bundle input.ts bundle.js -p ./settings/tsconfig.json
```
typescript-bundle provides one additional option named ```--globalNamespace``` or ```-gns``` which the
user can use to specify a global variable to access a modules exported members.

```
tsc-bundle input.ts bundle.js --globalNamespace mylib
```

read sections below for more information around this option.

## rational

As of writing (November 2016), the typescript compiler still provides no direct mechanism to compile
modular typescript source code into something that is directly comsumable in web pages. Current
best practice encourages that developers should be leveraging import/export to wire their projects, 
however, without selecting a module loader, or external bundler (such as webpack, browserify), 
the modules emitted from the compiler just cannot be consumed.

An alternative approach is to use typescripts ```<reference>``` directive. Which does allow script to 
be concatenated into a single output and be consumed in page, but at the expense of having code 
not compatible with import / export. 

This project seeks to find a reasonable middle ground, letting developers author their projects using
import / export, compile that code into something that is directly consumable in page, and allow that 
code to be easily migrated into a dedicated module system / external bundling technology with 0 need 
to modify their code base. 

note: this project will be marked deprecated should this functionality arrive in the typescript compiler
itself.

## how does this project work

typescript-bundle internally calls the typescript compiler with the options ```--module amd``` and
```--outFile```. This causes the typescript compiler to emit a single AMD bundle containing all modules
it locates by traversing imports throughout the project. From here, typescript-bundle rewrites the 
compilers output with a mini AMD module loader which is used to wrap the compilers output.

A high level view of the bundles output is as follows.

```javascript
var [global namespace] = (function() {

  [typescript-bundle module loader]

  [typescript amd outfile bundle]

  return collect()
})()
```
To further illustrate, consider the following which outlines the default ```AMD outfile``` output
produced by the typescript compiler, and how that rewritten by typescript-bundle.

![diagram](./doc/diagram.png)

## notes

- typescript-bundle can only accept a single input.ts file to compile. This file is considered a top most module, 
and should import the other modules you want to include in the compilation.
- the index.ts is responsible for exporting objects to the page. Only exports on this module are publically accessible, 
all exported variables in other modules are private. 
- The exports on index.ts are written to the ```--globalNamespace``` variable name given at the command line. If no global 
namespace is given, the modules are wrapped within a closure and inaccessble to the page.
- typescript-bundle ignores ```--outFile, --outDir and ---module``` compiler options.  Internally, these options are set
to ```--module amd``` and ```--outFile [bundle.js]``` where bundle.js is provided as the second argument at the command line.
- source maps are not available. 

## building the project
The project can be built by running the following command from the project root.
```
node tasks build
```