import { Module } from '@nestjs/common';
import { CampanhasService } from './campanhas.service';
import { CampanhasController } from './campanhas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampanhaEntity } from './entities/campanha.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampanhaEntity])],
  controllers: [CampanhasController],
  providers: [CampanhasService],
})
export class CampanhasModule {}
