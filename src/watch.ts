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

import * as fs      from "fs"

/** simple event debouncer */
class Debounce {
  private handle : NodeJS.Timer
  constructor(private delay: number) {
    this.handle = undefined
  }
  public emit(func: Function): void {
    if(this.handle !== undefined) {
      clearTimeout(this.handle)
    }
    this.handle = setTimeout(() => {
      this.handle = undefined
      func()
    }, this.delay)
  }
}

/** watcher handler to allow caller to terminate. */
export class Watcher {
  constructor(private watcher: fs.FSWatcher) {}
  public close(): void {
    this.watcher.close()
  }
}

/** 
 * watches the given filePath for changes.
 * @param {string} filePath the file to watch.
 * @param {Function} func the change event handler.
 * @returns {Watcher}
 */
export const watch = (filePath: string, func: () => void): Watcher => {
  const debounce = new Debounce(50)
  return new Watcher(fs.watch(filePath, _ => debounce.emit(_ => func())))
}