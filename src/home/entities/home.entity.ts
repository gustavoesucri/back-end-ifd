import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { ObjectId } from 'mongodb';

@Entity('home')
export class HomeEntity {
  // @ObjectIdColumn()
  @PrimaryGeneratedColumn()
  id: number;
  // _id: ObjectId;

  @Column('text', { array: true })
  paragrafos: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
