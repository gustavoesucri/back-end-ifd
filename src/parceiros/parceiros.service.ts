import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { UpdateParceiroDto } from './dto/update-parceiro.dto';
import { ParceiroEntity } from './entities/parceiro.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import slugify from 'slugify';

@Injectable()
export class ParceirosService {
  constructor(
    @InjectRepository(ParceiroEntity)
    private readonly parceiroRepository: Repository<ParceiroEntity>,
  ) {}

  async create(createParceiroDto: CreateParceiroDto) {
    //Cria a slug a partir do nome do parceiro
    const slug = slugify(createParceiroDto.nomeParceiro, {
      lower: true,
      strict: true, // Se strict: false, ele pode manter alguns caracteres "estranhos" (dependendo da config).
    });

    // Verifica se o parceiro com aquele slug já existe.
    const parceiroSlug = await this.parceiroRepository.findOne({
      where: { slug },
    });

    if (parceiroSlug) {
      throw new ConflictException(
        `Parceiro de slug '${slug}', nome '${parceiroSlug.nomeParceiro}', já existe no Banco de Dados.`,
      );
    }

    // Se não existe, dá prosseguimento na criação.

    const newParceiro = {
      ...createParceiroDto,
      slug, // gera o slug automaticamente a partir do nome
    };

    const parceiro = this.parceiroRepository.create(newParceiro); // não é async porque ainda não interage com o BD, somente cria o objeto.

    // return this.parceiroRepository.save(parceiro);
    try {
      await this.parceiroRepository.save(parceiro);
      return {
        message: `Parceiro ID ${parceiro.id}, SLUG '${parceiro.slug}' criado com sucesso.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar criar o Parceiro no Banco de Dados.`,
      );
    }
  }

  async findAll() {
    try {
      const parceiros = await this.parceiroRepository.find();
      return parceiros;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao tentar acessar todos os Parceiros no Banco de Dados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const parceiro = await this.parceiroRepository.findOne({ where: { id } });

      if (!parceiro) {
        throw new NotFoundException(`Parceiro com ID ${id} não encontrado.`);
      }

      return parceiro;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // deixa passar o erro esperado
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Parceiro com ID ${id} no Banco de Dados.`,
      );
    }
  }

  async findByName(name: string) {
    try {
      const parceiros = await this.parceiroRepository.find({
        where: { nomeParceiro: ILike(`%${name}%`) }, // Usando ILike, pois Like é case-sensitive no PostgreSQL.
      });

      if (parceiros.length === 0) {
        throw new NotFoundException(
          `Nenhum parceiro encontrado com nome semelhante a '${name}'.`,
        );
      }

      return parceiros;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Erro ao buscar Parceiros com nome semelhante a '${name}'.`,
      );
    }
  }

  async findBySlug(slug: string) {
    try {
      const parceiro = await this.parceiroRepository.findOne({
        where: { slug },
      });

      if (!parceiro) {
        throw new NotFoundException(
          `Parceiro com slug '${slug}' não encontrado.`,
        );
      }

      return parceiro;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Parceiro com slug '${slug}' no Banco de Dados.`,
      );
    }
  }

  async update(id: number, updateParceiroDto: UpdateParceiroDto) {
    const parceiro = await this.parceiroRepository.findOne({ where: { id } });

    if (!parceiro) {
      throw new NotFoundException(
        `Parceiro ID ${id} não encontrado para atualizar!`,
      );
    }

    // Se o nome foi alterado, gera um novo slug
    let novoSlug = parceiro.slug; // mantém o atual, caso nome não seja alterado

    if (updateParceiroDto.nomeParceiro) {
      novoSlug = slugify(updateParceiroDto.nomeParceiro, {
        lower: true,
        strict: true,
      });

      const slugExistente = await this.parceiroRepository.findOne({
        where: { slug: novoSlug },
      });

      if (slugExistente && slugExistente.id !== id) {
        throw new ConflictException(
          `Já existe outro Parceiro com o SLUG '${novoSlug}' gerado a partir do Novo Nome de Parceiro.`,
        );
      }
    }

    const dadosAtualizados = {
      ...updateParceiroDto,
      slug: novoSlug,
    };

    const parceiroUpdated = this.parceiroRepository.merge(
      parceiro,
      dadosAtualizados,
    );

    // return this.parceiroRepository.save(parceiroUpdated);
    try {
      await this.parceiroRepository.save(parceiroUpdated);
      return { message: `Parceiro ID ${id} atualizado com sucesso.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar o Parceiro ID ${id} no Banco de Dados.`,
      );
    }
  }

  async delete(id: number) {
    try {
      const result = await this.parceiroRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Parceiro ID ${id} não encontrado ou já removido!`,
        );
      }
      return { message: `Parceiro ID ${id} removido com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // mantém o 404
      }
      throw new InternalServerErrorException(
        `Erro ao tentar remover o Parceiro ID ${id} no Banco de Dados.`,
      );
    }
  }

  // async remove(id: number) {

  // SE PRECISAR VALIDAR ALGO, USAR O findOne. DO CONTRÁRIO, IR DIRETO PARA O DELETE ao invés de remove.
  // const parceiro = await this.parceiroRepository.findOne({
  //   where: { id },
  // });
  // if (!parceiro)
  //   throw new NotFoundException(
  //     `Parceiro ID ${id} não encontrado ou já removido!`,
  //   );

  // // return this.parceiroRepository.remove(parceiro);
  // try {
  //   await this.parceiroRepository.remove(parceiro);
  //   return { message: `Parceiro ID ${id} removido com sucesso.` };
  // } catch (error) {
  //   throw new InternalServerErrorException(
  //     `Erro ao tentar remover o Parceiro ID ${id} no Banco de Dados.`,
  //   );
  // }
  // }
}
