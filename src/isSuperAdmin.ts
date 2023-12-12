import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./MyContext";
import jwt, { JwtPayload } from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();


export const isSuperAdmin : MiddlewareFn<MyContext> =async ({ context }, next) => {

    const authorization = context.req.headers["authorization"];
    if(!authorization) throw new Error("Not Authorized my dude");

    try {

        const token = authorization.split(" ")[1];
        const payload  = await jwt.verify(token , process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
        if(!payload) throw new Error("No payload");
        
        if(payload?.role !== "SUPER_ADMIN") throw new Error("Only super admins allowed") 

    }catch(error) {
        console.log(error);
        throw new Error("Not authorized");
    }

    return next();
} 
