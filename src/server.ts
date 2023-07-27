require('dotenv').config();
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './graphql/helloResolver';
import { PORT, PRODUCTION } from './constants';
import { PrismaClient } from '@prisma/client';
import { PostResolver } from './graphql/postResolver';
import { UserResolver } from './graphql/userResolver';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import Redis from 'ioredis';

const server = async () => {
  const app = express();
  const prisma = new PrismaClient();

  const redisClient = new Redis(process.env.REDIS_URL as any);
  const RedisStore = connectRedis(session);

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://blogging-site-frontend.herokuapp.com',
      ],
      credentials: true,
    })
  );

  app.use(
    session({
      name: 'sid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      saveUninitialized: false,
      secret: PRODUCTION
        ? (process.env.SESSION_SECRET as string)
        : 'djfalkjfaskjfaldskjfasdlkjfasdlkjfasdlf',
      resave: false,
      proxy: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: false, // Set to 'none' before deploying
        secure: PRODUCTION,
      },
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      emitSchemaFile: true,
    }),
    context: ({ req, res }) => ({ req, res, prisma }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await server.start();
  server.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
};

server().catch((err) => console.log(err));
