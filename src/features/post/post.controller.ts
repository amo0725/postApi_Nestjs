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
