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

import {Options} from "./options"
import {shell}   from "./shell"

const VERSION = "[[[VERSION_STRING]]]"

export const help = () => `
\x1b[34mtypescript-bundle\x1b[0m

 Version ${VERSION}

\x1b[34musage:\x1b[0m
 
 typescript-bundle input.ts output.js --exportAs app [... tsc compiler options]

 typescript-bundle input.tsx output.js --globalmap react=React,react-dom=ReactDOM --jsx

 typescript-bundle --project .tsconfig.json --exportAs app

 typescript-bundle --help     

 typescript-bundle --version                  

\x1b[34mexample:\x1b[0m

 tsc-bundle ./input.ts ./scripts/bundle.js --exportAs myapp

`

export const errors = (option: Options) => {
  return `
\x1b[34mtypescript-bundle\x1b[0m

${option.errors.map(error => " " + error).join('\n')}

`
}

export const version = async () => {
  let tsc_version = ""
  await shell("tsc -v", (data) => tsc_version = data)
  return `
\x1b[34mtypescript-bundle\x1b[0m

 Version ${VERSION}

\x1b[34mtypescript\x1b[0m

 ${tsc_version}
`
} 

export const info = (options: Options) => {
  return `
\x1b[34mtypescript-bundle\x1b[0m  

 ${options.command}

\x1b[34mtypescript\x1b[0m

`
}


export const done = () => {
  return `\x1b[34mdone\x1b[0m\n\n`
}