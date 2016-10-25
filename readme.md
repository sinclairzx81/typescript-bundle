# typescript-bundle

A typescript compiler cli wrapper that allows for modular typescript projects 
to be compiled into a single output script that can be included in web pages 
with a html &lt;script&gt; tag.

## install
```
npm install typescript -g
npm install typescript-bundle -g 
```
## usage
```
tsc-bundle input.ts output.js --globalNamespace mylib
```
## overview

typescript-bundle compiles typescript projects that use import / export into a single 
output script that is directly consumable inside a web page with a html &lt;script&gt; 
tag.

typescript-bundle layers the typescript cli (tsc), and supports most of its
compiler options, including the watch option. typescript-bundle does however intercept the compilers
```--module``` and ```--outFile``` for internal use. 

Additionally, typescript-bundle also allows for configuration via tsconfig.json, meaning existing project configurations 
can be reused with the bundler with very little additional work.

## how does this project work

typescript-bundle layers the typescript cli (tsc), and internally 
sets the compiler options ```--target AMD``` and ```--outFile```. This causes the 
compiler to emit a single AMD module bundle. typescript-bundle wraps this output 
with a small shim that bootstraps the modules within, allowing it to be comsumed 
in page.

## command line options

typescript-bundle's cli works slightly different to tsc. The command line interface is as follows.

```
tsc-bundle [input.ts] [output.js] [...options]
```
note the following:

* typescript-bundle only accept a single input.ts file to compile. This input.ts script must 
be a top level module that imports the other modules used in compilation.  
* The input.ts exports are only available to the html scirpt if the ```--globalNamespace``` option is provided. if
omitted, the bundled module is contained within a function closure.
* only the input.ts exports are publically accessable to the html script. All other modules are
private and inaccesable to the page.
* the output.ts file supplied at the command line is internally rewritten
 to be the ```--outFile``` for the typescript compiler. Passing ```--outFile``` has no effect.
* the ```--module``` option is ignored. typescript-bundle internally defaults to AMD.



