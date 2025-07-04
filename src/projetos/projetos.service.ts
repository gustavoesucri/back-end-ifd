import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';
import { ProjetoEntity } from './entities/projeto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import slugify from 'slugify';

@Injectable()
export class ProjetosService {
  constructor(
    @InjectRepository(ProjetoEntity)
    private readonly projetoRepository: Repository<ProjetoEntity>,
  ) {}

  async create(createProjetoDto: CreateProjetoDto) {
    //Cria a slug a partir do nome do projeto
    const slug = slugify(createProjetoDto.nomeProjeto, {
      lower: true,
      strict: true, // Se strict: false, ele pode manter alguns caracteres "estranhos" (dependendo da config).
    });

    // Verifica se o projeto com aquele slug já existe.
    const projetoSlug = await this.projetoRepository.findOne({
      where: { slug },
    });

    if (projetoSlug) {
      throw new ConflictException(
        `Projeto de slug '${slug}', nome '${projetoSlug.nomeProjeto}', já existe no Banco de Dados.`,
      );
    }

    // Se não existe, dá prosseguimento na criação.

    const newProjeto = {
      ...createProjetoDto,
      slug, // gera o slug automaticamente a partir do nome
    };

    const projeto = this.projetoRepository.create(newProjeto); // não é async porque ainda não interage com o BD, somente cria o objeto.

    // return this.projetoRepository.save(projeto);
    try {
      await this.projetoRepository.save(projeto);
      return {
        message: `Projeto ID ${projeto.id}, SLUG '${projeto.slug}' criado com sucesso.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar criar o Projeto no Banco de Dados.`,
      );
    }
  }

  async findAll() {
    try {
      const projetos = await this.projetoRepository.find();
      return projetos;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao tentar acessar todos os Projetos no Banco de Dados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const projeto = await this.projetoRepository.findOne({ where: { id } });

      if (!projeto) {
        throw new NotFoundException(`Projeto com ID ${id} não encontrado.`);
      }

      return projeto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // deixa passar o erro esperado
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Projeto com ID ${id} no Banco de Dados.`,
      );
    }
  }

  async findByName(name: string) {
    try {
      const projetos = await this.projetoRepository.find({
        where: { nomeProjeto: ILike(`%${name}%`) }, // Usando ILike, pois Like é case-sensitive no PostgreSQL.
      });

      if (projetos.length === 0) {
        throw new NotFoundException(
          `Nenhum projeto encontrado com nome semelhante a '${name}'.`,
        );
      }

      return projetos;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Erro ao buscar Projetos com nome semelhante a '${name}'.`,
      );
    }
  }

  async findBySlug(slug: string) {
    try {
      const projeto = await this.projetoRepository.findOne({ where: { slug } });

      if (!projeto) {
        throw new NotFoundException(
          `Projeto com slug '${slug}' não encontrado.`,
        );
      }

      return projeto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Projeto com slug '${slug}' no Banco de Dados.`,
      );
    }
  }

  async update(id: number, updateProjetoDto: UpdateProjetoDto) {
    const projeto = await this.projetoRepository.findOne({ where: { id } });

    if (!projeto) {
      throw new NotFoundException(
        `Projeto ID ${id} não encontrado para atualizar!`,
      );
    }

    // Se o nome foi alterado, gera um novo slug
    let novoSlug = projeto.slug; // mantém o atual, caso nome não seja alterado

    if (updateProjetoDto.nomeProjeto) {
      novoSlug = slugify(updateProjetoDto.nomeProjeto, {
        lower: true,
        strict: true,
      });

      const slugExistente = await this.projetoRepository.findOne({
        where: { slug: novoSlug },
      });

      if (slugExistente && slugExistente.id !== id) {
        throw new ConflictException(
          `Já existe outro Projeto com o SLUG '${novoSlug}' gerado a partir do Novo Nome de Projeto.`,
        );
      }
    }

    const dadosAtualizados = {
      ...updateProjetoDto,
      slug: novoSlug,
    };

    const projetoUpdated = this.projetoRepository.merge(
      projeto,
      dadosAtualizados,
    );

    // return this.projetoRepository.save(projetoUpdated);
    try {
      await this.projetoRepository.save(projetoUpdated);
      return { message: `Projeto ID ${id} atualizado com sucesso.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar o Projeto ID ${id} no Banco de Dados.`,
      );
    }
  }

  async delete(id: number) {
    try {
      const result = await this.projetoRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Projeto ID ${id} não encontrado ou já removido!`,
        );
      }
      return { message: `Projeto ID ${id} removido com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // mantém o 404
      }
      throw new InternalServerErrorException(
        `Erro ao tentar remover o Projeto ID ${id} no Banco de Dados.`,
      );
    }
  }

  // async remove(id: number) {

  // SE PRECISAR VALIDAR ALGO, USAR O findOne. DO CONTRÁRIO, IR DIRETO PARA O DELETE ao invés de remove.
  // const projeto = await this.projetoRepository.findOne({
  //   where: { id },
  // });
  // if (!projeto)
  //   throw new NotFoundException(
  //     `Projeto ID ${id} não encontrado ou já removido!`,
  //   );

  // // return this.projetoRepository.remove(projeto);
  // try {
  //   await this.projetoRepository.remove(projeto);
  //   return { message: `Projeto ID ${id} removido com sucesso.` };
  // } catch (error) {
  //   throw new InternalServerErrorException(
  //     `Erro ao tentar remover o Projeto ID ${id} no Banco de Dados.`,
  //   );
  // }
  // }
}
