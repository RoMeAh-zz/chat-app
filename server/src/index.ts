import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { relationResolvers } from "./types/typegraphql";
import { UserResolver } from "./resolvers/User";

(async () => {
  const app = express();
  const prisma = new PrismaClient();
  await prisma.$connect();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [...relationResolvers, UserResolver],
    }),
    context: ({ req, res }) => ({ req, res, prisma }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(parseInt(process.env.PORT), () => console.log("Server started!"));
})();
