import { Field, InputType, ObjectType, Resolver } from "type-graphql";

@ObjectType()
class Role {
    ADMIN 
    SUPER_ADMIN
}
enum Status {
    ACTIVE,
    INACTIVE
}
@ObjectType()
class User {
    @Field()
    fname : String
    @Field()
    lname : String
    @Field()
    role : Role
}

@InputType()
class createUserInput {
    fname : String
    lname : String
    role? : 
}




@Resolver()
export class userResolvers {

}