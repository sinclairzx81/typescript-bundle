/*--------------------------------------------------------------------------

typescript-bundle - bundle modular typescript projects for the browser

The MIT License (MIT)

Copyright (c) 2016-2017 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import * as path from "path"
import * as fs   from "fs"


interface BundlerMode {
  type  : "arguments" | "project" | "help" | "version" | "invalid"
  errors: string[]
}
/** tests for the compilation mode. */
const parseMode = (args: string []): BundlerMode => {
  let parts = args.slice()
  parts.shift()
  parts.shift()
  if(parts.length === 0) { 
    return { type:"help", errors: [] } 
  }
  else if(parts.length === 1) {
    const first = parts[0]
    if(first === "-h" || first === "--help")    { 
      return { type: "help", errors: []} 
    }
    if(first === "-v" || first === "--version") { 
      return { type: "version", errors: []} 
    }
  }
  else {
    const first = parts[0]
    if(first === "-p" || first === "--project") {
      const tsconfigFile = parts[1]
      if(!fs.existsSync(path.resolve(process.cwd(), tsconfigFile))) {
        return {type: "invalid", errors: [`cannot locate tsconfig at ${tsconfigFile}`]}
      } else {
        return {type: "project", errors: []}
      }
    } else {
      const inputFile = parts[0]
      if(!fs.existsSync(path.resolve(process.cwd(), inputFile))) {
        return {type: "arguments", errors: [`cannot locate input file ${inputFile}`]}
      } else {
        return {type: "arguments", errors: []}
      }
    }
  }
}


/** validates that the given tsconfig conforms to specification. */
const validateTsConfig = (tsconfigPath: string): string[] => {
  const result = []
  // check exits
  if(!fs.existsSync(path.resolve(process.cwd(), tsconfigPath))) {
    result.push(`error: cannot locate tsconfig.json at ${tsconfigPath}`)
    return result
  }
  // check valid json.
  let config: any = null
  try {
    config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), tsconfigPath), "utf8"))
  } catch (e) {
    result.push("error: tsconfig is not valid json.")
    return result
  }
  // validate --module amd
  if(config.compilerOptions.module === undefined || config.compilerOptions.module !== "amd") {
    result.push("error: tsconfig.compilerOptions.module be set to 'amd'.")
  }
  // validate --outFile option.
  if(config.compilerOptions.outFile === undefined) {
    result.push("error: tsconfig.compilerOptions.outFile path must be specified.")
  }
  // validate --outDir
  if(config.compilerOptions.outDir !== undefined) {
    result.push("error: tsconfig.compilerOptions.outDir is not allowed.")
  }
  // validate --moduleResolution
  if(config.compilerOptions.moduleResolution !== undefined) {
    result.push("error: tsconfig.compilerOptions.moduleResolution is not allowed.")
  }
  // validate --files
  if(config.files === undefined || config.files.length !== 1) {
    result.push("error: tsconfig.files array must contain exactly 1 input file.")
  }
  return result
}



/** validates input arguments for errors. */
const validateArguments = (args: string[]): string [] => {
  const result = []
  const mode = parseMode(args)
  const parts = args.slice()
  parts.shift()
  parts.shift()
  if(mode === undefined)      return []
  if(mode.type === "help")    return []
  if(mode.type === "version") return []
  if(mode.type === "project") {
    const second = parts[1]
    const errors = validateTsConfig(second)
    if(errors.length > 0) return errors
    parts.shift()
    parts.shift()
  }
  if(mode.type === "arguments") {
    const inputFile  = parts[0]
    const outputFile = parts[1]
    if(!fs.existsSync(path.resolve(process.cwd(), inputFile))) {
      result.push(`error: input file '${inputFile}' not found.\n`)
      return result
    }
    parts.shift()
    parts.shift()
  }
  // validate disabled compiler switches.
  while(parts.length > 0) {
    const part = parts.shift()
    if(part === "--module")           result.push("error: --module switch is not supported.\n")
    if(part === "--moduleResolution") result.push("error: --moduleResolution switch is not supported.\n")
    if(part === "--outDir")           result.push("error: --outDir option is not supported.\n")
    if(part === "--outFile")          result.push("error: --outFile option is not supported.\n")
  } return result
}

