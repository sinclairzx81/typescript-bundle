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

import {Shell}   from "./shell"
import {Log}     from "./logger"
import {Watcher} from "./watcher"

export interface Compiler {
  compile(command: string): Promise<{}>
}

/**
 * Compiler:
 * 
 * Wraps the typescript compiler at the command 
 * line. 
 */
export class TypeScriptCompiler implements Compiler {

  /**
   * creates a new compiler instance.
   * @param {Shell} the shell environment for this compiler.
   * @param {Log} the output log object.
   * @returns {Compiler}
   */
  constructor(private shell: Shell) { }
  
  /**
   * kicks off the compiler with the given command.
   * @parma {string} the compiler command line string.
   * @returns {Promise<{}>}
   */
  public compile(command: string): Promise<{}> {
    console.log("compiling: " + command)
    return new Promise<{}>((resolve, reject) => {
      this.shell.execute(command, 0).then(() => {
        resolve({})
      }).catch(reject)
    })
  }
}