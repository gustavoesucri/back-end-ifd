import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Assunto } from '../enums/assunto.enum';

@Entity('contato')
export class ContatoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: Assunto })
  subject: Assunto;

  // Campo opcional, salva string vazia se vier null
  @Column({ default: '' })
  customSubject: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
