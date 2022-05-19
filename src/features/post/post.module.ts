import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Posts, PostsSchema } from '../../common/models/posts.model';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema }
    ])
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
