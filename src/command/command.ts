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

import { basename, extname, resolve, dirname } from 'path'

// --------------------------------------------------------------------------
//
// Command
// 
// Command Line parser for TypeScript-Bundle
//
// Examples: tsc-bundle index.ts
//           tsc-bundle tsconfig.json 
//           tsc-bundle index.ts --outFile bundle.js
//           tsc-bundle index.ts --transform minify.js
// Options:
//   --outFile     Outputs the bundle with the give filepath.
//   --target      Sets the ES Target for the bundle.
//   --exportAs    Exports bundle exports as a global variable.
//   --importAs    Imports global variables as modules.
//   --transform   Applies a transform to the bundle.
//   --watch       Starts the compiler in watch mode.
//   --debug       Prints debug information.
//
// --------------------------------------------------------------------------

export type ESTarget = 'unknown' | 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'esnext'

export interface ImportAs {
  type: 'default' | 'namespace',
  outer: string
  inner: string
}
export interface CommandOptions {
  commandType: 'unknown' | 'info' | 'bundle' | 'error'
  outFile?:     string
  inFile:       string
  esTarget?:    ESTarget
  projectRoot:  string
  inFileType:   'unknown' | 'script' | 'project' | 'unknown'
  exportAs?:    string
  importAs:     ImportAs[]
  transforms:   string[]
  watch:        boolean
  debug:        boolean
  errorText?:   string
}

export class Command {

  /** Runs additional asserts across the resolved optiosn. */
  private static assert(options: CommandOptions): CommandOptions {
    // TODO

    return options
  }

  /** Parses the given process.argv like array. */
  public static parse(argv: string[]): CommandOptions {
    const args = [...argv.slice(2)]

    // Create default options
    const options: CommandOptions = {
      commandType:   'info',
      outFile:       undefined,
      inFile:        '',
      esTarget:      undefined,
      projectRoot:   '',
      inFileType:    'unknown',
      exportAs:      undefined,
      importAs:      [],
      transforms:    [],
      watch:         false,
      debug:         false,
      errorText:     undefined
    }

    // Check first argument. If none then return info.
    const next = args.shift()!
    if(!next) {
      options.commandType = 'info'
      return options
    }
    
    // Resolve inputFile and inputFileType
    options.commandType   = 'bundle'
    options.inFile        = resolve(next)
    options.projectRoot   = dirname(options.inFile)
    const name            = basename(options.inFile)
    const ext             = extname(options.inFile)

    // Check .ts | .tsx | tsconfig.json
    switch(ext) {
      case '.ts':
      case '.tsx':
        options.inFileType = "script"
        break
      case '.json':
        if(!name.includes('tsconfig')) {
          options.commandType = 'error'
          options.errorText = 'Must be a *.tsconfig.json file.'
          return options
        }
        options.inFileType = 'project'
        break
      default: {
        options.commandType = 'error'
        options.errorText = `Cannot bundle with file '${options.inFile}'`
        return options
      }
    }

    // Parse argument elements.
    while(args.length > 0) {
      const current = args.shift()!
      switch(current) {

        // WATCH
        case '--watch': {
          options.watch = true
          break
        }

        // DEBUG
        case '--debug': {
          options.debug = true
          break
        }

        // OUTFILE
        case '--outFile': {
          const next = args.shift()!
          if(!next) {
            options.commandType = 'error'
            options.errorText = `expected path for --outFile`
            return options
          }
          options.outFile = resolve(next)
          break
        }

        // TARGET
        case '--target': {
          const next = args.shift()!
          if(!next) {
            options.commandType = 'error'
            options.errorText = `expected expected target 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'esnext'`
            return options
          }
          options.outFile = resolve(next.toLowerCase())
          break
        }

        // EXPORTAS
        case '--exportAs': {
          const next = args.shift()!
          if(!next) {
            options.commandType = 'error'
            options.errorText = `expected name for --exportAs`
            return options
          }
          options.exportAs = next
          break
        }

        // IMPORTAS
        case '--importAs': {
          const next = args.shift()!
          if(!next) {
            options.commandType = 'error'
            options.errorText = `expected <global>=<module> pair for --importAs.`
            return options
          }
          const pattern = /([a-zA-Z0-9-_$]+)=([a-zA-Z0-9-_$]+)/
          const match = next.match(pattern)
          if(!match) {
            options.commandType = 'error'
            options.errorText = `expected e.g <global>=<module> pair for --importAs. got '${next}'`
            return options
          }
          const type = 'namespace'
          const outer = match[1]
          const inner = match[2]
          options.importAs.push({ type, outer, inner })
          break
        }
        // IMPORTAS
        case '--importAsDefault': {
          const next = args.shift()!
          if(!next) {
            options.commandType = 'error'
            options.errorText = `expected <global>=<module> pair for --importAs.`
            return options
          }
          const pattern = /([a-zA-Z0-9-_$]+)=([a-zA-Z0-9-_$]+)/
          const match = next.match(pattern)
          if(!match) {
            options.commandType = 'error'
            options.errorText = `expected e.g <global>=<module> pair for --importAs. got '${next}'`
            return options
          }
          const type = 'default'
          const outer = match[1]
          const inner = match[2]
          options.importAs.push({ type, outer, inner })
          break
        }
        // TRANSFORM
        case '--transform': {
          const next = args.shift()!
          if(!next) {
            options.commandType = 'error'
            options.errorText = `expected path for --transform.`
            return options
          }
          options.transforms.push(resolve(next))
          break
        }

        // ERROR
        default: {
          options.commandType = 'error'
          options.errorText = `invalid option '${current}'`
          return options
        }
      }
    }
    return this.assert(options)
  }
}
