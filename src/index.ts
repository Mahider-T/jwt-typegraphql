import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { userResolvers } from "./resolvers/userResolvers";

// import cors from "cors";

(async () => {
    const app = express();

    const cors = {
        credentials : true,
        origin : 'https://studio.apollographql.com'
    }

    // app.use(
    //     "/graphql",
    //     cors({
    //       origin: 'https://studio.apollographql.com',
    //       credentials: true,
    //     })
    //   );
    const apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [userResolvers],
            validate: { forbidUnknownValues: false } 
        }),
        context : ({req, res}) => ({req, res})
    })

    await apolloserver.start();
    apolloserver.applyMiddleware({app: app , cors})
    app.listen(3000, () => {
        console.log("Connected on port", 3000 )
    })
})();
