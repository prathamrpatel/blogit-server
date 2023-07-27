import { ObjectType, Field } from 'type-graphql';
import { Post } from './Post';

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}
