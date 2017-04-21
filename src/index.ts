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

/// <reference path="./@types/node/node.d.ts" />

import {Log, ConsoleLog}          from "./log"
import {Options}                  from "./options"
import {Pathing}                  from "./pathing"
import {Shell}                    from "./shell"
import {Provision}                from "./provision"
import {TypeScriptCompiler}       from "./compiler"
import {TypeScriptAmdOutFileShim} from "./shim"
import {Bundler}                  from "./bundler"

//-------------------------------------------
// setup !
//-------------------------------------------
let pathing   = new Pathing()
let log       = new ConsoleLog()
let shell     = new Shell(log)
let compiler  = new TypeScriptCompiler(shell, log)
let shim      = new TypeScriptAmdOutFileShim()
let provision = new Provision()
let bundler   = new Bundler (
  pathing, 
  provision,
  compiler, 
  shim, 
  log)

//-------------------------------------------
// bundle !
//-------------------------------------------
let options = new Options(process.argv)
bundler.bundle(options).then(() => {}).catch(error => {
  console.log("tsc-bundle:", error)
})