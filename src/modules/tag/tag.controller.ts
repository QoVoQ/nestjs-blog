import { TagService } from './tag.service';
import { Controller, Get } from '@nestjs/common';
import { TagRO } from './tag.interface';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAllTags(): Promise<TagRO> {
    const tags = await this.tagService.findAll();
    return { tags: tags.map(i => i.buildRO()) };
  }
}
