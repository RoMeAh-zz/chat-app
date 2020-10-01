import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity("server")
export class Server extends BaseEntity {
    @Field()
    @ObjectIdColumn()
    id: string

    @Field(() => String)
    @Column()
    name: string

    @Field(() => User)
    @Column()
    owner: User

    @Field(() => [User])
    @Column()
    users: User[]
}