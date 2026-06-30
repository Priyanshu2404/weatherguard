import { IsString, MinLength } from 'class-validator';

export class UpdateCityDto {
  @IsString()
  @MinLength(2)
  city: string;
}
