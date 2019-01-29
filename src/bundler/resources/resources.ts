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

import { asBase64 }            from './templates/index'
import { asBuffer }            from './templates/index'
import { asJson }              from './templates/index'
import { asText }              from './templates/index'
import { join, dirname }       from 'path'

// ------------------------------------------------------------------------------
//
// AMDReader
//
// The AMD Reader is responsible for parsing the contents of the TypeScript AMD
// bundle and computing data structure that's used to re-write bundle dependencies
// with absolute 'resource' paths.
//
// The reader also computes a set of `resource` definitions extracted from the
// resource dependencies bound in the bundle. These are used to inject resource
// content into the bundle.
//
// 
//
// ------------------------------------------------------------------------------

type Directive = 'text' | 'json' | 'base64' | 'buffer'
type Define = Module | Resource
interface Module {
  type: 'module'
  name: string
  dependencies: string[]
}
interface Resource {
  type: 'resource'
  name: string
  path: string
  dependencies: string[]
  directive: Directive
}
interface AMDResult {
  defines:  Define[]
  remaps:  {[name: string]: string[] }
}
class AMDReader {
  public static read(code: string): AMDResult {
    const document: AMDResult = { defines: [], remaps: {} }
    const resource_names: {[name: string]: null} = {}
    const pattern = /define\s*\("(.*)",\s*\[(.*)],\s*function/gm
    while(true) {
      const match = pattern.exec(code)
      if(match === null) {
        break
      }
      // Extract module data.
      const type     = 'module'
      const name     = match[1]
      const unmapped = match[2].split(',').map(text => text.replace(/"/g, '').trim())

      // Map dependencies, accumulate remaps & resource keys. 
      const module_root = dirname('./' + name)
      const dependencies = unmapped.map(dependency => {
        if(dependency.includes('!')) {
          const split = dependency.split('!').map(n => n.trim())
          if(split.length === 2 && (split[0] === 'text' || split[0] === 'json' || split[0] === 'base64' || split[0] === 'buffer')) {
            const directive = split[0]
            const absoluteName = join(module_root, split[1])
            const resource = `${directive}!${absoluteName}`
            document.remaps[resource] = document.remaps[resource] || []
            document.remaps[resource].push(dependency)
            resource_names[resource] = null
            return resource
          }
        }
        return dependency
      })
      const define = { type, name, dependencies: dependencies }
      document.defines.push(define as Define)
    }

    // Construct Resources from 'resource_names' accumulator.
    const resources = Object.keys(resource_names).map(name => {
      const [directive, path] = name.split('!')
      const dependencies = ["exports"]
      const type = 'resource'
      return { type, name, path, directive, dependencies } as Resource
    })
    document.defines.unshift(...resources)
    return document
  }
}

// ------------------------------------------------------------------------------
//
// Resources
// 
// Extracts a set of resource definitions from AMD dependencies and injects them
// into the bundle. Takes care of loading resource fragments, as well as remapping
// dependencies to point at the injected resource.
//
// ------------------------------------------------------------------------------
export class Resources {

  /** Parses for AMD define() and extracts the module + dependency names. */
  public static transform(basePath: string, code: string): string {
    const result = AMDReader.read(code)

    // Rewrites Module Resource Dependencies
    for(const key of Object.keys(result.remaps)) {
      for(const dependency of result.remaps[key]) {
        const pattern = new RegExp(dependency)
        code = code.replace(pattern, key)    
      }
    }
    // Create Resource Fragments
    const resources = result.defines.filter(define => define.type === 'resource') as Resource[]
    const fragments = resources.map(resource => {
      const path = join(basePath, resource.path)
      switch(resource.directive) {
        case 'text': return asText(resource.name, path)
        case 'json': return asJson(resource.name, path)
        case 'base64': return asBase64(resource.name, path)
        case 'buffer': return asBuffer(resource.name, path)
        default: throw Error(`unknown directive '${resource.directive}'`)
      }
    })

    return [...fragments, code].join('\n')
  }
}