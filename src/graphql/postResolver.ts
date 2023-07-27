import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  Int,
  UseMiddleware,
  FieldResolver,
  Root,
} from 'type-graphql';
import { Context } from '../types/Context';
import { isAuth } from '../middleware/isAuth';
import { validatePost } from '../util/validatePost';
import { PaginatedPosts } from './PaginatedPosts';
import { Post } from './Post';
import { PostResponse } from './PostResponse';

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  bodySnippet(@Root() post: Post) {
    return post.body.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('take', () => Int) take: number,
    @Arg('cursor', { nullable: true }) cursor: string,
    @Ctx() { prisma }: Context
  ) {
    const realTake = Math.min(50, take);
    const realTakePlusOne = realTake + 1;

    let posts = null;
    if (cursor) {
      posts = await prisma.post.findMany({
        take: realTakePlusOne,
        skip: 1,
        cursor: cursor ? { createdAt: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
        },
      });
    } else {
      posts = await prisma.post.findMany({
        take: realTakePlusOne,
        cursor: cursor ? { createdAt: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
        },
      });
    }

    return {
      posts,
      hasMore: posts.length === realTakePlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { prisma }: Context
  ) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return null;
    }

    return post;
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req, prisma }: Context
  ): Promise<PostResponse> {
    const errors = validatePost(title, body);

    if (errors) {
      return { errors };
    }

    const post = await prisma.post.create({
      data: {
        title,
        body,
        authorId: req.session.userId!,
      },
      include: {
        author: true,
      },
    });

    return { post } as PostResponse;
  }

  @Mutation(() => PostResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('postId', () => Int) postId: number,
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req, prisma }: Context
  ) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post || post.authorId !== req.session.userId) {
      return null;
    }

    const errors = validatePost(title, body);

    if (errors) {
      return { errors };
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        body,
      },
    });

    return updatedPost;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { req, prisma }: Context
  ) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return true;
    }

    if (post.authorId === req.session.userId) {
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return true;
    }

    return false;
  }

  @Query(() => [Post])
  @UseMiddleware(isAuth)
  async getPostsByUser(@Ctx() { req, prisma }: Context) {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
      },
    });

    return posts;
  }
}
