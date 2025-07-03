import { Transform } from 'class-transformer';
import {
  IsString,
  IsUrl,
  MaxLength,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';

export class CreateParceiroDto {
  @IsUrl({
    require_tld: false, // Permite URLs sem TLD, ex: 'http://localhost:3000' ou 'http://192.168.0.1'
    // Se fosse true (padrão), somente URLs com TLDs válidos seriam aceitas, ex: 'https://exemplo.com.br'
  })
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  logoUrl: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nomeParceiro: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((obj) => obj.externalUrl !== '') // Se for string vazia '', deixa passar. Do contrário, faz validação.
  @IsUrl({ require_tld: true })
  @MaxLength(255)
  externalUrl: string;
}
//Exemplo de JSON para teste:
// {
//   "logoUrl": "http://localhost:3001//static/images-noticias/esucri.png",
//   "nomeParceiro": "Nome do Parceiro 1",
//   ]
// }
