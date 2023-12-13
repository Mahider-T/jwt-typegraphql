import { AuthChecker } from "type-graphql";
import { MyContext } from "./MyContext";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const customAuthChecker: AuthChecker<MyContext> = ({ context }, roles)  => {

    const authorized = context.req.headers["authorization"];
    if(!authorized) throw new Error("No authorization header");

    const token = authorized.split(" ")[1];
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    context.payload = payload as any;
    
    return roles.some((role) => role === payload.role);
}