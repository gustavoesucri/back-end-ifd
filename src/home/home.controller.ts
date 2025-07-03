import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // Esta rota talvez não seja necessária. Se não for usar, comentar o service respectivo também.
  @Post()
  async create(@Body() createHomeDto: CreateHomeDto) {
    return await this.homeService.create(createHomeDto);
  }

  // Esta rota talvez não seja necessária. Se não for usar, comentar o service respectivo também.
  @Get()
  async findAll() {
    return await this.homeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.homeService.findOne(id);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeDto: UpdateHomeDto,
  ) {
    return await this.homeService.update(id, updateHomeDto);
  }

  // Esta rota talvez não seja necessária. Se não for usar, comentar o service respectivo também.
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.homeService.delete(id);
  }
}
