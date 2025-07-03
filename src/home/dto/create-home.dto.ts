import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateHomeDto {
  @IsArray()
  // @ArrayNotEmpty()
  @IsString({ each: true }) // Valida cada item do array como sendo uma string
  readonly paragrafos: string[];
}

//Exemplo de JSON para teste:
// {
//     "paragrafos": [
//                    "Este é o primeiro parágrafo",
//                    "Este é mais um parágrafo, o 2",
//                    "Este é o parágrafo 3",
//                   ]
// }
