import { Resolver, Ctx, Arg, Mutation, Query } from 'type-graphql';
import { Context } from '../types/Context';
import argon from 'argon2';
import { User } from './User';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { UserResponse } from './UserResponse';
import { validateRegister } from '../util/validateRegister';
import { validateLogin } from '../util/validateLogin';

@Resolver(User)
export class UserResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: Context) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie('sid');

        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  @Query(() => User, { nullable: true })
  async currentUser(@Ctx() { req, prisma }: Context) {
    if (!req.session.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { req, prisma }: Context
  ) {
    const errors = validateRegister(username, password);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon.hash(password);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
        include: {
          posts: true,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return {
            errors: [
              {
                field: 'username',
                message: 'Username is already taken',
              },
            ],
          };
        }
      }
    }

    req.session.userId = user?.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { req, prisma }: Context
  ) {
    const errors = validateLogin(username, password);

    if (errors) {
      return { errors };
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'User not found',
          },
        ],
      };
    }

    const isPasswordValid = await argon.verify(user.password, password);

    if (!isPasswordValid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password is incorrect',
          },
        ],
      };
    }

    req.session.userId = user.id;
    return { user };
  }
}
