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

import { readFileSync } from 'fs'
import { render }       from './render'

/** formats the JSON cleanly within the bundle. */
function formatJson(data: any): string {
  return JSON.stringify(data, null, 2).split('\n').map((n, i) => (i > 0) ? `  ${n}`: n).join("\n")
}

function get(filePath: string): string {
  let content = ''
  try {
    content = readFileSync(filePath, 'utf8')
  } catch(error) {
    return formatJson({ error: 'unable to load resource'})
  }
  
  try {
    return formatJson(JSON.parse(content))
  } catch(error) {
    return JSON.stringify({ error: error.toString() })
  }
}

export function asJson(moduleName: string, filePath: string) {
  return render(moduleName, get(filePath))
}