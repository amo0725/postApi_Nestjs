import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Posts, PostsDocument } from '../../common/models/posts.model';
@Injectable()
export class PostService {
    constructor(
        @InjectModel(Posts.name) private readonly postModel: Model<PostsDocument>
    ) {}

    create(post: any) {
    return this.postModel.create(post);
    }

    findById(id: string) {
        return this.postModel.findById(id);
    }

    updateById(id: string, data: any) {
        return this.postModel.findByIdAndUpdate(id, data, { new: true });
    }

    removeById(id: string) {
        return this.postModel.deleteOne({ _id: id });
    }
}
