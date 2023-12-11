import { Field, InputType, ObjectType, Resolver, registerEnumType, Int, Mutation, Arg, Query } from "type-graphql";

import { PrismaClient, Role, Status } from "@prisma/client";
const prisma = new PrismaClient();

registerEnumType(Status, {
    name: "Status",
    description: "Status of the administrator"
})

registerEnumType(Role, {
    name: "Role",
    description: "Role of the administrator"
})

@ObjectType()
class User {
    @Field(() => Int)
    id : Number 

    @Field(() => String)
    fName : string

    @Field(() => String)
    lName : string

    @Field(() => Role)
    role : Role

    @Field(() => Status)
    status : Status
}

@InputType()
class CreateUserInput {

    @Field(() => String)
    fName : string

    @Field(() => String)
    lName : string

    @Field(() => Role)
    role : Role

    @Field(() => Status, {nullable : true})
    status? : Status
}

@Resolver()
export class userResolvers {
    @Mutation(() => User)
    async createAdmin(@Arg("newAdmin", () => CreateUserInput) newAdmin : CreateUserInput) : Promise<User>  {

        const createdAdmin = await prisma.user.create({
            data : newAdmin
        })

        return createdAdmin;
    }

    @Query(() => [User])
    async getUsers() {
        return await prisma.user.findMany()
    }
}