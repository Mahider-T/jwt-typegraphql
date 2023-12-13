import { Field, InputType, ObjectType, Resolver, registerEnumType, Int, Mutation, Arg, Query, Ctx, UseMiddleware, Authorized } from "type-graphql";

import { hash, compare } from "bcrypt";

import { PrismaClient, Role, Status } from "@prisma/client";

import { MyContext } from "src/MyContext";

import { createAccessToken, createRefreshToken } from "../auth";

import { isAuth } from "../isAuth";



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

    @Field()
    username : string

    @Field()
    password : string
}

@InputType()
class CreateUserInput {

    @Field(() => String)
    fName : string

    @Field(() => String)
    lName : string

    @Field(() => Role)
    role : Role

    @Field(() => Status)
    status : Status

    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class LoginResponse {
    @Field()
    token : string
}

@Resolver()
export class userResolvers {

    @Mutation(() => User)
    async createAdmin(@Arg("newAdmin", () => CreateUserInput) newAdmin : CreateUserInput) : Promise<User>  {
        try{
            const hashedPass = await hash(newAdmin.password, 10);
            const updatedAdmin = { ...newAdmin, password : hashedPass};
    
            const createdAdmin = await prisma.user.create({
                data : updatedAdmin
            })
    
            return createdAdmin;
        }catch(error){
            console.log(error)
            return error.message
        }        
    }


    //Role based authentication using custom auth checker
    @Query()
    @Authorized(["SUPER_ADMIN"])
    superAdminQuery() : string {
        return `Just got accessed by a SUPER_ADMIN`;
    }

    //Use middleware to authenticate a user and set context to be used in query
    @Query()
    @UseMiddleware(isAuth)
    middlewareQuery(@Ctx() context : MyContext) : string {
        return `Hi ${context.payload!.role}`
    }


    @Query(() => [User])
    async getUsers() {
        return await prisma.user.findMany();
    }

    @Query(() => LoginResponse  )
    async login(@Arg("username", () => String) username : string,
                @Arg("password", () => String) password : string,
                @Ctx() {res} : MyContext) : Promise<LoginResponse> {
        
        try{

            const userExists = await prisma.user.findUnique({
                where : {username}
            })
            if(!userExists) throw new Error("Authentication failed")

            const verify = await compare(password, userExists.password)
            if(!verify) throw new Error("Authentication failed")

            if(!process.env.REFRESH_TOKEN_SECRET || !process.env.ACCESS_TOKEN_SECRET) {
                throw new Error("Jwt secret can not be undefined");
            }
            const refreshToken = createRefreshToken(userExists);

            res.cookie( "theToken", refreshToken, {httpOnly:true} )

            return {token : createAccessToken(userExists)}

        }catch(error) {
            console.log(error);
            return error.message;
        }
    } 
    
}
