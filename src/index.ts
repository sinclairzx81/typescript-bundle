/*--------------------------------------------------------------------------

typescript-bundle

The MIT License (MIT)

Copyright (c) 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { TypeScriptConfiguration }       from './compiler/index'
import { Command, CommandOptions }       from './command/index'
import { Bundler, BundlerOptions }       from './bundler/index'
import { TypeScript, TypeScriptOptions } from './compiler/index'
import { TypeScriptCompilerError }       from './compiler/index'
import { writeFileSync }                 from 'fs'

/** Writes usage information */
async function info() {
  const green  = '\x1b[32m'
  const esc    = '\x1b[0m'
  console.log(`Version 1.0.10

Examples: ${green}tsc-bundle${esc} index.ts
          ${green}tsc-bundle${esc} tsconfig.json
          ${green}tsc-bundle${esc} script.ts --exportAs Foo
          ${green}tsc-bundle${esc} index.ts --outFile bundle.js
          ${green}tsc-bundle${esc} index.ts --transform script.js

Options:
  --outFile         Outputs the bundle with the give filepath.
  --target          Sets the ES Target for the bundle.
  --exportAs        Exports bundle exports as a global variable.
  --importAs        Imports global variable as a module (namespace).
  --importAsDefault Imports global variable as a module (default).
  --transform       Applies a transform to the bundle.
  --watch           Starts the compiler in watch mode.
  --debug           Prints debug information.
  `)
}

/** Writes error messages */
async function fatal(errorText: string) {
  console.log(errorText)
}

/** Resolves compiler and bundler options. */
function getOptions(commandOptions: CommandOptions): [TypeScriptOptions, BundlerOptions]  {
  const typescriptOptions: TypeScriptOptions = {
    type:         'script',
    esTarget:     'es3',
    inFile:       '',
    outFile:      '',
    watch:        false
  }
  const bundlerOptions: BundlerOptions = {
    esTarget:     'es3',
    projectRoot:  '',
    importAs:     [],
    exportAs:     null,
    transforms:   []
  }

  // Get 'defaults' from 'inFile | inFileType'
  if(commandOptions.inFileType === 'project') {
    const defaults = TypeScriptConfiguration.resolveTargetAndOutFileFromTsConfig(commandOptions.inFile)
    typescriptOptions.type     = 'project'
    typescriptOptions.outFile  = defaults.outFile
    typescriptOptions.esTarget = defaults.esTarget
    bundlerOptions.esTarget    = defaults.esTarget
  } else {
    const defaults = TypeScriptConfiguration.resolveTargetAndOutFileFromScript(commandOptions.inFile)
    typescriptOptions.type     = 'script'
    typescriptOptions.outFile  = defaults.outFile
    typescriptOptions.esTarget = defaults.esTarget
    bundlerOptions.esTarget    = defaults.esTarget
  }

  // Set 'outFile' from 'commandOptions'
  typescriptOptions.inFile = commandOptions.inFile

  // Set 'overrides' from 'commandOptions'
  if(commandOptions.outFile) {
    typescriptOptions.outFile = commandOptions.outFile
  }
  if(commandOptions.esTarget) {
    typescriptOptions.esTarget = commandOptions.esTarget
    bundlerOptions.esTarget = commandOptions.esTarget
  }
  if(commandOptions.watch) {
    typescriptOptions.watch = true
  }

  // Set 'bundler' from 'commandOptions'
  bundlerOptions.projectRoot = commandOptions.projectRoot
  bundlerOptions.exportAs     = commandOptions.exportAs
  bundlerOptions.importAs     = commandOptions.importAs
  bundlerOptions.transforms   = commandOptions.transforms
  return [typescriptOptions, bundlerOptions]
}

/** Runs the bundler pass. */
async function bundle(commandOptions: CommandOptions) {
  const [typescriptOptions, bundlerOptions] = getOptions(commandOptions)
  if(commandOptions.debug) {
    console.log(); console.log('COMMAND',    commandOptions)
    console.log(); console.log("TYPESCRIPT", typescriptOptions)
    console.log(); console.log("BUNDLER",    bundlerOptions)
  }
  try {
    await TypeScript.compile(typescriptOptions, 
      diagnostic => process.stdout.write(diagnostic), 
      content => {
        if(Bundler.shouldBundle(content)) {
          const bundle = Bundler.bundle(content, bundlerOptions)
            writeFileSync(typescriptOptions.outFile, bundle, 'utf8')
        }
    })
  } catch(error) {
    fatal(error.message)
    process.exit((error as TypeScriptCompilerError).exitcode)
  }
}

/** cli entry point. */
async function run(argv: string[]) {
  const commandOptions = Command.parse(argv)
  switch(commandOptions.commandType) {
    case 'info': return info()
    case 'bundle': return bundle(commandOptions)
    case 'error': return fatal(commandOptions.errorText!)
  }
}

run(process.argv)