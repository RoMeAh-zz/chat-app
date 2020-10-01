import "reflect-metadata";
import { config } from "dotenv";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

config();

(async () => {
  const app = express();
  const extension = process.env.FILE_EXTENSION ?? ".ts";

  await createConnection({
    type: "mongodb",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    url: process.env.MONGODB_URL,
    synchronize: true,
    entities: [`${__dirname}/entity/**/*${extension}`],
    name: "default",
  });

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        domain: undefined
      },
      saveUninitialized: false,
      secret: process.env.SECRET ?? "",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [`${__dirname}/resolvers/**/*${extension}`],
      validate: true,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });
  const port = parseInt(process.env.PORT ?? "4000");
  app.listen(port, () => {
    console.log(
      `GraphQL Online at http://localhost:${port}${apolloServer.graphqlPath}`
    );
  });
})();
