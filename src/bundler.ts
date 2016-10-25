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

import { Options }   from "./options"
import { Provision } from "./provision"
import { Pathing }   from "./pathing"
import { Watcher }   from "./watcher"
import { Compiler }  from "./compiler"
import { Shell }     from "./shell"
import { Shim }      from "./shim"
import { Log }       from "./logger"

const help_string = `

typescript-bundle:

usage:

 tsc-bundle [input] [output] [...options]

example:

 tsc-bundle ./input.ts ./scripts/bundle.js --gns mylib --target es5
 
`

/**
 * Bundler:
 * 
 * typescript AMD single out bundler. 
 * Wraps the typescript compiler with 
 * the AMD compiler option and shims
 * a AMD loader around the compilers
 * default output script.
 */
export class Bundler {

  /** 
   * creates a new bundler.
   * @param {Pathing} the pathing object.
   * @param {Compiler} the compiler object.
   * @param {Shim} the shim object.
   * @param {Log} the log object.
   * @returns {Bundler}
   */
  constructor(private pathing  : Pathing,
              private provision: Provision,
              private compiler : Compiler,
              private shim     : Shim,
              private log      : Log) {}
  /**
   * runs the bundler. 
   * @param {Options} the bundler options.
   * @returns {Promise<{}>}
   */
  public bundle(options: Options): Promise<{}> {
    return new Promise<{}>((resolve, reject) => {
      let opts = options.getCompilerOptions()

      //-------------------------------------------
      // inspect options for --help.
      //-------------------------------------------
      if(opts.help) {
        this.compiler
            .compile(options.getCompilerString())
            .then(() => {
              this.log.write(help_string)
              resolve()
            }).catch(reject)
        return
      }

      //-------------------------------------------
      // provision output file to watch.
      //-------------------------------------------
      this.provision.provisionFile(opts.outFile)

      //-------------------------------------------
      // setup watcher to catch typescript changes
      // to the output javascript.
      //-------------------------------------------

      let watcher = new Watcher(opts.outFile)
      watcher.on("change", () => this.shim.shim(opts.outFile, opts.globalNamespace))
      
      //-----------------------------------------
      // run the compiler. ensure that once the
      // compiler process has ended, we attempt
      // to write the shim over the top.
      //-----------------------------------------
      this.compiler.compile(options.getCompilerString()).then(() => {
        this.shim.shim(opts.outFile, opts.globalNamespace)
        watcher.dispose()
        resolve()
      }).catch(error => {
        this.shim.shim(opts.outFile, opts.globalNamespace)
        watcher.dispose()
        reject(error)
      })
    })
  }
}