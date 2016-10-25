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

export class Pathing {
  constructor() {

  }

  /**
   * returns the current working directory for this process.
   * @returns {string}
   */
  public cwd(): string {
    return process.cwd()
  }

  /**
   * joins the left path with the right path.
   * @param {string} the left path.
   * @param {string} the right path.
   * @returns {string} the left and right paths concatinated with system delimiter.
   */
  public join(left: string, right: string) : string {
    return path.join(left, right)
  }

  /**
   * converts the given filepath into a absolute path from
   * the current working directory.
   * @param {string} the path to absolute.
   * @returns {string}
   */
  public abs(filepath: string) : string {
    return  path.resolve(process.cwd(), filepath)
  }

  /**
   * for the given filepath, return the directory 
   * portion of the path.
   * @param {string} the filepath.
   * @returns {string} the directory.
   */
  public dirname(filepath: string): string {
    return path.dirname(this.abs(filepath))
  }
  /**
   * for the given filepath, return the filename.
   * @param {string} the filepath.
   * @returns {string} the filename.
   */
  public filename(filepath: string): string {
    return path.basename(filepath)
  }
}