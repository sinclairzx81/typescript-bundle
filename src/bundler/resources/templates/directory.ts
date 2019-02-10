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

import { resolve, join } from 'path'
import { readdirSync, statSync, readFileSync, existsSync } from 'fs'
import { render } from './render'

// ------------------------------------------------------------------------------
//
// Directory
//
// Recursively encodes a directory to an object. The filename is used as a key
// on the resulting object, and the files contents are written as base64. Callers
// are expected to decode the base64 asset when importing. (For consideration)
//
// ------------------------------------------------------------------------------

export interface FileEntry {
  path: string
  data: string
}

/** Flatmap polyfill for node 8. */
function flatMap<T>(array: T[][]): T[] {
  const buffer: T[] = []
  array.forEach(element => buffer.push(...element))
  return buffer
}

function readFiles(rootPath: string, directoryPath: string): FileEntry[] {
  if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
    return []
  }
  const contents = readdirSync(directoryPath)
  return [
    ...flatMap(
      contents
        .map(path => join(directoryPath, path))
        .filter(path => statSync(path).isDirectory())
        .map(path => readFiles(rootPath, path))
    ),
    ...contents
      .map(path => join(directoryPath, path))
      .filter(path => statSync(path).isFile())
      .map(path => {
        const data = readFileSync(path).toString('base64')
        const trim = path.replace(rootPath + '/', '')
        return { path: trim, data }
      })
  ]
}

export function packDirectory(directoryPath: string): {[path: string]: string } {
  const absolutePath = resolve(directoryPath)
  const entries = readFiles(absolutePath, absolutePath)
  return entries.reduce((acc: {[path: string]: string }, c) => {
    acc[c.path] = c.data
    return acc
  }, {})
}

function formatJson(data: any): string {
  return JSON.stringify(data, null, 2)
    .split('\n')
    .map((n, i) => (i > 0 ? `  ${n}` : n))
    .join('\n')
}

export function asDirectory(moduleName: string, filePath: string) {
  const directory = formatJson(packDirectory(filePath))
  return render(moduleName, directory)
}
