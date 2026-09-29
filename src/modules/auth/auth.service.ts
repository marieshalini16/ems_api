import { ConflictException, Injectable, UnauthorizedException, Logger, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(private readonly prisma: PrismaService,
              private readonly jwtService : JwtService) {}
     
// Login 

  async login(loginDto: LoginDto) {

  try{

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

  this.logger.log('Login successfully');

   return {
      message: 'Login successful',
      access_token: token,
      userId: user.id,
      role_id: user.role_id,
    };
  }

  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to login', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to login');
  }
}

// Register

async register(registerDto: RegisterDto) {
  try{
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

  this.logger.log('Register successfully');

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
  catch(error){
    if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

    this.logger.error( 'Failed to register', error instanceof Error ? error.stack : String(error) );
    throw new InternalServerErrorException('Failed to register');
  }
  }
}
