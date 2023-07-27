import { Field, Int, ObjectType } from 'type-graphql';
import { Post } from './Post';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  password: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Post])
  posts: Post[];
}
