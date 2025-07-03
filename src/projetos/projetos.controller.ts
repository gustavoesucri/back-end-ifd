import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';

@Controller('projetos')
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  @Post()
  create(@Body() createProjetoDto: CreateProjetoDto) {
    return this.projetosService.create(createProjetoDto);
  }

  @Get()
  findAll() {
    return this.projetosService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.projetosService.findBySlug(slug);
  }

  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projetosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjetoDto: UpdateProjetoDto,
  ) {
    return this.projetosService.update(id, updateProjetoDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.projetosService.delete(id);
  }
}
