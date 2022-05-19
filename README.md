# ***Post & Comment API***

建立一個擁有基本貼文及留言功能的API


## 初步功能需求
1. 使用者可以在app中`貼文 (post)`
2. 使用者可以在貼文底下`留言`, 或是留言別的使用者的`留言 (comment)`
3. 取得貼文`留言`最多的10筆貼文
4. `新增/修改/刪除` 貼文
5. `新增/修改/刪除` 留言

## 實作步驟

### 第一步 `MongoDB`的結構
首先，我會創建一個名為`posts`的`collection`，
接下來再想想`posts`內部資料的結構

#### `posts`的資料結構
```
    {
        _id : ObjectId('...') ,
        Text : { type: String, required: true } ,
        Date : { type: Date, required: true } ,
        Author : { type: String, required: true }
    }
```
#### 如下圖
![](https://i.imgur.com/MIoDKmv.png)


再來，我會創建另一個名為`comments`的`collection`，
一樣來想一下`comments`內部資料的結構

#### `comments`的資料結構

```
    {
        _id : ObjectId('...') ,
        Post : ObjectId('...') , //ref to posts
        Text : { type: String, required: true } ,
        Date : { type: Date, required: true } ,
        Author : { type: String, required: true } ,
        Replies : [{ 
            _id : ObjectId('...') ,
            Text : { type: String, required: true } ,
            Date : { type: Date, required: true } ,
            Author : { type: String, required: true } ,
        }]
    }
```

#### 如下圖
![](https://i.imgur.com/nwn8Hsz.png)



最後，我們需要一個`aggregations`來取得`留言`最多的10筆貼文資料

#### `aggregations` for `Nodejs`
```
[
  {
    '$lookup': {
      'from': 'comments', 
      'localField': '_id', 
      'foreignField': 'Post', 
      'as': 'Comments'
    }
  }, {
    '$project': {
      'Text': 1, 
      'Author': 1, 
      'Comments': 1, 
      'Comments_Size': {
        '$size': '$Comments'
      }
    }
  }, {
    '$unwind': {
      'path': '$Comments'
    }
  }, {
    '$project': {
      'Text': 1, 
      'Author': 1, 
      'Comments': 1, 
      'Comments_Size': 1, 
      'Replies_Size': {
        '$size': '$Comments.Replies'
      }
    }
  }, {
    '$project': {
      '_id': 1, 
      'Text': 1, 
      'Author': 1, 
      'Comments': 1, 
      'Comments_Count': {
        '$sum': [
          '$Comments_Size', '$Replies_Size'
        ]
      }
    }
  }, {
    '$group': {
      '_id': '$_id', 
      'Comments': {
        '$push': '$$ROOT'
      }, 
      'totalSaleAmount': {
        '$sum': '$Comments_Count'
      }
    }
  }, {
    '$sort': {
      'totalSaleAmount': -1
    }
  }, {
    '$limit': 10
  }
]
```

### 第二步 安裝 `NestCLI`



#### 透過 `npm` 進行全域安裝
```
$ npm install -g @nestjs/cli
```
安裝完就可以在終端機使用 `NestCLI`

![](https://i.imgur.com/E5c7EDV.png)



### 第三步 建置 `post-api`

#### 透過 `new` 指令來快速建立 App：

```
$ nest new post-api
```
這裡我選擇使用`npm`

![](https://i.imgur.com/AYYa01r.png)

接下來執行看看

```
$ cd post-api
$ npm start
```

![](https://i.imgur.com/EAHFGv0.png)

### 第四步 `mongoose` 環境建置

#### 安裝 `mongoose`

前面使用`npm`，所以這裡使用`npm install`
```
$ npm install @nestjs/mongoose mongoose
```

#### 連線 `MongoDB` 前置作業

首先，在 `post-api` 資料夾下新增`.env`

```
MONGO_USERNAME=<username>
MONGO_PASSWORD=<password>
MONGO_RESOURCE=<DB_URL>
```

接下來，在 `src/config` 資料夾下新增 `mongo.config.ts`

```
import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => {
  const username = process.env.MONGO_USERNAME;
  const password = encodeURIComponent(process.env.MONGO_PASSWORD);
  const resource = process.env.MONGO_RESOURCE;
  const uri = `mongodb+srv://${username}:${password}@${resource}?retryWrites=true&w=majority`;
  return { username, password, resource, uri };
});
```

> 這裡可能會找不到`@nestjs/config`模組
> 一樣使用`npm`來安裝
> `$ npm install @nestjs/config`

#### `app.module.ts`

引入 `ConfigModule`, `ConfigService` 及 `MongooseModule`

```
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './features/post/post.module';

import MongoConfigFactory from './config/mongo.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [MongoConfigFactory]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri')
      })
    }),
    PostModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

