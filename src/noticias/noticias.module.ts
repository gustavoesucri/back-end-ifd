import { Module } from '@nestjs/common';
import { NoticiasService } from './noticias.service';
import { NoticiasController } from './noticias.controller';
import { NoticiaEntity } from './entities/noticia.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([NoticiaEntity])],
  controllers: [NoticiasController],
  providers: [NoticiasService],
})
export class NoticiasModule {}
