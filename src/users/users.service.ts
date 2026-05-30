import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { User } from './repositories/user/domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { RoleEnum } from '../roles/roles.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined;

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }

    if (!password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'passwordIsRequired',
        },
      });
    }

    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
    }

    let photo: string | undefined = undefined;

    if (createUserDto.photo) {
      const fileObject = await this.filesService.findById(createUserDto.photo);
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject.id;
    }

    let role: RoleEnum | undefined = createUserDto.role;

    if (createUserDto.role) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(createUserDto.role));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = createUserDto.role;
    }

    return this.usersRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      first_name: createUserDto.firstName,
      last_name: createUserDto.lastName,
      email: createUserDto.email,
      password,
      photo,
      role,
      provider: AuthProvidersEnum.email,
    });
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const userObject = await this.usersRepository.findById(id);

      if (userObject && userObject?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | undefined = undefined;

    if (updateUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && userObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }

      email = updateUserDto.email;
    }

    let photo: string | undefined = undefined;

    if (updateUserDto.photo) {
      const fileObject = await this.filesService.findById(updateUserDto.photo);
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject.id;
    }

    return this.usersRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      first_name: updateUserDto.firstName,
      last_name: updateUserDto.lastName,
      email,
      password,
      photo,
    });
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }
}
