import { MiddlewareFn } from 'type-graphql';
import { Context } from '../types/Context';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('Not authenticated');
  }

  return next();
};
