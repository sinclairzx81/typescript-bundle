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

import { Resources } from './resources/index'
import { Transform } from './transforms/index'
import { Loader }    from './loader/loader'

// ---------------------------------------------------------------------------
//
// Bundler
//
// A specialized TypeScript AMD bundler that rewrites Typescript code
// generated with the '--outFile' | '--module amd' options. Also takes
// care of injecting resources that conform to typescript-bundles asset
// directives (see Resources code for details)
//
// ---------------------------------------------------------------------------

export type ESTarget = 'unknown' | 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'esnext'
export type ExportAs = string | null | undefined
export interface ImportAs {
  type: 'default' | 'namespace',
  outer: string
  inner: string
}
export interface BundlerOptions {
  esTarget:     ESTarget
  projectRoot:  string
  entryPoint?:  string
  exportAs?:    ExportAs,
  importAs?:    ImportAs[],
  transforms:   string[]
}

export class Bundler {
  public static shouldBundle(code: string) {
    // check for marker - written in Loader
    return code.includes("'marker:" + "resolver';") === false
  }
  public static bundle(code: string, options: BundlerOptions): string {
    options.exportAs = options.exportAs || null
    options.importAs = options.importAs || []

    code = Transform.typescriptOutput(options.transforms, code)
    code = Resources.transform(options.projectRoot, code)
    code = Loader.transform({
      entryPoint: options.entryPoint,
      esTarget:   options.esTarget,
      importAs:   options.importAs,
      exportAs:   options.exportAs
    }, code)
    return Transform.bundleOutput(options.transforms, code)
  }
}