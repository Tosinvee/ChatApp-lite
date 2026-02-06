import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import * as crypto from 'crypto';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interface/token.interface';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from 'src/user/schema/refresh-token.schema';
import { Model } from 'mongoose';
import redisClient from 'src/utils/redisClient';

@Injectable()
export class AuthService {
  private logger: Logger;
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async onModuleDestroy() {
    await redisClient.quit();
    this.logger.log('Redis connection gracefully closed');
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  hashForDb(token: string) {
    return bcrypt.hash(token, 10);
  }

  hashForRedis(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async signup(body: CreateUserDto) {
    const existingUser = await this.userService.getUser({ email: body.email });
    if (existingUser) throw new BadRequestException('User already exist');
    const hashedPassword = await this.userService.hashPassword(body.password);
    await this.userService.create({
      ...body,
      password: hashedPassword,
    });
    return {
      message: 'USER signed up sucessfully',
    };
  }

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.userService.getUser({ email });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return user;
  }

  async saveRefreshToken(userId: string, token: string) {
    const dbHash = await this.hashForDb(token);
    const redisHash = this.hashForRedis(token);
    const refreshToken = await this.refreshTokenModel.create({
      userId,
      token: dbHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await redisClient.set(
      `refresh:${redisHash}`,
      refreshToken._id.toString(),
      'EX',
      30 * 24 * 60 * 60,
    );
  }

  async login(user: User) {
    const tokenPaylod: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = this.jwtService.sign(tokenPaylod, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user._id.toString(), refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }
}
