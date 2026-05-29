import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty()
  passwordActual: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  nuevaPassword: string;
}
