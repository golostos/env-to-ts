#!/usr/bin/env node

const { parse } = require('dotenv')
const fs = require('node:fs/promises')
const { program } = require('commander');

program
  .version('1.0.2', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-e, --envfile <value>', 'Envfile name', '.env')
  .option('-t, --types <value>', 'Name of a file with TS types for environment variables', 'EnvironmentVariables.ts')
  .option('-w, --watch', 'Watch mode', false)
  .option('-ni, --no-infer-number', 'No infer number type from the env variable')
  .option('-ne, --no-node-env', 'This prevents of using NODE_ENV variable in the types definitions')
  .parse(process.argv)

const options = program.opts();

const ac = new AbortController();
const { signal } = ac;

function writeVarsToFile() {
  const nodeEnvValue = `'production' | 'development' | 'testing'`
  const keysToTypes = (parsed) => {
    let types = Object.keys(parsed).reduce((acc, cur) => {
      const type = (options.inferNumber && !isNaN(Number(parsed[cur]))) ? 'number' : 'string'
      return acc + `  ${cur}: ${type};\n`
    }, '')
    if (options.nodeEnv) types += `  NODE_ENV: ${nodeEnvValue};\n`
    return types
  }
  fs.readFile(options.envfile).then(file => {
    const parsed = parse(file)
    const envVars = `export interface EnvironmentVariables {\n${keysToTypes(parsed)}}\n`
    return fs.writeFile(options.types, new Uint8Array(Buffer.from(envVars)))
  })
  .then(() => console.log('Successful parsing...'))
  .catch(console.error)
}

writeVarsToFile();

if (options.watch) (async () => {
  console.log('Running in the watching mode');
  try {
    const watcher = fs.watch(options.envfile, { signal });
    for await (const event of watcher) {
      if (event.eventType === 'change') {
        writeVarsToFile();
      }
    }
  } catch (err) {
    if (err.name === 'AbortError')
      return;
    throw err;
  }
})();