import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Comments, CommentsSchema } from '../../common/models/comments.model';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema }
    ])
  ],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
