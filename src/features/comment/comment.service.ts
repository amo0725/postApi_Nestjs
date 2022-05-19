import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Comments, CommentsDocument } from '../../common/models/comments.model';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comments.name) private readonly commentModel: Model<CommentsDocument>
    ) {}

    create(post: any) {
        return this.commentModel.create(post);
    }

    findById(id: string) {
        return this.commentModel.findById(id);
    }

    updateById(id: string, data: any) {
        return this.commentModel.findByIdAndUpdate(id, data, { new: true });
    }

    removeById(id: string) {
        return this.commentModel.deleteOne({ _id: id });
    }
}