export interface BunderProperties {
  // typescript-bundle defined.
  inputFile?                        : string
  outputFile?                       : string
  exportAs?                         : string

  // typescript compiler defined.
  allowJs?                          : boolean
  allowSyntheticDefaultImports?     : boolean
  allowUnreachableCode?             : boolean
  allowUnusedLabels?                : boolean
  alwaysStrict?                     : boolean
  baseUrl?                          : string
  charset?                          : string
  checkJs?                          : boolean
  declaration?                      : boolean
  declarationDir?                   : string
  diagnostics?                      : boolean
  disableSizeLimit?                 : boolean
  downlevelIteration?               : boolean
  emitBOM?                          : boolean
  emitDecoratorMetadata?            : boolean
  experimentalDecorators?           : boolean
  forceConsistentCasingInFileNames? : boolean
  help?                             : boolean
  importHelpers?                    : boolean
  inlineSourceMap?                  : boolean
  inlineSources?                    : boolean
  // (ignore) init?                 : boolean
  isolatedModules?                  : boolean
  jsx?                              : string
  jsxFactory?                       : string
  lib?                              : string[]
  listEmittedFiles?                 : boolean
  listFiles?                        : boolean
  locale?                           : string
  mapRoot?                          : string
  maxNodeModuleJsDepth?             : number
  // (ignore) module?               : string
  // (ignore) moduleResolution?     : string | "node" | "classic"
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
  // (ignore) out?                  : string // deprecated
  // (ignore) outFile?              : string // see inputFile
  // (ignore) paths?                : any    // tsconfig only
  preserveConstEnums?               : boolean
  pretty?                           : boolean
  project?                          : string
  reactNamespace?                   : string
  removeComments?                   : boolean
  rootDir?                          : string
  rootDirs?                         : string[]
  skipDefaultLibCheck?              : boolean
  skipLibCheck?                     : boolean
  sourceMap?                        : boolean
  sourceRoot?                       : string
  strict?                           : boolean
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

/** reads the compiler options argument from the given args. */
const parseBundlerProperties = (args: string[]): BunderProperties => {
  try {
    const options: BunderProperties = { }
    const mode = parseMode(args)

    if(mode.type === "help")    return { help   : true } 
    if(mode.type === "version") return { version: true }

    // unshift from the first two arguments.
    const parts = args.slice()
    parts.shift()
    parts.shift()
    
    // unshift input / output
    if(mode.type === "arguments") {
      options.inputFile  = parts.shift()
      options.outputFile = parts.shift()
    }
    
    // unshift project
    if(mode.type === "project") {
      parts.shift() // unshift --project option
      options.project = parts.shift()
      const tsconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), options.project), "utf8"))
      options.outputFile = tsconfig.compilerOptions.outFile // require to provision.
      options.inputFile  = tsconfig.files[0]
    }

    // read command line arguments.
    while (parts.length > 0) {
      switch (parts.shift()) {
        // typescript-bundle configurations.
        case "--exportAs":                          options.exportAs                         = parts.shift(); break;
        case "-gns":
          console.log("deprecation notice: switch --gns. use --exportAs instead.")    
          options.exportAs = parts.shift(); 
          break;
        case "--globalNamespace":
          console.log("deprecation notice: switch --globalNamespace. use --exportAs instead.")    
          options.exportAs = parts.shift(); 
          break;
        // typescript configurations.
        case "--allowJs":                           options.allowJs                          = true; break;
        case "--allowSyntheticDefaultImports":      options.allowSyntheticDefaultImports     = true; break;
        case "--allowUnreachableCode":              options.allowUnreachableCode             = true; break;
        case "--allowUnusedLabels":                 options.allowUnusedLabels                = true; break;
        case "--alwaysStrict":                      options.alwaysStrict                     = true; break;
        case "--baseUrl":                           options.baseUrl                          = parts.shift(); break;
        case "--charset":                           options.charset                          = parts.shift(); break;
        case "--checkJs":                           options.checkJs                          = true; break;
        case "-d":
        case "--declaration":                       options.declaration                      = true; break;
        case "--declarationDir":                    options.declarationDir                   = parts.shift(); break;
        case "--diagnostics":                       options.diagnostics                      = true; break;
        case "--disableSizeLimit":                  options.disableSizeLimit                 = true; break;
        case "--downlevelIteration":                options.downlevelIteration               = true; break;
        case "--emitBOM":                           options.emitBOM                          = true; break;
        case "--emitDecoratorMetadata":             options.emitDecoratorMetadata            = true; break;
        case "--experimentalDecorators":            options.experimentalDecorators           = true; break;
        case "--forceConsistentCasingInFileNames":  options.forceConsistentCasingInFileNames = true; break;
        // (ignore) case "-h":
        // (ignore) case "--help":                  options.help                             = true; break;
        case "--inlineSourceMap":                   options.inlineSourceMap                  = true; break;
        case "--inlineSources":                     options.inlineSources                    = true; break;
        case "--importHelpers":                     options.importHelpers                    = true; break;
        case "--isolatedModules":                   options.isolatedModules                  = true; break;
        case "--jsx":                               options.jsx                              = parts.shift(); break;
        case "--jsxFactory":                        options.jsxFactory                       = parts.shift(); break;
        case "--lib":                               options.lib                              = parts.shift().split(","); break;
        case "--listEmittedFiles":                  options.listEmittedFiles                 = true; break;
        case "--listFiles":                         options.listFiles                        = true; break;
        case "--locale":                            options.locale                           = parts.shift(); break;
        case "--mapRoot":                           options.mapRoot                          = parts.shift(); break;
        case "--maxNodeModuleJsDepth":              options.maxNodeModuleJsDepth             = parseInt(parts.shift()); break;
        // (ignore) case "--module":                options.module                           = parts.shift(); break;
        // (ignore) case "--moduleResolution":      options.moduleResolution                 = parts.shift(); break;
        // (ignore) case "--paths":                 options.paths                            = parts.shift(); break; 
        case "--newLine":                           options.newLine                          = parts.shift(); break;
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
        // (ignored) case "--outDir":               options.outDir                           = parts.shift(); break;
        // (ignored) case "--outFile":              options.outFile                          = parts.shift(); break;
        case "--preserveConstEnums":                options.preserveConstEnums               = true; break;
        case "--pretty":                            options.pretty                           = true; break;
        case "-p":
        // (ignored) case "--project":              options.project                          = parts.shift(); break; // gathered at start.
        case "--reactNamespace":                    options.reactNamespace                   = parts.shift(); break;
        case "--removeComments":                    options.removeComments                   = true; break;
        case "--rootDir":                           options.rootDir                          = parts.shift(); break;
        case "--rootDirs":                          options.rootDirs                         = parts.shift().split(","); break;
        case "--skipDefaultLibCheck":               options.skipDefaultLibCheck              = true; break;
        case "--skipLibCheck":                      options.skipLibCheck                     = true; break;
        case "--sourceMap":                         options.sourceMap                        = true; break;
        case "--sourceRoot":                        options.sourceRoot                       = parts.shift(); break;
        case "--strict":                            options.strict                           = true; break;
        case "--stripInternal":                     options.stripInternal                    = true; break;
        case "--suppressExcessPropertyErrors":      options.suppressExcessPropertyErrors     = true; break;
        case "--suppressImplicitAnyIndexErrors":    options.suppressImplicitAnyIndexErrors   = true; break;
        case "-t":
        case "--target":                            options.target                           = parts.shift(); break;
        case "--traceResolution":                   options.traceResolution                  = true; break;
        case "--types":                             options.types                            = parts.shift().split(","); break;
        case "--typeRoots":                         options.typeRoots                        = parts.shift().split(","); break;
        // (ignore) case "-v":
        // (ignore) case "--version":               options.version                          = true; break;
        case "-w":
        case "--watch":                             options.watch                            = true; break;
        default: break;
      }
    }
    return options
  } catch (e) {
    return { help: true  }
  }
}

