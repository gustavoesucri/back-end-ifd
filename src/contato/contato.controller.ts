import { Body, Controller, Post } from '@nestjs/common';
import { ContatoService } from './contato.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { ContatoEntity } from './entities/contato.entity';

@Controller('contato')
export class ContatoController {
  constructor(private readonly contatoService: ContatoService) {}

  @Post()
  async create(
    @Body() createContatoDto: CreateContatoDto,
  ): Promise<ContatoEntity> {
    return this.contatoService.create(createContatoDto);
  }
}
