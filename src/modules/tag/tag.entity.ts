import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('tag')
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: '' })
  @Expose()
  name: string;

  buildRO(): string {
    return this.name;
  }
}
