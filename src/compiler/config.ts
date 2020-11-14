/*--------------------------------------------------------------------------

typescript-bundle

The MIT License (MIT)

Copyright (c) 2019-2020 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { TsConfig } from '../config/index'
import { resolve, join, dirname, basename, extname } from 'path'

export type ESTarget = 'unknown' | 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'esnext'

export class TypeScriptConfiguration {

  public static read(tsConfigPath: string): any {
    return TsConfig.resolve(tsConfigPath)
  }

  public static resolveTargetAndOutFileFromScript(scriptPath: string): { esTarget: ESTarget, outFile: string } {
    const resolvedScriptPath  = resolve(scriptPath)
    const scriptPathDirectory = dirname(resolvedScriptPath)
    const extension = extname(resolvedScriptPath)
    const filename  = basename(resolvedScriptPath, extension)
    const outFile   = join(scriptPathDirectory, filename + '.js')
    return { outFile, esTarget: 'es3' }
  }

  /** Tries to resolve default tsconfig 'target' and 'outFile' properties based some rules. */
  public static resolveTargetAndOutFileFromTsConfig(tsConfigPath: string): { esTarget: ESTarget, outFile: string } {
    const tsConfigPathResolvedPath = resolve(tsConfigPath)
    const tsConfigDirectoryPath = dirname(tsConfigPathResolvedPath)
    const outFile = join(tsConfigDirectoryPath, './bundle.js')
    const output = { outFile, esTarget: 'es3' as ESTarget }

    const configuration = this.read(tsConfigPath)
    
    // read es target from tsconfig.
    if(configuration.compilerOptions && configuration.compilerOptions.target) {
      output.esTarget = configuration.compilerOptions.target.toLocaleLowerCase() as ESTarget
    }
    
    // if the configs outFile is set, use it as as the default 'outFile'
    if(configuration.compilerOptions && configuration.compilerOptions.outFile) {
      output.outFile = join(tsConfigDirectoryPath, configuration.compilerOptions.outFile)
      return output
    }
    
    // if the 'outDir' then try and resolve a default outFile.
    if(configuration.compilerOptions && configuration.compilerOptions.outDir) {
      const resolvedOutDir = resolve(tsConfigDirectoryPath, configuration.compilerOptions.outDir)
      // try to resolve the 'last' file in the configuration as the default outFile.
      if(configuration.files && configuration.files.length > 0) {
        const last = configuration.files[configuration.files.length - 1]
        if(!last.includes('d.ts') && (last.includes('.ts') || last.includes('.tsx')) ) {
          const extension = extname(last)
          const filename = basename(last, extension)
          output.outFile = join(resolvedOutDir, filename + '.js')
          return output
        }
      }
      output.outFile = join(resolvedOutDir, './bundle.js')
      return output
    }

    // try to resolve the 'last' file in the configuration as the default outFile, this
    // is pathed to the 'tsconfig.json' root.
    if(configuration.files && configuration.files.length > 0) {
      const last = configuration.files[configuration.files.length - 1]
      if(!last.includes('d.ts') && (last.includes('.ts') || last.includes('.tsx')) ) {
        const extension = extname(configuration.files[0])
        const filename = basename(configuration.files[0], extension)
        output.outFile = join(tsConfigDirectoryPath, filename + '.js')
        return output
      }
    }
    
    return output
  }
}
