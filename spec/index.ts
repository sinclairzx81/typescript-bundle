import Content from 'text!assets/asset.txt'

import { Dependency } from './dependency'

const dependency = new Dependency()

dependency.write()

console.log('index', Content)