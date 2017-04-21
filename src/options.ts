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

/// <reference path="@types/node/node.d.ts" />

import * as path from "path"
import * as fs   from "fs"


export interface CompilerOptions {
  inFile?                           : string
  allowJs?                          : boolean
  allowSyntheticDefaultImports?     : boolean
  allowUnreachableCode?             : boolean
  allowUnusedLabels?                : boolean
  alwaysStrict?                     : boolean
  baseUrl?                          : string
  charset?                          : string
  declaration?                      : boolean
  declarationDir?                   : string
  diagnostics?                      : boolean
  disableSizeLimit?                 : boolean
  emitBOM?                          : boolean
  emitDecoratorMetadata?            : boolean
  experimentalDecorators?           : boolean
  forceConsistentCasingInFileNames? : boolean
  globalNamespace?                  : string
  importHelpers?                    : boolean
  inlineSourceMap?                  : boolean
  inlineSources?                    : boolean
  isolatedModules?                  : boolean
  help?                             : boolean
  jsx?                              : string | "Preserve" | "React"
  jsxFactory?                       : string
  lib?                              : string[]
  listEmittedFiles?                 : boolean
  listFiles?                        : boolean
  locale?                           : string
  mapRoot?                          : string
  maxNodeModuleJsDepth?             : number
  module?                           : string | "none" | "commonjs" | "amd" | "system" | "umd" | "es6" | "es2015" | "amd-bundle"
  moduleResolution?                 : string | "node" | "classic"
  newLine?                          : string
  noEmit?                           : boolean
  noEmitHelpers?                    : boolean
  noEmitOnError?                    : boolean
  noFallthroughCasesInSwitch?       : boolean
  noImplicitAny?                    : boolean
  noImplicitReturns?                : boolean
  noImplicitThis?                   : boolean
  noImplicitUseStrict?              : boolean
  noLib?                            : boolean
  noResolve?                        : boolean
  noUnusedLocals?                   : boolean
  noUnusedParameters?               : boolean
  outDir?                           : string
  outFile?                          : string
  preserveConstEnums?               : boolean
  pretty?                           : boolean
  project?                          : string
  reactNamespace?                   : string
  removeComments?                   : boolean
  rootDir?                          : string
  rootDirs?                         : string[]
  skipLibCheck?                     : boolean
  skipDefaultLibCheck?              : boolean
  sourceMap?                        : boolean
  sourceRoot?                       : string
  strictNullChecks?                 : boolean
  stripInternal?                    : boolean
  suppressExcessPropertyErrors?     : boolean
  suppressImplicitAnyIndexErrors?   : boolean
  target?                           : string
  traceResolution?                  : boolean
  types?                            : string[]
  typeRoots?                        : string[]
  version?                          : boolean
  watch?                            : boolean
}

export class Options {

  constructor(private args: Array<string>) { }

  /**
   * attempts to load the tsconfig compiler options from disk.
   * @param {string} the project path if available.
   * @returns {any | undefined} the compiler options.
   */
  private getTsConfigCompilerOptions(path?: string): any | undefined {
    path = path || process.cwd() + "/tsconfig.json";
    try {
      let contents = fs.readFileSync(path, "utf8")
      let obj = JSON.parse(contents)
      return obj.compilerOptions as CompilerOptions
    } catch (e) {
      return undefined
    }
  }

