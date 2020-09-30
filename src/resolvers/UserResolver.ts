import { User } from "../entity/User";
import { Arg, Query, Resolver } from "type-graphql";
import { hash, verify } from "argon2";
import { UserQueryReturnType } from "../types/UserQueryReturnType";

@Resolver()
export class UserResolver {
  @Query(() => UserQueryReturnType)
  async create(
    @Arg("username") username: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserQueryReturnType> {
    password = await hash(password);
    if (await User.findOne({ username, email })) {
      return {
        error: "Email Already Exists",
      };
    }
    return {
      user: await User.create({
        username,
        firstName,
        lastName,
        email,
        password,
      }).save(),
    };
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
}
