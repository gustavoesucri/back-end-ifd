import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampanhaDto } from './dto/create-campanha.dto';
import { UpdateCampanhaDto } from './dto/update-campanha.dto';
import { CampanhaEntity } from './entities/campanha.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(CampanhaEntity)
    private readonly campanhaRepository: Repository<CampanhaEntity>,
  ) {}

  async create(createCampanhaDto: CreateCampanhaDto) {
    //Cria a slug a partir do nome da campanha
    const slug = slugify(createCampanhaDto.nomeCampanha, {
      lower: true,
      strict: true, // Se strict: false, ele pode manter alguns caracteres "estranhos" (dependendo da config).
    });

    // Verifica se a campanha com aquele slug já existe.
    const campanhaSlug = await this.campanhaRepository.findOne({
      where: { slug },
    });

    if (campanhaSlug) {
      throw new ConflictException(
        `Campanha de slug '${slug}', nome '${campanhaSlug.nomeCampanha}', já existe no Banco de Dados.`,
      );
    }

    // Se não existe, dá prosseguimento na criação.

    const newCampanha = {
      ...createCampanhaDto,
      slug, // gera o slug automaticamente a partir do nome
    };

    const campanha = this.campanhaRepository.create(newCampanha); // não é async porque ainda não interage com o BD, somente cria o objeto.

    // return this.campanhaRepository.save(campanha);
    try {
      await this.campanhaRepository.save(campanha);
      return {
        message: `Campanha ID ${campanha.id}, SLUG '${campanha.slug}' criada com sucesso.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar criar a Campanha no Banco de Dados.`,
      );
    }
  }

  async findAll() {
    try {
      const campanhas = await this.campanhaRepository.find();
      return campanhas;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao tentar acessar todas as Campanhas no Banco de Dados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const campanha = await this.campanhaRepository.findOne({ where: { id } });

      if (!campanha) {
        throw new NotFoundException(`Campanha com ID ${id} não encontrada.`);
      }

      return campanha;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // deixa passar o erro esperado
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Campanha com ID ${id} no Banco de Dados.`,
      );
    }
  }

  async findBySlug(slug: string) {
    try {
      const campanha = await this.campanhaRepository.findOne({
        where: { slug },
      });

      if (!campanha) {
        throw new NotFoundException(
          `Campanha com slug '${slug}' não encontrada.`,
        );
      }

      return campanha;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Campanha com slug '${slug}' no Banco de Dados.`,
      );
    }
  }

  async update(id: number, updateCampanhaDto: UpdateCampanhaDto) {
    const campanha = await this.campanhaRepository.findOne({ where: { id } });

    if (!campanha) {
      throw new NotFoundException(
        `Campanha ID ${id} não encontrada para atualizar!`,
      );
    }

    // Se o nome foi alterado, gera um novo slug
    let novoSlug = campanha.slug; // mantém o atual, caso nome não seja alterado

    if (updateCampanhaDto.nomeCampanha) {
      novoSlug = slugify(updateCampanhaDto.nomeCampanha, {
        lower: true,
        strict: true,
      });

      const slugExistente = await this.campanhaRepository.findOne({
        where: { slug: novoSlug },
      });

      if (slugExistente && slugExistente.id !== id) {
        throw new ConflictException(
          `Já existe outra Campanha com o SLUG '${novoSlug}' gerado a partir do Novo Nome de Campanha.`,
        );
      }
    }

    const dadosAtualizados = {
      ...updateCampanhaDto,
      slug: novoSlug,
    };

    const campanhaUpdated = this.campanhaRepository.merge(
      campanha,
      dadosAtualizados,
    );

    // return this.campanhaRepository.save(campanhaUpdated);
    try {
      await this.campanhaRepository.save(campanhaUpdated);
      return { message: `Campanha ID ${id} atualizada com sucesso.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar a Campanha ID ${id} no Banco de Dados.`,
      );
    }
  }

  async delete(id: number) {
    try {
      const result = await this.campanhaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Campanha ID ${id} não encontrada ou já removida!`,
        );
      }
      return { message: `Campanha ID ${id} removida com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // mantém o 404
      }
      throw new InternalServerErrorException(
        `Erro ao tentar remover a Campanha ID ${id} no Banco de Dados.`,
      );
    }
  }

  // async remove(id: number) {

  // SE PRECISAR VALIDAR ALGO, USAR O findOne. DO CONTRÁRIO, IR DIRETO PARA O DELETE ao invés de remove.
  // const campanha = await this.campanhaRepository.findOne({
  //   where: { id },
  // });
  // if (!campanha)
  //   throw new NotFoundException(
  //     `Campanha ID ${id} não encontrada ou já removida!`,
  //   );

  // // return this.campanhaRepository.remove(campanha);
  // try {
  //   await this.campanhaRepository.remove(campanha);
  //   return { message: `Campanha ID ${id} removida com sucesso.` };
  // } catch (error) {
  //   throw new InternalServerErrorException(
  //     `Erro ao tentar remover a Campanha ID ${id} no Banco de Dados.`,
  //   );
  // }
  // }
}
