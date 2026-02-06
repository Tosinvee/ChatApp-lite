import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuards extends AuthGuard('jwt') {}
