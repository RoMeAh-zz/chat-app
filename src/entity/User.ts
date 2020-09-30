import { Field, ObjectType } from "type-graphql";
import { Entity, Column, BaseEntity, ObjectIdColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @ObjectIdColumn()
  id: string;

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

  @Field()
  @Column()
  password: string;
}
