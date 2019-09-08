import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './tag.entity';
import { Repository } from 'typeorm';

export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async findAll() {
    return this.tagRepository.find();
  }

  async findTagByName(name: string) {
    return this.tagRepository.findOneOrFail({ name });
  }

  async saveTags(tags: string[]) {
    return Promise.all(tags.map(t => this.save(t)));
  }

  async save(tag: string) {
    const tagExist = await this.tagRepository.findOne({ name: tag });

    if (tagExist instanceof TagEntity) {
      return Promise.resolve(tagExist);
    }
    return this.tagRepository.save({ name: tag });
  }
}
