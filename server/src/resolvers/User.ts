import { User } from "../types/typegraphql";
import { Resolver, Mutation, Ctx, Arg } from "type-graphql";
import { Context } from "../types/context";
import { hash } from "argon2";

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    public async register(
        @Arg("username") username: string,
        @Arg("password") password: string,
        @Arg("email") email: string,
        @Ctx() { prisma }: Context
    ) {
        return await prisma.user.create({
            data: { username, password: await hash(password), email }
        })
    }
}