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
    if(!req.session.user) throw new Error("Not Logged In!")
    const owner = await User.findOne({
      email: req.session.user.email,
      username: req.session.user.username,
    })
    
    if(!owner) {
      throw new Error("Not Logged in")
    };

    owner.lastUpdatedAt = new Date();
    owner.save();

    const server = await Server.create({ name, owner, users: [owner] }).save();
    return server;
  }
}
