import { Module } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { ProjetosController } from './projetos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetoEntity } from './entities/projeto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjetoEntity])],
  controllers: [ProjetosController],
  providers: [ProjetosService],
})
export class ProjetosModule {}
