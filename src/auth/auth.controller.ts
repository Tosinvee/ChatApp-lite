import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CurrentUser } from './decorator/current.user';
import { User } from 'src/user/schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }
}