  /**
   * loads the compiler options.
   * @returns {CompilerOptions}
   */
  public getCompilerOptions(): CompilerOptions {
    try {

      let options: CompilerOptions = { }

      //------------------------------------------------------------
      // unshift from the first two arguments.
      //------------------------------------------------------------
      let args = this.args.slice()
      args.shift()
      args.shift()

      //------------------------------------------------------------
      // validate the argument length. (minimum 2)
      //------------------------------------------------------------
      if (args.length < 2) {
        return {help: true}
      }

      //------------------------------------------------------------
      // extract input and output paths.
      //------------------------------------------------------------
      let inFile  = args.shift()
      let outFile = args.shift()
      
      //------------------------------------------------------------
      // extract command line arguments.
      //------------------------------------------------------------
      while (args.length > 0) {
        let current = args.shift()
        switch (current) {
          case "--allowJs":                           options.allowJs                          = true; break;
          case "--allowSyntheticDefaultImports":      options.allowSyntheticDefaultImports     = true; break;
          case "--allowUnreachableCode":              options.allowUnreachableCode             = true; break;
          case "--allowUnusedLabels":                 options.allowUnusedLabels                = true; break;
          case "--alwaysStrict":                      options.alwaysStrict                     = true; break;
          case "--baseUrl":                           options.baseUrl                          = args.shift(); break;
          case "--charset":                           options.charset                          = args.shift(); break;
          case "-d":
          case "--declaration":                       options.declaration                      = true; break;
          case "--declarationDir":                    options.declarationDir                   = args.shift(); break;
          case "--diagnostics":                       options.diagnostics                      = true; break;
          case "--disableSizeLimit":                  options.disableSizeLimit                 = true; break;
          case "--emitBOM":                           options.emitBOM                          = true; break;
          case "--emitDecoratorMetadata":             options.emitDecoratorMetadata            = true; break;
          case "--experimentalDecorators":            options.experimentalDecorators           = true; break;
          case "--forceConsistentCasingInFileNames":  options.forceConsistentCasingInFileNames = true; break;
          case "-gns":
          case "--globalNamespace":                   options.globalNamespace                  = args.shift(); break;
          case "--inlineSourceMap":                   options.inlineSourceMap                  = true; break;
          case "--inlineSources":                     options.inlineSources                    = true; break;
          case "--importHelpers":                     options.importHelpers                    = true; break;
          case "--isolatedModules":                   options.isolatedModules                  = true; break;
          case "-h":
          case "--help":                              options.help                             = true; break;
          case "--jsx":                               options.jsx                              = args.shift(); break;
          case "--jsxFactory":                        options.jsxFactory                       = args.shift(); break;
          case "--lib":                               options.lib                              = args.shift().split(","); break;
          case "--listEmittedFiles":                  options.listEmittedFiles                 = true; break;
          case "--listFiles":                         options.listFiles                        = true; break;
          case "--locale":                            options.locale                           = args.shift(); break;
          case "--mapRoot":                           options.mapRoot                          = args.shift(); break;
          case "--maxNodeModuleJsDepth":              options.maxNodeModuleJsDepth             = parseInt(args.shift()); break;
          case "--module":                            options.module                           = args.shift(); break;
          case "--moduleResolution":                  options.moduleResolution                 = args.shift(); break;
          case "--newLine":                           options.newLine                          = args.shift(); break;
          case "--noEmit":                            options.noEmit                           = true; break;
          case "--noEmitHelpers":                     options.noEmitHelpers                    = true; break;
          case "--noEmitOnError":                     options.noEmitOnError                    = true; break;
          case "--noFallthroughCasesInSwitch":        options.noFallthroughCasesInSwitch       = true; break;
          case "--noImplicitAny":                     options.noImplicitAny                    = true; break;
          case "--noImplicitReturns":                 options.noImplicitReturns                = true; break;
          case "--noImplicitThis":                    options.noImplicitThis                   = true; break;
          case "--noImplicitUseStrict":               options.noImplicitUseStrict              = true; break;
          case "--noLib":                             options.noLib                            = true; break;
          case "--noResolve":                         options.noResolve                        = true; break;
          case "--noUnusedLocals":                    options.noUnusedLocals                   = true; break;
          case "--noUnusedParameters":                options.noUnusedParameters               = true; break;
          case "--outDir":                            options.outDir                           = args.shift(); break;
          case "--outFile":                           options.outFile                          = args.shift(); break;
          case "--preserveConstEnums":                options.preserveConstEnums               = true; break;
          case "--pretty":                            options.pretty                           = true; break;
          case "-p":
          case "--project":                           options.project                          = args.shift(); break;
          case "--reactNamespace":                    options.reactNamespace                   = args.shift(); break;
          case "--removeComments":                    options.removeComments                   = true; break;
          case "--rootDir":                           options.rootDir                          = args.shift(); break;
          case "--rootDirs":                          options.rootDirs                         = args.shift().split(","); break;
          case "--skipLibCheck":                      options.skipLibCheck                     = true; break;
          case "--skipDefaultLibCheck":               options.skipDefaultLibCheck              = true; break;
          case "--sourceMap":                         options.sourceMap                        = true; break;
          case "--sourceRoot":                        options.sourceRoot                       = args.shift(); break;
          case "--stripInternal":                     options.stripInternal                    = true; break;
          case "--suppressExcessPropertyErrors":      options.suppressExcessPropertyErrors     = true; break;
          case "--suppressImplicitAnyIndexErrors":    options.suppressImplicitAnyIndexErrors   = true; break;
          case "-t":
          case "--target":                            options.target                           = args.shift(); break;
          case "types":                               options.types                            = args.shift().split(","); break;
          case "typeRoots":                           options.types                            = args.shift().split(","); break;
          case "-v":
          case "--version":                           options.version                          = true; break;
          case "-w":
          case "--watch":                             options.watch                            = true; break;
          default: return { help: true }
        }
      }

      //------------------------------------------------------------
      // bind in any tsconfig options if not already set. Note,
      // that we do not set the option if supplied at the command 
      // line arguments.
      //------------------------------------------------------------
      let tsconfig = this.getTsConfigCompilerOptions(options.project)
      if(tsconfig !== undefined) {
        Object.keys(tsconfig).forEach(key => {
          if (options[key] === undefined) {
            options[key] = tsconfig[key]
          }
        })
      }

      //------------------------------------------------------------
      // bind in input/output files.
      //------------------------------------------------------------
      options.inFile   = path.resolve(process.cwd(), inFile)
      options.outFile  = path.resolve(process.cwd(), outFile)

      //------------------------------------------------------------
      // return
      //------------------------------------------------------------
      return options
    } catch (e) {
      return {
        help: true
      }
    }
  }

