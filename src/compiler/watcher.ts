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
// WatchTarget
//
// Creates a target file for the Watcher to watch. This file is exclusively
// the --outFile of the TypeScript compiler.
//
// --------------------------------------------------------------------------

class WatchTarget {
  public static shouldCreateDirectory (directoryPath: string): boolean {
    try {
      const stat = statSync(directoryPath)
      return stat.isDirectory() ? false : true
    } catch (e) {
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
// Simple file system watcher, leveraged by the TypeScript compiler host
// to signal when content has been written. Keeps track of content emitted
// fro the compiler to prevent double bundling downstream on same content.
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
    const resolvedFilePath      = resolve(filePath)
    const resolvedDirectoryPath = dirname(resolvedFilePath)

    // create empty file to observe on..
    WatchTarget.createEmptyFile(resolvedFilePath)

    // track last content from compiler.
    let last_content = ''
    return new WatchHandle(watch(resolvedFilePath, (event: string, filePath) => {
      const joinedPath = join(resolvedDirectoryPath, filePath)
      if(joinedPath === resolvedFilePath) {
        if(event === 'change') {
          const content = readFileSync(resolvedFilePath, 'utf8')
          if(last_content !== content) {
            last_content = content
            func({ content })
          }
        }
      }
    }))
  }
}