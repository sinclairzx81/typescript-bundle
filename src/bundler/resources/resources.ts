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

import { asDirectory }         from './templates/index'
import { asBase64 }            from './templates/index'
import { asBuffer }            from './templates/index'
import { asJson }              from './templates/index'
import { asText }              from './templates/index'
import { asCss }               from './templates/index'
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

type Directive =  'directory' | 'text' | 'json' | 'base64' | 'buffer' | 'css'
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
    const result: AMDResult = { defines: [], remaps: {} }
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
          if(split.length === 2 && 
              (split[0] === 'directory' || 
               split[0] === 'text'      ||
               split[0] === 'json'      || 
               split[0] === 'base64'    || 
               split[0] === 'buffer'    ||
               split[0] === 'css')) {
            const directive = split[0]
            const absoluteName = join(module_root, split[1])
            const resource = `${directive}!${absoluteName}`
            result.remaps[resource] = result.remaps[resource] || []
            result.remaps[resource].push(dependency)
            resource_names[resource] = null
            return resource
          }
        }
        return dependency
      })
      
      const define = { type, name, dependencies }
      result.defines.push(define as Define)
    }
    
    // Resolve the resource path prefix. This is resolved from the
    // 'last' definition in the bundle. We are looking for multi
    // component paths (i.e 'parent/index'). This indicates that
    // TypeScript has re-orientated the module paths due to a
    // module inside the 'projectRoot' importing outside the project
    // root. In these cases, we prefix the resourcePath with ../.
    // for as many path components found - 1.
    let resourcePathPrefix = './'
    if(result.defines.length > 0) {
      const entry = result.defines[result.defines.length - 1] as Module
      const split = entry.name.split('/')
      if(split.length > 1) {
        resourcePathPrefix = split.slice(1).map(n => '../').join('')
      }
    }

    // Construct Resources from 'resource_names' accumulator.
    const resources = Object.keys(resource_names).map(name => {
      const [directive, moduleName] = name.split('!')
      const dependencies = ["exports"]
      const type = 'resource'
      const path = `${resourcePathPrefix}${moduleName}`
      return { type, name, path, directive, dependencies } as Resource
    })

    result.defines.unshift(...resources)
    return result
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

        // note: there is a subtle thing going on here
        // where the remap is stepping through imports
        // in 'order of discovery' and the rewriting of
        // module imports works by replacing in 'order
        // of discovery'. Need to consider a more 
        // clear cut, obvious way of handling this
        // module rewrite.
        const pattern = new RegExp(dependency)
        code = code.replace(pattern, key)    
      }
    }
    // Create Resource Fragments
    const resources = result.defines.filter(define => define.type === 'resource') as Resource[]
    const fragments = resources.map(resource => {
      const path = join(basePath, resource.path)
      switch(resource.directive) {
        case 'directory': return asDirectory(resource.name, path)
        case 'text':      return asText(resource.name, path)
        case 'json':      return asJson(resource.name, path)
        case 'base64':    return asBase64(resource.name, path)
        case 'buffer':    return asBuffer(resource.name, path)
        case 'css':       return asCss(resource.name, path)
        default: throw Error(`unknown directive '${resource.directive}'`)
      }
    })

    return [...fragments, code].join('\n')
  }
}