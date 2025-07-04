import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { UpdateParceiroDto } from './dto/update-parceiro.dto';

@Controller('parceiros')
export class ParceirosController {
  constructor(private readonly parceirosService: ParceirosService) {}

  @Post()
  create(@Body() createParceiroDto: CreateParceiroDto) {
    return this.parceirosService.create(createParceiroDto);
  }

  @Get()
  findAll() {
    return this.parceirosService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.parceirosService.findBySlug(slug);
  }

  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parceirosService.findOne(id);
  }

  @Get('buscar')
  async findByName(@Query('nome') nome: string) {
    if (!nome || nome.trim() === '') {
      throw new BadRequestException('Parâmetro de busca "nome" é obrigatório.');
    }
    // Exemplo de busca: GET /parceiros/buscar?nome=tech Isso retornará todos os parceiros cujo nome contenha "tech"

    return this.parceirosService.findByName(nome);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParceiroDto: UpdateParceiroDto,
  ) {
    return this.parceirosService.update(id, updateParceiroDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.parceirosService.delete(id);
  }
}
