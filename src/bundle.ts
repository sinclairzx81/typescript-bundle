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

import { Options }       from "./options"
import { touch }         from "./touch"
import { watch }         from "./watch"
import { compile }       from "./compile"
import { shim }          from "./shim"
import { help, version, info, errors } from "./help"

import * as path from "path"


/**
 * bundles a typescript amd + outFile module.
 * @param {Options} options the bundle options.
 * @param {Function} log the logging function.
 * @returns {Promise<any>} 
 */
export const bundle = async (options: Options, log: Function) => {
    // run validation, help and version checks.
    if(options.errors.length > 0)  return log(errors(options))
    if(options.properties.help)    return log(help())
    if(options.properties.version) return log(await version())

    // display compiler settings.
    log(info(options))

    // if we are loading from a project, then we need to resolve
    // the output file path from the view of the config.
    const outputFile = (options.properties.project === undefined)
      ? path.resolve(process.cwd(), options.properties.outputFile)
      : path.resolve(
          path.dirname(
            path.resolve(process.cwd(), options.properties.project
            ) ), options.properties.outputFile)
      

    // ensure the output file exists.
    await touch(outputFile)

    // watch output file for changes. (compile on save support)
    const watcher = watch(outputFile, () => {
      shim(outputFile, options.properties.exportAs)
    })
    
    // run compilation.
    try {
      await compile (options.command, log)
      await shim    (outputFile, options.properties.exportAs)
      watcher.close ()
    } catch (e) {
      shim(outputFile, options.properties.exportAs)
      watcher.close()
    }
}
