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

import * as events  from "events"
import * as fs      from "fs"
import * as crypto  from "crypto"

/**
 * Debounce
 * 
 * The nodejs file system watcher, and the 
 * typescript emitter generates many file
 * system events while writing files. This
 * class allows the caller to "set" a function
 * to run within the watcher callback, and 
 * only runs that function if the given 
 * delay has elapsed. 
 */
class Debounce {
  private handle : NodeJS.Timer
  /**
   * creates a new debounce.
   * @param {number} the delay in millisecond.
   * @returns {Debounce}
   */
  constructor(private delay: number) {
    this.handle = undefined
  }
  /**
   * runs the given function. If the function
   * is called before this debouncers delay
   * has elapsed, the event is rerun.
   * @param {Function} the function to run.
   * @returns {void}
   */
  public set(func: Function): void {
    if(this.handle !== undefined) {
      clearTimeout(this.handle)
    }
    this.handle = setTimeout(() => {
      func(); this.handle = undefined;
    }, this.delay)
  }
}

/*
 * Watcher
 * 
 * Listeners to file system events on the given filepath.
 * The watcher is used to emit "change" events back to
 * the bundler so it can shim the output when the compiler
 * is run in watch mode.
 */
export class Watcher {
  
  private emitter     : events.EventEmitter
  private watcher     : fs.FSWatcher
  private debounce    : Debounce

  /**
   * creates a new watcher.
   * @param {number} the filepath to watch.
   * @param {number} a event timeout to defer events being emitted.
   * @returns {Watcher}
   */
  constructor(public filepath: string) {
    this.emitter   = new events.EventEmitter()
    this.debounce  = new Debounce(20)
    this.watcher = fs.watch(this.filepath, { recursive: false }, (event, filename) => {
      this.debounce.set(() => this.emitter.emit("change"))
    })
  }

  /**
   * subscribes to file system change events.
   * @param {string} the event to subscribe to.
   * @param {Function} the listener function.
   * @returns {void}
   */
  public on(event: string, func: Function): void {
    this.emitter.on(event, func)
  }

  /**
   * disposes this watcher.
   * @returns {void}
   */
  public dispose() : void {
    this.emitter.removeAllListeners()
    this.watcher.close()
  }
}