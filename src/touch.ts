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

/**
 * determines of the given directory should be created.
 * @param {string} the directory path to test.
 * @returns {boolean}
 */
const shouldCreateDirectory = (directoryPath: string): boolean => {
  try {
    const stat = fs.statSync(directoryPath)
    return stat.isDirectory() ? false : true
  } catch (e) {
    return true
  }
}

/**
 * determines if the file should be created.
 * @param {string} the directory path to test.
 * @returns {boolean}
 */
const shouldCreateFile = (filePath: string): boolean => {
  try {
    const stat = fs.statSync(filePath)
    return stat.isFile() ? false : true
  } catch (e) {
    return true
  }
}

/**
 * creates the given directory path if not exists.
 * @param {string} directoryPath the directory path to create.
 * @returns {void}
 */
const provisionDirectory = (directory: string): void => {
  const abs     = path.resolve(process.cwd(), directory).replace(/\\/g, "/")
  const parts   = abs.split("/")
  let current   = ""
  while (parts.length > 0) {
    current = current + parts.shift() + "/"
    if (shouldCreateDirectory(current)) {
      fs.mkdirSync(current)
    }
  }
}

/**
 * touches the given file and creates if not exists.
 * @param {string} filePath the file to touch.
 * @returns {void}
 */
export const touch = (filePath: string): void => {
  provisionDirectory(path.dirname(filePath))
  if(shouldCreateFile(filePath) === true) {
    fs.writeFileSync(filePath, "", { encoding: "utf8" })
  }
}
