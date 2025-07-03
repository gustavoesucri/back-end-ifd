import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('noticias')
export class NoticiaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 }) // ou type: 'text'
  imagemUrl: string;

  @Column({ type: 'varchar', length: 100 })
  nomeNoticia: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  // Notícia é sem texto resumo
  // @Column({ type: 'text' })
  // textoResumo: string;

  @Column({ type: 'varchar', length: 100 })
  chamada: string;

  @Column('text', { array: true })
  paragrafos: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
