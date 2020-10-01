import { User } from "../entity/User";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { hash, verify } from "argon2";
import { Server } from "../entity/Server";
import { Context } from "../types/Context";
import { CreateUser } from "../input/CreateUser";

@Resolver()
export class UserResolver {
  @Query(() => User)
  async createUser(
    @Arg("options", () => CreateUser) options: CreateUser
  ): Promise<User> {
    options.password = await hash(options.password);
    if (await User.findOne({ email: options.email })) {
      throw new Error("Email Already Exists");
    }
    return await User.create(options).save();
  }

  @Query(() => Boolean)
  async delete(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string
  ) {
    const result = await User.findOne(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!result) return false;
    if (!(await verify(result.password, password))) {
      return false;
    }

    await User.delete(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    return true;
  }

  @Query(() => Boolean)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: Context
  ) {
    const result = await User.findOne(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!result) return false;
    if (!(await verify(result.password, password))) {
      return false;
    }

    result.lastLoggedInAt = new Date();
    await result.save();
    req.session.user = result;

    return true;
  }

  @Query(() => [Server])
  async userOwnedServers(@Ctx() { req }: Context): Promise<Server[]> {
    if(!req.session.user) throw new Error("Not Logged In!")
    const user = await User.findOne({
      email: req.session.user.email,
      username: req.session.user.username,
    });

    if(!user) throw new Error("Not Logged In")

    const servers = [];

    const serverArray = await Server.find();
    for (const server of serverArray) {
      if (server.owner == user) servers.push(server);
    }

    return servers;
  }

  @Query(() => [Server])
  async userServers(@Ctx() { req }: Context): Promise<Server[]> {
    if(!req.session.user) throw new Error("Not Logged In!")
    const user = await User.findOne({
      email: req.session.user.email,
      username: req.session.user.username,
    });

    if(!user) throw new Error("Not Logged In")

    const servers = [];

    const serverArray = await Server.find();
    for (const server of serverArray) {
      if (server.users.includes(user)) servers.push(server);
    }

    return servers;
  }

  @Query(() => Boolean)
  async joinServer(
    @Arg("id", () => String) id: string,
    @Ctx() { req }: Context
  ) {
    if(!req.session.user) return false;

    const user = await User.findOne(req.session.user);

    if(!user) return false;
    user.lastUpdatedAt = new Date();
    await user.save();

    const server = await Server.findOne({ id });
    if(!server) return false;

    server.users = [...server.users, user];
    await server.save()

    return true;
  }
}
