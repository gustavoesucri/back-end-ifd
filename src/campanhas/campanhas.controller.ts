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
import { CampanhasService } from './campanhas.service';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { UpdateCampanhaDto } from './dto/update-campanha.dto';

@Controller('campanhas')
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Post()
  create(@Body() createCampanhaDto: CreateCampanhaDto) {
    return this.campanhasService.create(createCampanhaDto);
  }

  @Get()
  findAll() {
    return this.campanhasService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.campanhasService.findBySlug(slug);
  }

  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campanhasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampanhaDto: UpdateCampanhaDto,
  ) {
    return this.campanhasService.update(id, updateCampanhaDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.campanhasService.delete(id);
  }
}
