import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeEntity } from './entities/home.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomeEntity)
    private readonly homeRepository: Repository<HomeEntity>,
  ) {}

  async create(createHomeDto: CreateHomeDto) {
    const newHome = {
      ...createHomeDto,
    };
    const home = this.homeRepository.create(newHome); // não é async porque ainda não interage com o BD, somente cria o objeto.

    // return this.homeRepository.save(home);
    try {
      await this.homeRepository.save(home);
      return { message: `Texto Home ID ${home.id} criado com sucesso.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar criar o texto Home no Banco de Dados.`,
      );
    }
  }

  async findAll() {
    try {
      const home = await this.homeRepository.find();
      return home;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao tentar acessar todos os textos da Home no Banco de Dados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const home = await this.homeRepository.findOne({
        where: { id },
      });
      // console.log(home)
      if (!home) {
        throw new NotFoundException(`Texto home ID ${id} não encontrado!`);
      }
      return home.paragrafos; // Atenção! Retorna somente os paragrafos. Isso interfere no front-end.
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // console.error("Erro inesperado:", error); // Descomentar para verificar o erro.
      throw new InternalServerErrorException(
        `Erro ao tentar acessar o texto Home ID ${id} no Banco de Dados.`,
      );
    }
  }

  async update(id: number, updateHomeDto: UpdateHomeDto) {
    const home = await this.homeRepository.findOne({
      where: { id },
    });
    if (!home)
      throw new NotFoundException(
        `Texto Home ID ${id} não encontrado para atualizar!`,
      );
    const homeUpdated = this.homeRepository.merge(home, updateHomeDto);

    // return this.homeRepository.save(homeUpdated);
    try {
      await this.homeRepository.save(homeUpdated);
      return { message: `Texto Home ID ${id} atualizado com sucesso.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar o texto Home ID ${id} no Banco de Dados.`,
      );
    }
  }

  async delete(id: number) {
    try {
      const result = await this.homeRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Texto Home ID ${id} não encontrado ou já removido!`,
        );
      }
      return { message: `Texto Home ID ${id} removido com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // mantém o erro 404
      }
      throw new InternalServerErrorException(
        `Erro ao tentar remover o texto Home ID ${id} no Banco de Dados.`,
      );
    }
  }

  // async remove(id: number) {

  //SE PRECISAR VALIDAR ALGO, USAR O findOne. DO CONTRÁRIO, IR DIRETO PARA O DELETE ao invés de remove.
  // const home = await this.homeRepository.findOne({
  //   where: { id },
  // });
  // if (!home)
  //   throw new NotFoundException(
  //     `Texto Home ID ${id} não encontrado ou já removido!`,
  //   );

  //     // return this.homeRepository.remove(home);
  //     try {
  //       await this.homeRepository.remove(home);
  //       return { message: `Texto Home ID ${id} removido com sucesso.` };
  //     } catch (error) {
  //       throw new InternalServerErrorException(
  //         `Erro ao tentar remover o texto Home ID ${id} no Banco de Dados.`,
  //       );
  //     }
  //   }
}
