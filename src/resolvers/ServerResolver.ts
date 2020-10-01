import { Server } from "../entity/Server";
import { User } from "../entity/User";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../types/Context";


@Resolver()
export class ServerResolver {
    @Query(() => Server)
    async createServer(
      @Arg("usernameOrEmail") name: string,
      @Ctx() { req }: Context
    ): Promise<Server> {
      const owner = (await User.findOneOrFail({
        email: req.session.user.email,
        username: req.session.user.username
      }));
      const server = await Server.create({ name, owner, users: [owner] }).save()
      return server;
    }
}