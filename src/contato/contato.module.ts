import { Module } from '@nestjs/common';
import { ContatoService } from './contato.service';
import { ContatoController } from './contato.controller';
import { ContatoEntity } from './entities/contato.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContatoEntity])],
  providers: [ContatoService],
  controllers: [ContatoController],
})
export class ContatoModule {}
