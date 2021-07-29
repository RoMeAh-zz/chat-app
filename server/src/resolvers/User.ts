import { User } from "../types/typegraphql";
import { sign } from "jsonwebtoken";
import {
  Resolver,
  Mutation,
  Ctx,
  Arg,
  Query,
  ObjectType,
  Field,
} from "type-graphql";
import { Context } from "../types/context";
import { hash, verify } from "argon2";
import { GraphQLError } from "../types/error";

@ObjectType()
class Token {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  public async hi() {
    return "hallo";
  }

  @Mutation(() => User)
  public async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("email") email: string,
    @Ctx() { prisma }: Context
  ) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) throw new GraphQLError("email", "User already exists");
    if (username.includes("@"))
      throw new GraphQLError("username", "Cannot contain '@'");
    if (username.length > 3)
      throw new GraphQLError("username", "Must be greater than 3");
    if (!email.includes("@"))
      throw new GraphQLError("email", "Invalid Email address");
    if (password.length < 8)
      throw new GraphQLError("password", "Too small password");

    return await prisma.user.create({
      data: { username, password: await hash(password), email },
    });
  }

  @Mutation(() => Token)
  public async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { prisma }: Context
  ) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new GraphQLError("email", "Invalid Email");
    const correct = await verify(user.password, password);
    if (!correct) throw new GraphQLError("password", "Incorrect password");

    return {
      access_token: sign({ id: user.id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      }),
      refresh_token: sign(
        { id: user.id, v: user.jwt_version },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      ),
    };
  }
}
