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

async function build_amd_template(target) {
  const template = `./src/bundler/loader/templates/template.ts`
  const outFile  = `./src/bundler/loader/templates/${target}.ts`
  const backtick = "\\\`"
  await shell(`
    tsc ${template} --outFile ${outFile} --target ${target} --removeComments
    && echo "export default ${backtick}""$(cat ${outFile})"${backtick} > ${outFile}
  `)
}

export async function clean() {
  await shell('shx rm -rf ./output')
  await shell('shx rm -rf ./node_modules')
}

export async function amd_loaders() {
  const targets = ['es3', 'es5', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'esnext']
  const builds = targets.map(target => build_amd_template(target))
  await Promise.all(builds)
}

export async function build () {
  await shell('tsc --project ./src/tsconfig.json --outDir ./output/bin')
}

export async function pack () {
  await build()
  await shell('node ./output/bin/index.js ./src/tsconfig.json --outFile ./output/pack/index.js')
  await shell('shx cp ./package.json   ./output/pack')
  await shell('shx cp ./readme.md      ./output/pack')
  await shell('shx cp ./license        ./output/pack')
  await shell('shx cp ./src/tsc-bundle ./output/pack')
  await shell('cd output/pack && npm pack')
}

export async function install_cli () {
  await pack()
  await shell('cd ./output/pack && npm install ./*.tgz -g')
}

export async function spec() {
  await pack()
  await shell('node ./output/pack ./spec/tsconfig.json --outFile ./output/spec/index.js')
  await shell('node ./output/spec')
}



