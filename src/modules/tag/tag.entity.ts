import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tag')
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: '' })
  name: string;

  buildRO(): string {
    return this.name;
  }
}
