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

import es3    from './templates/es3'
import es5    from './templates/es5'
import es6    from './templates/es6'
import es2015 from './templates/es2015'
import es2016 from './templates/es2016'
import es2017 from './templates/es2017'
import es2018 from './templates/es2018'
import esnext from './templates/esnext'

// --------------------------------------------------------------------------
//
// AMD Template
//
// Returns an AMD module loader template for the given ES target.
//
// --------------------------------------------------------------------------

export interface LoaderTemplate {
  esTarget: ESTarget
  header:   string
  footer:   string
}

export type ESTarget = 'unknown' | 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'esnext'
export type ExportAs = string | null | undefined
export interface ImportAs {
  type: 'default' | 'namespace',
  outer: string
  inner: string
}
export interface LoaderOptions {
  entryPoint?: string
  esTarget:    ESTarget
  exportAs:    ExportAs
  importAs:    ImportAs[]
}

export class Loader {
  private static getLoaderTemplate(target: ESTarget): [string, string] {
    const marker = `'marker:bundle';`
    switch(target) {
      case 'unknown': return es3.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es3': return es3.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es5': return es5.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es6': return es6.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es2015': return es2015.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es2016': return es2016.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es2017': return es2017.split(marker).map(n => n.trimRight()) as [string, string]
      case 'es2018': return es2018.split(marker).map(n => n.trimRight()) as [string, string]
      case 'esnext': return esnext.split(marker).map(n => n.trimRight()) as [string, string]
      default: return esnext.split(marker).map(n => n.trimRight()) as [string, string]
    }
  }
  
  private static indent(code: string): string {
    return code.split("\n").map(line => "    " + line).join("\n")
  }

  private static resolveExportAs (exportAs: ExportAs) {
    if(exportAs === null || exportAs === undefined) {
      return ''
    }
    else if(exportAs === 'commonjs') {
      return 'module.exports = '
    } else {
      return `var ${exportAs} = `
    }
  }

  private static resolveImportAs(imports: ImportAs[]): string[] {
    return imports.map(importAs => {
      switch(importAs.type) {
        case 'default': return [
          `define("${importAs.inner}", ["exports"], function(exports) {`,
          `    Object.defineProperty(exports, "__esModule", { value: true });`,
          `    Object.defineProperty(exports, "default", { value: window['${importAs.outer}'] });`, 
          `});`
        ].join('\n')
        case 'namespace': return [
          `define("${importAs.inner}", ["exports"], function(exports) {`,
          `    Object.defineProperty(exports, "__cjsModule", { value: true });`,
          `    Object.defineProperty(exports, "default", { value: window['${importAs.outer}'] });`, 
          `});`
        ].join('\n')
      }
    })
  }

  public static resolveEntryModule(tfooter: string, entryPoint?: string): string {
    return (entryPoint !== undefined)
      ? tfooter.replace('"marker:entry"', `"${entryPoint}"`)
      : tfooter.replace('"marker:entry"', `entry[0]`)
  }

  public static transform(options: LoaderOptions, code: string): string {
    const [theader, tfooter] = this.getLoaderTemplate(options.esTarget)
    const texports = this.resolveExportAs(options.exportAs)
    const timports = this.resolveImportAs(options.importAs)
    const header = `${texports}${theader}`
    const marker = "'marker:" + "resolver';"
    const body   = this.indent([...timports, code, marker].join('\n'))
    const footer = this.resolveEntryModule(tfooter, options.entryPoint)
    return [header, body, footer].join('\n')
  }
}