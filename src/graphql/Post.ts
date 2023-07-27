import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  body: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  author: User;

  @Field(() => Int)
  authorId: number;
}
