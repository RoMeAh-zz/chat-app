import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { relationResolvers } from "./types/typegraphql";
import { UserResolver } from "./resolvers/User";
import { sign, verify } from "jsonwebtoken";
import { Payload } from "./types/JwtPayloads";

(async () => {
  const app = express();
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.get("/refresh_token", async (req, res) => {
    const { authorization } = req.headers as NodeJS.Dict<string>;
    if (!authorization)
      return res.send({ ok: false, error: "No refresh token provided" });

    const [type, refresh] = authorization.split(" ");

    try {
      const { bot, id, v } = verify(
        refresh,
        process.env.JWT_REFRESH_TOKEN_SECRET
      ) as Payload;

      if (type !== "bearer" && bot)
        return res.send({ ok: false, error: "User agent only" });

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.send({ ok: false, error: "No user found" });

      if (v !== user.jwt_version)
        return res.send({ ok: false, error: "Invalid refresh token" });

      return res.send({
        ok: true,
        access_token: sign(
          { id, bot, v },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15m",
          }
        ),
        refresh_token: sign(
          { id, bot, v },
          process.env.JWT_REFRESH_TOKEN_SECRET,
          {
            expiresIn: "7d",
          }
        ),
      });
    } catch {
      return res.send({ ok: false, error: "Invalid refresh token" });
    }
  });

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [...relationResolvers, UserResolver],
    }),
    context: ({ req, res }) => ({ req, res, prisma, userId: undefined }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(parseInt(process.env.PORT), () => console.log("Server started!"));
})();
