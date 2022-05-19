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
