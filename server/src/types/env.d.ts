declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    PORT: string;
  }
}