/*--------------------------------------------------------------------------

typescript-bundle

The MIT License (MIT)

Copyright (c) 2019-2020 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { resolve, join, dirname }   from 'path'
import { readFileSync, existsSync } from 'fs'
import { render } from './render'

// ------------------------------------------------------------------------------
//
// CssReader
//
// Reads Css files and resolves their internal @imports. Detects both
// 'file-not-found' and 'cyclic import' errors and throws in either
// case.
//
// ------------------------------------------------------------------------------

class CssFileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`bundler: css file '${filePath}' not found.`)
  }
}

class CssCyclicReadError extends Error {
  constructor(stack: string[]) {
    super('')
    const buffer = ['bundler: cyclic css @import detected.']
    stack.forEach((item, index) => {
      const padding = Array.from({length: index + 1}).join('x').replace(/x/g, ' ')
      buffer.push(`${padding} ↪ ${item}`)
    })
    this.message = buffer.join('\n')
  }
}

interface CssFile {
  filePath: string
  content:  string
  includes: string[]
}

class CssReader {
  private resolving: {[key: string]: string }
  private resolved:  {[key: string]: CssFile }
  private filePath:  string
  constructor(filePath: string) {
    this.filePath  = resolve(filePath)
    this.resolved  = {}
    this.resolving = {}
  }

  /** Parses the contents of the CSS file. */
  private parseCssFile(filePath: string): CssFile {
    filePath = resolve(filePath)
    const imports   = [] as {includePattern: string, includePath: string}[]
    if(!existsSync(filePath)) {
      throw new CssFileNotFoundError(filePath)
    }
    const contentRaw = readFileSync(filePath, 'utf8')
    const pattern    = /@import\s*["'](.*)["'];?/g
    // Parse @import's from document
    while(true) {
      const result = pattern.exec(contentRaw)
      if(!result) {
        break
      }
      const includePattern = result[0]
      const includePathRaw = result[1]
      const dirPath     = dirname(filePath)
      const includePath = resolve(join(dirPath, includePathRaw))
      imports.push({includePattern, includePath})
    }

    // Build includes array and replace @import strings.
    const includes = imports.map(_import => _import.includePath)
    const content  = imports.reduce((content, include) => {
      return content.replace(new RegExp(include.includePattern, 'g'), '')
    }, contentRaw)
    return { filePath, content, includes }
  }

  /** Loads file recursively and store in resolved cache. */
  private loadCssFile(filePath: string) {
    filePath = resolve(filePath)
    if(this.resolved[filePath]) {
      return
    }
    if(this.resolving[filePath]) {
      const stack = [...Object.keys(this.resolving), filePath]
      throw new CssCyclicReadError(stack)
    }
    this.resolving[filePath] = filePath
    const file = this.parseCssFile(filePath)
    for(const include of file.includes) {
      this.loadCssFile(include)
    }
    delete this.resolving[filePath]
    this.resolved[filePath] = file
  }

  /** Reads the CSS document concats its imports. */
  public read(): string {
    this.loadCssFile(this.filePath)
    return Object.keys(this.resolved)
      .map(key => this.resolved[key]!.content)
      .join('\n')
  }
}

function get(filePath: string): string {
  try {
    const reader = new CssReader(filePath)
    const content = reader.read()
    const lines = content.split('\n').map(line => {
      const text = line
        .replace(/\r/g, '')
        .replace(/\\/g, '\\\\"')
        .replace(/"/g, '\\"')
      return `    "${text}"`
    }).join(',\n')
    return `[\n${lines}\n  ].join('\\n')`
  } catch(error) {
    // todo: consider better ways to notify error.
    console.log(error.message + '\n')
    return '""'
  }
}

export function asCss(moduleName: string, filePath: string) {
  return render(moduleName, get(filePath))
}