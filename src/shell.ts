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

import {spawn} from "child_process"

/**
 * executes a shell command.
 * @param {string} the command to execute.
 * @param {Function} optional logging function.
 * @returns {Promise<number>} the process exit code.
 */
export const shell = (command: string, log: Function = function() {}) => new Promise<number>((resolve, reject) => {
  const encoding = "utf8"
  const windows  = /^win/.test(process.platform) as boolean
  const proc = spawn (
    windows ? 'cmd' : 'sh', 
    [ windows ? '/c':'-c', command ]
  )
  proc.stdout.setEncoding(encoding)
  proc.stderr.setEncoding(encoding)
  proc.stdout.on("data", data => log(data))
  proc.stderr.on("data", data => log(data))
  proc.on("error", error    => reject(error))
  proc.on("close", exitcode => resolve(exitcode))
})