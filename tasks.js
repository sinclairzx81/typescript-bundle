"use strict";

const task = require("./tasksmith.js")

//------------------------------------
// cleans out the bin
//------------------------------------
const clean = () => task.drop("./bin")

//------------------------------------
// builds the bin
//------------------------------------
const build = () => task.series(() => [
  task.shell("tsc ./src/index.ts --lib dom,es2015,es2015.promise,es2015.generator --module commonjs --target es5 --removeComments --outDir ./bin"),
  task.copy ("./src/tsc-bundle", "./bin"),
  task.copy ("./package.json",   "./bin"),
  task.copy ("./readme.md",      "./bin"),
  task.copy ("./license",        "./bin")
])


//------------------------------------
// installs module.
//------------------------------------
const install = () => task.series(() => [
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