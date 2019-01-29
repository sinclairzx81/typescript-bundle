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

//--------------------------------------------------------------------------
//
// helper functions
//
//--------------------------------------------------------------------------

function shell (command) {
  return new Promise(resolve => {
    command = command.split('\n').join(' ').split(' ').filter(n => n.length > 0).join(' ')
    const { spawn } = require('child_process')
    const windows = /^win/.test(process.platform)
    console.log(`\x1b[32m${command}\x1b[0m` )
    const ls      = spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command] )
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stderr)
    ls.on('close', (code) => resolve(code))
  })
}
async function cli(args, tasks) {
  const task = (args.length === 3) ? args[2] : 'none'
  const func = (tasks[task]) ? tasks[task] : () => {
    console.log('tasks:')
    Object.keys(tasks).forEach(task => console.log(` - ${task}`))
  }; await func()
}

//--------------------------------------------------------------------------
//
// compiler commands
//
//--------------------------------------------------------------------------

const BUILD     = () => `tsc --project ./src/tsconfig.json`
const BUILD_AMD = (target) => {
  const template = `./src/bundler/loader/templates/template.ts`
  const outFile  = `./src/bundler/loader/templates/${target}.ts`
  const backtick = "\\\`"
  return `
    tsc ${template} --outFile ${outFile} --target ${target} --removeComments
    && echo "export default ${backtick}""$(cat ${outFile})"${backtick} > ${outFile}
  `
}


//--------------------------------------------------------------------------
//
// tasks
//
//--------------------------------------------------------------------------

async function clean() {
  await shell('shx rm -rf ./spec/project/out/index.js')
  await shell('shx rm -rf ./bin')
  await shell('shx rm -rf ./pack')
  await shell('shx rm -rf ./node_modules')
}

async function spec () {
  await shell('npm install')
  await shell(`${SPEC()}`)
  await shell('mocha ./spec.js')
}

async function amd_loaders() {
  const targets = ['es3', 'es5', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'esnext']
  await Promise.all(targets.map(target => shell(BUILD_AMD(target))))
}



async function build () {
  await shell('npm install')
  await shell(`${BUILD()}`)
}

async function pack () {
  await build()
  await shell('node ./bin/index.js ./src/tsconfig.json --outFile ./pack/index.js --debug')
  await shell('shx mkdir -p ./pack')
  await shell('shx cp ./package.json ./pack')
  await shell('shx cp ./readme.md ./pack')
  await shell('shx cp ./license ./pack')
  await shell('shx cp ./src/tsc-bundle ./pack')
}

async function watch_spec() {
  await shell('npm install')
  await shell(`${BUILD()}`)
  await Promise.all([
    shell(`${BUILD()} --watch`),
    shell('fsrun ./bin/ [node ./bin/index.js ./spec/project/in/tsconfig.json]')
  ])
}
async function watch_spec_out () {
  await shell('fsrun ./spec/project/out/index.js [node ./spec/project/out/index.js]')
}
async function install_cli () {
  await pack()
  await shell('cd ./pack && npm install -g')
}

async function uninstall_cli () {
  await pack()
  await shell('cd ./pack && npm uninstall -g')
}

//--------------------------------------------------------------------------
//
// cli
//
//--------------------------------------------------------------------------
cli(process.argv, {
  clean,
  amd_loaders,
  build,
  pack,
  watch_spec,
  watch_spec_out,
  install_cli,
  uninstall_cli
}).catch(console.log)
