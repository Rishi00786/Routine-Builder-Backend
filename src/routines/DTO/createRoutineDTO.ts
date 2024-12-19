import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsOptional,
  IsUrl,
  IsNotEmpty,
  IsObject,
} from 'class-validator';

class ProductDTO {
  @IsString()
  @IsNotEmpty()
  'product-name': string;

  @IsString()
  @IsNotEmpty()
  'product-desc': string;
}

class StepDTO {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  @Type(() => ProductDTO)
  product: ProductDTO;
}

export class CreateRoutineDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  duration: string;

  @IsString()
  @IsNotEmpty()
  milestones: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  imagePreview: string;

  @IsArray()
  @Type(() => StepDTO)
  steps: StepDTO[];

  @IsArray()
  @IsString({ each: true })
  benefits: string[];
}
