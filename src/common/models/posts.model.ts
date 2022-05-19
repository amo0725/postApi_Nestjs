import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostsDocument = Posts & Document;

@Schema()
export class Posts {
    @Prop({ required: true })
    Text: String;

    @Prop({ required: true })
    Date: Date;

    @Prop({ required: true })
    Author: String;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);