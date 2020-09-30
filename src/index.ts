import "reflect-metadata";
import { config } from "dotenv";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

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
