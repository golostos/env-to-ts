/* eslint-disable prettier/prettier */
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        POSTGRES_USER: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DB: string;
        DB_HOST: string;
        DB_PORT: number;
        DB_SCHEMA: string;
        DATABASE_URL: string;
        NODE_ENV: 'production' | 'development' | 'testing';
      }
    }
  }
}
