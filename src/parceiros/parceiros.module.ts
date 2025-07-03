import { Module } from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { ParceirosController } from './parceiros.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParceiroEntity } from './entities/parceiro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParceiroEntity])],
  controllers: [ParceirosController],
  providers: [ParceirosService],
})
export class ParceirosModule {}
