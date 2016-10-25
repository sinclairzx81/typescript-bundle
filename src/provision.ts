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

import * as path from "path"
import * as fs   from "fs"

/**
 * Provision: 
 * 
 * Provisions files and folders. This type is
 * used to create target files and directories
 * to watch on. 
 */
export class Provision {

  /**
   * tests if the given directory should be created.
   * @param {string} the directory path to test.
   * @returns {boolean}
   */
  private shouldCreateDirectory(directory: string): boolean {
    try {
      let stat = fs.statSync(directory)
      return stat.isDirectory() ? false : true
    } catch (e) {
      return true
    }
  }

  /**
   * tests if we should create a file.
   * @param {string} the directory path to test.
   * @returns {boolean}
   */
  private shouldCreateFile(filepath: string): boolean {
    try {
      let stat = fs.statSync(filepath)
      return stat.isFile() ? false : true
    } catch (e) {
      return true
    }
  }

  /**
   * provisions the given directory, ensuring all
   * the given path is created for additional work 
   * within.
   * @param {string} the directory path to provision.
   * @returns {Promise<{}>}
   */
  public provisionDirectory(directory: string): void {
    let abs     = path.resolve(process.cwd(), directory).replace(/\\/g, "/")
    let parts   = abs.split("/")
    let current = ""
    while (parts.length > 0) {
      current = current + parts.shift() + "/"
      if (this.shouldCreateDirectory(current)) {
        fs.mkdir(current)
      }
    }
  }

  /**
   * provisions the given file path. checks the 
   * files directory paths and creates parent 
   * directories, and creates a empty file if
   * no file exists at the given path.
   * @param {string} the filepath to provision.
   * @returns {void}
   */
  public provisionFile(filepath: string): void {
    this.provisionDirectory(path.dirname(filepath))
    if(this.shouldCreateFile(filepath) === true) {
      fs.writeFileSync(filepath, "", "utf8")
    }
  }
}