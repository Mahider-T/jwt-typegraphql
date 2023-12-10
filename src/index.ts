import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { userResolvers } from "./resolvers/userResolvers";

async () => {
    const app = express();

    const apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [userResolvers]
        }),
        context : ({req, res}) => ({req, res})
    })

    await apolloserver.start();
    apolloserver.applyMiddleware({app: app as express.Application, cors: true})
    app.listen(3000, () => {
        console.log("Connected on port", 3000 )
    })
}
