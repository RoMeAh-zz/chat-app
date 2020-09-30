import { User } from "../entity/User";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class UserQueryReturnType {
  @Field({ nullable: true })
  user?: User;

  @Field({ nullable: true })
  error?: string;
}
