import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { NoticiaEntity } from './entities/noticia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';

@Injectable()
export class NoticiasService {
  constructor(
    @InjectRepository(NoticiaEntity)
    private readonly noticiaRepository: Repository<NoticiaEntity>,
  ) {}

  async create(createNoticiaDto: CreateNoticiaDto) {
    //Cria a slug a partir do nome da noticia
    const slug = slugify(createNoticiaDto.nomeNoticia, {
      lower: true,
      strict: true, // Se strict: false, ele pode manter alguns caracteres "estranhos" (dependendo da config).
    });

    // Verifica se a noticia com aquele slug já existe.
    const noticiaSlug = await this.noticiaRepository.findOne({
      where: { slug },
    });

    if (noticiaSlug) {
      throw new ConflictException(
        `Notícia de slug '${slug}', nome '${noticiaSlug.nomeNoticia}', já existe no Banco de Dados.`,
      );
    }

    // Se não existe, dá prosseguimento na criação.

    const newNoticia = {
      ...createNoticiaDto,
      slug, // gera o slug automaticamente a partir do nome
    };

    const noticia = this.noticiaRepository.create(newNoticia); // não é async porque ainda não interage com o BD, somente cria o objeto.

    // return this.noticiaRepository.save(noticia);
    try {
      await this.noticiaRepository.save(noticia);
      return {
        message: `Notícia ID ${noticia.id}, SLUG '${noticia.slug}' criada com sucesso.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar criar a Notícia no Banco de Dados.`,
      );
    }
  }

  async findAll() {
    try {
      const noticias = await this.noticiaRepository.find();
      return noticias;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao tentar acessar todas as Noticias no Banco de Dados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const noticia = await this.noticiaRepository.findOne({ where: { id } });

      if (!noticia) {
        throw new NotFoundException(`Notícia com ID ${id} não encontrada.`);
      }

      return noticia;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // deixa passar o erro esperado
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Notícia com ID ${id} no Banco de Dados.`,
      );
    }
  }

  async findBySlug(slug: string) {
    try {
      const noticia = await this.noticiaRepository.findOne({ where: { slug } });

      if (!noticia) {
        throw new NotFoundException(
          `Notícia com slug '${slug}' não encontrada.`,
        );
      }

      return noticia;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao buscar Notícia com slug '${slug}' no Banco de Dados.`,
      );
    }
  }

  async update(id: number, updateNoticiaDto: UpdateNoticiaDto) {
    const noticia = await this.noticiaRepository.findOne({ where: { id } });

    if (!noticia) {
      throw new NotFoundException(
        `Notícia ID ${id} não encontrada para atualizar!`,
      );
    }

    // Se o nome foi alterado, gera um novo slug
    let novoSlug = noticia.slug; // mantém o atual, caso nome não seja alterado

    if (updateNoticiaDto.nomeNoticia) {
      novoSlug = slugify(updateNoticiaDto.nomeNoticia, {
        lower: true,
        strict: true,
      });

      const slugExistente = await this.noticiaRepository.findOne({
        where: { slug: novoSlug },
      });

      if (slugExistente && slugExistente.id !== id) {
        throw new ConflictException(
          `Já existe outra Notícia com o SLUG '${novoSlug}' gerado a partir do Novo Nome de Noticia.`,
        );
      }
    }

    const dadosAtualizados = {
      ...updateNoticiaDto,
      slug: novoSlug,
    };

    const noticiaUpdated = this.noticiaRepository.merge(
      noticia,
      dadosAtualizados,
    );

    // return this.noticiaRepository.save(noticiaUpdated);
    try {
      await this.noticiaRepository.save(noticiaUpdated);
      return { message: `Notícia ID ${id} atualizada com sucesso.` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar a Notícia ID ${id} no Banco de Dados.`,
      );
    }
  }

  async delete(id: number) {
    try {
      const result = await this.noticiaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Notícia ID ${id} não encontrada ou já removida!`,
        );
      }
      return { message: `Notícia ID ${id} removida com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // mantém o 404
      }
      throw new InternalServerErrorException(
        `Erro ao tentar remover a Notícia ID ${id} no Banco de Dados.`,
      );
    }
  }

  // async remove(id: number) {

  // SE PRECISAR VALIDAR ALGO, USAR O findOne. DO CONTRÁRIO, IR DIRETO PARA O DELETE ao invés de remove.
  // const noticia = await this.noticiaRepository.findOne({
  //   where: { id },
  // });
  // if (!noticia)
  //   throw new NotFoundException(
  //     `Notícia ID ${id} não encontrada ou já removida!`,
  //   );

  // // return this.noticiaRepository.remove(noticia);
  // try {
  //   await this.noticiaRepository.remove(noticia);
  //   return { message: `Notícia ID ${id} removida com sucesso.` };
  // } catch (error) {
  //   throw new InternalServerErrorException(
  //     `Erro ao tentar remover a Notícia ID ${id} no Banco de Dados.`,
  //   );
  // }
  // }
}