  /**
   * returns a typescript compiler string.
   * @returns {string}
   */
  public getCompilerString(): string {
    let buffer = []
    let options = this.getCompilerOptions()
    if (options.help)                             return "tsc -h"
    if (options.allowJs)                          buffer.push("--allowJs")
    if (options.alwaysStrict)                     buffer.push("--alwaysStrict")
    if (options.allowSyntheticDefaultImports)     buffer.push("--allowSyntheticDefaultImports")
    if (options.allowUnreachableCode)             buffer.push("--allowUnreachableCode")
    if (options.allowUnusedLabels)                buffer.push("--allowUnusedLabels")
    if (options.baseUrl)                          buffer.push("--baseUrl " + options.baseUrl)
    if (options.charset)                          buffer.push("--charset " + options.charset)
    if (options.declaration)                      buffer.push("--declaration")
    if (options.declarationDir)                   buffer.push("--declarationDir " + options.declarationDir)
    if (options.diagnostics)                      buffer.push("--diagnostics "    + options.diagnostics)
    if (options.disableSizeLimit)                 buffer.push("--disableSizeLimit")
    if (options.emitBOM)                          buffer.push("--emitBOM")
    if (options.emitDecoratorMetadata)            buffer.push("--emitDecoratorMetadata")
    if (options.experimentalDecorators)           buffer.push("--experimentalDecorators")
    if (options.forceConsistentCasingInFileNames) buffer.push("--forceConsistentCasingInFileNames")
    if (options.importHelpers)                    buffer.push("--importHelpers")
    if (options.inlineSourceMap)                  buffer.push("--inlineSourceMap")
    if (options.inlineSources)                    buffer.push("--inlineSources")
    if (options.isolatedModules)                  buffer.push("--isolatedModules")
    if (options.help)                             buffer.push("--help")
    if (options.jsx)                              buffer.push("--jsx " + options.jsx)
    if (options.jsxFactory)                       buffer.push("--jsxFactory " + options.jsxFactory)
    if (options.lib)                              buffer.push("--lib " + options.lib.join(","))
    if (options.listEmittedFiles)                 buffer.push("--listEmittedFiles")
    if (options.listFiles)                        buffer.push("--listFiles")
    if (options.locale)                           buffer.push("--locale "  + options.locale)
    if (options.mapRoot)                          buffer.push("--mapRoot " + options.mapRoot)
    if (options.maxNodeModuleJsDepth)             buffer.push("--maxNodeModuleJsDepth " + options.maxNodeModuleJsDepth.toString())
    /* ignore if(options.module)                  buffer.push("--module " + options.module) */
    buffer.push("--module amd")
    if (options.moduleResolution)                 buffer.push("--moduleResolution " + options.moduleResolution)
    if (options.newLine)                          buffer.push("--newLine "          + options.newLine)
    if (options.noEmit)                           buffer.push("--noEmit")
    if (options.noEmitHelpers)                    buffer.push("--noEmitHelpers")
    if (options.noEmitOnError)                    buffer.push("--noEmitOnError")
    if (options.noFallthroughCasesInSwitch)       buffer.push("--noFallthroughCasesInSwitch")
    if (options.noImplicitAny)                    buffer.push("--noImplicitAny")
    if (options.noImplicitReturns)                buffer.push("--noImplicitReturns")
    if (options.noImplicitThis)                   buffer.push("--noImplicitThis")
    if (options.noImplicitUseStrict)              buffer.push("--noImplicitUseStrict")
    if (options.noLib)                            buffer.push("--noLib")
    if (options.noResolve)                        buffer.push("--noResolve")
    if (options.noUnusedLocals)                   buffer.push("--noUnusedLocals")
    if (options.noUnusedParameters)               buffer.push("--noUnusedParameters")
    /* ignore if (options.outDir)               buffer.push("--outDir " + options.outDir) */
    if (options.outFile)                          buffer.push("--outFile " + options.outFile)
    if (options.preserveConstEnums)               buffer.push("--preserveConstEnums")
    if (options.pretty)                           buffer.push("--pretty")
    if (options.reactNamespace)                   buffer.push("--reactNamespace " + options.reactNamespace)
    if (options.removeComments)                   buffer.push("--removeComments")
    if (options.rootDir)                          buffer.push("--rootDir " + options.rootDir)
    if (options.skipLibCheck)                     buffer.push("--skipLibCheck")
    if (options.skipDefaultLibCheck)              buffer.push("--skipDefaultLibCheck")
    if (options.sourceMap)                        buffer.push("--sourceMap")
    if (options.sourceRoot)                       buffer.push("--sourceRoot " + options.sourceRoot)
    if (options.strictNullChecks)                 buffer.push("--strictNullChecks")
    if (options.stripInternal)                    buffer.push("--stripInternal")
    if (options.suppressExcessPropertyErrors)     buffer.push("--suppressExcessPropertyErrors")
    if (options.suppressImplicitAnyIndexErrors)   buffer.push("--suppressImplicitAnyIndexErrors")
    if (options.target)                           buffer.push("--target " + options.target)
    if (options.traceResolution)                  buffer.push("--traceResolution")
    if (options.types)                            buffer.push("--types " + options.types.join(","))
    if (options.typeRoots)                        buffer.push("--types " + options.typeRoots.join(","))
    if (options.version)                          buffer.push("--version")
    if (options.watch)                            buffer.push("--watch")
    return `tsc ${options.inFile} ${buffer.join(' ')}`
  }
}