/** parses the typescript compiler string from typescript-bundle arguments. */
const parseTscCommand = (mode: BundlerMode, options: BunderProperties): string => {
  let buffer = []
  if (options.help)                             return "tsc -h"
  if (options.project)                          buffer.push("--project " + options.project)
  if (options.allowJs)                          buffer.push("--allowJs")
  if (options.alwaysStrict)                     buffer.push("--alwaysStrict")
  if (options.allowSyntheticDefaultImports)     buffer.push("--allowSyntheticDefaultImports")
  if (options.allowUnreachableCode)             buffer.push("--allowUnreachableCode")
  if (options.allowUnusedLabels)                buffer.push("--allowUnusedLabels")
  if (options.baseUrl)                          buffer.push("--baseUrl " + options.baseUrl)
  if (options.charset)                          buffer.push("--charset " + options.charset)
  if (options.checkJs)                          buffer.push("--checkJs")
  if (options.declaration)                      buffer.push("--declaration")
  if (options.declarationDir)                   buffer.push("--declarationDir " + options.declarationDir)
  if (options.diagnostics)                      buffer.push("--diagnostics "    + options.diagnostics)
  if (options.disableSizeLimit)                 buffer.push("--disableSizeLimit")
  if (options.downlevelIteration)               buffer.push("--downlevelIteration")
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
  // (ignore) if(options.module)                buffer.push("--module " + options.module) */
  // (ignore) if(options.moduleResolution)      buffer.push("--moduleResolution " + options.moduleResolution)
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
  // (ignore) if (options.outDir)               buffer.push("--outDir " + options.outDir) 
  // (ignore) if (options.outFile)              buffer.push("--outFile " + options.outFile)
  // (ignore) if (options.paths)                buffer.push("")
  if (options.preserveConstEnums)               buffer.push("--preserveConstEnums")
  if (options.pretty)                           buffer.push("--pretty")
  // (ignored) if (options.project)             buffer.push("--project " + options.project)
  if (options.reactNamespace)                   buffer.push("--reactNamespace " + options.reactNamespace)
  if (options.removeComments)                   buffer.push("--removeComments")
  if (options.rootDir)                          buffer.push("--rootDir " + options.rootDir)
  if (options.skipDefaultLibCheck)              buffer.push("--skipDefaultLibCheck")
  if (options.skipLibCheck)                     buffer.push("--skipLibCheck")
  if (options.sourceMap)                        buffer.push("--sourceMap")
  if (options.sourceRoot)                       buffer.push("--sourceRoot " + options.sourceRoot)
  if (options.strict)                           buffer.push("--strict")
  if (options.strictNullChecks)                 buffer.push("--strictNullChecks")
  if (options.stripInternal)                    buffer.push("--stripInternal")
  if (options.suppressExcessPropertyErrors)     buffer.push("--suppressExcessPropertyErrors")
  if (options.suppressImplicitAnyIndexErrors)   buffer.push("--suppressImplicitAnyIndexErrors")
  if (options.target)                           buffer.push("--target " + options.target)
  if (options.traceResolution)                  buffer.push("--traceResolution")
  if (options.types)                            buffer.push("--types " + options.types.join(","))
  if (options.typeRoots)                        buffer.push("--typeRoots " + options.typeRoots.join(","))
  if (options.version)                          buffer.push("--version")
  if (options.watch)                            buffer.push("--watch")

  /** resolve command based on mode.  */
  if(mode.type === "project"){
    return `tsc ${buffer.join(' ')}`
  } else if(mode.type === "arguments"){
    buffer.push("--module amd")
    buffer.push("--outFile " + options.outputFile)   
    return `tsc ${options.inputFile} ${buffer.join(' ')}` 
  } else if(mode.type === "version"){
    return "tsc --version"
  } else {
    return "tsc --help"
  }
}

export interface Options {
  /** the tsc compiler command */
  command    : string
  /** the extracted command properties. */
  properties : BunderProperties
  /** argument validation errors. */
  errors     : string[]
}
export const parse = (args: Array<any>): Options => {
  const properties = parseBundlerProperties(args)
  const mode       = parseMode(args)
  return {
    errors     : validateArguments(args),
    command    : parseTscCommand(mode, properties),
    properties : properties
  }
}