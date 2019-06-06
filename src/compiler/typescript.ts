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

import { Watcher }      from './watcher'
import { spawn }        from 'child_process'

// --------------------------------------------------------------------------
//
// TypeScript
//
// A process host script that runs the TypeScript compiler and observes
// diagnostics and content emits from the compiler. Due to there not being 
// a standard way to pipe TypeScript output on stdio, we need to 'watch'
// for content being written to disk. 

// Working through 'stdio' helps isolate TypeScript-Bundle intrinsic
// TypeScript differences from version to version, allowing this software
// to run against theoretically any version of TypeScript.
//
// see: https://github.com/Microsoft/TypeScript/issues/1226
//
// --------------------------------------------------------------------------

export class TypeScriptCompilerError extends Error {
  constructor(public exitcode: number) {
    super(`TypeScript ended with exit code ${exitcode}`)
  }
}

export type ESTarget = 'unknown' | 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'esnext'

export interface TypeScriptOptions {
  type:     'project' | 'script'
  esTarget: ESTarget
  inFile:   string
  outFile:  string
  watch:    boolean
}

export type TypeScriptDiagnosticCallback = (diagnostic: string) => void
export type TypeScriptContentCallback    = (content: string) => void

export class TypeScript {

  public static async compile(typescriptOptions: TypeScriptOptions, diagnosticCallback: TypeScriptDiagnosticCallback, contentCallback: TypeScriptContentCallback): Promise<number> {
    return new Promise(async (resolve, reject) => {
      let signal = false
      
      // Starts a file system watcher waiting for TypeScript to emit content.
      const watcher = Watcher.watch(typescriptOptions.outFile, event => {
        contentCallback(event.content)
        signal = true
      })
      
      try {

        // Executes the typescript compiler.
        await this.execute(typescriptOptions, diagnostic => diagnosticCallback(diagnostic))
    
        // On process end, wait for content signal or timeout.
        let start = Date.now()
        const wait = () => {
          const delta = Date.now() - start
          if(signal || delta > 1000) {
            watcher.dispose()
            return resolve()
          }
          setTimeout(() => wait(), 100)
        }
        wait()

      } catch(error) {
        watcher.dispose()
        reject(error)
      }
    })
  }

  /** Executes the compiler and listens for diagnostics on stdout. */
  private static execute(compilerOptions: TypeScriptOptions, diagnosticCallback: TypeScriptDiagnosticCallback): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const options = this.getCompilerStartOptions(compilerOptions)
      const proc = spawn(options.command, options.options)
      proc.stdout.setEncoding('utf8')
      proc.stderr.setEncoding('utf8')
      proc.stdout.on('data',  (data: string) => diagnosticCallback(data))
      proc.stderr.on('data',  (data: string) => diagnosticCallback(data))
      proc.on('error', error => reject(error))
      proc.on('close', exitcode => {
        if (exitcode === 0) {
          return resolve(exitcode)
        }
        reject(new TypeScriptCompilerError(exitcode))
      })
    })
  }

  /**  Resolves the TypeScript compiler command line arguments. */
  private static getCompilerStartOptions(options: TypeScriptOptions): {
    command: string
    options: string[]
  }{
    const buffer = ['tsc']
    if(options.type === 'project') {
      buffer.push(...[`--project`, `${options.inFile}`])
    } else {
      buffer.push(`${options.inFile}`)
    }
    buffer.push(...[`--outFile`, `${options.outFile}`])
    buffer.push(...[`--target`, `${options.esTarget}`])
    buffer.push(...[`--module`, `amd`])
    if(options.watch) {
      // buffer.push('--preserveWatchOutput')
      buffer.push('--watch')
    }

    return this.getStartOptions(buffer)
  }

  /** Resolves the spawn() options based on host operating system. */
  private static getStartOptions(
    compilerOptions: string[]
  ): {
    command: string
    options: string[]
  } {
    if (/^win/.test(process.platform)) {
       // windows
      const command = 'cmd'
      const options = ['/c', ...compilerOptions]
      return { command, options }
    } else {
      // linux | osx
      const command = 'sh'
      // todo: may have issues on linux for paths with spaces.
      const options = ['-c', compilerOptions.join(' ')] 
      return { command, options }
    }
  }
}
