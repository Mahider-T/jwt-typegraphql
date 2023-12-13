import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { userResolvers } from "./resolvers/userResolvers";
import { customAuthChecker } from "./customAuth";

// import cors from "cors";

(async () => {
    const app = express();

    const cors = {
        credentials : true,
        origin : 'https://studio.apollographql.com'
    }

    const apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [userResolvers],
            authChecker :customAuthChecker,
            validate: { forbidUnknownValues: false } 
        }),
        context : ({req, res}) => ({req, res}),
    })

    await apolloserver.start();
    apolloserver.applyMiddleware({app: app , cors})
    app.listen(3000, () => {
        console.log("Running on localhost:3000/graphql");
    })
})();
