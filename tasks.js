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

"use strict";

const task = require("./tasksmith.js")
const fs   = require("fs")

//------------------------------------
// cleans out the bin
//------------------------------------
const clean = () => task.drop("./bin")

//------------------------------------
// builds the bin
//------------------------------------
const build = () => task.series(() => [
  task.shell ("tsc ./src/index.ts --lib dom,es2015 --module commonjs --target es5 --removeComments --outDir ./bin"),
  task.copy  ("./src/tsc-bundle", "./bin"),
  task.copy  ("./package.json",   "./bin"),
  task.copy  ("./readme.md",      "./bin"),
  task.copy  ("./license",        "./bin"),
  task.script("version-stamp", (context) => {
    const version = JSON.parse(fs.readFileSync(__dirname + "/package.json", "utf8")).version
    const help_in = fs.readFileSync(__dirname + "/bin/help.js", "utf8")
    const help_out = help_in.split("[[[VERSION_STRING]]]").join(version)
    fs.writeFileSync(__dirname + "/bin/help.js", help_out, "utf8")
    context.ok()
  })
])


//------------------------------------
// build and installs module.
//------------------------------------
const install = () => task.series(() => [
  build(),
  task.shell("cd ./bin && npm install -g .")
])

//------------------------------------
// uninstalls module.
//------------------------------------
const uninstall = () => task.series(() => [
  task.shell("cd ./bin && npm uninstall -g .")
])

//------------------------------------
// publishes this module.
//------------------------------------
const publish = () => task.series(() => [
  task.shell("cd ./bin && npm publish")
])

const cli = task.cli(process.argv, {
  "clean"     : clean(),
  "build"     : build(),
  "install"   : install(),
  "uninstall" : uninstall(),
  "publish"   : publish()
})

task.debug(cli)


 