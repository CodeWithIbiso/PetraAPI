import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import mongoose from "mongoose";
import express from "express";
import http from "http";
import cors from "cors";
import pkg from "body-parser";

import typeDefs from "./src/typeDefs.js";
import resolvers from "./src/resolvers.js";
// DATASOURCES
import Spot from "./src/datasources/spot.js";
import User from "./src/datasources/user.js";
// MODELS
import spot from "./src/models/spot.js";
import user from "./src/models/user.js";

const { MONGODB_CONNECTION_STRING } = process.env;

const { json } = pkg;

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use(
  "/graphql",
  cors(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const { cache } = server;
      const token = req.headers.token;
      return {
        cache,
        token,
        // We create new instances of our data sources with each request.
        // We can pass in our server's cache, contextValue, or any other
        // info our data sources require.
        dataSources: {
          Spots: new Spot(spot),
          Users: new User(user),
        },
        token,
      };
    },
  })
);

let dbInstance = null;
(async function () {
  if (dbInstance) return;
  await mongoose
    .connect(MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async (response) => {
      dbInstance = response;
      console.log("🎉 connected to database successfully");

      await new Promise((resolve) =>
        httpServer.listen({ port: 4000 }, resolve)
      );
      console.log(`🚀 Server ready at http://localhost:4000/graphql`);
    })
    .catch((error) => console.error(error));
})();
