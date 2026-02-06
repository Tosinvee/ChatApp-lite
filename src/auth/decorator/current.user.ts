import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/user/schema/user.schema';

const getCurrentUserByContext = (context: ExecutionContext): User => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.user as User;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User =>
    getCurrentUserByContext(context),
);
