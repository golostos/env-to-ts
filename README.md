# Parser of the ENV file to the Typescript type definitions

## Installation:

`$ npm i @golostos/env-to-js`

## Usage:

```
Usage: env-to-ts [OPTIONS]...

Options:
  -v, --version           output the version number
  -e, --envfile <value>   Envfile name (default: ".env")
  -t, --types <value>     Name of a file with TS types for environment variables (default: "EnvironmentVariables.ts")        
  -w, --watch             Watch mode (default: false)
  -ni, --no-infer-number  No infer number type from the env variable
  -ne, --no-node-env      This prevents of using NODE_ENV variable in the types definitions
  -h, --help              display help for command
```

### Input file example (.env):

```
# POSTGRES
POSTGRES_USER=prisma
POSTGRES_PASSWORD=topsecret
POSTGRES_DB=vdc
DB_HOST=localhost
DB_PORT=5432
DB_SCHEMA=public

# Prisma database connection
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB}?schema=${DB_SCHEMA}&sslmode=prefer
```

### Example of the command:

`$ npx env-to-ts -e test/.env -t test/EnvironmentVariables.ts -w`

### Output file example (EnvironmentVariables.ts):

```typescript
export interface EnvironmentVariables {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_SCHEMA: string;
  DATABASE_URL: string;
  NODE_ENV: "production" | "development" | "testing";
}
```