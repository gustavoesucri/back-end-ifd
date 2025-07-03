import { Transform } from 'class-transformer';
import {
  IsString,
  IsUrl,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  ArrayMaxSize,
  IsNotEmpty,
} from 'class-validator';

export class CreateProjetoDto {
  @IsUrl({
    require_tld: false, // Permite URLs sem TLD, ex: 'http://localhost:3000' ou 'http://192.168.0.1'
    // Se fosse true (padrão), somente URLs com TLDs válidos seriam aceitas, ex: 'https://exemplo.com.br'
  })
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  imagemUrl: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nomeProjeto: string;

  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  textoResumo: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => (typeof v === 'string' ? v.trim() : v))
      : value,
  )
  paragrafos: string[];
}

//Exemplo de JSON para teste:
// {
//   "imagemUrl": "http://localhost:3001/static/images-projetos/foto2.jpeg",
//   "nomeProjeto": "Nome do Projeto 1",
//   "textoResumo": "Este é o texto resumo/chamada do Projeto 1. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta dicta quaerat atque dignissimos corporis expedita aliquid, ipsa facere provident dolorem pariatur blanditiis eaque ex officiis, quo modi, perferendis et ab!Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur id, totam cum explicabo fuga error doloremque voluptatum repudiandae, maxime, ipsam reiciendis aut! Aspernatur provident eos dolorem, voluptatum veniam rem soluta.",
//   "paragrafos": [
//     "Este é o parágrafo 1",
//     "Este é o <strong>parágrafo</strong> 2",
//     "Este é o parágrafo 3",
//     "Este é o parágrafo 4",
//     "Este é o parágrafo 5",
//     "Este é o parágrafo 6"
//   ]
// }
