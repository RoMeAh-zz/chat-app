import { User } from "../entity/User";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { hash, verify } from "argon2";
import { Server } from "../entity/Server";
import { Context } from "../types/Context";

@Resolver()
export class UserResolver {
  @Query(() => User)
  async create(
    @Arg("username") username: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<User> {
    password = await hash(password);
    if (await User.findOne({ username, email })) {
      throw new Error(
        "Email Already Exists"
      )
    }
    return await User.create({
        username,
        firstName,
        lastName,
        email,
        password,
      }).save();
  }

  @Query(() => Boolean)
  async delete(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string
  ) {
    const result = (
      await User.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      )
    )
    if(!result) return false;
    if(!(await verify(result.password, password))) {
      return false
    };

    await User.delete(
      usernameOrEmail.includes("@")
    ? { email: usernameOrEmail }
    : { username: usernameOrEmail }
    )
    return true
  }

  @Query(() => Boolean)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: Context
  ) {
    const result = (
      await User.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      )
    )
    if(!result) return false;
    if(!(await verify(result.password, password))) {
      return false
    };

    req.session.user = result;

    return true
  }


  @Query(() => [Server])
  async userOwnedServers(
    @Ctx() { req }: Context
  ): Promise<Server[]> {
    const user = (await User.findOneOrFail({
      email: req.session.user.email,
      username: req.session.user.username
    }));

    const servers = []

    const serverArray = await Server.find()
    for(const server of serverArray) {
      if(server.owner == user) servers.push(server)
    }

    return servers;
  }

  @Query(() => [Server])
  async userServers(
    @Ctx() { req }: Context
  ): Promise<Server[]> {
    const user = (await User.findOneOrFail({
      email: req.session.user.email,
      username: req.session.user.username
    }));
    
    const servers = []

    const serverArray = await Server.find()
    for(const server of serverArray) {
      if(server.users.includes(user)) servers.push(server)
    }

    return servers;
  }
}
