import { CreateUserDTO } from './createUserDTO';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUseDTO extends PartialType(CreateUserDTO) {}
