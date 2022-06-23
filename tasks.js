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

async function build_amd_template(target) {
  const template = `./src/bundler/loader/templates/template.ts`
  const outFile  = `./src/bundler/loader/templates/${target}.ts`
  const backtick = "\\\`"
  await shell(`
    tsc ${template} --outFile ${outFile} --target ${target} --removeComments
    && echo "export default ${backtick}""$(cat ${outFile})"${backtick} > ${outFile}
  `).exec()
}

export async function clean() {
  await folder('target').delete().exec()
}

export async function amd_loaders() {
  const targets = ['es3', 'es5', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'esnext']
  const builds = targets.map(target => build_amd_template(target))
  await Promise.all(builds)
}

export async function build(target = 'target') {
  await shell(`tsc --project src/tsconfig.json --outDir ${target}/bin`).exec()
}

export async function pack(target = 'target') {
  await build()
  await shell(`node ${target}/bin/index.js ./src/tsconfig.json --outFile ${target}/pack/index.js`).exec()
  await folder(`${target}/pack`).add('package.json').exec()
  await folder(`${target}/pack`).add('readme.md').exec()
  await folder(`${target}/pack`).add('license').exec()
  await folder(`${target}/pack`).add('src/tsc-bundle').exec()
  await shell(`cd ${target}/pack && npm pack`).exec()
}

export async function spec(target = 'target') {
  await pack()
  await shell(`node ${target}/pack ./spec/tsconfig.json --outFile ${target}/spec/index.js`).exec()
  await shell(`node ${target}/spec`).exec()
}

export async function install_cli (target = 'target') {
  await pack(target)
  const packageJson = JSON.parse(await file(`package.json`).read('utf-8'))
  const packfile = `typescript-bundle-${packageJson.version}.tgz`
  await shell(`cd ${target}/pack && npm install ${packfile} -g`).exec()
}

export async function uninstall_cli (target = 'target') {
  await shell('npm uninstall typescript-bundle -g').exec()
}