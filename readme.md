# typescript-bundle

bundle typescript projects for the browser and node.

## usage

```typescript
export function helloworld () { ... }
```

```

tsc-bundle app.ts app.js --exportAs app

```

```html
<script src="./app.js"></script>
<script>
  app.helloworld()
</script>
```

## install
```
npm install typescript -g
npm install typescript-bundle -g 
```

## overview

typescript-bundle is a command line utility for compiling modular typescript projects into a single output script that is consumable inside a web page with a simple ```<script>``` tag.

typescript-bundle layers the typescript compiler directly and supports many of the compilers options ( including ```---watch``` ) and aims to be a quick, easy to use bundling alternative for typescript centric projects.

[command line options](#command-line-options)
- [quick start](#quick-start)
- [exportAs](#exportAs)
- [importAs](#importAs)
- [tsconfig](#tsconfig)

[how does this project work](#how-does-this-project-work)

[some notes](#notes)

## command line options

### quick start
typescript-bundle expects one input file and one output file be specified upfront. The following bundles ```input.ts``` to ```output.js```
```
tsc-bundle input.ts output.js [... other typescript compiler options here]
```
### exportAs

By default, typescript-bundle encloses your compiled bundle within function closure. However it may be desirable to expose your module to a page as a global variable. This is faciliated with the ```--exportAs``` option. 

By providing this option, typescript-bundle will emit a global variable which the page can call into the exports on the module. As follows.
```
tsc-bundle input.ts output.js --exportAs foo
```
```javascript
var foo = (function() { /** your bundle here */ })
```
In some scenarios it may be desirable to bundle node modules. This requirement arises in situations where you want to mandate a strict interface to a module, while ensuring the modules internals stay private (handled implicitly by the bundles closure). typescript-bundle provides a special export ```COMMONJS``` for this purpose.

```
tsc-bundle input.ts output.js --exportAs COMMONJS
```
```typescript
module.exports = (function() { /** your bundle here */ })
```

### importAs

It is common to want to be able to reference global / UMD modules inside a bundle. This is typically the case or libraries like ```React``` which may be included outside the bundle with a external ```<script>``` tag. 

The TypeScript ```@types/*``` typically map to the modules global name (as seen from the page), but in order for typescript-bundle to resolve the module at runtime, the module name and global name must be configured. This is the purpose of the ```--importAs``` option.

Consider the following.

```typescript
import { React }    from "react"
import { ReactDOM } from "react-dom"
```
Where ```"react"``` is the module name and ```React``` is the global variable name as seen from the page. To configure ```--importAs``` for this, consider the following.
```
tsc-bundle input.ts output.js --importAs react=React,react-dom=ReactDOM
```

### project
You can pass the ```--project``` option to have typescript-bundle use its configurations with.
```
tsc-bundle --project ./tsconfig.json
```  
typescript-bundle does however mandate the following settings be set. So it is recommended keeping a seperate configuration for bundling.
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
note: the ```--moduleResolution``` and ```--outDir``` must be left unset.

note: the ```files``` should contain only one file path.

note: the ```exportAs``` and ```importAs``` are still required to be passed at the command line as these options are additional functionality not present in tsconfig.

## how does this project work

typescript-bundle wraps the default typescript output when the compiler is configured with ```--module amd``` and ```--outFile``` options. By default, this causes the compiler to emit all modules into a single output javascript file, however the compiler does not emit any AMD loading infrastructure. This is specifically what typescript-bundle provides. 

A high level view of typescript-bundle's output is as follows.

```javascript
var [exportAs] = (function() {

  [typescript-bundle amd loader]

  [typescript amd outfile output]

  return collect()
})()
```

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
The project can be built locally by running the following command from the project root.
```
node tasks build
```