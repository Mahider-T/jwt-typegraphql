import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config()

export function createAccessToken(user : User) : string {

    const token = jwt.sign({id : user.id, role : user.role, status : user.status}, process.env.ACCESS_TOKEN_SECRET!, {expiresIn : "15m"});
    return token;
}

export function createRefreshToken(user : User) : string {

    const token = jwt.sign({id : user.id, role : user.role, status : user.status}, process.env.REFRESH_TOKEN_SECRET!, {expiresIn : "1d"});
    return token;
}