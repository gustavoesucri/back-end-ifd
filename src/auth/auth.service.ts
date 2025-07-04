import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
  ) {}

  async validateAuth(loginDto: LoginDto) {
    const auth = await this.findUserByEmail(loginDto.email);
    const isMatch = await bcrypt.compare(loginDto.password, auth.password);
    if (auth && isMatch) {
      const { password, ...result } = auth;
      return result;
    }
    return null;
  }

  login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findUserByEmail(email: string) {
    const user = await this.authRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado!');

    return user;
  }

  async create(createAuthDto: CreateAuthDto) {
    const existingAuth = await this.authRepository.findOne({
      where: {
        email: createAuthDto.email,
      },
    });
    if (existingAuth) throw new ConflictException('E-mail já registrado');

    const passwordHash = await bcrypt.hash(createAuthDto.password, 10);

    const newAuth = {
      email: createAuthDto.email,
      password: passwordHash,
    };

    const auth = this.authRepository.create(newAuth);

    return this.authRepository.save(auth);
  }
}
