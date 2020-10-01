import UniqueID from "nodejs-snowflake";
import { Field, ObjectType } from "type-graphql";
import { Entity, Column, BaseEntity, ObjectIdColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Column()
  id: string = String(new UniqueID({ returnNumber: true }).getUniqueID());

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  createdAt: Date = new Date();

  @Field()
  @Column()
  lastUpdatedAt: Date = new Date();

  @Field()
  @Column()
  lastLoggedInAt: Date = new Date();
}
