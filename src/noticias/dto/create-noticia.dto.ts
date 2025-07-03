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

export class CreateNoticiaDto {
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
  nomeNoticia: string;

  //Notícia fica sem texto resumo, somente com o título, que é o nomeNoticia, porém ganha a chamada.
  // @IsString()
  // @MaxLength(1000) // pode ajustar conforme necessidade
  // @IsNotEmpty()
  // @Transform(({ value }) => value?.trim())
  // textoResumo: string;

  // Chamada da notícia
  @IsString()
  @MaxLength(100) // pode ajustar conforme necessidade
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  chamada: string;

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
//   "imagemUrl": "http://localhost:3001/static/images-noticias/foto2.jpeg",
//   "nomeNoticia": "Nome da Notícia 1",
//   "chamada": "Esta é a Chamada da Notícia, que é diferente do título dela. VEJA AQUI!",
//   "paragrafos": [
//     "Este é o parágrafo 1",
//     "Este é o <strong>parágrafo</strong> 2",
//     "Este é o parágrafo 3",
//     "Este é o parágrafo 4",
//     "Este é o parágrafo 5",
//     "Este é o parágrafo 6"
//   ]
// }
