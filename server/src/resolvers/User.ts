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
  UseMiddleware,
} from "type-graphql";
import { Context } from "../types/context";
import { hash, verify } from "argon2";
import { GraphQLError } from "../types/error";
import { Auth } from "../middlewares/Auth";

@ObjectType()
class Token {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}

@Resolver()
export class UserResolver {
  @UseMiddleware(Auth)
  @Query(() => User)
  public async me(@Ctx() { userId, prisma }: Context) {
    const user = prisma.user.findUnique({ where: { id: userId! } });

    if (!user) throw new GraphQLError("user", "No user found!");
    return user;
  }

  @UseMiddleware(Auth)
  @Query(() => Boolean)
  public async logout(@Ctx() { userId, prisma }: Context) {
    const user = await prisma.user.findUnique({ where: { id: userId! } });

    if (!user) throw new GraphQLError("user", "No user found!");
    await prisma.user.update({
      where: { id: user.id },
      data: { jwt_version: user.jwt_version + 1 },
    });
    return true;
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
    if (user.bot) throw new GraphQLError("email", "Bots cannot login");
    const correct = await verify(user.password, password);
    if (!correct) throw new GraphQLError("password", "Incorrect password");

    return {
      access_token: sign(
        { id: user.id, bot: false, v: user.jwt_version },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      ),
      refresh_token: sign(
        { id: user.id, bot: false, v: user.jwt_version },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      ),
    };
  }
}
