
# TypeScript-Bundle

A zero configuration bundling tool for TypeScript.

![logo](./docs/images/logo-small.png)

```bash
$ npm install typescript-bundle -g
```
```bash
$ tsc-bundle ./index.ts
```

## Overview

TypeScript-Bundle is a build tool for the TypeScript programming language. It layers the TypeScript compiler cli to enable direct bundling of modular TypeScript source code for immediate consumption in a browser.

This tool provides:

- The ability to bundle directly from `.ts`, `.tsx` or `tsconfig.json`.
- The ability to embed `text`, `json`, `base64` and `buffer` assets as modules.
- Support for custom pre-processing pipelines.
- Supports TypeScript compiler versions as low as 1.8.0.

This tool is offered as is for anyone who finds it useful.

## Docs
- [Options](#Options)
- [Usage](#Usage)
- [Assets](#Assets)
- [ExportAs](#exportAs)
- [ImportAs](#importAs)
- [Transforms](#Transforms)
- [Tasks](#Tasks)

<a name="Options"></a>
## Options
```
$ tsc-bundle script.ts | script.tsx | tsconfig.json

  Examples: tsc-bundle index.ts
            tsc-bundle tsconfig.json
            tsc-bundle script.ts --exportAs Foo
            tsc-bundle index.ts --outFile bundle.js
            tsc-bundle index.ts --transform script.js

  Options:
    --outFile         Outputs the bundle with the give filepath.
    --target          Sets the ES Target for the bundle.
    --exportAs        Exports bundle exports as a global variable.
    --importAs        Imports global variable as a module (namespace).
    --importAsDefault Imports global variable as a module (default).
    --transform       Applies a transform to the bundle.
    --watch           Starts the compiler in watch mode.
    --debug           Prints debug information.
```
<a name="Usage"></a>
## Usage

### Bundle from source file

Point TypeScript-Bundle at a TypeScript source file to have it bundle that file and everything it imports. Will use the default compiler settings.

```bash
# output: ./script.js
$ tsc-bundle ./script.ts

# output: ./bundle.js
$ tsc-bundle ./script.ts --outFile ./bundle.js
```
### Bundle from tsconfig.json

Point TypeScript-Bundle at a `tsconfig.json` to have it use the compiler settings within.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "lib": ["dom", "esnext"],
  },
  "files": ["script.ts"]
}

```
```bash
$ tsc-bundle ./src/tsconfig.json

# output: ./script.js
```
```bash
$ tsc-bundle ./src/tsconfig.json --outFile ./bundle.js

# output: ./bundle.js
```
<a name="Assets"></a>
## Assets
##### Supported for TypeScript compiler versions 2.2.0 and higher.
```typescript
import Content from 'text!./file.txt'
```
TypeScript-Bundle automatically bundles files with a special import scheme similar to WebPack's [ts-loader](https://github.com/TypeStrong/ts-loader). It supports `text`, `json`, `base64`, `buffer` and `css` directives that inform the bundler how to embed the asset.

```typescript
import Text   from 'text!./file.txt'    // as 'string'
import Base64 from 'base64!./image.png' // as 'string | base64 encoded'
import Obj    from 'json!./file.json'   // as 'any'
import Buf    from 'buffer!./file.dat'  // as 'Uint8Array'
import Css    from 'css!./file.css'     // as 'string | @import concat'
```

### Declarations

To import assets without compiler warnings, TypeScript requires you define an additional declaration file `.d.ts` that describes the `file extension` to `type` mappings. The following is an example of such a declaration.
```typescript
declare module '*.txt' {
 const value: string
  export default value
}
declare module '*.json' {
  const value: any
  export default value
}
declare module '*.b64' {
 const value: string
  export default value
}
declare module '*.buf' {
 const value: Uint8Array
  export default value
}
declare module '*.css' {
 const value: string
  export default value
}
```
You can either add this declaration to your `tsconfig.json` or as a `/// <reference path='extensions.d.ts' />` directive if bundling from script.

<a name="ExportAs"></a>
## ExportAs
```
--exportAs GLOBAL
```
Assigns a global variable name to the bundle.

### Example

```TypeScript
// script.ts

export function add(a: number, b: number) { return a + b }
```
```bash
$ tsc-bundle script.ts --exportAs Foo
```
```javascript
var Foo = (function() {  /* bundled code here */  })()
```
Now available to the page.
```html
<script src='./script.js'></script>

<script> console.log(Foo.add(10, 20)) </script>
```
### CommonJS

If you are bundling for nodejs, you can pass `--exportAs commonjs` that will make the bundle a nodejs module. Useful for keeping the internals of the bundle private while exposing a surface level API.

```bash
$ tsc-bundle ./script.ts --exportAs commonjs
```
```javascript
module.exports = (function() {  /* bundled code here */  })()
```
```javascript
// node: app.js
const Foo = require('./script')
```

<a name="ImportAs"></a>
## ImportAs
```
--importAs GLOBAL=module

--importAsDefault GLOBAL=module
```
Adds global variables (such as those added to a web page when loading scripts via CDN) as internal modules.

### Import React
```bash
# install react declaration files.

$ npm install @types/react
$ npm install @types/react-dom
```
```TypeScript
// index.ts

import * as React    from 'react'
import * as ReactDOM from 'react-dom'
```
```bash
# bundle with --importAs. The convention is GLOBAL_NAME=MODULE_NAME.

$ tsc-bundle index.ts --importAs React=react --importAs ReactDOM=react-dom
```
```html
<!-- adds global name React -->
<script src="./react.js"></script>
<!-- adds global name ReactDOM -->
<script src="./react-dom.js"></script>
<!-- the bundle -->
<script src="./index.js"></script>
```
It is possible to import as many global names as necessary.

### importAs vs importAsDefault

TypeScript-Bundle provides two importAs schemes for importing global variables. The decision to select one over the other is purely down to the import semantics provided by `@types/*` declaration for that library.

#### importAs
```
--importAs THREE=three
```
```typescript
import * as THREE from 'three'
```
#### importAsDefault
```
--importAsDefault THREE=three
```
```typescript
import THREE from 'three'
```
Select the most appropriate based on the library you're importing.


<a name="Transforms"></a>
## Transforms
```
--transform ./preprocessor.js
```
Allows for custom preprocessing of the bundle.

```javascript
// ./preprocessor.js

// run on typescript AMD output.
module.exports.typescriptOutput = function(javascript_code) {
  // apply transformations here.

  return javascript_code
}

// run on typescript-bundle output.
module.exports.bundleOutput = function(javascript_code) {
  // apply transformations here.

  return javascript_code
}
```
Multiple preprocessing stages can be stacked if required.
```
$ tsc-bundle ./index.ts --transform ./a.js --transform ./b.js --transform ./c.js
```

<a name="Tasks"></a>

## Tasks

The following tasks are provided by this project.

```bash
$ npm run clean          # cleans this project.
$ npm run es_loaders     # rebuilds es loader templates. 
$ npm run build          # builds the bundler.
$ npm run pack           # packs the bundler.
$ npm run watch-spec     # compiles the spec project on edits.
$ npm run watch-spec-out # executes the spec project on edits.
$ npm run install-cli    # installs the bundler cli globally.
$ npm run uninstall-cli  # uninstalls the bundler cli globally.
```