到這裡應該就可以成功與`MongoDB`連線

![](https://i.imgur.com/BXGH5mC.png)

### 第五步 實作及使用`Model`

#### 建立及產生 `Schema`

在`src/common/models`下，建立`posts.model.ts`和`comments.model.ts`

#### `posts.model.ts`
```
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
```

#### `comments.model.ts`
```
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

    @Prop({ required: false, 
            type:[{
                    Text:{type: String, required: true}, 
                    Date:{type: Date, required: true},
                    Author:{type: String, required: true}
                }]
        })
        
    Replies: { Text: String; Date: Date; Author: String}[];

    @Prop({ type: SchemaTypes.ObjectId, ref: Posts.name, required:true })
    Post: Types.ObjectId;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
```

#### 實作`Model`

使用`NestCLI`建立`PostModule`, `PostController`及`PostService`

```
$ nest generate module features/post
$ nest generate controller features/post
$ nest generate service features/post
```

使用`NestCLI`建立`CommentModule`, `CommentController`及`CommentService`

```
$ nest generate module features/comment
$ nest generate controller features/comment
$ nest generate service features/comment
```

#### `post.module.ts`
引入`MongooseModule`，並使用`Posts`的`Model`
```
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
```

#### `post.service.ts`
注入`PostModel`到`PostService`的`@InjectModel`
```
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Posts, PostsDocument } from '../../common/models/posts.model';
@Injectable()
export class PostService {
    constructor(
        @InjectModel(Posts.name) private readonly postModel: Model<PostsDocument>
    ) {}
}
```

#### `comment.module.ts`
引入`MongooseModule`，並使用`Comment`的`Model`
```
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Comments, CommentsSchema } from '../../common/models/comments.models';
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
```
#### `comment.service.ts`
注入`CommentModel`到`CommentService`的`@InjectModel`
```
import { Injectable } from '@nestjs注入Model/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Comments, CommentsDocument } from '../../common/models/comments.model';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comments.name) private readonly commentModel: Model<CommentsDocument>
    ) {}
}
```

### 第六步 實作 `API`

#### 實作`CRUD`
* 新增 `create`, `findById`, `updateById`, `removeById`，並呼叫`Model`來達到實現`CRUD`的目的
#### `post.service.ts`
```
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
```

#### `comment.service.ts`
```
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
```

* 新增 `@POST`, `@GET`, `@Patch`, `@Delete`實現`CRUD`，並且回傳執行後的`document`結果
#### `post.controller.ts`
```
import { Body, Controller, Post, Get, Param, Patch, Delete} from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) {}

    @Post()
    create(@Body() body: any) {
        return this.postService.create(body);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.postService.findById(id);
    }
    
    @Patch(':id')
    updateById(
        @Param('id') id: string,
        @Body() body: any
    ) {
        return this.postService.updateById(id, body);
    }

    @Delete(':id')
    removeById(@Param('id') id: string) {
        return this.postService.removeById(id);
    }
}
```
#### `comment.controller.ts`
```
import { Body, Controller, Post, Get, Param, Patch, Delete} from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
    constructor(
        private readonly commentService: CommentService
    ) {}

    @Post()
    create(@Body() body: any) {
        return this.commentService.create(body);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.commentService.findById(id);
    }
    
    @Patch(':id')
    updateById(
        @Param('id') id: string,
        @Body() body: any
    ) {
        return this.commentService.updateById(id, body);
    }

    @Delete(':id')
    removeById(@Param('id') id: string) {
        return this.commentService.removeById(id);
    }
}
```

### 第七步 測試 `API`

#### 使用`Postman`進行測試

* #### `新增(Create)`![](https://i.imgur.com/0F1IMN6.png)![](https://i.imgur.com/jEGvyiT.png)


* #### `讀取(Read)`![](https://i.imgur.com/aolOAJV.png)![](https://i.imgur.com/NzxBNVg.png)


* #### `更新(Update)`![](https://i.imgur.com/81q3sv1.png)![](https://i.imgur.com/hYBD2C3.png)


* #### `刪除(Delete)`![](https://i.imgur.com/28tm5wa.png)![](https://i.imgur.com/U8uQyiH.png)



# **結束**