/*--------------------------------------------------------------------------

typescript-bundle

The MIT License (MIT)

Copyright (c) 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { FSWatcher, watch,  statSync }           from 'fs'
import { mkdirSync, readFileSync,writeFileSync } from 'fs'
import { dirname, resolve, join }                from 'path'

// --------------------------------------------------------------------------
//
// ResetTimeout
//
// A specialized timeout used to debounce file system 'change' events. This
// class provides a 'run()' method that can be called many times in quick
// succession with only the 'last' function passed to run() being invoked
// within the timeout threshold. This timeout is required when TypeScript
// emits amounts of code that overlap with the bundler downstream.
//
// --------------------------------------------------------------------------
class ResetTimeout {
  private timer!: NodeJS.Timer
  private resets: number
  constructor(private timeout: number, private maxResets: number = 256) {
    this.resets = 0
  }
  public run(func: () => void) {
    this.resets += 1
    clearTimeout(this.timer)
    if(this.resets >= this.maxResets) {
      throw Error(`ResetTimeout: exceeded maximum reset count of ${this.maxResets}`)
    }
    this.timer = setTimeout(() => {
      this.resets = 0
      func()
    }, this.timeout)
  }
}

// --------------------------------------------------------------------------
//
// WatchTarget
//
// Provisions the watchers file target by creating the file and its respective
// directory path. Needed by the watcher to observe on an actual file.
//
// --------------------------------------------------------------------------

class WatchTarget {
  public static shouldCreateDirectory (directoryPath: string): boolean {
    try {
      const stat = statSync(directoryPath)
      return stat.isDirectory() ? false : true
    } catch {
      return true
    }
  }
  private static createDirectory (directoryPath: string): void {
    const abs     = resolve(process.cwd(), directoryPath).replace(/\\/g, "/")
    const parts   = abs.split("/")
    let current   = ""
    while (parts.length > 0) {
      current = current + parts.shift() + "/"
      if (this.shouldCreateDirectory(current)) {
        mkdirSync(current)
      }
    }
  }
  public static createEmptyFile (filePath: string): void {
    const directoryPath = dirname(filePath)
    this.createDirectory(directoryPath)
    writeFileSync(filePath, '')
  }
}

// -------------------------------------------------------------------------
//
// Watcher
//
// File system watcher utility. Specialized to observe on TypeScript content
// being emitted to disk. This watcher is used exclusively by the TypeScript
// compiler host.
//
// -------------------------------------------------------------------------

export class WatchHandle {
  constructor(private readonly watcher: FSWatcher) { }
  public dispose() {
    this.watcher.close()
  }
}
export interface WatchEvent {
  content: string
}
export type WatcherCallbackFunction = (event: WatchEvent) => void

export class Watcher {
  
  /** Watches the given file path and emits 'only' on file change events. */
  public static watch(filePath: string, func: WatcherCallbackFunction): WatchHandle {

    // resolve target file and directory paths.
    const timeout               = new ResetTimeout(50)
    const resolvedFilePath      = resolve(filePath)
    const resolvedDirectoryPath = dirname(resolvedFilePath)

    // create empty file to observe on..
    WatchTarget.createEmptyFile(resolvedFilePath)

    // track last content from compiler.
    return new WatchHandle(watch(resolvedFilePath, (event: string, filePath) => {
      const joinedPath = join(resolvedDirectoryPath, filePath)
      if(joinedPath === resolvedFilePath) {
        if(event === 'change') {
          timeout.run(() => {
            const content = readFileSync(resolvedFilePath, 'utf8')
            func({ content })
          })
        }
      }
    }))
  }
}