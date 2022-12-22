#!/usr/bin/env node

const { parse } = require('dotenv')
const fs = require('node:fs/promises')
const { program } = require('commander');

program
  .version('1.0.3', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-e, --envfile <value>', 'Envfile name', '.env')
  .option('-t, --types <value>', 'Name of a file with TS types for environment variables')
  .option('-d, --declare <value>', 'Name of a file with global env type declarations', 'environment.d.ts')
  .option('-w, --watch', 'Watch mode', false)
  .option('-ni, --no-infer-number', 'No infer number type from the env variable')
  .option('-ne, --no-node-env', 'This prevents of using NODE_ENV variable in the types definitions')
  .option('-nd, --no-declare-file', 'This prevents the creation of a file with global env type declarations')
  .parse(process.argv)

const options = program.opts();

const ac = new AbortController();
const { signal } = ac;

function keysToTypes(parsed, spaces = 2) {
  const nodeEnvValue = `'production' | 'development' | 'testing'`
  let types = Object.keys(parsed).reduce((acc, cur) => {
    const type = (options.inferNumber && !isNaN(Number(parsed[cur]))) ? 'number' : 'string'
    return acc + `${' '.repeat(spaces)}${cur}: ${type};\n`
  }, '')
  if (options.nodeEnv) types += `${' '.repeat(spaces)}NODE_ENV: ${nodeEnvValue};\n`
  return types
}

function writeVarsToFile(envFileName, outFile, outFileType) {
  fs.readFile(envFileName).then(file => {
    const parsed = parse(file)
    const envVars = outFileType === 'types' 
      ? `export interface EnvironmentVariables {\n${keysToTypes(parsed)}}\n`
      : `/* eslint-disable prettier/prettier */\ndeclare module 'process' {\n  global {\n    namespace NodeJS {\n      interface ProcessEnv {\n${keysToTypes(parsed, 8)}      }\n    }\n  }\n}\n`
    return fs.writeFile(outFile, new Uint8Array(Buffer.from(envVars)))
  })
    .then(() => console.log('Successful parsing env variables to: ' + outFile))
    .catch(console.error)
}

if (options.types) writeVarsToFile(options.envfile, options.types, 'types');

if (options.declareFile) writeVarsToFile(options.envfile, options.declare, 'declare');

if (options.watch) (async () => {
  console.log('Running in the watching mode');
  try {
    const watcher = fs.watch(options.envfile, { signal });
    for await (const event of watcher) {
      if (event.eventType === 'change') {
        if (options.types) writeVarsToFile(options.envfile, options.types, 'types');
        if (options.declareFile) writeVarsToFile(options.envfile, options.declare, 'declare');
      }
    }
  } catch (err) {
    if (err.name === 'AbortError')
      return;
    throw err;
  }
})();