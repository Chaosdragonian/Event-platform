import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import {
  RefreshSession,
  RefreshSessionSchema,
} from '../refresh/schema/refresh-session.schema';
import { AuthFacade } from './auth.facade';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { JwtAuthGuard, JwtStrategy, RolesGuard } from '@app/common';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshSession.name, schema: RefreshSessionSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthFacade,
    TokenService,
    SessionService,
    JwtAuthGuard,
    JwtStrategy,
    RolesGuard,
  ],
})
export class AuthModule {}
