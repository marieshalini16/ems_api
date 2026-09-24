import { ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
              private readonly jwtService : JwtService) {}
     
// Login 

  async login(loginDto: LoginDto) {

  const user = await this.prisma.users.findUnique({
    where: {
      email: loginDto.email,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(loginDto.password, user.password);

  if (!passwordMatch) {
    throw new UnauthorizedException('Invalid email or password');
  }
    
  const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
    });

   return {
      message: 'Login successful',
      access_token: token,
      userId: user.id,
      role_id: user.role_id,
    };

}

// Register

async register(registerDto: RegisterDto) {
    const {fullname, email, phone, password} = registerDto;

    const existingEmail = await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.users.create({
        data: {
          full_name: fullname,
          email,
          phone,
          password: hashedPassword,
          role_id: 2,
          user_name: fullname,
          dept_id: 1,
        },
      });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
      },
    };

  }

}
