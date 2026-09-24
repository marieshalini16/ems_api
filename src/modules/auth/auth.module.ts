import 'dotenv/config';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthJwtStrategy } from './auth.jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],

  controllers: [AuthController,],

  providers: [
    AuthService,
    AuthJwtStrategy,
  ],

  exports: [
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}