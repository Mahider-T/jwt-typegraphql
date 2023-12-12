import { Field, InputType, ObjectType, Resolver, registerEnumType, Int, Mutation, Arg, Query, Ctx } from "type-graphql";

import { hash, compare } from "bcrypt";

import { PrismaClient, Role, Status } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MyContext } from "src/MyContext";
dotenv.config();

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

function generateToken(user : User, secret : string) : string {

    if(!secret) throw new Error("Secret can not be empty");
    
    const token = jwt.sign({role : user.role, status : user.status}, secret, {expiresIn : "15m"})

    return token;
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

    @Query(() => [User])
    async getUsers() {
        return await prisma.user.findMany()
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
            const refreshToken = generateToken(userExists, process.env.REFRESH_TOKEN_SECRET);

            res.cookie( "theToken", refreshToken, {httpOnly:true} )

            return {token : generateToken(userExists, process.env.ACCESS_TOKEN_SECRET)}

        }catch(error) {
            console.log(error);
            return error.message;
        }
    } 
    
}
