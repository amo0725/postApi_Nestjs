import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';
import { Posts } from './posts.model';

export type CommentsDocument = Comments & Document;

@Schema()
export class Comments {
    @Prop({ type: String, required: true })
    Text: String;

    @Prop({ type: Date, required: true })
    Date: Date;

    @Prop({ type: String, required: true })
    Author: String;

    @Prop({ required: false, type:[{Text:{type: String, required: true}, Date:{type: Date, required: true}, Author:{type: String, required: true}}] })
    Replies: { Text: String; Date: Date; Author: String}[];

    @Prop({ type: SchemaTypes.ObjectId, ref: Posts.name, required:true })
    Post: Types.ObjectId;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);