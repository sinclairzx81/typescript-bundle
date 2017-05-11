# typescript-bundle
### bundle modular typescript projects for the browser
## install
```
npm install typescript -g
npm install typescript-bundle -g 
```
## usage
code
```typescript
// myapp.ts
export function helloworld() { ... }
```
compile
```
tsc-bundle myapp.ts myapp.js --exportAs myapp
```
run
```html
<script src="./myapp.js">
   myapp.helloworld()
</script>
```

## overview

typescript-bundle is a minimal command line utility for compiling modular typescript projects into a single output script that is consumable inside a web page with a ```<script>``` tag. It directly layers the typescript compiler cli, and allows for multi file modular typescript projects to be written and consumed in a website with no additional tooling. 

typescript-bundle supports the majority of the typescript compiler switches, including compile on save for fast and rapid typescript workflows. 

## command line options

typescript-bundle's cli is similar to the typescipt ```tsc``` cli with the exception that the user must specify 1 input file and 1 output
file up front. The input file should be the top most module in a given project, and should ```import``` all other modules to be part of a compilation.

> typescript-bundle expects the ```input.ts``` typescript file to ```import``` other files to be included in the compilation, and ```export``` the members that are to be visable to the page.

The command line interface is as follows...
```
tsc-bundle [input] [output] [--exportAs] [...standard tsc compiler options]
```
An example of which might look something like...
```
tsc-bundle input.ts output.js --exportAs myapp --target es2015 --noImplicitAny --watch
```
> typescript-bundle supports most of the tsc compiler switches except for ```--module``` and ```--outFile``` which are internally set to ```AMD``` and the given output filename respectively.

> the ```--exportAs``` option will expose the given name ```myapp``` to the page. If omitted, typecript-bundle will simply wrap all compiled modules within a function closure, with exported modules inaccessible to the page.

typescript-bundle can also be configured by way of tsconfig.json, with the caveat that the configuration must conform to typescript-bundles internal specification. The minimal basic configuration is as follows. 

```json
{
  "compilerOptions": {
    "module": "amd",
    "outFile": "output.js"
  }, "files": [
    "input.ts"
  ]
}
``` 
which can be compiled with...
```
tsc-bundle --project ./tsconfig.json -exportAs myapp
```
> developers are free to configure all other compiler switches with the exception of ```--moduleResolution``` and ```--outDir``` which must be left undefined.

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
- The exports on index.ts are written to the ```--exportAs``` variable name given at the command line. If no global 
namespace is given, the modules are wrapped within a closure and inaccessble to the page.
- typescript-bundle ignores ```--outFile, --outDir and ---module``` compiler options.  Internally, these options are set
to ```--module amd``` and ```--outFile [bundle.js]``` where bundle.js is provided as the second argument at the command line.
- source maps are not available. 

## building the project
The project can be built by running the following command from the project root.
```
node tasks build
```