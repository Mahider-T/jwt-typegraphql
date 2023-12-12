
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./MyContext";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();


export const isAuth : MiddlewareFn<MyContext> =({ context }, next) => {

    const authorization = context.req.headers["authorization"];
    if(!authorization) throw new Error("Not Authorized my dude");

    try {

        const token = authorization.split(" ")[1];
        const payload = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET!);
        console.log(payload);
        context.payload = payload as any;

    }catch(error) {
        
        throw new Error("Not Authorized");
        console.log(error);
    }

    return next();
} 

