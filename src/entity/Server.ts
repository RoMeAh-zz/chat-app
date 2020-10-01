import UniqueID from "nodejs-snowflake";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity("server")
export class Server extends BaseEntity {
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Column()
  id: string = String(new UniqueID({ returnNumber: true }).getUniqueID());

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => User)
  @Column()
  owner: User;

  @Field(() => [User])
  @Column()
  users: User[];
}
